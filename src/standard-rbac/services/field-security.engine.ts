import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldLevelSecurity, FieldSecurityAction, MaskingType } from '../entities/field-level-security.entity';

export interface FieldSecurityRule {
  fieldName: string;
  action: FieldSecurityAction;
  maskingType?: MaskingType;
  maskingChar?: string;
  visibleChars?: number;
  allowExport?: boolean;
  allowPrint?: boolean;
  requiresApproval?: boolean;
  auditOnAccess?: boolean;
}

export interface EntityFieldSecurity {
  entityType: string;
  fields: Map<string, FieldSecurityRule>;
}

@Injectable()
export class FieldSecurityEngine {
  constructor(
    @InjectRepository(FieldLevelSecurity)
    private readonly fieldSecurityRepository: Repository<FieldLevelSecurity>,
  ) {}

  /**
   * Resolve field security rules for a permission
   */
  async resolveFieldSecurity(
    permissionId: string,
    tenantId?: string,
    countryCode?: string
  ): Promise<Map<string, FieldSecurityRule>> {
    const where: any = { permissionId, isActive: true };
    if (tenantId) where.tenantId = tenantId;

    const rules = await this.fieldSecurityRepository.find({ where });

    const fieldRules = new Map<string, FieldSecurityRule>();

    for (const rule of rules) {
      // Country-specific rules take precedence
      if (rule.isCountrySpecific && countryCode && rule.countryCode !== countryCode) {
        continue;
      }

      const fieldRule: FieldSecurityRule = {
        fieldName: rule.fieldName,
        action: rule.securityAction,
        maskingType: rule.maskingType,
        maskingChar: rule.maskingChar,
        visibleChars: rule.visibleChars,
        allowExport: rule.allowExport,
        allowPrint: rule.allowPrint,
        requiresApproval: rule.requiresApprovalToView,
        auditOnAccess: rule.auditOnAccess,
      };

      fieldRules.set(rule.fieldName, fieldRule);
    }

    return fieldRules;
  }

  /**
   * Apply field security to data object
   */
  async applyFieldSecurity(
    data: Record<string, any>,
    fieldRules: Map<string, FieldSecurityRule>,
    context?: Record<string, any>
  ): Promise<Record<string, any>> {
    const securedData = { ...data };

    for (const [fieldName, rule] of fieldRules) {
      if (!securedData.hasOwnProperty(fieldName)) continue;

      // Evaluate conditional rules
      if (context?.conditions) {
        const conditionsMet = this.evaluateConditions(context.conditions, data);
        if (!conditionsMet) continue;
      }

      switch (rule.action) {
        case FieldSecurityAction.HIDE:
          delete securedData[fieldName];
          break;

        case FieldSecurityAction.MASK:
          securedData[fieldName] = this.maskValue(
            securedData[fieldName],
            rule.maskingType,
            rule.maskingChar,
            rule.visibleChars
          );
          break;

        case FieldSecurityAction.PARTIAL:
          securedData[fieldName] = this.partialMask(
            securedData[fieldName],
            rule.visibleChars
          );
          break;

        case FieldSecurityAction.READ_ONLY:
          // Mark as read-only (would be handled by frontend)
          securedData[`${fieldName}_readonly`] = true;
          break;

        case FieldSecurityAction.EDITABLE:
          // Allow editing (no change needed)
          break;
      }
    }

    return securedData;
  }

  /**
   * Apply field security to array of data objects
   */
  async applyFieldSecurityBulk(
    dataArray: Record<string, any>[],
    fieldRules: Map<string, FieldSecurityRule>,
    context?: Record<string, any>
  ): Promise<Record<string, any>[]> {
    return Promise.all(
      dataArray.map(data => this.applyFieldSecurity(data, fieldRules, context))
    );
  }

  /**
   * Mask a value based on masking type
   */
  private maskValue(
    value: any,
    maskingType?: MaskingType,
    maskingChar: string = '*',
    visibleChars?: number
  ): string {
    if (value === null || value === undefined) return value;

    const strValue = String(value);

    switch (maskingType) {
      case MaskingType.FULL:
        return maskingChar.repeat(strValue.length);

      case MaskingType.PARTIAL_START:
        if (!visibleChars) visibleChars = 4;
        return strValue.substring(0, visibleChars) + maskingChar.repeat(Math.max(0, strValue.length - visibleChars));

      case MaskingType.PARTIAL_END:
        if (!visibleChars) visibleChars = 4;
        return maskingChar.repeat(Math.max(0, strValue.length - visibleChars)) + strValue.substring(strValue.length - visibleChars);

      case MaskingType.PARTIAL_MIDDLE:
        if (!visibleChars) visibleChars = 2;
        const start = strValue.substring(0, visibleChars);
        const end = strValue.substring(strValue.length - visibleChars);
        const middle = maskingChar.repeat(Math.max(0, strValue.length - visibleChars * 2));
        return start + middle + end;

      case MaskingType.HASH:
        // Simple hash representation
        return `[HASH:${this.simpleHash(strValue)}]`;

      case MaskingType.TOKENIZE:
        // Tokenize (would use proper tokenization service in production)
        return `[TOKEN:${this.generateToken()}]`;

      case MaskingType.REDACT:
        return '[REDACTED]';

      default:
        return maskingChar.repeat(strValue.length);
    }
  }

  /**
   * Partial mask with custom logic
   */
  private partialMask(value: any, visibleChars: number = 4): string {
    if (value === null || value === undefined) return value;

    const strValue = String(value);
    if (strValue.length <= visibleChars) {
      return strValue;
    }

    return strValue.substring(0, visibleChars) + '***';
  }

  /**
   * Simple hash function (for demonstration)
   */
  private simpleHash(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8).toUpperCase();
  }

  /**
   * Generate token (for demonstration)
   */
  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  }

  /**
   * Evaluate conditional rules
   */
  private evaluateConditions(conditions: Record<string, any>, data: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if (data[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if field can be exported
   */
  async canExportField(
    permissionId: string,
    fieldName: string,
    tenantId?: string
  ): Promise<boolean> {
    const rule = await this.fieldSecurityRepository.findOne({
      where: { permissionId, fieldName, isActive: true, tenantId },
    });

    if (!rule) return true; // No restriction

    return rule.allowExport;
  }

  /**
   * Check if field can be printed
   */
  async canPrintField(
    permissionId: string,
    fieldName: string,
    tenantId?: string
  ): Promise<boolean> {
    const rule = await this.fieldSecurityRepository.findOne({
      where: { permissionId, fieldName, isActive: true, tenantId },
    });

    if (!rule) return true; // No restriction

    return rule.allowPrint;
  }

  /**
   * Get fields that require approval to view
   */
  async getApprovalRequiredFields(
    permissionId: string,
    tenantId?: string
  ): Promise<string[]> {
    const rules = await this.fieldSecurityRepository.find({
      where: {
        permissionId,
        requiresApprovalToView: true,
        isActive: true,
        tenantId,
      },
    });

    return rules.map(r => r.fieldName);
  }

  /**
   * Get fields that require audit on access
   */
  async getAuditRequiredFields(
    permissionId: string,
    tenantId?: string
  ): Promise<string[]> {
    const rules = await this.fieldSecurityRepository.find({
      where: {
        permissionId,
        auditOnAccess: true,
        isActive: true,
        tenantId,
      },
    });

    return rules.map(r => r.fieldName);
  }
}
