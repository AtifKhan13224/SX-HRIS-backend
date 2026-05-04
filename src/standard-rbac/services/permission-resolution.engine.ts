import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SystemRole } from '../entities/system-role.entity';
import { SystemRolePermission } from '../entities/system-role-permission.entity';
import { PermissionRegistry } from '../entities/permission-registry.entity';
import { DataScopeResolutionEngine } from './data-scope-resolution.engine';
import { FieldSecurityEngine } from './field-security.engine';

export interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
  conditions?: Record<string, any>;
  dataScope?: any;
  fieldRestrictions?: any;
}

export interface UserPermissions {
  userId: string;
  roles: SystemRole[];
  permissions: Map<string, PermissionCheckResult>;
  effectivePermissions: string[];
}

@Injectable()
export class PermissionResolutionEngine {
  constructor(
    @InjectRepository(SystemRole)
    private readonly roleRepository: Repository<SystemRole>,
    @InjectRepository(SystemRolePermission)
    private readonly rolePermissionRepository: Repository<SystemRolePermission>,
    @InjectRepository(PermissionRegistry)
    private readonly permissionRepository: Repository<PermissionRegistry>,
    private readonly dataScopeEngine: DataScopeResolutionEngine,
    private readonly fieldSecurityEngine: FieldSecurityEngine,
  ) {}

