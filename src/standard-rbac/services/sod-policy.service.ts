import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere } from 'typeorm';
import { SoDPolicy, ConflictSeverity, ConflictAction, RegulatoryFramework } from '../entities/sod-policy.entity';
import { SystemRole } from '../entities/system-role.entity';
import { AuditService } from './audit.service';

const DEFAULT_TENANT = 'DEFAULT';

export interface SoDPolicyFilters {
  conflictSeverity?: ConflictSeverity;
  conflictAction?: ConflictAction;
  tenantId?: string;
  isActive?: boolean;
  isEnforced?: boolean;
  regulatoryFramework?: string;
  searchTerm?: string;
}

export interface SoDPolicyStatistics {
  total: number;
  active: number;
  enforced: number;
  bySeverity: Record<string, number>;
  byAction: Record<string, number>;
  byFramework: Record<string, number>;
  requiresReview: number;
  withExceptions: number;
}

export interface SoDPolicyTemplate {
  name: string;
  description: string;
  category: string;
  regulatoryFramework: string[];
  policies: Partial<SoDPolicy>[];
}

@Injectable()
export class SoDPolicyService {
  constructor(
    @InjectRepository(SoDPolicy)
    private readonly sodPolicyRepository: Repository<SoDPolicy>,
    @InjectRepository(SystemRole)
    private readonly roleRepository: Repository<SystemRole>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new SoD policy
   */
  async createPolicy(
    data: Partial<SoDPolicy>,
    createdBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<SoDPolicy> {
    // Validate required fields
    if (!data.policyCode || !data.policyName || !data.conflictingRole1 || !data.conflictingRole2) {
      throw new BadRequestException('Missing required fields: policyCode, policyName, conflictingRole1, conflictingRole2');
    }

    // Check for duplicate policy code
    const existing = await this.sodPolicyRepository.findOne({
      where: { policyCode: data.policyCode },
    });

    if (existing) {
      throw new BadRequestException(`SoD policy with code ${data.policyCode} already exists`);
    }

    // Validate roles exist
    const [role1, role2] = await Promise.all([
      this.roleRepository.findOne({ where: { id: data.conflictingRole1 } }),
      this.roleRepository.findOne({ where: { id: data.conflictingRole2 } }),
    ]);

    if (!role1) {
      throw new NotFoundException(`Role with ID ${data.conflictingRole1} not found`);
    }
    if (!role2) {
      throw new NotFoundException(`Role with ID ${data.conflictingRole2} not found`);
    }

    // Prevent self-conflict
    if (data.conflictingRole1 === data.conflictingRole2) {
      throw new BadRequestException('A role cannot conflict with itself');
    }

    // Calculate risk score if not provided
    if (!data.riskMetrics) {
      data.riskMetrics = this.calculateRiskMetrics(
        data.conflictSeverity || ConflictSeverity.MEDIUM,
        data.conflictAction || ConflictAction.WARN,
      );
    }

    const policy = this.sodPolicyRepository.create({
      ...data,
      tenantId: data.tenantId || tenantId,
      createdBy,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isEnforced: data.isEnforced !== undefined ? data.isEnforced : true,
      reviewFrequencyDays: data.reviewFrequencyDays || 90,
    });

    const savedPolicy = await this.sodPolicyRepository.save(policy);

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: createdBy,
      eventType: 'SOD_POLICY_CREATED' as any,
      severity: 'HIGH' as any,
      eventDescription: `Created SoD policy ${savedPolicy.policyCode}: ${savedPolicy.policyName}`,
      entityType: 'SOD_POLICY',
      entityId: savedPolicy.id,
      contextData: { policy: savedPolicy },
    });

    return savedPolicy;
  }

