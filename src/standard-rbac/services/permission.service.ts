import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { PermissionRegistry } from '../entities/permission-registry.entity';
import { SystemRolePermission } from '../entities/system-role-permission.entity';
import { CreatePermissionDto, UpdatePermissionDto, AssignPermissionToRoleDto } from '../dto/permission.dto';
import { AuditService } from './audit.service';

export interface PermissionSearchFilters {
  module?: string;
  action?: string;
  searchTerm?: string;
  riskScoreMin?: number;
  riskScoreMax?: number;
  tags?: string[];
  isSensitive?: boolean;
  requiresSoD?: boolean;
  isActive?: boolean;
}

export interface PermissionTemplate {
  name: string;
  description: string;
  permissions: string[];
  roleCategory?: string;
}

export interface BulkAssignResult {
  successful: number;
  failed: number;
  errors: Array<{ permissionCode: string; error: string }>;
}

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionRegistry)
    private readonly permissionRepository: Repository<PermissionRegistry>,
    @InjectRepository(SystemRolePermission)
    private readonly rolePermissionRepository: Repository<SystemRolePermission>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new permission
   */
  async createPermission(createDto: CreatePermissionDto): Promise<PermissionRegistry> {
    // Check if permission code already exists
    const existing = await this.permissionRepository.findOne({
      where: { permissionCode: createDto.permissionCode }
    });

    if (existing) {
      throw new ConflictException(`Permission with code ${createDto.permissionCode} already exists`);
    }

    // Validate dependencies
    if (createDto.dependencies && createDto.dependencies.length > 0) {
      await this.validatePermissionCodes(createDto.dependencies);
    }

    // Validate exclusions
    if (createDto.exclusions && createDto.exclusions.length > 0) {
      await this.validatePermissionCodes(createDto.exclusions);
    }

    const permission = this.permissionRepository.create(createDto);
    const savedPermission = await this.permissionRepository.save(permission);

    // Audit log
    await this.auditService.log({
      tenantId: 'DEFAULT_TENANT',
      userId: createDto.createdBy,
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Created permission: ${createDto.permissionName}`,
      permissionId: savedPermission.id,
      permissionCode: savedPermission.permissionCode,
    });

    return savedPermission;
  }

  /**
   * Update an existing permission
   */
  async updatePermission(permissionId: string, updateDto: UpdatePermissionDto): Promise<PermissionRegistry> {
    const permission = await this.findById(permissionId);

    // Store old values for audit
    const oldSnapshot = { ...permission };

    // Validate dependencies if being updated
    if (updateDto.dependencies && updateDto.dependencies.length > 0) {
      await this.validatePermissionCodes(updateDto.dependencies);
    }

    // Validate exclusions if being updated
    if (updateDto.exclusions && updateDto.exclusions.length > 0) {
      await this.validatePermissionCodes(updateDto.exclusions);
    }

    // Update permission
    Object.assign(permission, updateDto);
    const updatedPermission = await this.permissionRepository.save(permission);

    // Audit log
    await this.auditService.log({
      tenantId: 'DEFAULT_TENANT',
      userId: 'SYSTEM',
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: (permission.isSensitive ? 'HIGH' : 'MEDIUM') as any,
      eventDescription: `Updated permission: ${permission.permissionName}`,
      permissionId: permission.id,
      permissionCode: permission.permissionCode,
      oldValue: JSON.stringify(oldSnapshot),
      newValue: JSON.stringify(updatedPermission),
    });

    return updatedPermission;
  }

  /**
   * Delete a permission (soft delete by setting isActive to false)
   */
  async deletePermission(permissionId: string, deletedBy: string): Promise<void> {
    const permission = await this.findById(permissionId);

    // Check if permission is assigned to any roles
    const assignmentCount = await this.rolePermissionRepository.count({
      where: { permissionId }
    });

    if (assignmentCount > 0) {
      throw new BadRequestException(`Cannot delete permission that is assigned to ${assignmentCount} roles. Remove assignments first.`);
    }

    // Soft delete
    permission.isActive = false;
    await this.permissionRepository.save(permission);

    // Audit log
    await this.auditService.log({
      tenantId: 'DEFAULT_TENANT',
      userId: deletedBy,
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: 'HIGH' as any,
      eventDescription: `Deleted permission: ${permission.permissionName}`,
      permissionId: permission.id,
      permissionCode: permission.permissionCode,
    });
  }

  /**
   * Find permission by ID
   */
  async findById(permissionId: string): Promise<PermissionRegistry> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId }
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${permissionId} not found`);
    }

    return permission;
  }

  /**
   * Find permission by code
   */
  async findByCode(permissionCode: string): Promise<PermissionRegistry> {
    const permission = await this.permissionRepository.findOne({
      where: { permissionCode }
    });

    if (!permission) {
      throw new NotFoundException(`Permission with code ${permissionCode} not found`);
    }

    return permission;
  }

  /**
   * Get all permissions with optional filters
   */
  async findAll(filters?: PermissionSearchFilters): Promise<PermissionRegistry[]> {
    const where: any = {};

    if (filters) {
      if (filters.module) where.module = filters.module;
      if (filters.action) where.action = filters.action;
      if (filters.isSensitive !== undefined) where.isSensitive = filters.isSensitive;
      if (filters.requiresSoD !== undefined) where.requiresSoD = filters.requiresSoD;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
    }

    let query = this.permissionRepository.createQueryBuilder('permission')
      .where(where);

    // Apply search term
    if (filters?.searchTerm) {
      query = query.andWhere(
        '(permission.permissionName ILIKE :search OR permission.permissionCode ILIKE :search OR permission.permissionDescription ILIKE :search)',
        { search: `%${filters.searchTerm}%` }
      );
    }

    // Apply risk score filter
    if (filters?.riskScoreMin !== undefined) {
      query = query.andWhere('permission.riskScore >= :minRisk', { minRisk: filters.riskScoreMin });
    }
    if (filters?.riskScoreMax !== undefined) {
      query = query.andWhere('permission.riskScore <= :maxRisk', { maxRisk: filters.riskScoreMax });
    }

    // Apply tags filter
    if (filters?.tags && filters.tags.length > 0) {
      query = query.andWhere('permission.permissionTags && ARRAY[:...tags]', { tags: filters.tags });
    }

    query = query.orderBy('permission.module', 'ASC')
      .addOrderBy('permission.action', 'ASC')
      .addOrderBy('permission.permissionName', 'ASC');

    return query.getMany();
  }

  /**
   * Get permissions by module
   */
  async findByModule(module: string): Promise<PermissionRegistry[]> {
    return this.permissionRepository.find({
      where: { module: module as any, isActive: true },
      order: { action: 'ASC', permissionName: 'ASC' }
    });
  }

  /**
   * Get permissions by role
   */
  async findByRole(roleId: string): Promise<PermissionRegistry[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { systemRoleId: roleId },
      relations: ['permission']
    });

    return rolePermissions.map(rp => rp.permission);
  }

  /**
   * Assign permission to role
   */
  async assignToRole(assignDto: AssignPermissionToRoleDto): Promise<SystemRolePermission> {
    // Check if permission exists
    const permission = await this.findById(assignDto.permissionId);

    // Check if already assigned
    const existing = await this.rolePermissionRepository.findOne({
      where: { 
        systemRoleId: assignDto.roleId, 
        permissionId: assignDto.permissionId 
      }
    });

    if (existing) {
      throw new ConflictException('Permission already assigned to this role');
    }

    // Check dependencies
    if (permission.dependencies && permission.dependencies.length > 0) {
      await this.validateDependencies(assignDto.roleId, permission.dependencies);
    }

    // Create assignment
    const rolePermission = this.rolePermissionRepository.create({
      systemRoleId: assignDto.roleId,
      permissionId: assignDto.permissionId,
      grantType: assignDto.grantType as any,
      createdBy: assignDto.createdBy,
      isConditional: assignDto.isConditional,
      conditions: assignDto.conditions,
      requiresDataScope: assignDto.requiresDataScope,
      dataScopeConfigId: assignDto.dataScopeConfigId,
      requiresFieldSecurity: assignDto.requiresFieldSecurity,
      fieldRestrictions: assignDto.fieldRestrictions,
    });

    const saved = await this.rolePermissionRepository.save(rolePermission);

    // Audit log
    await this.auditService.log({
      tenantId: 'DEFAULT_TENANT',
      userId: assignDto.createdBy || 'SYSTEM',
      eventType: 'PERMISSION_GRANTED' as any,
      severity: (permission.isSensitive ? 'HIGH' : 'MEDIUM') as any,
      eventDescription: `Assigned permission ${permission.permissionCode} to role`,
      roleId: assignDto.roleId,
      permissionId: permission.id,
      permissionCode: permission.permissionCode,
    });

    return saved;
  }

  /**
   * Revoke permission from role
   */
  async revokeFromRole(roleId: string, permissionCode: string, revokedBy: string): Promise<void> {
    const permission = await this.findByCode(permissionCode);

    const rolePermission = await this.rolePermissionRepository.findOne({
      where: { systemRoleId: roleId, permissionId: permission.id }
    });

    if (!rolePermission) {
      throw new NotFoundException('Permission assignment not found');
    }

    await this.rolePermissionRepository.remove(rolePermission);

    // Audit log
    await this.auditService.log({
      tenantId: 'DEFAULT_TENANT',
      userId: revokedBy,
      eventType: 'PERMISSION_DENIED' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Revoked permission ${permissionCode} from role`,
      roleId,
      permissionId: permission.id,
      permissionCode: permission.permissionCode,
    });
  }

  /**
   * Bulk assign permissions to role
   */
  async bulkAssignToRole(
    roleId: string, 
    permissionIds: string[], 
    assignedBy: string
  ): Promise<BulkAssignResult> {
    const result: BulkAssignResult = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const permissionId of permissionIds) {
      try {
        await this.assignToRole({
          roleId,
          permissionId,
          grantType: 'DIRECT' as any,
          createdBy: assignedBy
        });
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          permissionCode: permissionId,
          error: error.message
        });
      }
    }

    return result;
  }

  /**
   * Bulk revoke permissions from role
   */
  async bulkRevokeFromRole(
    roleId: string,
    permissionCodes: string[],
    revokedBy: string
  ): Promise<BulkAssignResult> {
    const result: BulkAssignResult = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const permissionCode of permissionCodes) {
      try {
        await this.revokeFromRole(roleId, permissionCode, revokedBy);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          permissionCode,
          error: error.message
        });
      }
    }

    return result;
  }

  /**
   * Get permission matrix for multiple roles
   */
  async getPermissionMatrix(roleIds: string[]): Promise<any> {
    const permissions = await this.findAll({ isActive: true });
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { systemRoleId: In(roleIds) },
      relations: ['permission']
    });

    const matrix = permissions.map(permission => {
      const roleGrants = roleIds.map(roleId => {
        const grant = rolePermissions.find(
          rp => rp.systemRoleId === roleId && rp.permissionId === permission.id
        );
        return {
          roleId,
          hasPermission: !!grant,
          grantType: grant?.grantType || null,
          effectiveFrom: grant?.effectiveFrom || null,
          effectiveTo: grant?.effectiveTo || null
        };
      });

      return {
        permissionId: permission.id,
        permissionCode: permission.permissionCode,
        permissionName: permission.permissionName,
        module: permission.module,
        action: permission.action,
        riskScore: permission.riskScore,
        isSensitive: permission.isSensitive,
        requiresSoD: permission.requiresSoD,
        roleGrants
      };
    });

    return matrix;
  }

  /**
   * Apply permission template to role
   */
  async applyTemplate(roleId: string, template: PermissionTemplate, appliedBy: string): Promise<BulkAssignResult> {
    return this.bulkAssignToRole(roleId, template.permissions, appliedBy);
  }

  /**
   * Get predefined permission templates
   */
  async getTemplates(): Promise<PermissionTemplate[]> {
    return [
      {
        name: 'Employee Self-Service',
        description: 'Basic permissions for employees to view their own data',
        roleCategory: 'BUSINESS',
        permissions: [
          'CORE_HR.VIEW',
          'LEAVE.VIEW',
          'LEAVE.CREATE',
          'PAYROLL.VIEW',
          'PERFORMANCE.VIEW'
        ]
      },
      {
        name: 'Manager Essentials',
        description: 'Permissions for line managers to manage their team',
        roleCategory: 'BUSINESS',
        permissions: [
          'CORE_HR.VIEW',
          'CORE_HR.EDIT',
          'LEAVE.VIEW',
          'LEAVE.APPROVE',
          'PERFORMANCE.VIEW',
          'PERFORMANCE.EDIT',
          'ATTENDANCE.VIEW',
          'REPORTS.VIEW'
        ]
      },
      {
        name: 'HR Administrator',
        description: 'Full HR operations permissions',
        roleCategory: 'ADMINISTRATIVE',
        permissions: [
          'CORE_HR.VIEW',
          'CORE_HR.CREATE',
          'CORE_HR.EDIT',
          'CORE_HR.DELETE',
          'LEAVE.VIEW',
          'LEAVE.CREATE',
          'LEAVE.EDIT',
          'LEAVE.APPROVE',
          'RECRUITMENT.VIEW',
          'RECRUITMENT.CREATE',
          'RECRUITMENT.EDIT',
          'LIFECYCLE.VIEW',
          'LIFECYCLE.CREATE',
          'LIFECYCLE.EDIT',
          'REPORTS.VIEW',
          'REPORTS.EXPORT'
        ]
      },
      {
        name: 'Payroll Specialist',
        description: 'Payroll processing and reporting',
        roleCategory: 'FINANCIAL',
        permissions: [
          'PAYROLL.VIEW',
          'PAYROLL.CREATE',
          'PAYROLL.EDIT',
          'PAYROLL.APPROVE',
          'REPORTS.VIEW',
          'REPORTS.EXPORT',
          'CORE_HR.VIEW'
        ]
      },
      {
        name: 'System Administrator',
        description: 'Full system configuration and management',
        roleCategory: 'TECHNICAL',
        permissions: [
          'SETTINGS.VIEW',
          'SETTINGS.CONFIGURE',
          'SETTINGS.EDIT',
          'API.VIEW',
          'API.CONFIGURE',
          'COMPLIANCE.VIEW',
          'COMPLIANCE.AUDIT',
          'ANALYTICS.VIEW',
          'REPORTS.VIEW',
          'REPORTS.EXPORT'
        ]
      },
      {
        name: 'Auditor Read-Only',
        description: 'View-only access for audit purposes',
        roleCategory: 'AUDIT',
        permissions: [
          'CORE_HR.VIEW',
          'PAYROLL.VIEW',
          'LEAVE.VIEW',
          'RECRUITMENT.VIEW',
          'PERFORMANCE.VIEW',
          'ATTENDANCE.VIEW',
          'LIFECYCLE.VIEW',
          'REPORTS.VIEW',
          'COMPLIANCE.VIEW',
          'COMPLIANCE.AUDIT'
        ]
      }
    ];
  }

  /**
   * Get permission statistics
   */
  async getStatistics(): Promise<any> {
    const total = await this.permissionRepository.count({ where: { isActive: true } });
    const sensitive = await this.permissionRepository.count({ where: { isSensitive: true, isActive: true } });
    const highRisk = await this.permissionRepository.count({ 
      where: { isActive: true }
    });
    const requiresSoD = await this.permissionRepository.count({ where: { requiresSoD: true, isActive: true } });

    const byModule = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('permission.module', 'module')
      .addSelect('COUNT(*)', 'count')
      .where('permission.isActive = true')
      .groupBy('permission.module')
      .getRawMany();

    const byAction = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('permission.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('permission.isActive = true')
      .groupBy('permission.action')
      .getRawMany();

    return {
      total,
      sensitive,
      highRisk: await this.permissionRepository
        .createQueryBuilder('permission')
        .where('permission.isActive = true')
        .andWhere('permission.riskScore >= 8')
        .getCount(),
      requiresSoD,
      byModule: byModule.map(m => ({ module: m.module, count: parseInt(m.count) })),
      byAction: byAction.map(a => ({ action: a.action, count: parseInt(a.count) }))
    };
  }

  /**
   * Validate permission codes exist
   */
  private async validatePermissionCodes(permissionCodes: string[]): Promise<void> {
    for (const code of permissionCodes) {
      const exists = await this.permissionRepository.findOne({
        where: { permissionCode: code }
      });
      if (!exists) {
        throw new BadRequestException(`Permission with code ${code} does not exist`);
      }
    }
  }

  /**
   * Validate dependencies are met for a role
   */
  private async validateDependencies(roleId: string, dependencies: string[]): Promise<void> {
    for (const dependencyCode of dependencies) {
      const permission = await this.findByCode(dependencyCode);
      const hasPermission = await this.rolePermissionRepository.findOne({
        where: { systemRoleId: roleId, permissionId: permission.id }
      });
      
      if (!hasPermission) {
        throw new BadRequestException(
          `Missing required dependency: ${dependencyCode}. This permission must be granted first.`
        );
      }
    }
  }

  /**
   * Check for exclusion conflicts
   */
  async checkExclusions(roleId: string, permissionCode: string): Promise<string[]> {
    const permission = await this.findByCode(permissionCode);
    
    if (!permission.exclusions || permission.exclusions.length === 0) {
      return [];
    }

    const conflicts: string[] = [];
    for (const exclusionCode of permission.exclusions) {
      const excludedPermission = await this.findByCode(exclusionCode);
      const hasExcluded = await this.rolePermissionRepository.findOne({
        where: { systemRoleId: roleId, permissionId: excludedPermission.id }
      });
      
      if (hasExcluded) {
        conflicts.push(exclusionCode);
      }
    }

    return conflicts;
  }
}
