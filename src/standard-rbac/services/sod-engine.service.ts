import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SoDPolicy, ConflictSeverity, ConflictAction } from '../entities/sod-policy.entity';
import { SystemRole } from '../entities/system-role.entity';
import { SystemRolePermission } from '../entities/system-role-permission.entity';

export interface SoDViolation {
  policyId: string;
  policyCode: string;
  policyName: string;
  conflictingRole1: string;
  conflictingRole2: string;
  severity: ConflictSeverity;
  action: ConflictAction;
  description: string;
  blocksAssignment: boolean;
  requiresException: boolean;
  mitigatingControls?: string;
  riskScore?: number;
}

export interface SoDCheckResult {
  hasViolations: boolean;
  blockingViolations: SoDViolation[];
  warnings: SoDViolation[];
  logOnly: SoDViolation[];
  riskScore: number;
}

@Injectable()
export class SoDEngine {
  constructor(
    @InjectRepository(SoDPolicy)
    private readonly sodPolicyRepository: Repository<SoDPolicy>,
    @InjectRepository(SystemRole)
    private readonly roleRepository: Repository<SystemRole>,
    @InjectRepository(SystemRolePermission)
    private readonly rolePermissionRepository: Repository<SystemRolePermission>,
  ) {}

  /**
   * Check for SoD violations when assigning roles
   */
  async checkViolations(userId: string, proposedRoleIds: string[], existingRoleIds: string[] = []): Promise<SoDCheckResult> {
    const allRoleIds = [...new Set([...existingRoleIds, ...proposedRoleIds])];
    
    // Get all active SoD policies
    const policies = await this.sodPolicyRepository.find({
      where: { isActive: true, isEnforced: true },
    });

    const blockingViolations: SoDViolation[] = [];
    const warnings: SoDViolation[] = [];
    const logOnly: SoDViolation[] = [];
    let totalRiskScore = 0;

    // Check each policy
    for (const policy of policies) {
      const hasRole1 = allRoleIds.includes(policy.conflictingRole1);
      const hasRole2 = allRoleIds.includes(policy.conflictingRole2);

      if (hasRole1 && hasRole2) {
        const violation = await this.buildViolation(policy);
        totalRiskScore += this.getSeverityRiskScore(policy.conflictSeverity);

        switch (policy.conflictAction) {
          case ConflictAction.BLOCK:
            blockingViolations.push(violation);
            break;
          case ConflictAction.WARN:
          case ConflictAction.ALLOW_WITH_APPROVAL:
            warnings.push(violation);
            break;
          case ConflictAction.LOG_ONLY:
            logOnly.push(violation);
            break;
        }
      }
    }

    // Check permission-level conflicts
    const permissionConflicts = await this.checkPermissionConflicts(allRoleIds);
    blockingViolations.push(...permissionConflicts.blocking);
    warnings.push(...permissionConflicts.warnings);

    return {
      hasViolations: blockingViolations.length > 0 || warnings.length > 0 || logOnly.length > 0,
      blockingViolations,
      warnings,
      logOnly,
      riskScore: totalRiskScore,
    };
  }

