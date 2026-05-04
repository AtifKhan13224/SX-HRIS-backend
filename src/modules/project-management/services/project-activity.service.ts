import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, LessThanOrEqual, MoreThanOrEqual, Like, In } from 'typeorm';
import {
  ProjectActivity,
  ActivityScopeMapping,
  ActivityVersion,
  ActivityDependencyLink,
  ActivityAuditLog,
  ActivityStatus,
  ScopeType,
} from '../entities/project-activity.entity';
import {
  CreateProjectActivityDto,
  UpdateProjectActivityDto,
  ActivityQueryDto,
  UpdateActivityStatusDto,
  BulkActivityActionDto,
  ValidateActivityDependenciesDto,
  ApproveActivityDto,
  PaginatedActivityResponseDto,
} from '../dto/project-activity.dto';

/**
 * PROJECT ACTIVITY SERVICE
 * Enterprise-grade business logic for activity configuration management
 * 
 * Features:
 * - Multi-tenant isolated operations
 * - Complete audit trail
 * - Dependency validation
 * - Version control
 * - Effective dating support
 * - Configuration change tracking
 */
@Injectable()
export class ProjectActivityService {
  constructor(
    @InjectRepository(ProjectActivity)
    private readonly activityRepository: Repository<ProjectActivity>,
    @InjectRepository(ActivityScopeMapping)
    private readonly scopeMappingRepository: Repository<ActivityScopeMapping>,
    @InjectRepository(ActivityVersion)
    private readonly activityVersionRepository: Repository<ActivityVersion>,
    @InjectRepository(ActivityDependencyLink)
    private readonly dependencyLinkRepository: Repository<ActivityDependencyLink>,
    @InjectRepository(ActivityAuditLog)
    private readonly auditLogRepository: Repository<ActivityAuditLog>,
  ) {}

