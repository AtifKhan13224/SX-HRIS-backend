import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProjectStructureTemplate,
  ProjectStructureLevel,
} from '../entities/project-config.entity';
import {
  CreateStructureTemplateDto,
  CreateStructureLevelDto,
} from '../dto/project-config.dto';
import { ProjectConfigurationService } from './project-configuration.service';

/**
 * STRUCTURE MANAGEMENT SERVICE
 * Manages project structure templates and levels
 */
@Injectable()
export class StructureManagementService {
  constructor(
    @InjectRepository(ProjectStructureTemplate)
    private readonly templateRepository: Repository<ProjectStructureTemplate>,
    @InjectRepository(ProjectStructureLevel)
    private readonly levelRepository: Repository<ProjectStructureLevel>,
    private readonly configService: ProjectConfigurationService,
  ) {}

  // ==========================================
  // STRUCTURE TEMPLATE METHODS
  // ==========================================

  async createTemplate(
    dto: CreateStructureTemplateDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectStructureTemplate> {
    const existing = await this.templateRepository.findOne({
      where: { tenantId, templateCode: dto.templateCode, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException(`Structure template with code '${dto.templateCode}' already exists`);
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
      configurationType: 'STRUCTURE_TEMPLATE',
      configurationId: saved.id,
      configurationCode: saved.templateCode,
      actionType: 'CREATE',
      actionDescription: `Created structure template: ${saved.templateName}`,
      afterState: saved,
      performedBy: userId,
    });

    return saved;
  }

  async findAllTemplates(tenantId: string): Promise<ProjectStructureTemplate[]> {
    return this.templateRepository.find({
      where: { tenantId, isDeleted: false },
      order: { templateName: 'ASC' },
    });
  }

  async findTemplateById(id: string, tenantId: string): Promise<ProjectStructureTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!template) {
      throw new NotFoundException(`Structure template with ID '${id}' not found`);
    }

    return template;
  }

  async updateTemplate(
    id: string,
    updates: Partial<CreateStructureTemplateDto>,
    changeReason: string,
    tenantId: string,
    userId: string,
  ): Promise<ProjectStructureTemplate> {
    const template = await this.findTemplateById(id, tenantId);
    const beforeState = { ...template };

    Object.assign(template, {
      ...updates,
      version: template.version + 1,
      updatedBy: userId,
    });

    const saved = await this.templateRepository.save(template);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'STRUCTURE_TEMPLATE',
      configurationId: saved.id,
      configurationCode: saved.templateCode,
      actionType: 'UPDATE',
      actionDescription: `Updated structure template: ${changeReason}`,
      beforeState,
      afterState: saved,
      performedBy: userId,
      changeReason,
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
      'STRUCTURE_TEMPLATE',
      id,
      tenantId,
    );

    if (dependencies.length > 0) {
      throw new BadRequestException(
        `Cannot delete structure template. It is used by: ${dependencies.map(d => d.dependentEntityType).join(', ')}`,
      );
    }

    template.isDeleted = true;
    template.deletedAt = new Date();
    template.deletedBy = userId;
    template.status = 'INACTIVE';