  /**
   * Check permission-level conflicts
   */
  private async checkPermissionConflicts(roleIds: string[]): Promise<{
    blocking: SoDViolation[];
    warnings: SoDViolation[];
  }> {
    const blocking: SoDViolation[] = [];
    const warnings: SoDViolation[] = [];

    // Get all permissions for these roles
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { systemRoleId: In(roleIds), isActive: true },
      relations: ['permission'],
    });

    const permissionMap = new Map<string, string[]>();
    rolePermissions.forEach(rp => {
      const permCode = (rp.permission as any).permissionCode;
      if (!permissionMap.has(permCode)) {
        permissionMap.set(permCode, []);
      }
      permissionMap.get(permCode)!.push(rp.systemRoleId);
    });

    // Check for conflicting permission policies
    const permissionPolicies = await this.sodPolicyRepository.find({
      where: { isActive: true, isEnforced: true },
    });

    for (const policy of permissionPolicies) {
      if (!policy.conflictingPermissions || policy.conflictingPermissions.length < 2) continue;

      const hasAllConflicting = policy.conflictingPermissions.every(perm =>
        permissionMap.has(perm)
      );

      if (hasAllConflicting) {
        const violation = await this.buildViolation(policy);

        if (policy.conflictAction === ConflictAction.BLOCK) {
          blocking.push(violation);
        } else {
          warnings.push(violation);
        }
      }
    }

    return { blocking, warnings };
  }

  /**
   * Build violation object
   */
  private async buildViolation(policy: SoDPolicy): Promise<SoDViolation> {
    const role1 = await this.roleRepository.findOne({ where: { id: policy.conflictingRole1 } });
    const role2 = await this.roleRepository.findOne({ where: { id: policy.conflictingRole2 } });

    return {
      policyId: policy.id,
      policyCode: policy.policyCode,
      policyName: policy.policyName,
      conflictingRole1: role1?.roleName || policy.conflictingRole1,
      conflictingRole2: role2?.roleName || policy.conflictingRole2,
      severity: policy.conflictSeverity,
      action: policy.conflictAction,
      description: policy.policyDescription || '',
      blocksAssignment: policy.conflictAction === ConflictAction.BLOCK,
      requiresException: policy.requiresException,
      mitigatingControls: policy.mitigatingControls,
      riskScore: policy.riskMetrics?.riskScore || 0,
    } as any;
  }

  /**
   * Analyze risk for role combination
   */
  async analyzeRiskProfile(roleIds: string[]): Promise<{
    overallRisk: number;
    riskLevel: string;
    highRiskPermissions: string[];
    violations: SoDViolation[];
    recommendations: string[];
  }> {
    const sodCheck = await this.checkViolations('temp', roleIds);
    
    // Calculate overall risk
    const baseRisk = sodCheck.riskScore;
    const violationRisk = sodCheck.blockingViolations.length * 10 + sodCheck.warnings.length * 5;
    const overallRisk = baseRisk + violationRisk;

    // Determine risk level
    let riskLevel = 'LOW';
    if (overallRisk > 50) riskLevel = 'CRITICAL';
    else if (overallRisk > 30) riskLevel = 'HIGH';
    else if (overallRisk > 15) riskLevel = 'MEDIUM';

    // Get high-risk permissions
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { systemRoleId: In(roleIds), isActive: true },
      relations: ['permission'],
    });

    const highRiskPermissions = rolePermissions
      .filter(rp => (rp.permission as any).riskScore >= 7)
      .map(rp => (rp.permission as any).permissionCode);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (sodCheck.blockingViolations.length > 0) {
      recommendations.push('Remove one of the conflicting roles to resolve blocking violations');
    }

    if (sodCheck.warnings.length > 0) {
      recommendations.push('Request approval for SoD exception with proper justification');
    }

    if (highRiskPermissions.length > 5) {
      recommendations.push('Consider splitting responsibilities across multiple roles');
    }

    if (roleIds.length > 3) {
      recommendations.push('Review if all roles are necessary for the user');
    }

    return {
      overallRisk,
      riskLevel,
      highRiskPermissions,
      violations: [...sodCheck.blockingViolations, ...sodCheck.warnings],
      recommendations,
    };
  }

  /**
   * Create SoD exception request
   */
  async createException(
    policyId: string,
    userId: string,
    requestorId: string,
    justification: string,
    durationDays: number = 90
  ): Promise<any> {
    const policy = await this.sodPolicyRepository.findOne({ where: { id: policyId } });

    if (!policy) {
      throw new Error('SoD policy not found');
    }

    if (!policy.requiresException) {
      throw new Error('This policy does not support exceptions');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (policy.exceptionValidityDays || durationDays));

    return {
      policyId,
      userId,
      requestorId,
      justification,
      expiresAt,
      approverRole: policy.exceptionApproverRole,
      requiresApproval: true,
    };
  }

  /**
   * Get SoD policies that apply to specific roles
   */
  async getPoliciesForRoles(roleIds: string[]): Promise<SoDPolicy[]> {
    const policies = await this.sodPolicyRepository.find({
      where: { isActive: true },
    });

    return policies.filter(policy => {
      return roleIds.includes(policy.conflictingRole1) || roleIds.includes(policy.conflictingRole2);
    });
  }

  /**
   * Get policies requiring periodic review
   */
  async getPoliciesRequiringReview(): Promise<SoDPolicy[]> {
    const policies = await this.sodPolicyRepository.find({
      where: { requiresPeriodicReview: true, isActive: true },
    });

    const now = new Date();

    return policies.filter(policy => {
      if (!policy.lastReviewedAt) return true;

      const daysSinceReview = Math.floor(
        (now.getTime() - policy.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSinceReview >= policy.reviewFrequencyDays;
    });
  }

  /**
   * Mark policy as reviewed
   */
  async markPolicyReviewed(policyId: string, reviewedBy: string): Promise<void> {
    await this.sodPolicyRepository.update(policyId, {
      lastReviewedAt: new Date(),
      lastReviewedBy: reviewedBy,
    });
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(tenantId?: string): Promise<any> {
    const where: any = { isActive: true };
    if (tenantId) where.tenantId = tenantId;

    const policies = await this.sodPolicyRepository.find({ where });

    const compliance = {
      totalPolicies: policies.length,
      enforcedPolicies: policies.filter(p => p.isEnforced).length,
      criticalPolicies: policies.filter(p => p.conflictSeverity === ConflictSeverity.CRITICAL).length,
      policiesRequiringReview: 0,
      frameworkCoverage: new Map<string, number>(),
    };

    // Count policies requiring review
    const now = new Date();
    policies.forEach(policy => {
      if (policy.requiresPeriodicReview && policy.lastReviewedAt) {
        const daysSinceReview = Math.floor(
          (now.getTime() - policy.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceReview >= policy.reviewFrequencyDays) {
          compliance.policiesRequiringReview++;
        }
      }

      // Count framework coverage
      policy.regulatoryFrameworks?.forEach(framework => {
        compliance.frameworkCoverage.set(
          framework,
          (compliance.frameworkCoverage.get(framework) || 0) + 1
        );
      });
    });

    return {
      ...compliance,
      frameworkCoverage: Object.fromEntries(compliance.frameworkCoverage),
    };
  }

  /**
   * Calculate risk score based on severity
   */
  private getSeverityRiskScore(severity: ConflictSeverity): number {
    const scores = {
      [ConflictSeverity.LOW]: 5,
      [ConflictSeverity.MEDIUM]: 15,
      [ConflictSeverity.HIGH]: 30,
      [ConflictSeverity.CRITICAL]: 50,
    };
    return scores[severity] || 0;
  }
}
