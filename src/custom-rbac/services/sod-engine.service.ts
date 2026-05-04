import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SoDPolicy, ConflictType, RiskSeverity, EnforcementLevel } from '../entities/sod-policy.entity';
import { CustomRole } from '../entities/custom-role.entity';
import { RolePermission } from '../entities/role-permission.entity';

export interface SoDViolation {
  policyId: string;
  policyName: string;
  conflictType: ConflictType;
  violatingPermissions: string[];
  violatingRoles?: string[];
  riskSeverity: RiskSeverity;
  enforcementLevel: EnforcementLevel;
  recommendation: string;
  details: string;
}

export interface ValidationResult {
  isValid: boolean;
  canOverride: boolean;
  violations: SoDViolation[];
  errors: string[];
  warnings: string[];
}

@Injectable()
export class SoDEngine {
  private readonly logger = new Logger(SoDEngine.name);

  constructor(
    @InjectRepository(SoDPolicy)
    private readonly sodPolicyRepository: Repository<SoDPolicy>,
    @InjectRepository(CustomRole)
    private readonly roleRepository: Repository<CustomRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  /**
   * Detects SoD violations for a role
   */
  async detectViolations(
    roleId: string,
    tenantId: string
  ): Promise<SoDViolation[]> {
    this.logger.log(`Detecting SoD violations for role ${roleId}`);

    // Get role with permissions
    const role = await this.getRoleWithPermissions(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    // Get active SoD policies for tenant
    const policies = await this.getActiveSoDPolicies(tenantId);
    
    const violations: SoDViolation[] = [];

    for (const policy of policies) {
      const violation = await this.checkPolicy(role, policy);
      if (violation) {
        violations.push(violation);
      }
    }

    this.logger.log(`Found ${violations.length} SoD violations for role ${roleId}`);
    return violations;
  }

  /**
   * Pre-save validation
   * Prevents creating roles that violate SoD
   */
  async validateBeforeSave(
    roleId: string,
    permissionIds: string[],
    tenantId: string
  ): Promise<ValidationResult> {
    this.logger.log(`Validating SoD compliance for role ${roleId}`);

    const violations = await this.detectViolationsForPermissions(
      permissionIds,
      tenantId
    );

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for hard blocks
    const hardBlocks = violations.filter(
      v => v.enforcementLevel === EnforcementLevel.HARD_BLOCK
    );

    if (hardBlocks.length > 0) {
      errors.push(...hardBlocks.map(v => 
        `SoD Violation (HARD_BLOCK): ${v.policyName} - ${v.details}`
      ));
    }

    // Check for soft blocks
    const softBlocks = violations.filter(
      v => v.enforcementLevel === EnforcementLevel.SOFT_BLOCK
    );

    if (softBlocks.length > 0) {
      warnings.push(...softBlocks.map(v => 
        `SoD Violation (SOFT_BLOCK): ${v.policyName} - ${v.details} (Requires justification)`
      ));
    }

    // Check for warnings
    const warningViolations = violations.filter(
      v => v.enforcementLevel === EnforcementLevel.WARNING
    );

    if (warningViolations.length > 0) {
      warnings.push(...warningViolations.map(v => 
        `SoD Violation (WARNING): ${v.policyName} - ${v.details}`
      ));
    }

    return {
      isValid: hardBlocks.length === 0,
      canOverride: softBlocks.length > 0 && hardBlocks.length === 0,
      violations,
      errors,
      warnings
    };
  }

  /**
   * Checks a single SoD policy against a role
   */
  private async checkPolicy(
    role: any,
    policy: SoDPolicy
  ): Promise<SoDViolation | null> {
    const permissionIds = role.permissions.map(rp => rp.permissionId);

    switch (policy.conflictType) {
      case ConflictType.PERMISSION_CONFLICT:
        return this.checkPermissionConflict(permissionIds, policy);
      
      case ConflictType.ROLE_CONFLICT:
        return this.checkRoleConflict(role.id, policy);
      
      case ConflictType.CROSS_MODULE:
        return this.checkCrossModuleConflict(role.permissions, policy);
      
      case ConflictType.APPROVAL_CHAIN:
        return this.checkApprovalChainConflict(role, policy);
      
      default:
        return null;
    }
  }

  /**
   * Checks for permission conflicts
   */
  private checkPermissionConflict(
    permissionIds: string[],
    policy: SoDPolicy
  ): SoDViolation | null {
    for (const forbidden of policy.forbiddenCombinations) {
      if (!forbidden.permissions || forbidden.permissions.length === 0) {
        continue;
      }

      // Check if all forbidden permissions are present
      const hasAllForbidden = forbidden.permissions.every(fp => 
        permissionIds.includes(fp)
      );

      if (hasAllForbidden) {
        return {
          policyId: policy.id,
          policyName: policy.name,
          conflictType: policy.conflictType,
          violatingPermissions: forbidden.permissions,
          riskSeverity: policy.riskSeverity,
          enforcementLevel: policy.enforcementLevel,
          recommendation: this.generateRecommendation(policy),
          details: forbidden.reason
        };
      }
    }

    return null;
  }

  /**
   * Checks for role conflicts
   */
  private async checkRoleConflict(
    roleId: string,
    policy: SoDPolicy
  ): Promise<SoDViolation | null> {
    // Get user's assigned roles (this would need user context)
    // For now, just check if this role conflicts with others
    
    for (const forbidden of policy.forbiddenCombinations) {
      if (!forbidden.roles || forbidden.roles.length === 0) {
        continue;
      }

      // Check if this role is in the forbidden list
      if (forbidden.roles.includes(roleId)) {
        return {
          policyId: policy.id,
          policyName: policy.name,
          conflictType: policy.conflictType,
          violatingPermissions: [],
          violatingRoles: forbidden.roles,
          riskSeverity: policy.riskSeverity,
          enforcementLevel: policy.enforcementLevel,
          recommendation: this.generateRecommendation(policy),
          details: forbidden.reason
        };
      }
    }

    return null;
  }

  /**
   * Checks for cross-module conflicts
   */
  private checkCrossModuleConflict(
    permissions: any[],
    policy: SoDPolicy
  ): SoDViolation | null {
    // Group permissions by module
    const moduleMap = new Map<string, string[]>();
    
    for (const rp of permissions) {
      const module = rp.permission?.module;
      if (!module) continue;

      if (!moduleMap.has(module)) {
        moduleMap.set(module, []);
      }
      moduleMap.get(module).push(rp.permissionId);
    }

    // Check forbidden combinations across modules
    for (const forbidden of policy.forbiddenCombinations) {
      if (!forbidden.permissions) continue;

      // Check if permissions span across forbidden module combinations
      const modules = new Set<string>();
      for (const permId of forbidden.permissions) {
        for (const [module, perms] of moduleMap.entries()) {
          if (perms.includes(permId)) {
            modules.add(module);
          }
        }
      }

      if (modules.size > 1) {
        return {
          policyId: policy.id,
          policyName: policy.name,
          conflictType: policy.conflictType,
          violatingPermissions: forbidden.permissions,
          riskSeverity: policy.riskSeverity,
          enforcementLevel: policy.enforcementLevel,
          recommendation: this.generateRecommendation(policy),
          details: `${forbidden.reason} (Modules: ${Array.from(modules).join(', ')})`
        };
      }
    }

    return null;
  }

  /**
   * Checks for approval chain conflicts
   */
  private checkApprovalChainConflict(
    role: any,
    policy: SoDPolicy
  ): SoDViolation | null {
    // Check if role has both approval and transaction permissions
    const hasApprovalPerms = role.permissions.some(rp => 
      rp.permission?.actions?.includes('APPROVE')
    );

    const hasCreatePerms = role.permissions.some(rp => 
      rp.permission?.actions?.includes('CREATE') ||
      rp.permission?.actions?.includes('EDIT')
    );

    if (hasApprovalPerms && hasCreatePerms) {
      return {
        policyId: policy.id,
        policyName: policy.name,
        conflictType: policy.conflictType,
        violatingPermissions: role.permissions.map(rp => rp.permissionId),
        riskSeverity: policy.riskSeverity,
        enforcementLevel: policy.enforcementLevel,
        recommendation: this.generateRecommendation(policy),
        details: 'Role has both transaction creation and approval permissions'
      };
    }

    return null;
  }

  /**
   * Detects violations for a specific set of permissions
   */
  private async detectViolationsForPermissions(
    permissionIds: string[],
    tenantId: string
  ): Promise<SoDViolation[]> {
    const policies = await this.getActiveSoDPolicies(tenantId);
    const violations: SoDViolation[] = [];

    for (const policy of policies) {
      const violation = this.checkPermissionConflict(permissionIds, policy);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  /**
   * Gets role with permissions
   */
  private async getRoleWithPermissions(roleId: string): Promise<any> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId }
    });

    if (!role) {
      return null;
    }

    const permissions = await this.rolePermissionRepository.find({
      where: { roleId, isActive: true },
      relations: ['permission']
    });

    return {
      ...role,
      permissions
    };
  }

