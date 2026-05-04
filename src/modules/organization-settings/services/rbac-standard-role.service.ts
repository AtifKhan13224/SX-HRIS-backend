import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { RBACStandardRole } from '../entities/rbac-standard-role.entity';
import { RBACPermission } from '../entities/rbac-permission.entity';
import { RBACRolePermission } from '../entities/rbac-role-permission.entity';
import { RBACRoleAuditLog, AuditActionType } from '../entities/rbac-role-audit-log.entity';
import { RBACRoleVersionSnapshot } from '../entities/rbac-role-version-snapshot.entity';
import { RBACSODPolicy } from '../entities/rbac-sod-policy.entity';
import {
  CreateRBACStandardRoleDto,
  UpdateRBACStandardRoleDto,
  AssignPermissionsToRoleDto,
  RollbackRoleVersionDto,
  BulkRoleOperationDto,
} from '../dto/rbac-standard-role.dto';

@Injectable()
export class RBACStandardRoleService {
  constructor(
    @InjectRepository(RBACStandardRole)
    private readonly roleRepository: Repository<RBACStandardRole>,
    @InjectRepository(RBACPermission)
    private readonly permissionRepository: Repository<RBACPermission>,
    @InjectRepository(RBACRolePermission)
    private readonly rolePermissionRepository: Repository<RBACRolePermission>,
    @InjectRepository(RBACRoleAuditLog)
    private readonly auditLogRepository: Repository<RBACRoleAuditLog>,
    @InjectRepository(RBACRoleVersionSnapshot)
    private readonly versionSnapshotRepository: Repository<RBACRoleVersionSnapshot>,
    @InjectRepository(RBACSODPolicy)
    private readonly sodPolicyRepository: Repository<RBACSODPolicy>,
  ) {}

