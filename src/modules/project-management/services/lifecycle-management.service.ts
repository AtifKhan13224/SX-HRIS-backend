import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProjectLifecycleTemplate,
  ProjectLifecycleStage,
} from '../entities/project-config.entity';
import {
  CreateLifecycleTemplateDto,
  UpdateLifecycleTemplateDto,
  CreateLifecycleStageDto,
} from '../dto/project-config.dto';
import { ProjectConfigurationService } from './project-configuration.service';

/**
 * LIFECYCLE MANAGEMENT SERVICE
 * Manages lifecycle templates and stages
 */
@Injectable()
export class LifecycleManagementService {
  constructor(
    @InjectRepository(ProjectLifecycleTemplate)
    private readonly templateRepository: Repository<ProjectLifecycleTemplate>,
    @InjectRepository(ProjectLifecycleStage)
    private readonly stageRepository: Repository<ProjectLifecycleStage>,
    private readonly configService: ProjectConfigurationService,
  ) {}

  // ==========================================
  // LIFECYCLE TEMPLATE METHODS
  // ==========================================

  async createTemplate(
    dto: CreateLifecycleTemplateDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectLifecycleTemplate> {
    const existing = await this.templateRepository.findOne({
      where: { tenantId, templateCode: dto.templateCode, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException(`Lifecycle template with code '${dto.templateCode}' already exists`);
    }

    const template = this.templateRepository.create({
      ...dto,
      tenantId,
      effectiveStartDate: new Date(dto.effectiveStartDate),
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.templateRepository.save(template);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'LIFECYCLE_TEMPLATE',
      configurationId: saved.id,
      configurationCode: saved.templateCode,
      actionType: 'CREATE',
      actionDescription: `Created lifecycle template: ${saved.templateName}`,
      afterState: saved,
      performedBy: userId,
    });

    return saved;
  }

  async findAllTemplates(tenantId: string): Promise<ProjectLifecycleTemplate[]> {
    return this.templateRepository.find({
      where: { tenantId, isDeleted: false },
      relations: ['stages'],
      order: { templateName: 'ASC' },
    });
  }

  async findTemplateById(id: string, tenantId: string): Promise<ProjectLifecycleTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['stages'],
    });

    if (!template) {
      throw new NotFoundException(`Lifecycle template with ID '${id}' not found`);
    }

    return template;
  }

  async updateTemplate(
    id: string,
    dto: UpdateLifecycleTemplateDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectLifecycleTemplate> {
    const template = await this.findTemplateById(id, tenantId);
    const beforeState = { ...template };

    Object.assign(template, {
      ...dto,
      version: template.version + 1,
      updatedBy: userId,
    });

    const saved = await this.templateRepository.save(template);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'LIFECYCLE_TEMPLATE',
      configurationId: saved.id,
      configurationCode: saved.templateCode,
      actionType: 'UPDATE',
      actionDescription: `Updated lifecycle template: ${dto.changeReason}`,
      beforeState,
      afterState: saved,
      performedBy: userId,
      changeReason: dto.changeReason,
    });

