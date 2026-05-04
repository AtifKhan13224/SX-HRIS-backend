import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import {
  ProjectSubActivity,
  SubActivityScopeMapping,
  SubActivityVersion,
  SubActivityDependencyLink,
  SubActivityAuditLog,
} from '../entities/project-sub-activity.entity';
import { ProjectActivity, ActivityStatus } from '../entities/project-activity.entity';
import {
  CreateProjectSubActivityDto,
  UpdateProjectSubActivityDto,
  SubActivityQueryDto,
  BulkSubActivityActionDto,
  SubActivityScopeMappingDto,
  SubActivityApprovalDto,
} from '../dto/project-sub-activity.dto';

@Injectable()
export class ProjectSubActivityService {
  constructor(
    @InjectRepository(ProjectSubActivity)
    private readonly subActivityRepository: Repository<ProjectSubActivity>,
    @InjectRepository(SubActivityScopeMapping)
    private readonly scopeRepository: Repository<SubActivityScopeMapping>,
    @InjectRepository(SubActivityVersion)
    private readonly versionRepository: Repository<SubActivityVersion>,
    @InjectRepository(SubActivityDependencyLink)
    private readonly dependencyRepository: Repository<SubActivityDependencyLink>,
    @InjectRepository(SubActivityAuditLog)
    private readonly auditLogRepository: Repository<SubActivityAuditLog>,
    @InjectRepository(ProjectActivity)
    private readonly activityRepository: Repository<ProjectActivity>,
  ) {}

