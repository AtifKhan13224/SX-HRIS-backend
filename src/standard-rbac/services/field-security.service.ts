import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, FindOptionsWhere } from 'typeorm';
import { FieldLevelSecurity, FieldSecurityAction, MaskingType } from '../entities/field-level-security.entity';
import { AuditService } from './audit.service';

const DEFAULT_TENANT = 'DEFAULT';

export interface FieldSecurityRuleFilters {
  entityType?: string;
  permissionId?: string;
  tenantId?: string;
  countryCode?: string;
  securityAction?: FieldSecurityAction;
  isActive?: boolean;
  searchTerm?: string;
}

export interface FieldSecurityStatistics {
  total: number;
  active: number;
  byAction: Record<string, number>;
  byEntity: Record<string, number>;
  countrySpecific: number;
  withMasking: number;
  requiresApproval: number;
  auditOnAccess: number;
}

export interface FieldSecurityTemplate {
  name: string;
  description: string;
  category: string;
  entityType: string;
  rules: Partial<FieldLevelSecurity>[];
}

@Injectable()
export class FieldSecurityService {
  constructor(
    @InjectRepository(FieldLevelSecurity)
    private readonly fieldSecurityRepository: Repository<FieldLevelSecurity>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new field security rule
   */
  async createRule(
    data: Partial<FieldLevelSecurity>,
    createdBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<FieldLevelSecurity> {
    // Validate required fields
    if (!data.permissionId || !data.entityType || !data.fieldName || !data.securityAction) {
      throw new BadRequestException('Missing required fields: permissionId, entityType, fieldName, securityAction');
    }

    // Check for duplicates
    const existing = await this.fieldSecurityRepository.findOne({
      where: {
        permissionId: data.permissionId,
        entityType: data.entityType,
        fieldName: data.fieldName,
        tenantId: data.tenantId || tenantId,
        isActive: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Field security rule already exists for ${data.entityType}.${data.fieldName} on permission ${data.permissionId}`,
      );
    }

    // Validate masking configuration
    if (data.securityAction === FieldSecurityAction.MASK || data.securityAction === FieldSecurityAction.PARTIAL) {
      if (!data.maskingType) {
        throw new BadRequestException('Masking type is required for MASK or PARTIAL actions');
      }
    }

    const rule = this.fieldSecurityRepository.create({
      ...data,
      tenantId: data.tenantId || tenantId,
      createdBy,
      isActive: data.isActive !== undefined ? data.isActive : true,
      maskingChar: data.maskingChar || '*',
    });

    const savedRule = await this.fieldSecurityRepository.save(rule);

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: createdBy,
      eventType: 'FIELD_LEVEL_SECURITY_CREATED' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Created field security rule for ${savedRule.entityType}.${savedRule.fieldName}`,
      entityType: 'FIELD_SECURITY',
      entityId: savedRule.id,
      contextData: { rule: savedRule },
    });

    return savedRule;
  }

  /**
   * Get all field security rules with filters
   */
  async findAll(filters?: FieldSecurityRuleFilters): Promise<FieldLevelSecurity[]> {
    const where: FindOptionsWhere<FieldLevelSecurity> = {};

    if (filters) {
      if (filters.entityType) {
        where.entityType = filters.entityType;
      }
      if (filters.permissionId) {
        where.permissionId = filters.permissionId;
      }
      if (filters.tenantId) {
        where.tenantId = filters.tenantId;
      }
      if (filters.countryCode) {
        where.countryCode = filters.countryCode;
      }
      if (filters.securityAction) {
        where.securityAction = filters.securityAction;
      }
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
    }

    let query = this.fieldSecurityRepository
      .createQueryBuilder('rule')
      .where(where);

    if (filters?.searchTerm) {
      query = query.andWhere(
        '(rule.fieldName ILIKE :search OR rule.fieldDisplayName ILIKE :search OR rule.entityType ILIKE :search)',
        { search: `%${filters.searchTerm}%` },
      );
    }

    return await query
      .orderBy('rule.entityType', 'ASC')
      .addOrderBy('rule.fieldName', 'ASC')
      .getMany();
  }

  /**
   * Get field security rule by ID
   */
  async findById(id: string): Promise<FieldLevelSecurity> {
    const rule = await this.fieldSecurityRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Field security rule with ID ${id} not found`);
    }
    return rule;
  }

  /**
   * Get field security rules for a specific permission
   */
  async findByPermission(permissionId: string, tenantId?: string): Promise<FieldLevelSecurity[]> {
    const where: FindOptionsWhere<FieldLevelSecurity> = {
      permissionId,
      isActive: true,
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    return await this.fieldSecurityRepository.find({ where });
  }

  /**
   * Get field security rules for a specific entity type
   */
  async findByEntityType(entityType: string, tenantId?: string): Promise<FieldLevelSecurity[]> {
    const where: FindOptionsWhere<FieldLevelSecurity> = {
      entityType,
      isActive: true,
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    return await this.fieldSecurityRepository.find({
      where,
      order: { fieldName: 'ASC' },
    });
  }

  /**
   * Get sensitive fields (those with HIDE, MASK, or requiring approval)
   */
  async getSensitiveFields(entityType?: string, tenantId?: string): Promise<FieldLevelSecurity[]> {
    const query = this.fieldSecurityRepository
      .createQueryBuilder('rule')
      .where('rule.isActive = :isActive', { isActive: true })
      .andWhere(
        '(rule.securityAction IN (:...actions) OR rule.requiresApprovalToView = :requiresApproval)',
        {
          actions: [FieldSecurityAction.HIDE, FieldSecurityAction.MASK],
          requiresApproval: true,
        },
      );

    if (entityType) {
      query.andWhere('rule.entityType = :entityType', { entityType });
    }

    if (tenantId) {
      query.andWhere('rule.tenantId = :tenantId', { tenantId });
    }

    return await query.orderBy('rule.entityType', 'ASC').addOrderBy('rule.fieldName', 'ASC').getMany();
  }

  /**
   * Update field security rule
   */
  async updateRule(
    id: string,
    data: Partial<FieldLevelSecurity>,
    modifiedBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<FieldLevelSecurity> {
    const rule = await this.findById(id);
    const oldData = { ...rule };

    // Validate masking configuration if action is MASK or PARTIAL
    if (
      (data.securityAction === FieldSecurityAction.MASK ||
        data.securityAction === FieldSecurityAction.PARTIAL) &&
      !data.maskingType &&
      !rule.maskingType
    ) {
      throw new BadRequestException('Masking type is required for MASK or PARTIAL actions');
    }

    Object.assign(rule, data);
    const updatedRule = await this.fieldSecurityRepository.save(rule);

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: modifiedBy,
      eventType: 'FIELD_LEVEL_SECURITY_UPDATED' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Updated field security rule for ${updatedRule.entityType}.${updatedRule.fieldName}`,
      entityType: 'FIELD_SECURITY',
      entityId: updatedRule.id,
      contextData: { rule: updatedRule, oldData },
    });

    return updatedRule;
  }

  /**
   * Soft delete field security rule
   */
  async deleteRule(id: string, deletedBy: string, tenantId: string = DEFAULT_TENANT): Promise<void> {
    const rule = await this.findById(id);
    const oldData = { ...rule };

    rule.isActive = false;
    await this.fieldSecurityRepository.save(rule);

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: deletedBy,
      eventType: 'FIELD_LEVEL_SECURITY_DELETED' as any,
      severity: 'HIGH' as any,
      eventDescription: `Deleted field security rule for ${rule.entityType}.${rule.fieldName}`,
      entityType: 'FIELD_SECURITY',
      entityId: rule.id,
      contextData: { ruleId: rule.id },
    });
  }

  /**
   * Hard delete field security rule (permanent)
   */
  async hardDeleteRule(id: string, deletedBy: string, tenantId: string = DEFAULT_TENANT): Promise<void> {
    const rule = await this.findById(id);

    await this.fieldSecurityRepository.remove(rule);

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: deletedBy,
      eventType: 'FIELD_LEVEL_SECURITY_HARD_DELETED' as any,
      severity: 'CRITICAL' as any,
      eventDescription: `Hard deleted field security rule ${id}`,
      entityType: 'FIELD_SECURITY',
      entityId: id,
      contextData: { ruleId: id },
    });
  }

  /**
   * Get field security statistics
   */
  async getStatistics(tenantId?: string): Promise<FieldSecurityStatistics> {
    const where: FindOptionsWhere<FieldLevelSecurity> = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const rules = await this.fieldSecurityRepository.find({ where });
    const activeRules = rules.filter(r => r.isActive);

    const byAction: Record<string, number> = {};
    const byEntity: Record<string, number> = {};

    let countrySpecific = 0;
    let withMasking = 0;
    let requiresApproval = 0;
    let auditOnAccess = 0;

    for (const rule of activeRules) {
      // Count by action
      byAction[rule.securityAction] = (byAction[rule.securityAction] || 0) + 1;

      // Count by entity
      byEntity[rule.entityType] = (byEntity[rule.entityType] || 0) + 1;

      // Other statistics
      if (rule.isCountrySpecific) countrySpecific++;
      if (rule.maskingType) withMasking++;
      if (rule.requiresApprovalToView) requiresApproval++;
      if (rule.auditOnAccess) auditOnAccess++;
    }

    return {
      total: rules.length,
      active: activeRules.length,
      byAction,
      byEntity,
      countrySpecific,
      withMasking,
      requiresApproval,
      auditOnAccess,
    };
  }

  /**
   * Clone a field security rule
   */
  async cloneRule(
    id: string,
    newPermissionId: string,
    clonedBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<FieldLevelSecurity> {
    const sourceRule = await this.findById(id);

    const { id: _id, createdAt, updatedAt, ...ruleData } = sourceRule;

    const clonedRule = await this.createRule(
      {
        ...ruleData,
        permissionId: newPermissionId,
      },
      clonedBy,
      tenantId,
    );

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: clonedBy,
      eventType: 'FIELD_LEVEL_SECURITY_CLONED' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Cloned field security rule from ${id} to ${clonedRule.id}`,
      entityType: 'FIELD_SECURITY',
      entityId: clonedRule.id,
      contextData: { sourceId: id, clonedRuleId: clonedRule.id },
    });

    return clonedRule;
  }

  /**
   * Bulk update status (activate/deactivate multiple rules)
   */
  async bulkUpdateStatus(
    ruleIds: string[],
    isActive: boolean,
    modifiedBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<{ updated: number; failed: string[] }> {
    const failed: string[] = [];
    let updated = 0;

    for (const id of ruleIds) {
      try {
        const rule = await this.findById(id);
        rule.isActive = isActive;
        await this.fieldSecurityRepository.save(rule);

        await this.auditService.log({
          tenantId,
          userId: modifiedBy,
          eventType: 'FIELD_LEVEL_SECURITY_BULK_UPDATE' as any,
          severity: 'MEDIUM' as any,
          eventDescription: `Bulk updated field security rule ${id} status to ${isActive}`,
          entityType: 'FIELD_SECURITY',
          entityId: rule.id,
          contextData: { ruleId: id, isActive },
        });

        updated++;
      } catch (error) {
        failed.push(id);
      }
    }

    return { updated, failed };
  }

  /**
   * Get predefined field security templates for SAP SF-level configurations
   */
  async getTemplates(): Promise<FieldSecurityTemplate[]> {
    return [
      {
        name: 'PII Protection - Full',
        description: 'Comprehensive PII protection with masking for all sensitive employee fields',
        category: 'COMPLIANCE',
        entityType: 'EMPLOYEE',
        rules: [
          {
            fieldName: 'ssn',
            fieldDisplayName: 'Social Security Number',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.PARTIAL_END,
            visibleChars: 4,
            allowExport: false,
            allowPrint: false,
            requiresApprovalToView: true,
            auditOnAccess: true,
          },
          {
            fieldName: 'taxId',
            fieldDisplayName: 'Tax ID',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.FULL,
            allowExport: false,
            allowPrint: false,
            auditOnAccess: true,
          },
          {
            fieldName: 'bankAccount',
            fieldDisplayName: 'Bank Account',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.PARTIAL_END,
            visibleChars: 4,
            allowExport: false,
            allowPrint: false,
            requiresApprovalToView: true,
          },
          {
            fieldName: 'dateOfBirth',
            fieldDisplayName: 'Date of Birth',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.PARTIAL_START,
            visibleChars: 4,
            allowExport: false,
          },
        ],
      },
      {
        name: 'Payroll Data Protection',
        description: 'Protect sensitive payroll information with strict access controls',
        category: 'FINANCIAL',
        entityType: 'PAYROLL',
        rules: [
          {
            fieldName: 'grossPay',
            fieldDisplayName: 'Gross Pay',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.FULL,
            allowExport: false,
            auditOnAccess: true,
          },
          {
            fieldName: 'netPay',
            fieldDisplayName: 'Net Pay',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.FULL,
            allowExport: false,
            auditOnAccess: true,
          },
          {
            fieldName: 'bankAccountNumber',
            fieldDisplayName: 'Bank Account Number',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.PARTIAL_END,
            visibleChars: 4,
            allowExport: false,
            allowPrint: false,
            requiresApprovalToView: true,
          },
          {
            fieldName: 'routingNumber',
            fieldDisplayName: 'Routing Number',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.FULL,
            allowExport: false,
            allowPrint: false,
          },
        ],
      },
      {
        name: 'Performance Data - Confidential',
        description: 'Hide or restrict access to performance review data',
        category: 'PERFORMANCE',
        entityType: 'PERFORMANCE',
        rules: [
          {
            fieldName: 'performanceRating',
            fieldDisplayName: 'Performance Rating',
            securityAction: FieldSecurityAction.READ_ONLY,
            requiresApprovalToView: false,
            auditOnAccess: true,
          },
          {
            fieldName: 'compensationChange',
            fieldDisplayName: 'Compensation Change',
            securityAction: FieldSecurityAction.HIDE,
            requiresApprovalToView: true,
            auditOnAccess: true,
          },
          {
            fieldName: 'terminationReason',
            fieldDisplayName: 'Termination Reason',
            securityAction: FieldSecurityAction.HIDE,
            requiresApprovalToView: true,
            auditOnAccess: true,
          },
          {
            fieldName: 'disciplinaryAction',
            fieldDisplayName: 'Disciplinary Action',
            securityAction: FieldSecurityAction.HIDE,
            requiresApprovalToView: true,
            auditOnAccess: true,
          },
        ],
      },
      {
        name: 'Benefits & Health - HIPAA Compliant',
        description: 'HIPAA-compliant field security for benefits and health data',
        category: 'COMPLIANCE',
        entityType: 'BENEFITS',
        rules: [
          {
            fieldName: 'healthInsuranceId',
            fieldDisplayName: 'Health Insurance ID',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.PARTIAL_MIDDLE,
            allowExport: false,
            allowPrint: false,
            requiresApprovalToView: true,
            auditOnAccess: true,
          },
          {
            fieldName: 'medicalHistory',
            fieldDisplayName: 'Medical History',
            securityAction: FieldSecurityAction.HIDE,
            requiresApprovalToView: true,
            auditOnAccess: true,
          },
          {
            fieldName: 'beneficiaryDetails',
            fieldDisplayName: 'Beneficiary Details',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.PARTIAL_MIDDLE,
            requiresApprovalToView: true,
            auditOnAccess: true,
          },
        ],
      },
      {
        name: 'Recruitment - Background Check',
        description: 'Protect sensitive recruitment and background check information',
        category: 'RECRUITMENT',
        entityType: 'RECRUITMENT',
        rules: [
          {
            fieldName: 'previousSalary',
            fieldDisplayName: 'Previous Salary',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.FULL,
            requiresApprovalToView: true,
          },
          {
            fieldName: 'expectedSalary',
            fieldDisplayName: 'Expected Salary',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.FULL,
            requiresApprovalToView: true,
          },
          {
            fieldName: 'criminalBackground',
            fieldDisplayName: 'Criminal Background',
            securityAction: FieldSecurityAction.HIDE,
            requiresApprovalToView: true,
            auditOnAccess: true,
          },
          {
            fieldName: 'referenceContacts',
            fieldDisplayName: 'Reference Contacts',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.PARTIAL_MIDDLE,
            requiresApprovalToView: true,
          },
        ],
      },
      {
        name: 'Global Compliance - GDPR',
        description: 'GDPR-compliant field security for EU employees',
        category: 'COMPLIANCE',
        entityType: 'EMPLOYEE',
        rules: [
          {
            fieldName: 'personalEmail',
            fieldDisplayName: 'Personal Email',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.PARTIAL_MIDDLE,
            isCountrySpecific: true,
            countryCode: 'EU',
            allowExport: false,
            auditOnAccess: true,
          },
          {
            fieldName: 'phoneNumber',
            fieldDisplayName: 'Phone Number',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.PARTIAL_END,
            visibleChars: 4,
            isCountrySpecific: true,
            countryCode: 'EU',
            allowExport: false,
            auditOnAccess: true,
          },
          {
            fieldName: 'address',
            fieldDisplayName: 'Home Address',
            securityAction: FieldSecurityAction.MASK,
            maskingType: MaskingType.PARTIAL_START,
            visibleChars: 10,
            isCountrySpecific: true,
            countryCode: 'EU',
            allowExport: false,
            auditOnAccess: true,
          },
        ],
      },
      {
        name: 'Manager View - Limited',
        description: 'Allow managers to view employee data with limited access to sensitive fields',
        category: 'ROLE_BASED',
        entityType: 'EMPLOYEE',
        rules: [
          {
            fieldName: 'salary',
            fieldDisplayName: 'Salary',
            securityAction: FieldSecurityAction.READ_ONLY,
            auditOnAccess: true,
          },
          {
            fieldName: 'ssn',
            fieldDisplayName: 'SSN',
            securityAction: FieldSecurityAction.HIDE,
          },
          {
            fieldName: 'taxId',
            fieldDisplayName: 'Tax ID',
            securityAction: FieldSecurityAction.HIDE,
          },
          {
            fieldName: 'bankAccount',
            fieldDisplayName: 'Bank Account',
            securityAction: FieldSecurityAction.HIDE,
          },
        ],
      },
      {
        name: 'Auditor Access - Full Visibility',
        description: 'Grant auditors full visibility with read-only access and comprehensive logging',
        category: 'ROLE_BASED',
        entityType: 'EMPLOYEE',
        rules: [
          {
            fieldName: 'ssn',
            fieldDisplayName: 'SSN',
            securityAction: FieldSecurityAction.READ_ONLY,
            auditOnAccess: true,
          },
          {
            fieldName: 'salary',
            fieldDisplayName: 'Salary',
            securityAction: FieldSecurityAction.READ_ONLY,
            auditOnAccess: true,
          },
          {
            fieldName: 'bankAccount',
            fieldDisplayName: 'Bank Account',
            securityAction: FieldSecurityAction.READ_ONLY,
            auditOnAccess: true,
          },
          {
            fieldName: 'performanceRating',
            fieldDisplayName: 'Performance Rating',
            securityAction: FieldSecurityAction.READ_ONLY,
            auditOnAccess: true,
          },
        ],
      },
    ];
  }

  /**
   * Apply field security template to a permission
   */
  async applyTemplate(
    templateName: string,
    permissionId: string,
    entityType: string,
    appliedBy: string,
    tenantId: string = DEFAULT_TENANT,
  ): Promise<FieldLevelSecurity[]> {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.name === templateName && t.entityType === entityType);

    if (!template) {
      throw new NotFoundException(
        `Template "${templateName}" not found for entity type "${entityType}"`,
      );
    }

    const createdRules: FieldLevelSecurity[] = [];

    for (const ruleData of template.rules) {
      try {
        const rule = await this.createRule(
          {
            ...ruleData,
            permissionId,
            entityType: template.entityType,
            tenantId,
          },
          appliedBy,
          tenantId,
        );
        createdRules.push(rule);
      } catch (error) {
        // Continue creating other rules even if one fails
        console.error(`Failed to create rule for field ${ruleData.fieldName}:`, error.message);
      }
    }

    // Audit log
    await this.auditService.log({
      tenantId,
      userId: appliedBy,
      eventType: 'FIELD_LEVEL_SECURITY_TEMPLATE_APPLIED' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Applied template "${templateName}" to permission ${permissionId}`,
      entityType: 'FIELD_SECURITY',
      entityId: permissionId,
      contextData: { templateName, rulesCreated: createdRules.length },
    });

    return createdRules;
  }

  /**
   * Validate field security configuration
   */
  async validateConfiguration(id: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const rule = await this.findById(id);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check masking configuration
    if (
      (rule.securityAction === FieldSecurityAction.MASK ||
        rule.securityAction === FieldSecurityAction.PARTIAL) &&
      !rule.maskingType
    ) {
      errors.push('Masking type is required for MASK or PARTIAL security actions');
    }

    // Check approval configuration
    if (rule.requiresApprovalToView && !rule.approverRole) {
      warnings.push('No approver role specified for field requiring approval');
    }

    // Check country-specific configuration
    if (rule.isCountrySpecific && !rule.countryCode) {
      errors.push('Country code is required when field is country-specific');
    }

    // Check export/print restrictions for sensitive data
    if (rule.securityAction === FieldSecurityAction.HIDE || rule.maskingType) {
      if (rule.allowExport) {
        warnings.push('Sensitive field allows export - consider restricting');
      }
      if (rule.allowPrint) {
        warnings.push('Sensitive field allows printing - consider restricting');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
