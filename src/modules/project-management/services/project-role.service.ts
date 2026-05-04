import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, In } from 'typeorm';
import {
  ProjectRole,
  ProjectRoleHierarchy,
  ProjectRoleScopeMapping,
  ProjectRoleVersion,
  ProjectRoleDependencyLink,
  ProjectRoleAuditLog,
  RoleCategory,
  SkillLevel,
} from '../entities/project-role.entity';
import { ActivityStatus } from '../entities/project-activity.entity';
import {
  CreateProjectRoleDto,
  UpdateProjectRoleDto,
  ProjectRoleQueryDto,
  BulkProjectRoleActionDto,
  ProjectRoleScopeMappingDto,
  ProjectRoleApprovalDto,
  ProjectRoleHierarchyDto,
  UpdateProjectRoleStatusDto,
} from '../dto/project-role.dto';

/**
 * PROJECT ROLE SERVICE
 * Enterprise-grade role management with hierarchical support
 * Handles CRUD, hierarchy, versioning, audit, and dependency validation
 */
@Injectable()
export class ProjectRoleService {
  constructor(
    @InjectRepository(ProjectRole)
    private readonly projectRoleRepository: Repository<ProjectRole>,
    @InjectRepository(ProjectRoleHierarchy)
    private readonly roleHierarchyRepository: Repository<ProjectRoleHierarchy>,
    @InjectRepository(ProjectRoleScopeMapping)
    private readonly roleScopeMappingRepository: Repository<ProjectRoleScopeMapping>,
    @InjectRepository(ProjectRoleVersion)
    private readonly roleVersionRepository: Repository<ProjectRoleVersion>,
    @InjectRepository(ProjectRoleDependencyLink)
    private readonly roleDependencyRepository: Repository<ProjectRoleDependencyLink>,
    @InjectRepository(ProjectRoleAuditLog)
    private readonly roleAuditLogRepository: Repository<ProjectRoleAuditLog>,
  ) {}

  /**
   * CREATE PROJECT ROLE
   * Creates new role with tenant isolation, validation, and audit
   */
  async createRole(
    tenantId: string,
    userId: string,
    createDto: CreateProjectRoleDto,
  ): Promise<ProjectRole> {
    // Check for duplicate role code within tenant
    const existingRole = await this.projectRoleRepository.findOne({
      where: { tenantId, roleCode: createDto.roleCode, isDeleted: false },
    });

    if (existingRole) {
      throw new ConflictException(
        `A role with code '${createDto.roleCode}' already exists in this tenant.`,
      );
    }

    // Validate parent role if specified
    if (createDto.parentRoleId) {
      await this.validateParentRole(tenantId, createDto.parentRoleId);
      await this.validateNoCircularReference(createDto.parentRoleId, null);
    }

    // Validate experience range
    if (
      createDto.minExperienceYears !== undefined &&
      createDto.maxExperienceYears !== undefined &&
      createDto.minExperienceYears > createDto.maxExperienceYears
    ) {
      throw new BadRequestException(
        'Minimum experience years cannot exceed maximum experience years.',
      );
    }

    // Create role entity
    const role = this.projectRoleRepository.create({
      ...createDto,
      tenantId,
      createdBy: userId,
      updatedBy: userId,
      version: 1,
      status: createDto.status || ActivityStatus.DRAFT,
      // Note: hierarchy_path and hierarchy_level computed by database trigger
    });

    const savedRole = await this.projectRoleRepository.save(role);

    // Create initial version
    await this.createVersion(savedRole, 'CREATE', 'Initial role creation', userId);

    // Create audit log
    await this.createAuditLog(
      savedRole,
      'CREATE',
      'Role created',
      null,
      savedRole,
      userId,
      'System User',
    );

    return savedRole;
  }