    await this.templateRepository.save(template);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'STRUCTURE_TEMPLATE',
      configurationId: id,
      configurationCode: template.templateCode,
      actionType: 'DELETE',
      actionDescription: `Deleted structure template: ${changeReason}`,
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
  ): Promise<ProjectStructureTemplate> {
    const source = await this.findTemplateById(id, tenantId);
    const levels = await this.findLevelsByTemplate(id, tenantId);

    const clonedData: any = { ...source };
    delete clonedData.id;
    delete clonedData.createdAt;
    delete clonedData.updatedAt;
    delete clonedData.version;

    clonedData.templateCode = newCode;
    clonedData.templateName = newName;
    clonedData.status = 'DRAFT';
    clonedData.version = 1;

    const newTemplate = await this.createTemplate(clonedData, tenantId, userId);

    // Clone levels
    for (const level of levels) {
      const levelData: any = { ...level };
      delete levelData.id;
      delete levelData.createdAt;
      delete levelData.updatedAt;
      levelData.structureTemplateId = newTemplate.id;

      await this.createLevel(levelData, tenantId, userId);
    }

    return this.findTemplateById(newTemplate.id, tenantId);
  }

  // ==========================================
  // STRUCTURE LEVEL METHODS
  // ==========================================

  async createLevel(
    dto: CreateStructureLevelDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectStructureLevel> {
    // Verify template exists
    await this.findTemplateById(dto.structureTemplateId, tenantId);

    // Check for duplicate level code
    const existing = await this.levelRepository.findOne({
      where: {
        tenantId,
        structureTemplateId: dto.structureTemplateId,
        levelCode: dto.levelCode,
      },
    });

    if (existing) {
      throw new ConflictException(`Level with code '${dto.levelCode}' already exists in this template`);
    }

    // Check for duplicate level order
    const orderExists = await this.levelRepository.findOne({
      where: {
        tenantId,
        structureTemplateId: dto.structureTemplateId,
        levelOrder: dto.levelOrder,
      },
    });

    if (orderExists) {
      throw new ConflictException(`Level order ${dto.levelOrder} is already used in this template`);
    }

    const level = this.levelRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.levelRepository.save(level);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'STRUCTURE_LEVEL',
      configurationId: saved.id,
      configurationCode: saved.levelCode,
      actionType: 'CREATE',
      actionDescription: `Created structure level: ${saved.levelName}`,
      afterState: saved,
      performedBy: userId,
    });

    return saved;
  }

  async findLevelsByTemplate(
    templateId: string,
    tenantId: string,
  ): Promise<ProjectStructureLevel[]> {
    return this.levelRepository.find({
      where: {
        tenantId,
        structureTemplateId: templateId,
        isActive: true,
      },
      order: { levelOrder: 'ASC' },
    });
  }

  async findLevelById(id: string, tenantId: string): Promise<ProjectStructureLevel> {
    const level = await this.levelRepository.findOne({
      where: { id, tenantId },
      relations: ['structureTemplate'],
    });

    if (!level) {
      throw new NotFoundException(`Structure level with ID '${id}' not found`);
    }

    return level;
  }

  async updateLevel(
    id: string,
    updates: Partial<CreateStructureLevelDto>,
    tenantId: string,
    userId: string,
  ): Promise<ProjectStructureLevel> {
    const level = await this.findLevelById(id, tenantId);
    const beforeState = { ...level };

    Object.assign(level, updates);

    const saved = await this.levelRepository.save(level);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'STRUCTURE_LEVEL',
      configurationId: saved.id,
      configurationCode: saved.levelCode,
      actionType: 'UPDATE',
      actionDescription: `Updated structure level`,
      beforeState,
      afterState: saved,
      performedBy: userId,
    });

    return saved;
  }

  async deleteLevel(
    id: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    const level = await this.findLevelById(id, tenantId);

    level.isActive = false;
    await this.levelRepository.save(level);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'STRUCTURE_LEVEL',
      configurationId: id,
      configurationCode: level.levelCode,
      actionType: 'DELETE',
      actionDescription: `Deleted structure level`,
      beforeState: level,
      performedBy: userId,
    });
  }

  /**
   * Validate structure template configuration
   */
  async validateTemplate(templateId: string, tenantId: string): Promise<boolean> {
    const template = await this.findTemplateById(templateId, tenantId);
    const levels = await this.findLevelsByTemplate(templateId, tenantId);

    // Check if mandatory levels exist
    if (template.mandatoryLevels && template.mandatoryLevels.length > 0) {
      const levelCodes = levels.map(l => l.levelCode);
      const missingLevels = template.mandatoryLevels.filter(ml => !levelCodes.includes(ml));

      if (missingLevels.length > 0) {
        throw new BadRequestException(`Missing mandatory levels: ${missingLevels.join(', ')}`);
      }
    }

    // Check max hierarchy depth
    const maxDepth = Math.max(...levels.map(l => l.levelDepth));
    if (maxDepth > template.maxHierarchyDepth) {
      throw new BadRequestException(
        `Level depth (${maxDepth}) exceeds template max (${template.maxHierarchyDepth})`,
      );
    }

    return true;
  }

  /**
   * Generate WBS code format
   */
  async generateWbsCode(
    templateId: string,
    levelCode: string,
    parentWbs: string,
    itemNumber: number,
    tenantId: string,
  ): Promise<string> {
    const template = await this.findTemplateById(templateId, tenantId);

    if (!template.requiresWbsCodes || !template.wbsCodeFormat) {
      return null;
    }

    // Simple WBS generation - can be enhanced based on format
    if (parentWbs) {
      return `${parentWbs}.${itemNumber}`;
    }

    return `${itemNumber}`;
  }
}