    return saved;
  }

  async deleteTemplate(
    id: string,
    changeReason: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    const template = await this.findTemplateById(id, tenantId);

    // Check if template is in use
    const dependencies = await this.configService.checkDependencies(
      'LIFECYCLE_TEMPLATE',
      id,
      tenantId,
    );

    if (dependencies.length > 0) {
      throw new BadRequestException(
        `Cannot delete lifecycle template. It is used by: ${dependencies.map(d => d.dependentEntityType).join(', ')}`,
      );
    }

    template.isDeleted = true;
    template.deletedAt = new Date();
    template.deletedBy = userId;
    template.status = 'INACTIVE';

    await this.templateRepository.save(template);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'LIFECYCLE_TEMPLATE',
      configurationId: id,
      configurationCode: template.templateCode,
      actionType: 'DELETE',
      actionDescription: `Deleted lifecycle template: ${changeReason}`,
      beforeState: template,
      performedBy: userId,
      changeReason,
    });
  }

  async cloneTemplate(
    id: string,
    newCode: string,
    newName: string,
    tenantId: string,
    userId: string,
  ): Promise<ProjectLifecycleTemplate> {
    const source = await this.findTemplateById(id, tenantId);

    const clonedTemplateData: any = { ...source };
    delete clonedTemplateData.id;
    delete clonedTemplateData.stages;
    delete clonedTemplateData.createdAt;
    delete clonedTemplateData.updatedAt;
    delete clonedTemplateData.version;

    clonedTemplateData.templateCode = newCode;
    clonedTemplateData.templateName = newName;
    clonedTemplateData.status = 'DRAFT';
    clonedTemplateData.version = 1;

    const newTemplate = await this.createTemplate(clonedTemplateData, tenantId, userId);

    // Clone stages
    if (source.stages && source.stages.length > 0) {
      for (const stage of source.stages) {
        const stageData: any = { ...stage };
        delete stageData.id;
        delete stageData.createdAt;
        delete stageData.updatedAt;
        stageData.lifecycleTemplateId = newTemplate.id;

        await this.createStage(stageData, tenantId, userId);
      }
    }

    return this.findTemplateById(newTemplate.id, tenantId);
  }

  // ==========================================
  // LIFECYCLE STAGE METHODS
  // ==========================================

  async createStage(
    dto: CreateLifecycleStageDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectLifecycleStage> {
    // Verify template exists
    await this.findTemplateById(dto.lifecycleTemplateId, tenantId);

    // Check for duplicate stage code within template
    const existing = await this.stageRepository.findOne({
      where: {
        tenantId,
        lifecycleTemplateId: dto.lifecycleTemplateId,
        stageCode: dto.stageCode,
      },
    });

    if (existing) {
      throw new ConflictException(`Stage with code '${dto.stageCode}' already exists in this template`);
    }

    // Check for duplicate stage order
    const orderExists = await this.stageRepository.findOne({
      where: {
        tenantId,
        lifecycleTemplateId: dto.lifecycleTemplateId,
        stageOrder: dto.stageOrder,
      },
    });

    if (orderExists) {
      throw new ConflictException(`Stage order ${dto.stageOrder} is already used in this template`);
    }

    const stage = this.stageRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.stageRepository.save(stage);

    // Update template's total_stages
    const template = await this.findTemplateById(dto.lifecycleTemplateId, tenantId);
    template.totalStages = (template.stages?.length || 0) + 1;
    await this.templateRepository.save(template);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'LIFECYCLE_STAGE',
      configurationId: saved.id,
      configurationCode: saved.stageCode,
      actionType: 'CREATE',
      actionDescription: `Created lifecycle stage: ${saved.stageName}`,
      afterState: saved,
      performedBy: userId,
    });

    return saved;
  }

  async findStagesByTemplate(
    templateId: string,
    tenantId: string,
  ): Promise<ProjectLifecycleStage[]> {
    return this.stageRepository.find({
      where: {
        tenantId,
        lifecycleTemplateId: templateId,
        isActive: true,
      },
      order: { stageOrder: 'ASC' },
    });
  }

  async findStageById(id: string, tenantId: string): Promise<ProjectLifecycleStage> {
    const stage = await this.stageRepository.findOne({
      where: { id, tenantId },
      relations: ['lifecycleTemplate'],
    });

    if (!stage) {
      throw new NotFoundException(`Lifecycle stage with ID '${id}' not found`);
    }

    return stage;
  }

  async updateStage(
    id: string,
    updates: Partial<CreateLifecycleStageDto>,
    tenantId: string,
    userId: string,
  ): Promise<ProjectLifecycleStage> {
    const stage = await this.findStageById(id, tenantId);
    const beforeState = { ...stage };

    Object.assign(stage, updates);

    const saved = await this.stageRepository.save(stage);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'LIFECYCLE_STAGE',
      configurationId: saved.id,
      configurationCode: saved.stageCode,
      actionType: 'UPDATE',
      actionDescription: `Updated lifecycle stage`,
      beforeState,
      afterState: saved,
      performedBy: userId,
    });

    return saved;
  }

  async deleteStage(
    id: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    const stage = await this.findStageById(id, tenantId);

    stage.isActive = false;
    await this.stageRepository.save(stage);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'LIFECYCLE_STAGE',
      configurationId: id,
      configurationCode: stage.stageCode,
      actionType: 'DELETE',
      actionDescription: `Deleted lifecycle stage`,
      beforeState: stage,
      performedBy: userId,
    });
  }

  /**
   * Validate stage sequence
   */
  async validateStageSequence(templateId: string, tenantId: string): Promise<boolean> {
    const stages = await this.findStagesByTemplate(templateId, tenantId);

    if (stages.length === 0) return true;

    const orders = stages.map(s => s.stageOrder).sort((a, b) => a - b);

    // Check for gaps
    for (let i = 0; i < orders.length - 1; i++) {
      if (orders[i + 1] - orders[i] > 1) {
        throw new BadRequestException('Stage sequence has gaps');
      }
    }

    return true;
  }
}