  /**
   * Get all SoD policies with filters
   */
  async findAll(filters?: SoDPolicyFilters): Promise<SoDPolicy[]> {
    const where: FindOptionsWhere<SoDPolicy> = {};

    if (filters) {
      if (filters.conflictSeverity) {
        where.conflictSeverity = filters.conflictSeverity;
      }
      if (filters.conflictAction) {
        where.conflictAction = filters.conflictAction;
      }
      if (filters.tenantId) {
        where.tenantId = filters.tenantId;
      }
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
      if (filters.isEnforced !== undefined) {
        where.isEnforced = filters.isEnforced;
      }
    }

    let query = this.sodPolicyRepository
      .createQueryBuilder('policy')
      .where(where);

    if (filters?.regulatoryFramework) {
      query = query.andWhere(':framework = ANY(policy.regulatoryFrameworks)', {
        framework: filters.regulatoryFramework,
      });
    }

    if (filters?.searchTerm) {
      query = query.andWhere(
        '(policy.policyCode ILIKE :search OR policy.policyName ILIKE :search OR policy.policyDescription ILIKE :search)',
        { search: `%${filters.searchTerm}%` },
      );
    }

    return await query
      .orderBy('policy.conflictSeverity', 'DESC')
      .addOrderBy('policy.policyCode', 'ASC')
      .getMany();
  }