  /**
   * Create a new standard role with comprehensive validation
   */
  async create(createDto: CreateRBACStandardRoleDto, userId: string): Promise<RBACStandardRole> {
    // Check for duplicate role code
    const existingRole = await this.roleRepository.findOne({
      where: { roleCode: createDto.roleCode },
    });

    if (existingRole) {
      throw new ConflictException(`Role with code '${createDto.roleCode}' already exists`);
    }

    // Validate conflicting roles exist
    if (createDto.conflictingRoles && createDto.conflictingRoles.length > 0) {
      await this.validateRoleCodes(createDto.conflictingRoles);
    }

    // Create the role
    const role = this.roleRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
      roleVersion: 1,
      approvalStatus: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
    });

    const savedRole = await this.roleRepository.save(role);

    // Create audit log
    await this.createAuditLog({
      roleId: savedRole.id,
      actionType: AuditActionType.ROLE_CREATED,
      actionDescription: `Role '${savedRole.roleName}' created`,
      performedBy: userId,
      changesAfter: savedRole,
    });

    // Create version snapshot
    await this.createVersionSnapshot(savedRole, userId, 'Initial role creation');

    return savedRole;
  }

  /**
   * Find all roles with filtering and pagination
   */
  async findAll(filters?: {
    tenantId?: string;
    roleCategory?: string;
    isActive?: boolean;
    isSystemOwned?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: RBACStandardRole[]; total: number; page: number; totalPages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('permissions.permission', 'permissionDetails');

    // Apply filters
    if (filters?.tenantId) {
      queryBuilder.andWhere('role.tenantId = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters?.roleCategory) {
      queryBuilder.andWhere('role.roleCategory = :roleCategory', {
        roleCategory: filters.roleCategory,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('role.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.isSystemOwned !== undefined) {
      queryBuilder.andWhere('role.isSystemOwned = :isSystemOwned', {
        isSystemOwned: filters.isSystemOwned,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(role.roleName LIKE :search OR role.roleCode LIKE :search OR role.roleDescription LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('role.displayOrder', 'ASC').addOrderBy('role.roleName', 'ASC');

    const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one role by ID with full details
   */
  async findOne(id: string): Promise<RBACStandardRole> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'permissions.permission'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }

  /**
   * Find role by code
   */
  async findByCode(roleCode: string): Promise<RBACStandardRole> {
    const role = await this.roleRepository.findOne({
      where: { roleCode },
      relations: ['permissions', 'permissions.permission'],
    });

    if (!role) {
      throw new NotFoundException(`Role with code '${roleCode}' not found`);
    }

    return role;
  }

  /**
   * Update a role with validation and versioning
   */
  async update(
    id: string,
    updateDto: UpdateRBACStandardRoleDto,
    userId: string,
  ): Promise<RBACStandardRole> {
    const role = await this.findOne(id);

    // Check if role is modifiable
    if (role.isSystemOwned && !role.isModifiable) {
      throw new ForbiddenException('System-owned roles that are not modifiable cannot be updated');
    }

    // Store before state for audit
    const beforeState = { ...role };

    // Validate change justification if required
    if (role.requiresChangeJustification && !updateDto.changeReason) {
      throw new BadRequestException('Change justification is required for this role');
    }

    // Update fields
    Object.assign(role, updateDto);
    role.updatedBy = userId;
    role.roleVersion += 1;
    role.lastChangeReason = updateDto.changeReason;

    // If dual approval is required, set to pending
    if (role.requiresDualApproval) {
      role.approvalStatus = 'PENDING';
    }

    const updatedRole = await this.roleRepository.save(role);

    // Create audit log
    await this.createAuditLog({
      roleId: updatedRole.id,
      actionType: AuditActionType.ROLE_UPDATED,
      actionDescription: `Role '${updatedRole.roleName}' updated`,
      performedBy: userId,
      changesBefore: beforeState,
      changesAfter: updatedRole,
      justification: updateDto.changeReason,
    });

    // Create version snapshot
    if (role.hasRollbackCapability) {
      await this.createVersionSnapshot(
        updatedRole,
        userId,
        updateDto.changeReason || 'Role updated',
      );
    }

    return updatedRole;
  }

  /**
   * Assign permissions to a role
   */
  async assignPermissions(
    assignDto: AssignPermissionsToRoleDto,
    userId: string,
  ): Promise<RBACStandardRole> {
    const role = await this.findOne(assignDto.roleId);

    // Validate all permission IDs exist
    const permissionIds = assignDto.permissions.map((p) => p.permissionId);
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    // Check for Segregation of Duties violations
    await this.checkSODViolations(role, permissions);

    // Remove existing permissions for this role
    await this.rolePermissionRepository.delete({ roleId: assignDto.roleId });

    // Create new permission assignments
    const rolePermissions = assignDto.permissions.map((permDto) => {
      return this.rolePermissionRepository.create({
        roleId: assignDto.roleId,
        permissionId: permDto.permissionId,
        ...permDto,
        createdBy: userId,
        updatedBy: userId,
      });
    });

    await this.rolePermissionRepository.save(rolePermissions);

    // Create audit log
    await this.createAuditLog({
      roleId: assignDto.roleId,
      actionType: AuditActionType.PERMISSION_MODIFIED,
      actionDescription: `Permissions assigned to role '${role.roleName}'`,
      performedBy: userId,
      affectedPermissions: permissionIds,
      justification: assignDto.changeReason,
    });

    // Increment role version
    role.roleVersion += 1;
    await this.roleRepository.save(role);

    return this.findOne(assignDto.roleId);
  }

  /**
   * Remove specific permissions from a role
   */
  async removePermissions(
    roleId: string,
    permissionIds: string[],
    userId: string,
    reason?: string,
  ): Promise<RBACStandardRole> {
    const role = await this.findOne(roleId);

    await this.rolePermissionRepository.delete({
      roleId,
      permissionId: In(permissionIds),
    });

    await this.createAuditLog({
      roleId,
      actionType: AuditActionType.PERMISSION_REMOVED,
      actionDescription: `Permissions removed from role '${role.roleName}'`,
      performedBy: userId,
      affectedPermissions: permissionIds,
      justification: reason,
    });

    return this.findOne(roleId);
  }

  /**
   * Activate a role
   */
  async activate(id: string, userId: string): Promise<RBACStandardRole> {
    const role = await this.findOne(id);
    role.isActive = true;
    role.updatedBy = userId;

    await this.roleRepository.save(role);

    await this.createAuditLog({
      roleId: id,
      actionType: AuditActionType.ROLE_ACTIVATED,
      actionDescription: `Role '${role.roleName}' activated`,
      performedBy: userId,
    });

    return role;
  }

  /**
   * Deactivate a role
   */
  async deactivate(id: string, userId: string): Promise<RBACStandardRole> {
    const role = await this.findOne(id);
    role.isActive = false;
    role.updatedBy = userId;

    await this.roleRepository.save(role);

    await this.createAuditLog({
      roleId: id,
      actionType: AuditActionType.ROLE_DEACTIVATED,
      actionDescription: `Role '${role.roleName}' deactivated`,
      performedBy: userId,
    });

    return role;
  }

  /**
   * Archive a role
   */
  async archive(id: string, userId: string, reason?: string): Promise<RBACStandardRole> {
    const role = await this.findOne(id);
    role.isArchived = true;
    role.isActive = false;
    role.updatedBy = userId;

    await this.roleRepository.save(role);

    await this.createAuditLog({
      roleId: id,
      actionType: AuditActionType.ROLE_ARCHIVED,
      actionDescription: `Role '${role.roleName}' archived`,
      performedBy: userId,
      justification: reason,
    });

    return role;
  }

  /**
   * Delete a role (only if not system-owned)
   */
  async remove(id: string, userId: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystemOwned) {
      throw new ForbiddenException('System-owned roles cannot be deleted');
    }

    await this.createAuditLog({
      roleId: id,
      actionType: AuditActionType.ROLE_DELETED,
      actionDescription: `Role '${role.roleName}' deleted`,
      performedBy: userId,
      changesBefore: role,
    });

    await this.roleRepository.remove(role);
  }

  /**
   * Rollback role to a previous version
   */
  async rollback(rollbackDto: RollbackRoleVersionDto, userId: string): Promise<RBACStandardRole> {
    const role = await this.findOne(rollbackDto.roleId);

    if (!role.hasRollbackCapability) {
      throw new ForbiddenException('This role does not support rollback');
    }

    const snapshot = await this.versionSnapshotRepository.findOne({
      where: {
        roleId: rollbackDto.roleId,
        version: rollbackDto.targetVersion,
      },
    });

    if (!snapshot) {
      throw new NotFoundException(`Version ${rollbackDto.targetVersion} not found`);
    }

    if (!snapshot.canRollbackTo) {
      throw new ForbiddenException('Cannot rollback to this version');
    }

    // Restore role state from snapshot
    const restoredData = snapshot.roleSnapshot;
    Object.assign(role, restoredData);
    role.roleVersion = snapshot.version;
    role.updatedBy = userId;

    await this.roleRepository.save(role);

    // Restore permissions
    await this.rolePermissionRepository.delete({ roleId: rollbackDto.roleId });
    const permissionsToRestore = [];
    for (const p of snapshot.permissionsSnapshot || []) {
      const rolePerm = this.rolePermissionRepository.create();
      rolePerm.roleId = rollbackDto.roleId;
      rolePerm.permissionId = p.permissionId || p.permission?.id;
      rolePerm.dataScope = p.dataScope;
      rolePerm.isActive = p.isActive ?? true;
      permissionsToRestore.push(rolePerm);
    }
    if (permissionsToRestore.length > 0) {
      await this.rolePermissionRepository.save(permissionsToRestore);
    }

    await this.createAuditLog({
      roleId: rollbackDto.roleId,
      actionType: AuditActionType.ROLLBACK_EXECUTED,
      actionDescription: `Role rolled back to version ${rollbackDto.targetVersion}`,
      performedBy: userId,
      justification: rollbackDto.rollbackReason,
      roleVersionBefore: role.roleVersion,
      roleVersionAfter: snapshot.version,
    });

    return this.findOne(rollbackDto.roleId);
  }

  /**
   * Get role version history
   */
  async getVersionHistory(roleId: string): Promise<RBACRoleVersionSnapshot[]> {
    return this.versionSnapshotRepository.find({
      where: { roleId },
      order: { version: 'DESC' },
    });
  }

  /**
   * Get role audit logs
   */
  async getAuditLogs(
    roleId: string,
    filters?: { actionType?: AuditActionType; startDate?: Date; endDate?: Date; limit?: number },
  ): Promise<RBACRoleAuditLog[]> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.roleId = :roleId', { roleId });

    if (filters?.actionType) {
      queryBuilder.andWhere('audit.actionType = :actionType', { actionType: filters.actionType });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('audit.createdAt', 'DESC');

    if (filters?.limit) {
      queryBuilder.take(filters.limit);
    }

    return queryBuilder.getMany();
  }

  /**
   * Bulk operations on roles
   */
  async bulkOperation(bulkDto: BulkRoleOperationDto, userId: string): Promise<any> {
    const roles = await this.roleRepository.find({
      where: { id: In(bulkDto.roleIds) },
    });

    if (roles.length !== bulkDto.roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    const results = [];

    for (const role of roles) {
      try {
        switch (bulkDto.operation) {
          case 'ACTIVATE':
            await this.activate(role.id, userId);
            results.push({ id: role.id, status: 'success', operation: 'activated' });
            break;
          case 'DEACTIVATE':
            await this.deactivate(role.id, userId);
            results.push({ id: role.id, status: 'success', operation: 'deactivated' });
            break;
          case 'ARCHIVE':
            await this.archive(role.id, userId, bulkDto.reason);
            results.push({ id: role.id, status: 'success', operation: 'archived' });
            break;
          case 'DELETE':
            if (!role.isSystemOwned) {
              await this.remove(role.id, userId);
              results.push({ id: role.id, status: 'success', operation: 'deleted' });
            } else {
              results.push({
                id: role.id,
                status: 'skipped',
                reason: 'System-owned role cannot be deleted',
              });
            }
            break;
        }
      } catch (error) {
        results.push({ id: role.id, status: 'error', error: error.message });
      }
    }

    return { results, totalProcessed: roles.length };
  }

  /**
   * Check for Segregation of Duties violations
   */
  private async checkSODViolations(
    role: RBACStandardRole,
    permissions: RBACPermission[],
  ): Promise<void> {
    const activePolicies = await this.sodPolicyRepository.find({
      where: { isActive: true },
    });

    for (const policy of activePolicies) {
      // Check role conflicts
      if (policy.conflictingRoles && policy.conflictingRoles.includes(role.roleCode)) {
        const violation = {
          policyCode: policy.policyCode,
          policyName: policy.policyName,
          severity: policy.severity,
          description: policy.policyDescription,
        };

        if (policy.violationAction === 'BLOCK') {
          throw new ForbiddenException(
            `SoD Violation: ${policy.policyName}. ${policy.policyDescription}`,
          );
        }

        // Log warning or require approval
        await this.createAuditLog({
          roleId: role.id,
          actionType: AuditActionType.SOD_VIOLATION_DETECTED,
          actionDescription: `SoD violation detected: ${policy.policyName}`,
          performedBy: 'SYSTEM',
          sodViolationDetected: true,
          sodViolationDetails: violation,
        });
      }
    }
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(data: Partial<RBACRoleAuditLog>): Promise<RBACRoleAuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...data,
      wasSuccessful: true,
    });
    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Create version snapshot
   */
  private async createVersionSnapshot(
    role: RBACStandardRole,
    userId: string,
    description: string,
  ): Promise<RBACRoleVersionSnapshot> {
    const permissions = await this.rolePermissionRepository.find({
      where: { roleId: role.id },
      relations: ['permission'],
    });

    const snapshot = this.versionSnapshotRepository.create({
      roleId: role.id,
      version: role.roleVersion,
      roleSnapshot: { ...role },
      permissionsSnapshot: permissions.map((p) => ({ ...p })),
      changeDescription: description,
      createdBy: userId,
      canRollbackTo: true,
    });

    return this.versionSnapshotRepository.save(snapshot);
  }

  /**
   * Validate role codes exist
   */
  private async validateRoleCodes(roleCodes: string[]): Promise<void> {
    const roles = await this.roleRepository.find({
      where: { roleCode: In(roleCodes) },
    });

    if (roles.length !== roleCodes.length) {
      const foundCodes = roles.map((r) => r.roleCode);
      const missing = roleCodes.filter((code) => !foundCodes.includes(code));
      throw new NotFoundException(`Role codes not found: ${missing.join(', ')}`);
    }
  }

  /**
   * Get permission matrix for a role
   */
  async getPermissionMatrix(roleId: string): Promise<any> {
    const role = await this.findOne(roleId);
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });

    // Group permissions by module and sub-module
    const matrix = {};
    for (const rp of rolePermissions) {
      const perm = rp.permission;
      if (!matrix[perm.module]) {
        matrix[perm.module] = {};
      }
      if (perm.subModule) {
        if (!matrix[perm.module][perm.subModule]) {
          matrix[perm.module][perm.subModule] = [];
        }
        matrix[perm.module][perm.subModule].push({
          permissionCode: perm.permissionCode,
          permissionName: perm.permissionName,
          action: perm.action,
          feature: perm.feature,
          dataScope: rp.dataScope || role.defaultDataScope,
          isActive: rp.isActive,
          requiresApproval: rp.requiresApproval,
          isSensitive: perm.isSensitive,
        });
      } else {
        if (!matrix[perm.module]['_root']) {
          matrix[perm.module]['_root'] = [];
        }
        matrix[perm.module]['_root'].push({
          permissionCode: perm.permissionCode,
          permissionName: perm.permissionName,
          action: perm.action,
          feature: perm.feature,
          dataScope: rp.dataScope || role.defaultDataScope,
          isActive: rp.isActive,
          requiresApproval: rp.requiresApproval,
          isSensitive: perm.isSensitive,
        });
      }
    }

    return {
      roleId: role.id,
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleCategory: role.roleCategory,
      permissionMatrix: matrix,
    };
  }
}
