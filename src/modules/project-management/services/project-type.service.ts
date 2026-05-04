import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, IsNull, Not } from 'typeorm';
import {
  ProjectType,
  ProjectResourceAllocationSettings,
  ProjectBillingCostSettings,
  ProjectGovernanceRuleMapping,
} from '../entities/project-config.entity';
import {
  CreateProjectTypeDto,
  UpdateProjectTypeDto,
  ProjectTypeQueryDto,
  BulkProjectTypeActionDto,
  CreateResourceAllocationSettingsDto,
  CreateBillingCostSettingsDto,
} from '../dto/project-config.dto';
import { ProjectConfigurationService } from './project-configuration.service';

/**
 * PROJECT TYPE SERVICE
 * Manages project type configurations with hierarchy support
 * 
 * Features:
 * - CRUD operations for project types
 * - Hierarchy management (parent-child relationships)
 * - Settings management (resource allocation, billing/cost)
 * - Governance rule application
 * - Version control and audit trail
 * - Circular dependency validation
 */
@Injectable()
export class ProjectTypeService {
  constructor(
    @InjectRepository(ProjectType)
    private readonly projectTypeRepository: Repository<ProjectType>,
    @InjectRepository(ProjectResourceAllocationSettings)
    private readonly resourceAllocationRepository: Repository<ProjectResourceAllocationSettings>,
    @InjectRepository(ProjectBillingCostSettings)
    private readonly billingCostRepository: Repository<ProjectBillingCostSettings>,
    @InjectRepository(ProjectGovernanceRuleMapping)
    private readonly governanceMappingRepository: Repository<ProjectGovernanceRuleMapping>,
    private readonly configService: ProjectConfigurationService,
  ) {}