  /**
   * GET ROLES WITH FILTERS AND PAGINATION
   * Supports complex filtering and hierarchical queries
   */
  async getRoles(tenantId: string, queryDto: ProjectRoleQueryDto): Promise<{
    roles: ProjectRole[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      roleCategory,
      skillLevel,
      status,
      parentRoleId,
      departmentId,
      practiceArea,
      scopeType,
      effectiveDate,
      includeInactive,
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.projectRoleRepository
      .createQueryBuilder('role')
      .where('role.tenant_id = :tenantId', { tenantId })
      .andWhere('role.is_deleted = :isDeleted', { isDeleted: false });

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(role.role_code) LIKE LOWER(:search) OR LOWER(role.role_name) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Category filter
    if (roleCategory) {
      queryBuilder.andWhere('role.role_category = :roleCategory', {
        roleCategory,
      });
    }

    // Skill level filter
    if (skillLevel) {
      queryBuilder.andWhere('role.skill_level = :skillLevel', { skillLevel });
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('role.status = :status', { status });
    } else if (!includeInactive) {
      queryBuilder.andWhere('role.status = :activeStatus', {
        activeStatus: ActivityStatus.ACTIVE,
      });
    }

    // Parent role filter
    if (parentRoleId) {
      queryBuilder.andWhere('role.parent_role_id = :parentRoleId', {
        parentRoleId,
      });
    }

    // Department filter
    if (departmentId) {
      queryBuilder.andWhere('role.department_id = :departmentId', {
        departmentId,
      });
    }

    // Practice area filter
    if (practiceArea) {
      queryBuilder.andWhere('role.practice_area = :practiceArea', {
        practiceArea,
      });
    }

    // Effective date filter
    if (effectiveDate) {
      queryBuilder.andWhere(
        'role.effective_start_date <= :effectiveDate',
        { effectiveDate },
      );
      queryBuilder.andWhere(
        '(role.effective_end_date IS NULL OR role.effective_end_date >= :effectiveDate)',
        { effectiveDate },
      );
    }

    // Scope filter (requires join)
    if (scopeType) {
      queryBuilder
        .leftJoin('role.scopeMappings', 'scope')
        .andWhere('scope.scope_type = :scopeType', { scopeType });
    }

    // Count total before pagination
    const total = await queryBuilder.getCount();

    // Apply sorting
    const sortColumn = sortBy.replace(/_/g, '');
    queryBuilder.orderBy(`role.${sortColumn}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const roles = await queryBuilder.getMany();

    return {
      roles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * GET ROLE BY ID
   * Retrieves single role with related data
   */
  async getRoleById(
    tenantId: string,
    roleId: string,
  ): Promise<ProjectRole> {
    const role = await this.projectRoleRepository.findOne({
      where: { id: roleId, tenantId, isDeleted: false },
      relations: ['parentRole', 'childRoles', 'scopeMappings'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found.`);
    }

    return role;
  }

  /**
   * GET ROLE HIERARCHY
   * Builds complete hierarchy tree starting from a role
   * Returns role with all descendants in tree structure
   */
  async getRoleHierarchy(
    tenantId: string,
    roleId: string,
  ): Promise<any> {
    const role = await this.getRoleById(tenantId, roleId);

    // Use materialized path for efficient descendant query
    const descendants = await this.projectRoleRepository
      .createQueryBuilder('role')
      .where('role.tenant_id = :tenantId', { tenantId })
      .andWhere('role.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('role.hierarchy_path LIKE :path', {
        path: `${role.hierarchyPath}/%`,
      })
      .orderBy('role.hierarchy_level', 'ASC')
      .addOrderBy('role.display_order', 'ASC')
      .getMany();

    // Build tree structure
    const buildTree = (parentId: string | null): any[] => {
      return descendants
        .filter((r) => r.parentRoleId === parentId)
        .map((r) => ({
          ...r,
          children: buildTree(r.id),
        }));
    };

