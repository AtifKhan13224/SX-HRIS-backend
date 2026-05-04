import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomRole } from '../entities/custom-role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { SoDEngine } from './sod-engine.service';

export interface RiskFactors {
  permissionRisk: number;
  scopeRisk: number;
  sensitivityRisk: number;
  sodRisk: number;
  governanceRisk: number;
}

export interface RiskAnalysis {
  totalScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactors;
  recommendations: string[];
  criticalIssues: string[];
}

@Injectable()
export class RiskScoringEngine {
  private readonly logger = new Logger(RiskScoringEngine.name);

  constructor(
    @InjectRepository(CustomRole)
    private readonly roleRepository: Repository<CustomRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private readonly sodEngine: SoDEngine,
  ) {}

  /**
   * Calculates comprehensive risk score for a role (0-100)
   * 
   * Factors:
   * - Number of high-risk permissions (30%)
   * - Data sensitivity access (25%)
   * - Scope breadth (20%)
   * - SoD violations (15%)
   * - Governance compliance (10%)
   */
  async calculateRiskScore(roleId: string, tenantId: string): Promise<RiskAnalysis> {
    this.logger.log(`Calculating risk score for role ${roleId}`);

    const role = await this.roleRepository.findOne({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    const permissions = await this.rolePermissionRepository.find({
      where: { roleId, isActive: true },
      relations: ['permission']
    });

    // Calculate individual risk factors
    const permissionRisk = this.calculatePermissionRisk(permissions);
    const scopeRisk = this.calculateScopeRisk(permissions);
    const sensitivityRisk = this.calculateSensitivityRisk(role, permissions);
    const sodRisk = await this.calculateSoDRisk(roleId, tenantId);
    const governanceRisk = this.calculateGovernanceRisk(role);

    // Weighted total score
    const totalScore = Math.min(100, Math.round(
      permissionRisk * 0.30 +
      scopeRisk * 0.20 +
      sensitivityRisk * 0.25 +
      sodRisk * 0.15 +
      governanceRisk * 0.10
    ));

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (totalScore >= 80) riskLevel = 'CRITICAL';
    else if (totalScore >= 60) riskLevel = 'HIGH';
    else if (totalScore >= 40) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      permissionRisk,
      scopeRisk,
      sensitivityRisk,
      sodRisk,
      governanceRisk
    });

    const criticalIssues = this.identifyCriticalIssues({
      permissionRisk,
      scopeRisk,
      sensitivityRisk,
      sodRisk,
      governanceRisk
    });

    return {
      totalScore,
      riskLevel,
      factors: {
        permissionRisk,
        scopeRisk,
        sensitivityRisk,
        sodRisk,
        governanceRisk
      },
      recommendations,
      criticalIssues
    };
  }

  /**
   * Calculates risk based on permissions
   */
  private calculatePermissionRisk(permissions: RolePermission[]): number {
    if (permissions.length === 0) return 0;

    let score = 0;
    const totalPerms = permissions.length;

    // Count high-risk actions
    let highRiskActions = 0;
    for (const perm of permissions) {
      const actions = perm.permission?.actions || [];
      
      // High-risk actions (check if array includes these values)
      const actionStr = actions.join(',');
      if (actionStr.includes('DELETE')) highRiskActions += 3;
      if (actionStr.includes('OVERRIDE')) highRiskActions += 3;
      if (actionStr.includes('MASS_UPDATE')) highRiskActions += 2;
      if (actionStr.includes('EXPORT')) highRiskActions += 2;
      if (actionStr.includes('APPROVE')) highRiskActions += 1;
    }

    // Count high individual risk permissions
    let highRiskPerms = permissions.filter(p => 
      (p.permission?.riskLevel || 0) > 70
    ).length;

    // Calculate score
    score += (totalPerms / 100) * 30; // More permissions = more risk
    score += (highRiskActions / totalPerms) * 40;
    score += (highRiskPerms / totalPerms) * 30;

    return Math.min(100, score);
  }

  /**
   * Calculates risk based on scope breadth
   */
  private calculateScopeRisk(permissions: RolePermission[]): number {
    if (permissions.length === 0) return 0;

    let score = 0;

    // Count unrestricted scopes
    const unrestrictedCount = permissions.filter(p => 
      !p.dataScope || p.dataScope.scopeType === 'UNRESTRICTED'
    ).length;

    // Calculate breadth
    const unrestrictedRatio = unrestrictedCount / permissions.length;
    score += unrestrictedRatio * 60;

    // Count cross-organizational scopes
    const crossOrgCount = permissions.filter(p => {
      const scope = p.dataScope?.scopeDefinition;
      return scope && (
        scope.organizationUnits?.length > 5 ||
        scope.countries?.length > 10 ||
        scope.businessUnits?.length > 5
      );
    }).length;

    score += (crossOrgCount / permissions.length) * 40;

    return Math.min(100, score);
  }