  /**
   * Create a new project type
   */
  async create(
    dto: CreateProjectTypeDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectType> {
    // Check for duplicate code
    const existing = await this.projectTypeRepository.findOne({
      where: {
        tenantId,
        projectTypeCode: dto.projectTypeCode,
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Project type with code '${dto.projectTypeCode}' already exists`,
      );
    }

    // Validate parent hierarchy
    let hierarchyPath = null;
    let hierarchyLevel = 0;

    if (dto.parentTypeId) {
      const parent = await this.findById(dto.parentTypeId, tenantId);
      hierarchyLevel = parent.hierarchyLevel + 1;
      hierarchyPath = `${parent.hierarchyPath || ''}/${parent.id}`;

      // Check for circular reference
      if (hierarchyPath && hierarchyPath.includes(dto.parentTypeId)) {
        throw new BadRequestException('Circular parent reference detected');
      }
    }

    // Create project type
    const projectType = this.projectTypeRepository.create({
      ...dto,
      tenantId,
      hierarchyPath,
      hierarchyLevel,
      effectiveStartDate: new Date(dto.effectiveStartDate),
      effectiveEndDate: dto.effectiveEndDate ? new Date(dto.effectiveEndDate) : null,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.projectTypeRepository.save(projectType);

    // Create version record
    await this.configService.createVersion({
      tenantId,
      configurationType: 'PROJECT_TYPE',
      configurationId: saved.id,
      versionNumber: 1,
      changeType: 'CREATE',
      changeDescription: 'Initial project type creation',
      configurationSnapshot: saved,
      changedBy: userId,
      effectiveFrom: new Date(),
    });

    // Create audit log
    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'PROJECT_TYPE',
      configurationId: saved.id,
      configurationCode: saved.projectTypeCode,
      actionType: 'CREATE',
      actionDescription: `Created project type: ${saved.projectTypeName}`,
      afterState: saved,
      performedBy: userId,
    });

    return saved;
  }

  /**
   * Find project types with filters and pagination
   */
  async findAll(
    query: ProjectTypeQueryDto,
    tenantId: string,
  ): Promise<{ data: ProjectType[]; total: number; page: number; pageSize: number }> {
    const {
      search,
      category,
      billingModel,
      status,
      parentTypeId,
      includeDescendants,
      page = 1,
      pageSize = 20,
      sortBy = 'projectTypeName',
      sortOrder = 'ASC',
    } = query;

    const whereConditions: any = {
      tenantId,
      isDeleted: false,
    };

    if (search) {
      whereConditions.projectTypeName = Like(`%${search}%`);
    }

    if (category) {
      whereConditions.defaultProjectCategory = category;
    }

    if (billingModel) {
      whereConditions.defaultBillingModel = billingModel;
    }

    if (status) {
      whereConditions.status = status;
    }

    if (parentTypeId === 'null') {
      whereConditions.parentTypeId = IsNull();
    } else if (parentTypeId) {
      if (includeDescendants) {
        // Find parent and all descendants
        const parent = await this.findById(parentTypeId, tenantId);
        const descendants = await this.projectTypeRepository
          .createQueryBuilder('pt')
          .where('pt.tenant_id = :tenantId', { tenantId })
          .andWhere('pt.is_deleted = false')
          .andWhere('pt.hierarchy_path LIKE :path', { path: `%${parent.id}%` })
          .getMany();

        const ids = [parentTypeId, ...descendants.map(d => d.id)];
        whereConditions.id = In(ids);
      } else {
        whereConditions.parentTypeId = parentTypeId;
      }
    }

    const [data, total] = await this.projectTypeRepository.findAndCount({
      where: whereConditions,
      relations: ['parentType', 'childTypes', 'governanceRuleMappings'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Find project type by ID
   */
  async findById(id: string, tenantId: string): Promise<ProjectType> {
    const projectType = await this.projectTypeRepository.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: [
        'parentType',
        'childTypes',
        'governanceRuleMappings',
        'resourceAllocationSettings',
        'billingCostSettings',
      ],
    });

    if (!projectType) {
      throw new NotFoundException(`Project type with ID '${id}' not found`);
    }

    return projectType;
  }

  /**
   * Update project type
   */
  async update(
    id: string,
    dto: UpdateProjectTypeDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectType> {
    const projectType = await this.findById(id, tenantId);
    const beforeState = { ...projectType };

    // Validate parent hierarchy if changing parent
    if (dto.parentTypeId !== undefined && dto.parentTypeId !== projectType.parentTypeId) {
      if (dto.parentTypeId) {
        const parent = await this.findById(dto.parentTypeId, tenantId);
        
        // Prevent setting self as parent
        if (dto.parentTypeId === id) {
          throw new BadRequestException('Cannot set project type as its own parent');
        }

        // Prevent circular reference
        if (parent.hierarchyPath && parent.hierarchyPath.includes(id)) {
          throw new BadRequestException('Circular parent reference detected');
        }

        projectType.parentTypeId = dto.parentTypeId;
        projectType.hierarchyLevel = parent.hierarchyLevel + 1;
        projectType.hierarchyPath = `${parent.hierarchyPath || ''}/${parent.id}`;
      } else {
        projectType.parentTypeId = null;
        projectType.hierarchyLevel = 0;
        projectType.hierarchyPath = null;
      }

      // Update descendants' hierarchy paths
      await this.updateDescendantHierarchy(projectType, tenantId);
    }

    // Update fields
    Object.assign(projectType, {
      ...dto,
      effectiveEndDate: dto.effectiveEndDate ? new Date(dto.effectiveEndDate) : projectType.effectiveEndDate,
      version: projectType.version + 1,
      updatedBy: userId,
    });

    const saved = await this.projectTypeRepository.save(projectType);

    // Identify changed fields
    const changedFields = Object.keys(dto).filter(
      key => dto[key] !== undefined && dto[key] !== beforeState[key],
    );

    // Create version record
    await this.configService.createVersion({
      tenantId,
      configurationType: 'PROJECT_TYPE',
      configurationId: saved.id,
      versionNumber: saved.version,
      changeType: 'UPDATE',
      changeDescription: dto.changeReason,
      configurationSnapshot: saved,
      changedFields: { fields: changedFields, before: beforeState, after: saved },
      changedBy: userId,
      effectiveFrom: new Date(),
    });

    // Create audit log
    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'PROJECT_TYPE',
      configurationId: saved.id,
      configurationCode: saved.projectTypeCode,
      actionType: 'UPDATE',
      actionDescription: `Updated project type: ${dto.changeReason}`,
      beforeState,
      afterState: saved,
      changedFields,
      performedBy: userId,
      changeReason: dto.changeReason,
    });

    return saved;
  }

  /**
   * Update status
   */
  async updateStatus(
    id: string,
    status: string,
    changeReason: string,
    tenantId: string,
    userId: string,
  ): Promise<ProjectType> {
    const projectType = await this.findById(id, tenantId);
    const beforeState = { ...projectType };

    projectType.status = status;
    projectType.updatedBy = userId;

    if (status === 'INACTIVE') {
      projectType.effectiveEndDate = new Date();
    }

    const saved = await this.projectTypeRepository.save(projectType);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'PROJECT_TYPE',
      configurationId: saved.id,
      configurationCode: saved.projectTypeCode,
      actionType: 'STATUS_CHANGE',
      actionDescription: `Changed status to ${status}: ${changeReason}`,
      beforeState,
      afterState: saved,
      changedFields: ['status'],
      performedBy: userId,
      changeReason,
    });

    return saved;
  }

  /**
   * Soft delete project type
   */
  async delete(
    id: string,
    changeReason: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    const projectType = await this.findById(id, tenantId);

    // Check for dependencies
    const hasDependencies = await this.configService.checkDependencies(
      'PROJECT_TYPE',
      id,
      tenantId,
    );

    if (hasDependencies.length > 0) {
      throw new BadRequestException(
        `Cannot delete project type. It is used by: ${hasDependencies.map(d => d.dependentEntityType).join(', ')}`,
      );
    }

    // Check for child types
    if (projectType.childTypes && projectType.childTypes.length > 0) {
      throw new BadRequestException(
        'Cannot delete project type that has child types. Delete children first.',
      );
    }

    projectType.isDeleted = true;
    projectType.deletedAt = new Date();
    projectType.deletedBy = userId;
    projectType.status = 'INACTIVE';

    await this.projectTypeRepository.save(projectType);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'PROJECT_TYPE',
      configurationId: id,
      configurationCode: projectType.projectTypeCode,
      actionType: 'DELETE',
      actionDescription: `Deleted project type: ${changeReason}`,
      beforeState: projectType,
      afterState: null,
      performedBy: userId,
      changeReason,
    });
  }

  /**
   * Bulk action (activate, deactivate, delete)
   */
  async bulkAction(
    dto: BulkProjectTypeActionDto,
    tenantId: string,
    userId: string,
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    const results = { success: 0, failed: 0, errors: [] };

    for (const typeId of dto.typeIds) {
      try {
        switch (dto.action) {
          case 'activate':
            await this.updateStatus(typeId, 'ACTIVE', dto.reason, tenantId, userId);
            break;
          case 'deactivate':
            await this.updateStatus(typeId, 'INACTIVE', dto.reason, tenantId, userId);
            break;
          case 'delete':
            await this.delete(typeId, dto.reason, tenantId, userId);
            break;
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ typeId, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get hierarchy tree
   */
  async getHierarchy(tenantId: string): Promise<ProjectType[]> {
    const allTypes = await this.projectTypeRepository.find({
      where: { tenantId, isDeleted: false },
      order: { hierarchyLevel: 'ASC', displayOrder: 'ASC', projectTypeName: 'ASC' },
    });

    return this.buildHierarchyTree(allTypes);
  }

  /**
   * Get direct children
   */
  async getChildren(parentId: string, tenantId: string): Promise<ProjectType[]> {
    return this.projectTypeRepository.find({
      where: {
        tenantId,
        parentTypeId: parentId,
        isDeleted: false,
      },
      order: { displayOrder: 'ASC', projectTypeName: 'ASC' },
    });
  }

  /**
   * Get all ancestors
   */
  async getAncestors(id: string, tenantId: string): Promise<ProjectType[]> {
    const projectType = await this.findById(id, tenantId);
    
    if (!projectType.hierarchyPath) {
      return [];
    }

    const ancestorIds = projectType.hierarchyPath
      .split('/')
      .filter(id => id && id.trim() !== '');

    if (ancestorIds.length === 0) {
      return [];
    }

    return this.projectTypeRepository.find({
      where: {
        id: In(ancestorIds),
        tenantId,
        isDeleted: false,
      },
      order: { hierarchyLevel: 'ASC' },
    });
  }

  /**
   * CREATE RESOURCE ALLOCATION SETTINGS
   */
  async createResourceAllocationSettings(
    dto: CreateResourceAllocationSettingsDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectResourceAllocationSettings> {
    // Verify project type exists
    await this.findById(dto.projectTypeId, tenantId);

    // Check if settings already exist
    const existing = await this.resourceAllocationRepository.findOne({
      where: { projectTypeId: dto.projectTypeId, tenantId },
    });

    if (existing) {
      throw new ConflictException('Resource allocation settings already exist for this project type');
    }

    const settings = this.resourceAllocationRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.resourceAllocationRepository.save(settings);
  }

  /**
   * CREATE BILLING COST SETTINGS
   */
  async createBillingCostSettings(
    dto: CreateBillingCostSettingsDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectBillingCostSettings> {
    // Verify project type exists
    await this.findById(dto.projectTypeId, tenantId);

    // Check if settings already exist
    const existing = await this.billingCostRepository.findOne({
      where: { projectTypeId: dto.projectTypeId, tenantId },
    });

    if (existing) {
      throw new ConflictException('Billing/cost settings already exist for this project type');
    }

    const settings = this.billingCostRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.billingCostRepository.save(settings);
  }

  /**
   * CLONE PROJECT TYPE
   */
  async clone(
    id: string,
    newCode: string,
    newName: string,
    tenantId: string,
    userId: string,
  ): Promise<ProjectType> {
    const source = await this.findById(id, tenantId);

    const clonedData: any = { ...source };
    delete clonedData.id;
    delete clonedData.createdAt;
    delete clonedData.updatedAt;
    delete clonedData.version;
    delete clonedData.approvedBy;
    delete clonedData.approvedAt;

    clonedData.projectTypeCode = newCode;
    clonedData.projectTypeName = newName;
    clonedData.status = 'DRAFT';
    clonedData.version = 1;

    return this.create(clonedData, tenantId, userId);
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private buildHierarchyTree(flatList: ProjectType[]): ProjectType[] {
    const map = new Map<string, ProjectType>();
    const roots: ProjectType[] = [];

    // First pass: create map
    flatList.forEach(item => {
      map.set(item.id, { ...item, childTypes: [] });
    });

    // Second pass: build tree
    flatList.forEach(item => {
      const node = map.get(item.id);
      if (item.parentTypeId) {
        const parent = map.get(item.parentTypeId);
        if (parent) {
          parent.childTypes = parent.childTypes || [];
          parent.childTypes.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  private async updateDescendantHierarchy(
    parent: ProjectType,
    tenantId: string,
  ): Promise<void> {
    const descendants = await this.projectTypeRepository.find({
      where: {
        tenantId,
        parentTypeId: parent.id,
        isDeleted: false,
      },
    });

    for (const descendant of descendants) {
      descendant.hierarchyLevel = parent.hierarchyLevel + 1;
      descendant.hierarchyPath = `${parent.hierarchyPath || ''}/${parent.id}`;
      await this.projectTypeRepository.save(descendant);

      // Recursively update children
      await this.updateDescendantHierarchy(descendant, tenantId);
    }
  }
}