    return {
      ...role,
      children: buildTree(role.id),
    };
  }

  /**
   * GET ROLE CHILDREN
   * Returns direct children of a role
   */
  async getRoleChildren(
    tenantId: string,
    parentRoleId: string,
  ): Promise<ProjectRole[]> {
    return this.projectRoleRepository.find({
      where: {
        tenantId,
        parentRoleId,
        isDeleted: false,
      },
      order: { displayOrder: 'ASC', roleName: 'ASC' },
    });
  }

  /**
   * GET ROLE ANCESTORS
   * Returns parent chain from root to role
   */
  async getRoleAncestors(
    tenantId: string,
    roleId: string,
  ): Promise<ProjectRole[]> {
    const role = await this.getRoleById(tenantId, roleId);

    if (!role.hierarchyPath) {
      return [];
    }

    // Extract ancestor IDs from hierarchy path
    const ancestorIds = role.hierarchyPath
      .split('/')
      .filter((id) => id && id !== role.id);

    if (ancestorIds.length === 0) {
      return [];
    }

    const ancestors = await this.projectRoleRepository.find({
      where: {
        id: In(ancestorIds),
        tenantId,
        isDeleted: false,
      },
      order: { hierarchyLevel: 'ASC' },
    });

    return ancestors;
  }

  /**
   * UPDATE ROLE
   * Updates role with version control and hierarchy validation
   */
  async updateRole(
    tenantId: string,
    userId: string,
    roleId: string,
    updateDto: UpdateProjectRoleDto,
  ): Promise<ProjectRole> {
    const role = await this.getRoleById(tenantId, roleId);

    // Store original state for audit
    const beforeState = { ...role };

    // Validate parent change
    if (updateDto.parentRoleId !== undefined && updateDto.parentRoleId !== role.parentRoleId) {
      if (updateDto.parentRoleId) {
        await this.validateParentRole(tenantId, updateDto.parentRoleId);
        await this.validateNoCircularReference(updateDto.parentRoleId, roleId);
      }
    }

    // Validate experience range
    const minExp = updateDto.minExperienceYears ?? role.minExperienceYears;
    const maxExp = updateDto.maxExperienceYears ?? role.maxExperienceYears;
    if (minExp !== undefined && maxExp !== undefined && minExp > maxExp) {
      throw new BadRequestException(
        'Minimum experience years cannot exceed maximum experience years.',
      );
    }

    // Detect changed fields
    const changedFields: string[] = [];
    Object.keys(updateDto).forEach((key) => {
      if (key !== 'changeReason' && updateDto[key] !== role[key]) {
        changedFields.push(key);
      }
    });

    // Update role
    Object.assign(role, updateDto);
    role.updatedBy = userId;
    role.version += 1;

    const updatedRole = await this.projectRoleRepository.save(role);

    // Create version record
    await this.createVersion(
      updatedRole,
      'UPDATE',
      updateDto.changeReason || 'Role updated',
      userId,
      changedFields,
    );

    // Create audit log
    await this.createAuditLog(
      updatedRole,
      'UPDATE',
      'Role updated',
      beforeState,
      updatedRole,
      userId,
      'System User',
      changedFields,
      updateDto.changeReason,
    );

    // If parent changed, update descendant hierarchy paths (handled by trigger)
    // But we should reload to get updated hierarchy_path
    return this.getRoleById(tenantId, roleId);
  }

  /**
   * UPDATE ROLE STATUS
   * Changes role status with workflow validation
   */
  async updateRoleStatus(
    tenantId: string,
    userId: string,
    roleId: string,
    statusDto: UpdateProjectRoleStatusDto,
  ): Promise<ProjectRole> {
    const role = await this.getRoleById(tenantId, roleId);
    const beforeState = { ...role };

    // Validate status transition
    this.validateStatusTransition(role.status, statusDto.status);

    role.status = statusDto.status;
    role.updatedBy = userId;
    role.version += 1;

    if (statusDto.status === ActivityStatus.INACTIVE) {
      role.deactivatedBy = userId;
      role.deactivatedAt = new Date();
      role.deactivationReason = statusDto.reason;
    }

    const updatedRole = await this.projectRoleRepository.save(role);

    // Create version
    await this.createVersion(
      updatedRole,
      'STATUS_CHANGE',
      statusDto.reason || `Status changed to ${statusDto.status}`,
      userId,
      ['status'],
    );

    // Create audit log
    await this.createAuditLog(
      updatedRole,
      `STATUS_CHANGE_${statusDto.status}`,
      `Status changed to ${statusDto.status}`,
      beforeState,
      updatedRole,
      userId,
      'System User',
      ['status'],
      statusDto.reason,
    );

    return updatedRole;
  }

  /**
   * DELETE ROLE (SOFT DELETE)
   * Soft deletes role with dependency validation
   */
  async deleteRole(
    tenantId: string,
    userId: string,
    roleId: string,
    reason?: string,
  ): Promise<void> {
    const role = await this.getRoleById(tenantId, roleId);

    // Check for active dependencies
    const dependencies = await this.roleDependencyRepository.count({
      where: { tenantId, sourceRoleId: roleId, isBlocking: true },
    });

    if (dependencies > 0) {
      throw new BadRequestException(
        `Cannot delete role. It has ${dependencies} blocking dependencies.`,
      );
    }

    // Check for child roles
    const childRoles = await this.getRoleChildren(tenantId, roleId);
    if (childRoles.length > 0) {
      throw new BadRequestException(
        `Cannot delete role. It has ${childRoles.length} child roles. Please reassign or delete child roles first.`,
      );
    }

    const beforeState = { ...role };

    role.isDeleted = true;
    role.deletedAt = new Date();
    role.deletedBy = userId;
    role.updatedBy = userId;

    await this.projectRoleRepository.save(role);

    // Create audit log
    await this.createAuditLog(
      role,
      'DELETE',
      'Role soft deleted',
      beforeState,
      role,
      userId,
      'System User',
      ['isDeleted', 'deletedAt', 'deletedBy'],
      reason,
    );
  }

  /**
   * BULK ACTION
   * Performs bulk operations on multiple roles
   */
  async bulkAction(
    tenantId: string,
    userId: string,
    bulkDto: BulkProjectRoleActionDto,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const { roleIds, action, reason } = bulkDto;
    const results = { success: 0, failed: 0, errors: [] };

    for (const roleId of roleIds) {
      try {
        switch (action) {
          case 'ACTIVATE':
            await this.updateRoleStatus(tenantId, userId, roleId, {
              status: ActivityStatus.ACTIVE,
              reason,
            });
            break;
          case 'DEACTIVATE':
            await this.updateRoleStatus(tenantId, userId, roleId, {
              status: ActivityStatus.INACTIVE,
              reason,
            });
            break;
          case 'DELETE':
            await this.deleteRole(tenantId, userId, roleId, reason);
            break;
          case 'APPROVE':
            await this.approveRole(tenantId, userId, { roleId, decision: 'APPROVED', notes: reason });
            break;
          case 'DEPRECATE':
            await this.updateRoleStatus(tenantId, userId, roleId, {
              status: ActivityStatus.DEPRECATED,
              reason,
            });
            break;
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Role ${roleId}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * APPROVE ROLE
   * Handles approval workflow
   */
  async approveRole(
    tenantId: string,
    userId: string,
    approvalDto: ProjectRoleApprovalDto,
  ): Promise<ProjectRole> {
    const role = await this.getRoleById(tenantId, approvalDto.roleId);

    if (role.status !== ActivityStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Role must be in PENDING_APPROVAL status to be approved/rejected.',
      );
    }

    const beforeState = { ...role };

    if (approvalDto.decision === 'APPROVED') {
      role.status = ActivityStatus.ACTIVE;
      role.approvedBy = userId;
      role.approvedAt = new Date();
      role.approvalNotes = approvalDto.notes;
    } else {
      role.status = ActivityStatus.DRAFT;
      role.approvalNotes = approvalDto.notes;
    }

    role.updatedBy = userId;
    role.version += 1;

    const updatedRole = await this.projectRoleRepository.save(role);

    // Create audit log
    await this.createAuditLog(
      updatedRole,
      approvalDto.decision,
      `Role ${approvalDto.decision.toLowerCase()}`,
      beforeState,
      updatedRole,
      userId,
      'System User',
      ['status', 'approvedBy', 'approvedAt', 'approvalNotes'],
      approvalDto.notes,
    );

    return updatedRole;
  }

  /**
   * ADD ROLE SCOPE
   * Creates scope mapping for role
   */
  async addRoleScope(
    tenantId: string,
    userId: string,
    roleId: string,
    scopeDto: ProjectRoleScopeMappingDto,
  ): Promise<ProjectRoleScopeMapping> {
    await this.getRoleById(tenantId, roleId);

    const scope = this.roleScopeMappingRepository.create({
      ...scopeDto,
      tenantId,
      projectRoleId: roleId,
      createdBy: userId,
    });

    return await this.roleScopeMappingRepository.save(scope);
  }

  /**
   * ADD HIERARCHY RELATIONSHIP
   * Creates explicit hierarchy link between roles
   */
  async addHierarchyRelationship(
    tenantId: string,
    userId: string,
    hierarchyDto: ProjectRoleHierarchyDto,
  ): Promise<ProjectRoleHierarchy> {
    // Validate both roles exist
    await this.getRoleById(tenantId, hierarchyDto.parentRoleId);
    await this.getRoleById(tenantId, hierarchyDto.childRoleId);

    // Prevent self-reference
    if (hierarchyDto.parentRoleId === hierarchyDto.childRoleId) {
      throw new BadRequestException('A role cannot be its own parent.');
    }

    // Validate no circular reference
    await this.validateNoCircularReference(
      hierarchyDto.parentRoleId,
      hierarchyDto.childRoleId,
    );

    // Check for existing relationship
    const existing = await this.roleHierarchyRepository.findOne({
      where: {
        tenantId,
        parentRoleId: hierarchyDto.parentRoleId,
        childRoleId: hierarchyDto.childRoleId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Hierarchy relationship already exists between these roles.',
      );
    }

    const hierarchy = this.roleHierarchyRepository.create({
      ...hierarchyDto,
      tenantId,
      createdBy: userId,
      relationshipType: hierarchyDto.relationshipType || 'REPORTS_TO',
    });

    return await this.roleHierarchyRepository.save(hierarchy);
  }

  /**
   * GET VERSION HISTORY
   * Retrieves version history for a role
   */
  async getVersionHistory(
    tenantId: string,
    roleId: string,
  ): Promise<ProjectRoleVersion[]> {
    await this.getRoleById(tenantId, roleId);

    return this.roleVersionRepository.find({
      where: { tenantId, projectRoleId: roleId },
      order: { versionNumber: 'DESC' },
    });
  }

  /**
   * GET AUDIT LOGS
   * Retrieves audit trail for a role
   */
  async getAuditLogs(
    tenantId: string,
    roleId: string,
  ): Promise<ProjectRoleAuditLog[]> {
    await this.getRoleById(tenantId, roleId);

    return this.roleAuditLogRepository.find({
      where: { tenantId, projectRoleId: roleId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * VALIDATE DEPENDENCIES
   * Checks blocking dependencies before deletion
   */
  async validateDependencies(
    tenantId: string,
    roleId: string,
  ): Promise<{ canDelete: boolean; dependencies: ProjectRoleDependencyLink[] }> {
    await this.getRoleById(tenantId, roleId);

    const dependencies = await this.roleDependencyRepository.find({
      where: { tenantId, sourceRoleId: roleId },
    });

    const blockingDeps = dependencies.filter((d) => d.isBlocking);

    return {
      canDelete: blockingDeps.length === 0,
      dependencies,
    };
  }

  /**
   * PRIVATE: CREATE VERSION
   * Creates version record for change tracking
   */
  private async createVersion(
    role: ProjectRole,
    changeType: string,
    changeDescription: string,
    userId: string,
    changedFields?: string[],
  ): Promise<void> {
    const version = this.roleVersionRepository.create({
      tenantId: role.tenantId,
      projectRoleId: role.id,
      versionNumber: role.version,
      changeType,
      changeDescription,
      configurationSnapshot: role,
      changedFields: changedFields || [],
      effectiveFrom: new Date(),
      changedBy: userId,
    });

    await this.roleVersionRepository.save(version);
  }

  /**
   * PRIVATE: CREATE AUDIT LOG
   * Creates comprehensive audit trail entry
   */
  private async createAuditLog(
    role: ProjectRole,
    actionType: string,
    actionDescription: string,
    beforeState: any,
    afterState: any,
    userId: string,
    userName: string,
    changedFields?: string[],
    changeReason?: string,
  ): Promise<void> {
    const auditLog = this.roleAuditLogRepository.create({
      tenantId: role.tenantId,
      projectRoleId: role.id,
      roleCode: role.roleCode,
      actionType,
      actionDescription,
      beforeState,
      afterState,
      changedFields,
      performedBy: userId,
      performedByName: userName,
      changeReason,
    });

    await this.roleAuditLogRepository.save(auditLog);
  }

  /**
   * PRIVATE: VALIDATE PARENT ROLE
   * Ensures parent role exists and is active
   */
  private async validateParentRole(
    tenantId: string,
    parentRoleId: string,
  ): Promise<void> {
    const parentRole = await this.projectRoleRepository.findOne({
      where: { id: parentRoleId, tenantId, isDeleted: false },
    });

    if (!parentRole) {
      throw new NotFoundException(`Parent role with ID ${parentRoleId} not found.`);
    }

    if (parentRole.status !== ActivityStatus.ACTIVE) {
      throw new BadRequestException(
        'Parent role must be in ACTIVE status.',
      );
    }
  }

  /**
   * PRIVATE: VALIDATE NO CIRCULAR REFERENCE
   * Prevents circular hierarchy (role cannot be ancestor of itself)
   */
  private async validateNoCircularReference(
    parentRoleId: string,
    childRoleId: string | null,
  ): Promise<void> {
    if (!childRoleId) return;

    // Get parent's hierarchy path
    const parentRole = await this.projectRoleRepository.findOne({
      where: { id: parentRoleId },
      select: ['id', 'hierarchyPath'],
    });

    if (!parentRole) return;

    // Check if child is in parent's hierarchy path (child would be ancestor of parent)
    if (parentRole.hierarchyPath && parentRole.hierarchyPath.includes(`/${childRoleId}/`)) {
      throw new BadRequestException(
        'Circular reference detected. A role cannot be its own ancestor.',
      );
    }
  }

  /**
   * PRIVATE: VALIDATE STATUS TRANSITION
   * Ensures valid status workflow transitions
   */
  private validateStatusTransition(
    currentStatus: ActivityStatus,
    newStatus: ActivityStatus,
  ): void {
    const validTransitions = {
      [ActivityStatus.DRAFT]: [
        ActivityStatus.ACTIVE,
        ActivityStatus.PENDING_APPROVAL,
        ActivityStatus.INACTIVE,
      ],
      [ActivityStatus.PENDING_APPROVAL]: [
        ActivityStatus.ACTIVE,
        ActivityStatus.DRAFT,
        ActivityStatus.INACTIVE,
      ],
      [ActivityStatus.ACTIVE]: [
        ActivityStatus.INACTIVE,
        ActivityStatus.DEPRECATED,
      ],
      [ActivityStatus.INACTIVE]: [
        ActivityStatus.ACTIVE,
        ActivityStatus.DEPRECATED,
      ],
      [ActivityStatus.DEPRECATED]: [ActivityStatus.INACTIVE],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}.`,
      );
    }
  }
}