  /**
   * Calculates risk based on data sensitivity
   */
  private calculateSensitivityRisk(role: CustomRole, permissions: RolePermission[]): number {
    if (permissions.length === 0) return 0;

    let score = 0;

    // Role sensitivity level
    const roleSensitivity = {
      'LOW': 10,
      'MEDIUM': 30,
      'HIGH': 60,
      'CRITICAL': 90
    };
    score += roleSensitivity[role.sensitivityLevel] * 0.3;

    // Permission data types
    const sensitivePerms = permissions.filter(p => {
      const dataType = p.permission?.dataType;
      return dataType === 'PII' || dataType === 'FINANCIAL' || 
             dataType === 'CONFIDENTIAL' || dataType === 'RESTRICTED';
    }).length;

    score += (sensitivePerms / permissions.length) * 70;

    return Math.min(100, score);
  }

  /**
   * Calculates risk based on SoD violations
   */
  private async calculateSoDRisk(roleId: string, tenantId: string): Promise<number> {
    try {
      const violations = await this.sodEngine.detectViolations(roleId, tenantId);
      
      if (violations.length === 0) return 0;

      let score = 0;

      // Weight by severity
      for (const violation of violations) {
        switch (violation.riskSeverity) {
          case 'CRITICAL':
            score += 25;
            break;
          case 'HIGH':
            score += 15;
            break;
          case 'MEDIUM':
            score += 8;
            break;
          case 'LOW':
            score += 3;
            break;
        }
      }

      return Math.min(100, score);
    } catch (error) {
      this.logger.error(`Error calculating SoD risk: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculates risk based on governance compliance
   */
  private calculateGovernanceRisk(role: CustomRole): number {
    let score = 0;

    // No approval workflow for high-risk role
    if (role.sensitivityLevel === 'HIGH' || role.sensitivityLevel === 'CRITICAL') {
      if (!role.requiresApproval || !role.approvalWorkflowId) {
        score += 50;
      }
    }

    // Role without owner
    if (!role.ownerId) {
      score += 30;
    }

    // Expired role still active
    if (role.effectiveEndDate && new Date(role.effectiveEndDate) < new Date()) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Generates recommendations based on risk factors
   */
  private generateRecommendations(factors: RiskFactors): string[] {
    const recommendations: string[] = [];

    if (factors.permissionRisk > 70) {
      recommendations.push('Reduce number of high-risk permissions or split into multiple roles');
      recommendations.push('Review and remove unnecessary DELETE, OVERRIDE, and MASS_UPDATE permissions');
    }

    if (factors.scopeRisk > 60) {
      recommendations.push('Restrict data scope to specific organizational units');
      recommendations.push('Avoid unrestricted access; apply principle of least privilege');
    }

    if (factors.sensitivityRisk > 70) {
      recommendations.push('Implement field-level masking for sensitive data');
      recommendations.push('Add approval workflow for this high-sensitivity role');
    }

    if (factors.sodRisk > 50) {
      recommendations.push('URGENT: Resolve Segregation of Duties violations');
      recommendations.push('Split conflicting permissions into separate roles');
    }

    if (factors.governanceRisk > 40) {
      recommendations.push('Add approval workflow for role changes');
      recommendations.push('Assign a role owner for accountability');
      recommendations.push('Set appropriate expiration dates');
    }

    return recommendations;
  }

  /**
   * Identifies critical issues
   */
  private identifyCriticalIssues(factors: RiskFactors): string[] {
    const issues: string[] = [];

    if (factors.sodRisk > 80) {
      issues.push('CRITICAL: Multiple severe SoD violations detected');
    }

    if (factors.sensitivityRisk > 85 && factors.governanceRisk > 50) {
      issues.push('CRITICAL: High-sensitivity role without proper governance');
    }

    if (factors.permissionRisk > 90) {
      issues.push('CRITICAL: Excessive high-risk permissions');
    }

    if (factors.scopeRisk > 85) {
      issues.push('CRITICAL: Near-unrestricted data access');
    }

    return issues;
  }

  /**
   * Bulk risk assessment for all roles
   */
  async bulkRiskAssessment(tenantId: string): Promise<any[]> {
    const roles = await this.roleRepository.find({
      where: { tenantId, isActive: true }
    });

    const assessments = [];
    for (const role of roles) {
      try {
        const analysis = await this.calculateRiskScore(role.id, tenantId);
        assessments.push({
          roleId: role.id,
          roleCode: role.roleCode,
          roleName: role.roleName,
          ...analysis
        });
      } catch (error) {
        this.logger.error(`Error assessing role ${role.id}: ${error.message}`);
      }
    }

    // Sort by risk score (highest first)
    assessments.sort((a, b) => b.totalScore - a.totalScore);

    return assessments;
  }
}