  /**
   * Resolve all effective permissions for a user
   */
  async resolveUserPermissions(userId: string, roleIds: string[], tenantId?: string): Promise<UserPermissions> {
    // Load all roles with their permissions
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
      relations: ['permissions', 'permissions.permission'],
    });

    const permissionsMap = new Map<string, PermissionCheckResult>();
    const effectivePermissions: string[] = [];

    // Process each role's permissions
    for (const role of roles) {
      if (!role.isActive) continue;

      // Check effective date
      if (role.effectiveFrom && new Date(role.effectiveFrom) > new Date()) continue;
      if (role.effectiveTo && new Date(role.effectiveTo) < new Date()) continue;

      for (const rolePermission of role.permissions || []) {
        if (!rolePermission.isActive) continue;

        const permission = rolePermission.permission as any;
        const permissionCode = permission.permissionCode;

        // Check if permission is effective
        if (rolePermission.effectiveFrom && new Date(rolePermission.effectiveFrom) > new Date()) continue;
        if (rolePermission.effectiveTo && new Date(rolePermission.effectiveTo) < new Date()) continue;

        // Process grant type
        const existing = permissionsMap.get(permissionCode);

        if (rolePermission.grantType === 'DENY') {
          // DENY always wins
          permissionsMap.set(permissionCode, {
            granted: false,
            reason: `Denied by role: ${role.roleName}`,
          });
          continue;
        }

        if (rolePermission.grantType === 'ALLOW' && (!existing || existing.granted === false)) {
          const result: PermissionCheckResult = {
            granted: true,
            reason: `Granted by role: ${role.roleName}`,
          };

          // Resolve data scope if required
          if (rolePermission.requiresDataScope && rolePermission.dataScopeConfigId) {
            result.dataScope = await this.dataScopeEngine.resolveScope(
              rolePermission.dataScopeConfigId,
              userId,
              { tenantId }
            );
          }

          // Resolve field security if required
          if (rolePermission.requiresFieldSecurity) {
            result.fieldRestrictions = await this.fieldSecurityEngine.resolveFieldSecurity(
              permission.id,
              tenantId
            );
          }

          // Handle conditional permissions
          if (rolePermission.isConditional && rolePermission.conditions) {
            result.conditions = rolePermission.conditions;
          }

          permissionsMap.set(permissionCode, result);
          effectivePermissions.push(permissionCode);
        }
      }
    }

    return {
      userId,
      roles,
      permissions: permissionsMap,
      effectivePermissions: Array.from(new Set(effectivePermissions)),
    };
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(
    userId: string,
    roleIds: string[],
    permissionCode: string,
    context?: Record<string, any>
  ): Promise<PermissionCheckResult> {
    const userPermissions = await this.resolveUserPermissions(userId, roleIds, context?.tenantId);
    
    const permission = userPermissions.permissions.get(permissionCode);
    
    if (!permission) {
      return { granted: false, reason: 'Permission not assigned' };
    }

    if (!permission.granted) {
      return permission;
    }

    // Evaluate conditional permissions
    if (permission.conditions) {
      const conditionsMet = await this.evaluateConditions(permission.conditions, context);
      if (!conditionsMet) {
        return {
          granted: false,
          reason: 'Conditional permission requirements not met',
          conditions: permission.conditions,
        };
      }
    }

    return permission;
  }

  /**
   * Check multiple permissions at once
   */
  async hasPermissions(
    userId: string,
    roleIds: string[],
    permissionCodes: string[],
    context?: Record<string, any>
  ): Promise<Map<string, PermissionCheckResult>> {
    const userPermissions = await this.resolveUserPermissions(userId, roleIds, context?.tenantId);
    const results = new Map<string, PermissionCheckResult>();

    for (const permissionCode of permissionCodes) {
      const permission = userPermissions.permissions.get(permissionCode);
      
      if (!permission) {
        results.set(permissionCode, { granted: false, reason: 'Permission not assigned' });
        continue;
      }

      if (permission.conditions) {
        const conditionsMet = await this.evaluateConditions(permission.conditions, context);
        if (!conditionsMet) {
          results.set(permissionCode, {
            granted: false,
            reason: 'Conditional permission requirements not met',
            conditions: permission.conditions,
          });
          continue;
        }
      }

      results.set(permissionCode, permission);
    }

    return results;
  }

  /**
   * Get all permissions for a module
   */
  async getModulePermissions(module: string, userId: string, roleIds: string[]): Promise<string[]> {
    const userPermissions = await this.resolveUserPermissions(userId, roleIds);
    
    return userPermissions.effectivePermissions.filter(p => p.startsWith(`${module}.`));
  }

  /**
   * Evaluate conditional logic
   */
  private async evaluateConditions(conditions: Record<string, any>, context?: Record<string, any>): Promise<boolean> {
    if (!context) return false;

    // Simple condition evaluation - can be extended with complex rules engine
    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get permission hierarchy (dependencies and prerequisites)
   */
  async getPermissionHierarchy(permissionCode: string): Promise<any> {
    const permission = await this.permissionRepository.findOne({
      where: { permissionCode },
    });

    if (!permission) {
      throw new NotFoundException(`Permission ${permissionCode} not found`);
    }

    const dependencies = permission.dependencies || [];
    const prerequisites = permission.prerequisites || [];
    const exclusions = permission.exclusions || [];

    return {
      permissionCode,
      dependencies,
      prerequisites,
      exclusions,
      riskScore: permission.riskScore,
      requiresSoD: permission.requiresSoD,
    };
  }

  /**
   * Validate permission assignment
   */
  async validatePermissionAssignment(
    roleId: string,
    permissionCode: string
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const permission = await this.permissionRepository.findOne({
      where: { permissionCode },
    });

    if (!permission) {
      errors.push(`Permission ${permissionCode} not found`);
      return { valid: false, errors, warnings };
    }

    if (!permission.isActive) {
      errors.push(`Permission ${permissionCode} is not active`);
    }

    // Check prerequisites
    if (permission.prerequisites && permission.prerequisites.length > 0) {
      const rolePermissions = await this.rolePermissionRepository.find({
        where: { systemRoleId: roleId },
        relations: ['permission'],
      });

      const rolePermissionCodes = rolePermissions.map(rp => (rp.permission as any).permissionCode);
      const missingPrerequisites = permission.prerequisites.filter(p => !rolePermissionCodes.includes(p));

      if (missingPrerequisites.length > 0) {
        warnings.push(`Missing prerequisites: ${missingPrerequisites.join(', ')}`);
      }
    }

    // Check exclusions
    if (permission.exclusions && permission.exclusions.length > 0) {
      const rolePermissions = await this.rolePermissionRepository.find({
        where: { systemRoleId: roleId },
        relations: ['permission'],
      });

      const rolePermissionCodes = rolePermissions.map(rp => (rp.permission as any).permissionCode);
      const conflictingPermissions = permission.exclusions.filter(p => rolePermissionCodes.includes(p));

      if (conflictingPermissions.length > 0) {
        errors.push(`Conflicting permissions detected: ${conflictingPermissions.join(', ')}`);
      }
    }

    // Risk warnings
    if (permission.riskScore >= 8) {
      warnings.push(`High-risk permission (score: ${permission.riskScore})`);
    }

    if (permission.requiresSoD) {
      warnings.push('This permission requires Segregation of Duties validation');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