  /**
   * CREATE NEW ACTIVITY
   * Creates activity with tenant isolation and audit trail
   */
  async createActivity(
    dto: CreateProjectActivityDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectActivity> {
    // Validate unique activity code within tenant
    const existing = await this.activityRepository.findOne({
      where: {
        tenantId,
        activityCode: dto.activityCode,
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Activity with code '${dto.activityCode}' already exists`,
      );
    }

    // Create activity
    const activity = this.activityRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      status: dto.requiresApproval ? ActivityStatus.PENDING_APPROVAL : ActivityStatus.ACTIVE,
      version: 1,
    });

    const savedActivity = await this.activityRepository.save(activity);

    // Create scope mappings if provided
    if (dto.scopes && dto.scopes.length > 0) {
      const scopeMappings = dto.scopes.map((scope) =>
        this.scopeMappingRepository.create({
          ...scope,
          activityId: savedActivity.id,
          tenantId,
          createdBy: userId,
        }),
      );
      await this.scopeMappingRepository.save(scopeMappings);
    }

    // Create initial version
    await this.createVersion(savedActivity, 'CREATE', 'Initial activity creation', userId);

    // Audit log
    await this.createAuditLog({
      activityId: savedActivity.id,
      activityCode: savedActivity.activityCode,
      actionType: 'CREATE',
      actionDescription: `Activity '${savedActivity.activityName}' created`,
      afterState: savedActivity,
      performedBy: userId,
      tenantId,
    });

    return this.getActivityById(savedActivity.id, tenantId);
  }

  /**
   * GET ACTIVITIES WITH FILTERING AND PAGINATION
   * Supports advanced search, filtering, and multi-tenant isolation
   */
  async getActivities(
    query: ActivityQueryDto,
    tenantId: string,
  ): Promise<PaginatedActivityResponseDto> {
    const {
      search,
      status,
      category,
      type,
      isBillable,
      scopeType,
      scopeEntityId,
      effectiveDate,
      includeInactive,
      page = 1,
      limit = 20,
      sortBy = 'activityCode',
      sortOrder = 'ASC',
    } = query;

    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.scopeMappings', 'scopeMappings')
      .where('activity.tenantId = :tenantId', { tenantId })
      .andWhere('activity.isDeleted = :isDeleted', { isDeleted: false });

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(activity.activityCode ILIKE :search OR activity.activityName ILIKE :search OR activity.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('activity.status = :status', { status });
    } else if (!includeInactive) {
      queryBuilder.andWhere('activity.status = :status', {
        status: ActivityStatus.ACTIVE,
      });
    }

    // Category filter
    if (category) {
      queryBuilder.andWhere('activity.activityCategory = :category', {
        category,
      });
    }

    // Type filter
    if (type) {
      queryBuilder.andWhere('activity.activityType = :type', { type });
    }

    // Billable filter
    if (isBillable !== undefined) {
      queryBuilder.andWhere('activity.isBillable = :isBillable', {
        isBillable,
      });
    }

    // Effective date filter
    if (effectiveDate) {
      queryBuilder
        .andWhere('activity.effectiveStartDate <= :effectiveDate', {
          effectiveDate,
        })
        .andWhere(
          '(activity.effectiveEndDate IS NULL OR activity.effectiveEndDate >= :effectiveDate)',
          { effectiveDate },
        );
    }

    // Scope filter
    if (scopeType) {
      queryBuilder.andWhere('scopeMappings.scopeType = :scopeType', {
        scopeType,
      });
    }

    if (scopeEntityId) {
      queryBuilder.andWhere('scopeMappings.scopeEntityId = :scopeEntityId', {
        scopeEntityId,
      });
    }

    // Sorting
    const sortField = `activity.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * GET ACTIVITY BY ID
   * Retrieves activity with all related data
   */
  async getActivityById(
    id: string,
    tenantId: string,
  ): Promise<ProjectActivity> {
    const activity = await this.activityRepository.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['scopeMappings', 'dependencies'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID '${id}' not found`);
    }

    return activity;
  }

  /**
   * UPDATE ACTIVITY
   * Updates activity with version control and audit trail
   */
  async updateActivity(
    id: string,
    dto: UpdateProjectActivityDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectActivity> {
    const activity = await this.getActivityById(id, tenantId);

    // Capture before state for audit
    const beforeState = { ...activity };

    // Detect changed fields
    const changedFields: string[] = [];
    Object.keys(dto).forEach((key) => {
      if (dto[key] !== undefined && dto[key] !== activity[key]) {
        changedFields.push(key);
      }
    });

    if (changedFields.length === 0) {
      throw new BadRequestException('No changes detected');
    }

    // Update activity
    Object.assign(activity, dto);
    activity.updatedBy = userId;
    activity.version += 1;

    const updatedActivity = await this.activityRepository.save(activity);

    // Create version record
    await this.createVersion(
      updatedActivity,
      'UPDATE',
      dto.changeReason || `Updated fields: ${changedFields.join(', ')}`,
      userId,
      changedFields,
    );

    // Audit log
    await this.createAuditLog({
      activityId: id,
      activityCode: activity.activityCode,
      actionType: 'UPDATE',
      actionDescription: `Activity '${activity.activityName}' updated`,
      beforeState,
      afterState: updatedActivity,
      changedFields,
      performedBy: userId,
      tenantId,
      changeReason: dto.changeReason,
    });

    return this.getActivityById(id, tenantId);
  }

  /**
   * UPDATE ACTIVITY STATUS
   * Changes activity status with validation and audit
   */
  async updateActivityStatus(
    id: string,
    dto: UpdateActivityStatusDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectActivity> {
    const activity = await this.getActivityById(id, tenantId);

    if (activity.status === dto.status) {
      throw new BadRequestException(
        `Activity is already in '${dto.status}' status`,
      );
    }

    // Validate status transition
    this.validateStatusTransition(activity.status, dto.status);

    const beforeState = { ...activity };
    activity.status = dto.status;
    activity.updatedBy = userId;
    activity.version += 1;

    if (dto.status === ActivityStatus.INACTIVE) {
      activity.deactivatedBy = userId;
      activity.deactivatedAt = new Date();
      activity.deactivationReason = dto.reason;
    }

    const updatedActivity = await this.activityRepository.save(activity);

    // Create version
    await this.createVersion(
      updatedActivity,
      'STATUS_CHANGE',
      `Status changed from ${beforeState.status} to ${dto.status}. Reason: ${dto.reason || 'Not provided'}`,
      userId,
      ['status'],
    );

    // Audit log
    await this.createAuditLog({
      activityId: id,
      activityCode: activity.activityCode,
      actionType: dto.status === ActivityStatus.ACTIVE ? 'ACTIVATE' : 'DEACTIVATE',
      actionDescription: `Activity status changed to ${dto.status}`,
      beforeState,
      afterState: updatedActivity,
      changedFields: ['status'],
      performedBy: userId,
      tenantId,
      changeReason: dto.reason,
    });

    return updatedActivity;
  }

  /**
   * APPROVE ACTIVITY
   * Approves pending activity
   */
  async approveActivity(
    dto: ApproveActivityDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectActivity> {
    const activity = await this.getActivityById(dto.activityId, tenantId);

    if (activity.status !== ActivityStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Activity is not in pending approval status',
      );
    }

    activity.status = ActivityStatus.ACTIVE;
    activity.approvedBy = userId;
    activity.approvedAt = new Date();
    activity.approvalNotes = dto.approvalNotes;
    activity.updatedBy = userId;
    activity.version += 1;

    const updatedActivity = await this.activityRepository.save(activity);

    // Create version
    await this.createVersion(
      updatedActivity,
      'APPROVAL',
      `Activity approved. Notes: ${dto.approvalNotes || 'None'}`,
      userId,
    );

    // Audit log
    await this.createAuditLog({
      activityId: activity.id,
      activityCode: activity.activityCode,
      actionType: 'APPROVE',
      actionDescription: `Activity approved`,
      afterState: updatedActivity,
      performedBy: userId,
      tenantId,
      changeReason: dto.approvalNotes,
      approvalStatus: 'APPROVED',
    });

    return updatedActivity;
  }

  /**
   * DELETE ACTIVITY (SOFT DELETE)
   * Validates dependencies before deletion
   */
  async deleteActivity(
    id: string,
    tenantId: string,
    userId: string,
    reason?: string,
  ): Promise<void> {
    const activity = await this.getActivityById(id, tenantId);

    // Check for blocking dependencies
    const dependencies = await this.validateDependencies(id, tenantId, true);

    if (dependencies.length > 0) {
      throw new BadRequestException(
        `Cannot delete activity. It has ${dependencies.length} blocking dependencies: ${dependencies.map((d) => d.dependentEntityType).join(', ')}`,
      );
    }

    // Soft delete
    activity.isDeleted = true;
    activity.deletedAt = new Date();
    activity.deletedBy = userId;
    activity.status = ActivityStatus.INACTIVE;

    await this.activityRepository.save(activity);

    // Audit log
    await this.createAuditLog({
      activityId: id,
      activityCode: activity.activityCode,
      actionType: 'DELETE',
      actionDescription: `Activity soft deleted`,
      beforeState: activity,
      performedBy: userId,
      tenantId,
      changeReason: reason,
    });
  }

  /**
   * BULK OPERATIONS
   * Perform bulk actions on multiple activities
   */
  async bulkAction(
    dto: BulkActivityActionDto,
    tenantId: string,
    userId: string,
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const activityId of dto.activityIds) {
      try {
        if (dto.action === 'ACTIVATE') {
          await this.updateActivityStatus(
            activityId,
            { status: ActivityStatus.ACTIVE, reason: dto.reason },
            tenantId,
            userId,
          );
        } else if (dto.action === 'DEACTIVATE') {
          await this.updateActivityStatus(
            activityId,
            { status: ActivityStatus.INACTIVE, reason: dto.reason },
            tenantId,
            userId,
          );
        } else if (dto.action === 'DELETE') {
          await this.deleteActivity(activityId, tenantId, userId, dto.reason);
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          activityId,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * VALIDATE DEPENDENCIES
   * Checks if activity is referenced elsewhere
   */
  async validateDependencies(
    activityId: string,
    tenantId: string,
    checkBlockingOnly: boolean = false,
  ): Promise<any[]> {
    const queryBuilder = this.dependencyLinkRepository
      .createQueryBuilder('link')
      .where('link.sourceActivityId = :activityId', { activityId })
      .andWhere('link.tenantId = :tenantId', { tenantId });

    if (checkBlockingOnly) {
      queryBuilder.andWhere('link.isBlocking = :isBlocking', {
        isBlocking: true,
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * GET ACTIVITY VERSIONS
   * Retrieves version history
   */
  async getActivityVersions(
    activityId: string,
    tenantId: string,
  ): Promise<ActivityVersion[]> {
    return await this.activityVersionRepository.find({
      where: { activityId, tenantId },
      order: { versionNumber: 'DESC' },
    });
  }

  /**
   * GET ACTIVITY AUDIT LOGS
   * Retrieves comprehensive audit trail
   */
  async getActivityAuditLogs(
    activityId: string,
    tenantId: string,
  ): Promise<ActivityAuditLog[]> {
    return await this.auditLogRepository.find({
      where: { activityId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * ADD ACTIVITY SCOPE
   * Adds organizational scope mapping
   */
  async addActivityScope(
    activityId: string,
    scopeData: any,
    tenantId: string,
    userId: string,
  ): Promise<ActivityScopeMapping> {
    const activity = await this.getActivityById(activityId, tenantId);

    const scope = this.scopeMappingRepository.create({
      ...scopeData,
      activityId,
      tenantId,
      createdBy: userId,
    });

    const savedScopes = await this.scopeMappingRepository.save(scope);
    const scopeArray = Array.isArray(savedScopes) ? savedScopes : [savedScopes];

    // Audit log
    await this.createAuditLog({
      activityId,
      activityCode: activity.activityCode,
      actionType: 'SCOPE_ADDED',
      actionDescription: `Scope '${scopeData.scopeType}' added`,
      afterState: scopeArray[0],
      performedBy: userId,
      tenantId,
    });

    return scopeArray[0];
  }

  /**
   * PRIVATE: CREATE VERSION RECORD
   */
  private async createVersion(
    activity: ProjectActivity,
    changeType: string,
    description: string,
    userId: string,
    changedFields?: string[],
  ): Promise<ActivityVersion> {
    const version = this.activityVersionRepository.create({
      activityId: activity.id,
      tenantId: activity.tenantId,
      versionNumber: activity.version,
      changeType,
      changeDescription: description,
      configurationSnapshot: activity,
      changedFields: changedFields || [],
      effectiveFrom: new Date(),
      changedBy: userId,
    });

    return await this.activityVersionRepository.save(version);
  }

  /**
   * PRIVATE: CREATE AUDIT LOG
   */
  private async createAuditLog(data: {
    activityId: string;
    activityCode: string;
    actionType: string;
    actionDescription: string;
    beforeState?: any;
    afterState?: any;
    changedFields?: string[];
    performedBy: string;
    tenantId: string;
    changeReason?: string;
    approvalStatus?: string;
  }): Promise<ActivityAuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...data,
      performedByName: 'System User', // TODO: Get from user service
      performedByRole: 'Admin', // TODO: Get from user context
    });

    return await this.auditLogRepository.save(auditLog);
  }

  /**
   * PRIVATE: VALIDATE STATUS TRANSITION
   */
  private validateStatusTransition(
    currentStatus: ActivityStatus,
    newStatus: ActivityStatus,
  ): void {
    const validTransitions = {
      [ActivityStatus.DRAFT]: [
        ActivityStatus.PENDING_APPROVAL,
        ActivityStatus.ACTIVE,
        ActivityStatus.INACTIVE,
      ],
      [ActivityStatus.PENDING_APPROVAL]: [
        ActivityStatus.ACTIVE,
        ActivityStatus.DRAFT,
      ],
      [ActivityStatus.ACTIVE]: [
        ActivityStatus.INACTIVE,
        ActivityStatus.DEPRECATED,
      ],
      [ActivityStatus.INACTIVE]: [ActivityStatus.ACTIVE],
      [ActivityStatus.DEPRECATED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
      );
    }
  }
}