  /**
   * CREATE SUB-ACTIVITY
   * Creates new sub-activity with validation of parent activity
   */
  async createSubActivity(
    dto: CreateProjectSubActivityDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectSubActivity> {
    // Validate parent activity exists and is active
    await this.validateParentActivity(dto.parentActivityId, tenantId);

    // Check for duplicate code
    const existing = await this.subActivityRepository.findOne({
      where: {
        tenantId,
        subActivityCode: dto.subActivityCode,
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(`Sub-Activity with code '${dto.subActivityCode}' already exists`);
    }

    // Create sub-activity
    const subActivity = this.subActivityRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      status: ActivityStatus.DRAFT,
      version: 1,
    });

    const saved = await this.subActivityRepository.save(subActivity);

    // Create scope mappings if provided
    if (dto.scopes && dto.scopes.length > 0) {
      await this.createScopeMappings(saved.id, dto.scopes, tenantId, userId);
    }

    // Create initial version
    await this.createVersion(saved, 'CREATE', 'Initial creation', userId, tenantId);

    // Create audit log
    await this.createAuditLog({
      subActivityId: saved.id,
      subActivityCode: saved.subActivityCode,
      parentActivityId: saved.parentActivityId,
      actionType: 'CREATE',
      actionDescription: `Sub-Activity created: ${saved.subActivityName}`,
      afterState: saved,
      performedBy: userId,
      performedByName: 'User',
      tenantId,
    });

    return this.getSubActivityById(saved.id, tenantId);
  }

  /**
   * GET SUB-ACTIVITIES WITH FILTERING AND PAGINATION
   */
  async getSubActivities(
    query: SubActivityQueryDto,
    tenantId: string,
  ): Promise<{ data: ProjectSubActivity[]; total: number; page: number; limit: number }> {
    const {
      search,
      parentActivityId,
      status,
      workType,
      isBillable,
      scopeType,
      effectiveDate,
      includeInactive = false,
      page = 1,
      limit = 20,
      sortBy = 'subActivityName',
      sortOrder = 'ASC',
    } = query;

    const queryBuilder = this.subActivityRepository
      .createQueryBuilder('sa')
      .leftJoinAndSelect('sa.parentActivity', 'pa')
      .leftJoinAndSelect('sa.scopeMappings', 'scope')
      .where('sa.tenantId = :tenantId', { tenantId })
      .andWhere('sa.isDeleted = :isDeleted', { isDeleted: false });

    // Filter by parent activity
    if (parentActivityId) {
      queryBuilder.andWhere('sa.parentActivityId = :parentActivityId', { parentActivityId });
    }

    // Search by code or name
    if (search) {
      queryBuilder.andWhere(
        '(sa.subActivityCode ILIKE :search OR sa.subActivityName ILIKE :search OR sa.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('sa.status = :status', { status });
    } else if (!includeInactive) {
      queryBuilder.andWhere('sa.status = :activeStatus', { activeStatus: ActivityStatus.ACTIVE });
    }

    // Filter by work type
    if (workType) {
      queryBuilder.andWhere('sa.workType = :workType', { workType });
    }

    // Filter by billable
    if (isBillable !== undefined) {
      queryBuilder.andWhere('sa.isBillable = :isBillable', { isBillable });
    }

    // Filter by scope type
    if (scopeType) {
      queryBuilder.andWhere('scope.scopeType = :scopeType', { scopeType });
    }

    // Filter by effective date
    if (effectiveDate) {
      queryBuilder.andWhere('sa.effectiveStartDate <= :effectiveDate', { effectiveDate });
      queryBuilder.andWhere('(sa.effectiveEndDate IS NULL OR sa.effectiveEndDate >= :effectiveDate)', { effectiveDate });
    }

    // Sorting
    queryBuilder.orderBy(`sa.${sortBy}`, sortOrder);

    // Pagination
    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  /**
   * GET SUB-ACTIVITY BY ID
   */
  async getSubActivityById(id: string, tenantId: string): Promise<ProjectSubActivity> {
    const subActivity = await this.subActivityRepository.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['parentActivity', 'scopeMappings', 'versions', 'dependencies'],
    });

    if (!subActivity) {
      throw new NotFoundException(`Sub-Activity with ID ${id} not found`);
    }

    return subActivity;
  }

  /**
   * GET SUB-ACTIVITIES BY PARENT ACTIVITY
   */
  async getSubActivitiesByParent(
    parentActivityId: string,
    tenantId: string,
    status?: ActivityStatus,
  ): Promise<ProjectSubActivity[]> {
    const where: any = {
      parentActivityId,
      tenantId,
      isDeleted: false,
    };

    if (status) {
      where.status = status;
    }

    return this.subActivityRepository.find({
      where,
      relations: ['scopeMappings'],
      order: { displayOrder: 'ASC', subActivityName: 'ASC' },
    });
  }

  /**
   * UPDATE SUB-ACTIVITY
   */
  async updateSubActivity(
    id: string,
    dto: UpdateProjectSubActivityDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectSubActivity> {
    const subActivity = await this.getSubActivityById(id, tenantId);

    // If parent activity is being changed, validate new parent
    if (dto.parentActivityId && dto.parentActivityId !== subActivity.parentActivityId) {
      await this.validateParentActivity(dto.parentActivityId, tenantId);
    }

    // Check for code uniqueness if code is being changed
    if (dto.subActivityCode && dto.subActivityCode !== subActivity.subActivityCode) {
      const existing = await this.subActivityRepository.findOne({
        where: {
          tenantId,
          subActivityCode: dto.subActivityCode,
          isDeleted: false,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Sub-Activity with code '${dto.subActivityCode}' already exists`);
      }
    }

    // Capture before state
    const beforeState = { ...subActivity };

    // Update fields
    Object.assign(subActivity, {
      ...dto,
      updatedBy: userId,
      version: subActivity.version + 1,
    });

    const updated = await this.subActivityRepository.save(subActivity);

    // Detect changed fields
    const changedFields = Object.keys(dto).filter(
      (key) => dto[key] !== undefined && dto[key] !== beforeState[key],
    );

    // Create new version
    await this.createVersion(
      updated,
      'UPDATE',
      dto.changeReason || 'Configuration updated',
      userId,
      tenantId,
      changedFields,
    );

    // Create audit log
    await this.createAuditLog({
      subActivityId: updated.id,
      subActivityCode: updated.subActivityCode,
      parentActivityId: updated.parentActivityId,
      actionType: 'UPDATE',
      actionDescription: `Sub-Activity updated: ${updated.subActivityName}`,
      beforeState,
      afterState: updated,
      changedFields,
      changeReason: dto.changeReason,
      performedBy: userId,
      performedByName: 'User',
      tenantId,
    });

    return this.getSubActivityById(updated.id, tenantId);
  }

  /**
   * UPDATE SUB-ACTIVITY STATUS
   */
  async updateSubActivityStatus(
    id: string,
    status: ActivityStatus,
    reason: string,
    tenantId: string,
    userId: string,
  ): Promise<ProjectSubActivity> {
    const subActivity = await this.getSubActivityById(id, tenantId);

    const oldStatus = subActivity.status;
    subActivity.status = status;
    subActivity.updatedBy = userId;

    if (status === ActivityStatus.INACTIVE || status === ActivityStatus.DEPRECATED) {
      subActivity.deactivatedBy = userId;
      subActivity.deactivatedAt = new Date();
      subActivity.deactivationReason = reason;
    }

    const updated = await this.subActivityRepository.save(subActivity);

    // Create audit log
    await this.createAuditLog({
      subActivityId: updated.id,
      subActivityCode: updated.subActivityCode,
      parentActivityId: updated.parentActivityId,
      actionType: 'STATUS_CHANGE',
      actionDescription: `Status changed from ${oldStatus} to ${status}`,
      beforeState: { status: oldStatus },
      afterState: { status },
      changeReason: reason,
      performedBy: userId,
      performedByName: 'User',
      tenantId,
    });

    return this.getSubActivityById(updated.id, tenantId);
  }

  /**
   * DELETE SUB-ACTIVITY (SOFT DELETE)
   */
  async deleteSubActivity(id: string, tenantId: string, userId: string): Promise<void> {
    const subActivity = await this.getSubActivityById(id, tenantId);

    // Check for blocking dependencies
    const hasBlockingDeps = await this.validateDependencies(id, tenantId);
    if (hasBlockingDeps) {
      throw new BadRequestException(
        'Cannot delete sub-activity: it has blocking dependencies (referenced in projects, tasks, or timesheets)',
      );
    }

    // Soft delete
    subActivity.isDeleted = true;
    subActivity.deletedAt = new Date();
    subActivity.deletedBy = userId;

    await this.subActivityRepository.save(subActivity);

    // Create audit log
    await this.createAuditLog({
      subActivityId: subActivity.id,
      subActivityCode: subActivity.subActivityCode,
      parentActivityId: subActivity.parentActivityId,
      actionType: 'DELETE',
      actionDescription: `Sub-Activity deleted: ${subActivity.subActivityName}`,
      beforeState: { isDeleted: false },
      afterState: { isDeleted: true },
      performedBy: userId,
      performedByName: 'User',
      tenantId,
    });
  }

  /**
   * BULK ACTION
   */
  async bulkAction(
    dto: BulkSubActivityActionDto,
    tenantId: string,
    userId: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const { subActivityIds, action, reason } = dto;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of subActivityIds) {
      try {
        if (action === 'ACTIVATE') {
          await this.updateSubActivityStatus(id, ActivityStatus.ACTIVE, reason || 'Bulk activation', tenantId, userId);
        } else if (action === 'DEACTIVATE') {
          await this.updateSubActivityStatus(id, ActivityStatus.INACTIVE, reason || 'Bulk deactivation', tenantId, userId);
        } else if (action === 'DELETE') {
          await this.deleteSubActivity(id, tenantId, userId);
        }
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to ${action.toLowerCase()} sub-activity ${id}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * APPROVE SUB-ACTIVITY
   */
  async approveSubActivity(
    dto: SubActivityApprovalDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectSubActivity> {
    const subActivity = await this.getSubActivityById(dto.subActivityId, tenantId);

    if (dto.decision === 'APPROVE') {
      subActivity.status = ActivityStatus.ACTIVE;
      subActivity.approvedBy = userId;
      subActivity.approvedAt = new Date();
      subActivity.approvalNotes = dto.notes;
    } else {
      subActivity.status = ActivityStatus.DRAFT;
      subActivity.approvalNotes = dto.notes;
    }

    subActivity.updatedBy = userId;
    const updated = await this.subActivityRepository.save(subActivity);

    // Create audit log
    await this.createAuditLog({
      subActivityId: updated.id,
      subActivityCode: updated.subActivityCode,
      parentActivityId: updated.parentActivityId,
      actionType: 'APPROVE',
      actionDescription: `Sub-Activity ${dto.decision === 'APPROVE' ? 'approved' : 'rejected'}`,
      afterState: { status: updated.status, approvalNotes: dto.notes },
      changeReason: dto.notes,
      performedBy: userId,
      performedByName: 'User',
      approvalStatus: dto.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      tenantId,
    });

    return this.getSubActivityById(updated.id, tenantId);
  }

  /**
   * GET VERSION HISTORY
   */
  async getVersionHistory(subActivityId: string, tenantId: string): Promise<SubActivityVersion[]> {
    return this.versionRepository.find({
      where: { subActivityId, tenantId },
      order: { versionNumber: 'DESC' },
    });
  }

  /**
   * GET AUDIT LOGS
   */
  async getAuditLogs(subActivityId: string, tenantId: string): Promise<SubActivityAuditLog[]> {
    return this.auditLogRepository.find({
      where: { subActivityId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * VALIDATE DEPENDENCIES
   */
  async validateDependencies(subActivityId: string, tenantId: string): Promise<boolean> {
    const blockingDeps = await this.dependencyRepository.count({
      where: {
        sourceSubActivityId: subActivityId,
        tenantId,
        isBlocking: true,
      },
    });

    return blockingDeps > 0;
  }

  /**
   * ADD SCOPE MAPPING
   */
  async addSubActivityScope(
    subActivityId: string,
    dto: SubActivityScopeMappingDto,
    tenantId: string,
    userId: string,
  ): Promise<SubActivityScopeMapping> {
    const subActivity = await this.getSubActivityById(subActivityId, tenantId);

    const scope = this.scopeRepository.create({
      ...dto,
      subActivityId: subActivity.id,
      tenantId,
      createdBy: userId,
    });

    const savedScopes = await this.scopeRepository.save(scope);
    const scopeArray = Array.isArray(savedScopes) ? savedScopes : [savedScopes];
    return scopeArray[0];
  }

  /**
   * VALIDATE PARENT ACTIVITY
   * Ensures parent activity exists, is active, and belongs to the same tenant
   */
  private async validateParentActivity(parentActivityId: string, tenantId: string): Promise<void> {
    const parentActivity = await this.activityRepository.findOne({
      where: { id: parentActivityId, tenantId, isDeleted: false },
    });

    if (!parentActivity) {
      throw new NotFoundException(`Parent activity with ID ${parentActivityId} not found`);
    }

    if (parentActivity.status !== ActivityStatus.ACTIVE && parentActivity.status !== ActivityStatus.DRAFT) {
      throw new BadRequestException(
        `Parent activity must be ACTIVE or DRAFT. Current status: ${parentActivity.status}`,
      );
    }

    // Check if parent activity allows sub-activities
    if (!parentActivity.allowSubActivities) {
      throw new BadRequestException(`Parent activity '${parentActivity.activityName}' does not allow sub-activities`);
    }
  }

  /**
   * CREATE VERSION
   */
  private async createVersion(
    subActivity: ProjectSubActivity,
    changeType: string,
    description: string,
    userId: string,
    tenantId: string,
    changedFields?: string[],
  ): Promise<void> {
    const version = this.versionRepository.create({
      tenantId,
      subActivityId: subActivity.id,
      versionNumber: subActivity.version,
      changeType,
      changeDescription: description,
      configurationSnapshot: subActivity as any,
      changedFields: changedFields ? (changedFields as any) : null,
      effectiveFrom: new Date(),
      changedBy: userId,
    });

    await this.versionRepository.save(version);
  }

  /**
   * CREATE AUDIT LOG
   */
  private async createAuditLog(data: {
    subActivityId: string;
    subActivityCode: string;
    parentActivityId: string;
    actionType: string;
    actionDescription: string;
    beforeState?: any;
    afterState?: any;
    changedFields?: string[];
    changeReason?: string;
    performedBy: string;
    performedByName: string;
    approvalStatus?: string;
    tenantId: string;
  }): Promise<void> {
    const log = this.auditLogRepository.create(data);
    await this.auditLogRepository.save(log);
  }

  /**
   * CREATE SCOPE MAPPINGS
   */
  private async createScopeMappings(
    subActivityId: string,
    scopes: SubActivityScopeMappingDto[],
    tenantId: string,
    userId: string,
  ): Promise<void> {
    const mappings = scopes.map((scope) =>
      this.scopeRepository.create({
        ...scope,
        subActivityId,
        tenantId,
        createdBy: userId,
      }),
    );

    await this.scopeRepository.save(mappings);
  }
}