  /**
   * Get SoD policy by ID
   */
  async findById(id: string): Promise<SoDPolicy> {
    const policy = await this.sodPolicyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`SoD policy with ID ${id} not found`);
    }
    return policy;
  }

  /**
   * Get SoD policy by code
   */
  async findByCode(policyCode: string): Promise<SoDPolicy> {
    const policy = await this.sodPolicyRepository.findOne({ where: { policyCode } });
    if (!policy) {
      throw new NotFoundException(`SoD policy with code ${policyCode} not found`);
    }
    return policy;
  }

  /**
   * Get policies affecting specific roles
   */
  async findPoliciesForRoles(roleIds: string[], tenantId?: string): Promise<SoDPolicy[]> {
    const query = this.sodPolicyRepository
      .createQueryBuilder('policy')
      .where('policy.isActive = :isActive', { isActive: true })
      .andWhere('policy.isEnforced = :isEnforced', { isEnforced: true })
      .andWhere(
        '(policy.conflictingRole1 IN (:...roleIds) OR policy.conflictingRole2 IN (:...roleIds))',
        { roleIds },
      );

    if (tenantId) {
      query.andWhere('policy.tenantId = :tenantId', { tenantId });
    }

    return await query
      .orderBy('policy.conflictSeverity', 'DESC')
      .getMany();
  }

  /**
   * Get policies requiring periodic review
   */
  async getPoliciesRequiringReview(): Promise<SoDPolicy[]> {
    const now = new Date();

    const policies = await this.sodPolicyRepository
      .createQueryBuilder('policy')
      .where('policy.isActive = :isActive', { isActive: true })
      .andWhere('policy.requiresPeriodicReview = :requiresReview', { requiresReview: true })
      .getMany();

    return policies.filter(policy => {
      if (!policy.lastReviewedAt) {
        return true; // Never reviewed
      }

      const daysSinceReview = Math.floor(
        (now.getTime() - new Date(policy.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24),
      );

      return daysSinceReview >= policy.reviewFrequencyDays;
    });
  }

  /**
   * Update SoD policy
   */
  async updatePolicy(
    id: string,
    data: Partial<SoDPolicy>,
    modifiedBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<SoDPolicy> {
    const policy = await this.findById(id);
    const oldData = { ...policy };

    // If changing roles, validate they exist
    if (data.conflictingRole1 && data.conflictingRole1 !== policy.conflictingRole1) {
      const role1 = await this.roleRepository.findOne({ where: { id: data.conflictingRole1 } });
      if (!role1) {
        throw new NotFoundException(`Role with ID ${data.conflictingRole1} not found`);
      }
    }

    if (data.conflictingRole2 && data.conflictingRole2 !== policy.conflictingRole2) {
      const role2 = await this.roleRepository.findOne({ where: { id: data.conflictingRole2 } });
      if (!role2) {
        throw new NotFoundException(`Role with ID ${data.conflictingRole2} not found`);
      }
    }

    // Recalculate risk metrics if severity or action changed
    if (data.conflictSeverity || data.conflictAction) {
      data.riskMetrics = this.calculateRiskMetrics(
        data.conflictSeverity || policy.conflictSeverity,
        data.conflictAction || policy.conflictAction,
      );
    }

    Object.assign(policy, data);
    const updatedPolicy = await this.sodPolicyRepository.save(policy);

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: modifiedBy,
      eventType: 'SOD_POLICY_UPDATED' as any,
      severity: 'HIGH' as any,
      eventDescription: `Updated SoD policy ${updatedPolicy.policyCode}`,
      entityType: 'SOD_POLICY',
      entityId: updatedPolicy.id,
      contextData: { policy: updatedPolicy, oldData },
    });

    return updatedPolicy;
  }

  /**
   * Soft delete SoD policy
   */
  async deletePolicy(id: string, deletedBy: string, tenantId: string = DEFAULT_TENANT): Promise<void> {
    const policy = await this.findById(id);
    const oldData = { ...policy };

    policy.isActive = false;
    policy.isEnforced = false;
    await this.sodPolicyRepository.save(policy);

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: deletedBy,
      eventType: 'SOD_POLICY_DELETED' as any,
      severity: 'HIGH' as any,
      eventDescription: `Deleted SoD policy ${policy.policyCode}`,
      entityType: 'SOD_POLICY',
      entityId: policy.id,
      contextData: { policyId: policy.id },
    });
  }

  /**
   * Hard delete SoD policy (permanent)
   */
  async hardDeletePolicy(id: string, deletedBy: string, tenantId: string = DEFAULT_TENANT): Promise<void> {
    const policy = await this.findById(id);

    await this.sodPolicyRepository.remove(policy);

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: deletedBy,
      eventType: 'SOD_POLICY_HARD_DELETED' as any,
      severity: 'CRITICAL' as any,
      eventDescription: `Hard deleted SoD policy ${id}`,
      entityType: 'SOD_POLICY',
      entityId: id,
      contextData: { policyId: id },
    });
  }

  /**
   * Mark policy as reviewed
   */
  async markPolicyReviewed(
    id: string,
    reviewedBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<SoDPolicy> {
    const policy = await this.findById(id);

    policy.lastReviewedAt = new Date();
    policy.lastReviewedBy = reviewedBy;

    const updatedPolicy = await this.sodPolicyRepository.save(policy);

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: reviewedBy,
      eventType: 'SOD_POLICY_REVIEWED' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Reviewed SoD policy ${policy.policyCode}`,
      entityType: 'SOD_POLICY',
      entityId: policy.id,
      contextData: { reviewedAt: policy.lastReviewedAt, reviewedBy },
    });

    return updatedPolicy;
  }

  /**
   * Get SoD policy statistics
   */
  async getStatistics(tenantId?: string): Promise<SoDPolicyStatistics> {
    const where: FindOptionsWhere<SoDPolicy> = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const policies = await this.sodPolicyRepository.find({ where });
    const activePolicies = policies.filter(p => p.isActive);
    const enforcedPolicies = policies.filter(p => p.isEnforced);

    const bySeverity: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    const byFramework: Record<string, number> = {};

    let requiresReview = 0;
    let withExceptions = 0;
    const now = new Date();

    for (const policy of activePolicies) {
      // Count by severity
      bySeverity[policy.conflictSeverity] = (bySeverity[policy.conflictSeverity] || 0) + 1;

      // Count by action
      byAction[policy.conflictAction] = (byAction[policy.conflictAction] || 0) + 1;

      // Count by regulatory framework
      if (policy.regulatoryFrameworks) {
        for (const framework of policy.regulatoryFrameworks) {
          byFramework[framework] = (byFramework[framework] || 0) + 1;
        }
      }

      // Check if requires review
      if (policy.requiresPeriodicReview && policy.lastReviewedAt) {
        const daysSinceReview = Math.floor(
          (now.getTime() - new Date(policy.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSinceReview >= policy.reviewFrequencyDays) {
          requiresReview++;
        }
      } else if (policy.requiresPeriodicReview && !policy.lastReviewedAt) {
        requiresReview++;
      }

      if (policy.requiresException) {
        withExceptions++;
      }
    }

    return {
      total: policies.length,
      active: activePolicies.length,
      enforced: enforcedPolicies.length,
      bySeverity,
      byAction,
      byFramework,
      requiresReview,
      withExceptions,
    };
  }

  /**
   * Clone an SoD policy
   */
  async clonePolicy(
    id: string,
    newPolicyCode: string,
    newPolicyName: string,
    clonedBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<SoDPolicy> {
    const sourcePolicy = await this.findById(id);

    const { id: _id, policyCode, policyName, createdAt, updatedAt, ...policyData } = sourcePolicy;

    const clonedPolicy = await this.createPolicy(
      {
        ...policyData,
        policyCode: newPolicyCode,
        policyName: newPolicyName,
      },
      clonedBy,
      tenantId,
    );

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: clonedBy,
      eventType: 'SOD_POLICY_CLONED' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Cloned SoD policy from ${id} to ${clonedPolicy.policyCode}`,
      entityType: 'SOD_POLICY',
      entityId: clonedPolicy.id,
      contextData: { sourceId: id, clonedPolicyId: clonedPolicy.id },
    });

    return clonedPolicy;
  }

  /**
   * Bulk update enforcement status
   */
  async bulkUpdateEnforcement(
    policyIds: string[],
    isEnforced: boolean,
    modifiedBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<{ updated: number; failed: string[] }> {
    const failed: string[] = [];
    let updated = 0;

    for (const id of policyIds) {
      try {
        const policy = await this.findById(id);
        policy.isEnforced = isEnforced;
        await this.sodPolicyRepository.save(policy);

        await this.auditService.log({
          tenantId,
          userId: modifiedBy,
          eventType: 'SOD_POLICY_BULK_UPDATE' as any,
          severity: 'HIGH' as any,
          eventDescription: `Bulk updated SoD policy ${id} enforcement to ${isEnforced}`,
          entityType: 'SOD_POLICY',
          entityId: policy.id,
          contextData: { policyId: id, isEnforced },
        });

        updated++;
      } catch (error) {
        failed.push(id);
      }
    }

    return { updated, failed };
  }

  /**
   * Calculate risk metrics based on severity and action
   */
  private calculateRiskMetrics(
    severity: ConflictSeverity,
    action: ConflictAction,
  ): {
    riskScore: number;
    impactLevel: string;
    likelihood: string;
    residualRisk: number;
  } {
    // Base risk score by severity
    const severityScores = {
      [ConflictSeverity.LOW]: 25,
      [ConflictSeverity.MEDIUM]: 50,
      [ConflictSeverity.HIGH]: 75,
      [ConflictSeverity.CRITICAL]: 100,
    };

    // Mitigation factor by action
    const actionMitigation = {
      [ConflictAction.BLOCK]: 0.1, // 90% mitigation
      [ConflictAction.ALLOW_WITH_APPROVAL]: 0.3, // 70% mitigation
      [ConflictAction.WARN]: 0.6, // 40% mitigation
      [ConflictAction.LOG_ONLY]: 0.9, // 10% mitigation
    };

    const baseScore = severityScores[severity];
    const mitigation = actionMitigation[action];
    const residualRisk = Math.round(baseScore * mitigation);

    return {
      riskScore: baseScore,
      impactLevel: severity,
      likelihood: this.getLikelihoodFromSeverity(severity),
      residualRisk,
    };
  }

  /**
   * Get likelihood label from severity
   */
  private getLikelihoodFromSeverity(severity: ConflictSeverity): string {
    const mapping = {
      [ConflictSeverity.LOW]: 'Rare',
      [ConflictSeverity.MEDIUM]: 'Possible',
      [ConflictSeverity.HIGH]: 'Likely',
      [ConflictSeverity.CRITICAL]: 'Almost Certain',
    };
    return mapping[severity];
  }

  /**
   * Get predefined SoD policy templates for SAP SF-level configurations
   */
  async getTemplates(): Promise<SoDPolicyTemplate[]> {
    return [
      {
        name: 'Financial Controls - SOX Compliance',
        description: 'Comprehensive SoD policies for SOX compliance in financial operations',
        category: 'FINANCIAL',
        regulatoryFramework: ['SOX', 'SOC2'],
        policies: [
          {
            policyCode: 'SOD-FIN-001',
            policyName: 'Invoice Creator & Approver Conflict',
            policyDescription: 'Prevents users from creating and approving their own invoices',
            conflictSeverity: ConflictSeverity.CRITICAL,
            conflictAction: ConflictAction.BLOCK,
            regulatoryFrameworks: ['SOX', 'SOC2'],
            businessJustification: 'Ensure proper segregation in accounts payable process',
            mitigatingControls: 'Dual approval required for high-value invoices',
            requiresPeriodicReview: true,
            reviewFrequencyDays: 90,
          },
          {
            policyCode: 'SOD-FIN-002',
            policyName: 'Payroll Processor & Approver Conflict',
            policyDescription: 'Prevents users from processing and approving payroll',
            conflictSeverity: ConflictSeverity.CRITICAL,
            conflictAction: ConflictAction.BLOCK,
            regulatoryFrameworks: ['SOX'],
            businessJustification: 'Prevent payroll fraud and errors',
            requiresPeriodicReview: true,
            reviewFrequencyDays: 60,
          },
          {
            policyCode: 'SOD-FIN-003',
            policyName: 'GL Posting & Reconciliation Conflict',
            policyDescription: 'Prevents users from both posting to GL and performing reconciliation',
            conflictSeverity: ConflictSeverity.HIGH,
            conflictAction: ConflictAction.WARN,
            regulatoryFrameworks: ['SOX', 'SOC2'],
            businessJustification: 'Ensure independent verification of GL transactions',
            requiresPeriodicReview: true,
            reviewFrequencyDays: 90,
          },
        ],
      },
      {
        name: 'HR & Compensation Controls',
        description: 'SoD policies for human resources and compensation management',
        category: 'HUMAN_RESOURCES',
        regulatoryFramework: ['SOX', 'GDPR'],
        policies: [
          {
            policyCode: 'SOD-HR-001',
            policyName: 'Salary Change Creator & Approver Conflict',
            policyDescription: 'Prevents users from creating and approving salary changes',
            conflictSeverity: ConflictSeverity.CRITICAL,
            conflictAction: ConflictAction.BLOCK,
            regulatoryFrameworks: ['SOX'],
            businessJustification: 'Prevent unauthorized compensation changes',
            requiresPeriodicReview: true,
            reviewFrequencyDays: 90,
          },
          {
            policyCode: 'SOD-HR-002',
            policyName: 'Employee Create & Benefits Admin Conflict',
            policyDescription: 'Prevents users from creating employees and managing their benefits',
            conflictSeverity: ConflictSeverity.HIGH,
            conflictAction: ConflictAction.WARN,
            regulatoryFrameworks: ['SOX', 'GDPR'],
            businessJustification: 'Ensure proper oversight in employee onboarding',
            requiresException: true,
            exceptionValidityDays: 30,
          },
          {
            policyCode: 'SOD-HR-003',
            policyName: 'Termination Initiator & Final Approver Conflict',
            policyDescription: 'Prevents users from both initiating and finally approving terminations',
            conflictSeverity: ConflictSeverity.HIGH,
            conflictAction: ConflictAction.BLOCK,
            regulatoryFrameworks: ['SOX'],
            businessJustification: 'Prevent unauthorized terminations',
            requiresPeriodicReview: true,
            reviewFrequencyDays: 90,
          },
        ],
      },
      {
        name: 'Access Management & Security',
        description: 'SoD policies for access control and security administration',
        category: 'SECURITY',
        regulatoryFramework: ['SOC2', 'ISO27001'],
        policies: [
          {
            policyCode: 'SOD-SEC-001',
            policyName: 'User Admin & Security Admin Conflict',
            policyDescription: 'Prevents users from combining user administration and security administration',
            conflictSeverity: ConflictSeverity.CRITICAL,
            conflictAction: ConflictAction.BLOCK,
            regulatoryFrameworks: ['SOC2', 'ISO27001'],
            businessJustification: 'Prevent privilege escalation and unauthorized access',
            requiresPeriodicReview: true,
            reviewFrequencyDays: 60,
          },
          {
            policyCode: 'SOD-SEC-002',
            policyName: 'Role Creator & Role Assignment Conflict',
            policyDescription: 'Prevents users from creating roles and assigning them to users',
            conflictSeverity: ConflictSeverity.HIGH,
            conflictAction: ConflictAction.WARN,
            regulatoryFrameworks: ['SOC2', 'ISO27001'],
            businessJustification: 'Ensure oversight in role-based access control',
            requiresException: true,
            exceptionValidityDays: 14,
          },
          {
            policyCode: 'SOD-SEC-003',
            policyName: 'Audit Log Admin & Security Admin Conflict',
            policyDescription: 'Prevents users from managing audit logs while having security admin rights',
            conflictSeverity: ConflictSeverity.CRITICAL,
            conflictAction: ConflictAction.BLOCK,
            regulatoryFrameworks: ['SOC2', 'ISO27001', 'GDPR'],
            businessJustification: 'Protect audit trail integrity',
            requiresPeriodicReview: true,
            reviewFrequencyDays: 30,
          },
        ],
      },
      {
        name: 'Procurement & Vendor Management',
        description: 'SoD policies for procurement and vendor management processes',
        category: 'PROCUREMENT',
        regulatoryFramework: ['SOX', 'SOC2'],
        policies: [
          {
            policyCode: 'SOD-PROC-001',
            policyName: 'PO Creator & Receiver Conflict',
            policyDescription: 'Prevents users from creating purchase orders and receiving goods',
            conflictSeverity: ConflictSeverity.HIGH,
            conflictAction: ConflictAction.BLOCK,
            regulatoryFrameworks: ['SOX', 'SOC2'],
            businessJustification: 'Prevent fictitious purchases and fraud',
            requiresPeriodicReview: true,
            reviewFrequencyDays: 90,
          },
          {
            policyCode: 'SOD-PROC-002',
            policyName: 'Vendor Creator & Payment Processor Conflict',
            policyDescription: 'Prevents users from creating vendors and processing payments',
            conflictSeverity: ConflictSeverity.CRITICAL,
            conflictAction: ConflictAction.BLOCK,
            regulatoryFrameworks: ['SOX'],
            businessJustification: 'Prevent vendor fraud and unauthorized payments',
            requiresPeriodicReview: true,
            reviewFrequencyDays: 60,
          },
        ],
      },
      {
        name: 'Data Privacy & Compliance (GDPR)',
        description: 'SoD policies for data privacy and GDPR compliance',
        category: 'PRIVACY',
        regulatoryFramework: ['GDPR', 'HIPAA'],
        policies: [
          {
            policyCode: 'SOD-PRIV-001',
            policyName: 'PII Access & Export Conflict',
            policyDescription: 'Prevents users from viewing and exporting PII data simultaneously',
            conflictSeverity: ConflictSeverity.HIGH,
            conflictAction: ConflictAction.WARN,
            regulatoryFrameworks: ['GDPR', 'HIPAA'],
            businessJustification: 'Protect personally identifiable information',
            requiresException: true,
            exceptionValidityDays: 7,
            requiresPeriodicReview: true,
            reviewFrequencyDays: 30,
          },
          {
            policyCode: 'SOD-PRIV-002',
            policyName: 'Data Delete & Audit Review Conflict',
            policyDescription: 'Prevents users from deleting data and reviewing audit logs',
            conflictSeverity: ConflictSeverity.CRITICAL,
            conflictAction: ConflictAction.BLOCK,
            regulatoryFrameworks: ['GDPR', 'SOC2'],
            businessJustification: 'Ensure traceability and prevent evidence tampering',
            requiresPeriodicReview: true,
            reviewFrequencyDays: 60,
          },
        ],
      },
    ];
  }

  /**
   * Apply SoD policy template
   */
  async applyTemplate(
    templateName: string,
    appliedBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<SoDPolicy[]> {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.name === templateName);

    if (!template) {
      throw new NotFoundException(`Template "${templateName}" not found`);
    }

    const createdPolicies: SoDPolicy[] = [];

    for (const policyData of template.policies) {
      try {
        // Note: In real implementation, you'd need to map role names to IDs
        // For now, we'll skip policies that don't have valid role IDs
        if (!policyData.conflictingRole1 || !policyData.conflictingRole2) {
          console.log(`Skipping policy ${policyData.policyCode} - roles need to be mapped`);
          continue;
        }

        const policy = await this.createPolicy(policyData, appliedBy, tenantId);
        createdPolicies.push(policy);
      } catch (error) {
        console.error(`Failed to create policy ${policyData.policyCode}:`, error.message);
      }
    }

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: appliedBy,
      eventType: 'SOD_POLICY_TEMPLATE_APPLIED' as any,
      severity: 'HIGH' as any,
      eventDescription: `Applied template "${templateName}"`,
      entityType: 'SOD_POLICY',
      entityId: 'TEMPLATE',
      contextData: { templateName, policiesCreated: createdPolicies.length },
    });

    return createdPolicies;
  }

  /**
   * Validate SoD policy configuration
   */
  async validateConfiguration(id: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const policy = await this.findById(id);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if roles still exist
    try {
      const [role1, role2] = await Promise.all([
        this.roleRepository.findOne({ where: { id: policy.conflictingRole1 } }),
        this.roleRepository.findOne({ where: { id: policy.conflictingRole2 } }),
      ]);

      if (!role1) {
        errors.push(`Conflicting role 1 (${policy.conflictingRole1}) no longer exists`);
      }
      if (!role2) {
        errors.push(`Conflicting role 2 (${policy.conflictingRole2}) no longer exists`);
      }
    } catch (error) {
      errors.push('Failed to validate role existence');
    }

    // Check exception configuration
    if (policy.requiresException && !policy.exceptionApproverRole) {
      warnings.push('No exception approver role specified');
    }

    if (policy.requiresException && !policy.exceptionValidityDays) {
      warnings.push('No exception validity period specified');
    }

    // Check review configuration
    if (policy.requiresPeriodicReview && !policy.reviewFrequencyDays) {
      errors.push('Review frequency must be specified for periodic review');
    }

    // Check critical policies are enforced
    if (policy.conflictSeverity === ConflictSeverity.CRITICAL && policy.conflictAction === ConflictAction.LOG_ONLY) {
      warnings.push('Critical severity policy should not use LOG_ONLY action');
    }

    // Check if policy needs review
    if (policy.requiresPeriodicReview && policy.lastReviewedAt) {
      const daysSinceReview = Math.floor(
        (new Date().getTime() - new Date(policy.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceReview >= policy.reviewFrequencyDays) {
        warnings.push(`Policy requires review (last reviewed ${daysSinceReview} days ago)`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