  /**
   * Gets active SoD policies for a tenant
   */
  private async getActiveSoDPolicies(tenantId: string): Promise<SoDPolicy[]> {
    return await this.sodPolicyRepository.find({
      where: { tenantId, isActive: true }
    });
  }

  /**
   * Generates recommendation for resolving violation
   */
  private generateRecommendation(policy: SoDPolicy): string {
    switch (policy.conflictType) {
      case ConflictType.PERMISSION_CONFLICT:
        return 'Remove one of the conflicting permissions or split into separate roles';
      
      case ConflictType.ROLE_CONFLICT:
        return 'Assign only one of the conflicting roles to users';
      
      case ConflictType.CROSS_MODULE:
        return 'Separate permissions into module-specific roles';
      
      case ConflictType.APPROVAL_CHAIN:
        return 'Create separate roles for transaction creation and approval';
      
      default:
        return 'Review and modify role permissions to resolve conflict';
    }
  }

  /**
   * Post-creation compliance scan
   */
  async scanRoleCompliance(roleId: string, tenantId: string): Promise<any> {
    const violations = await this.detectViolations(roleId, tenantId);

    const criticalViolations = violations.filter(
      v => v.riskSeverity === RiskSeverity.CRITICAL
    );

    const highViolations = violations.filter(
      v => v.riskSeverity === RiskSeverity.HIGH
    );

    return {
      roleId,
      complianceStatus: violations.length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
      totalViolations: violations.length,
      criticalViolations: criticalViolations.length,
      highViolations: highViolations.length,
      violations,
      scannedAt: new Date()
    };
  }

  /**
   * Bulk compliance scan for multiple roles
   */
  async bulkComplianceScan(tenantId: string): Promise<any[]> {
    const roles = await this.roleRepository.find({
      where: { tenantId, isActive: true }
    });

    const results = [];
    for (const role of roles) {
      const scan = await this.scanRoleCompliance(role.id, tenantId);
      results.push(scan);
    }

    return results;
  }
}
