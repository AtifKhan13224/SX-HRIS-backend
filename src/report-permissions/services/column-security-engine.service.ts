import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReportColumnSecurity,
  ColumnVisibility,
  MaskingType,
  DataClassification,
} from '../entities';

interface ColumnAccessResult {
  columnName: string;
  visibility: ColumnVisibility;
  maskingType?: MaskingType;
  shouldMask: boolean;
  shouldRedact: boolean;
  shouldAggregate: boolean;
  maskedValue?: string;
}

@Injectable()
export class ColumnSecurityEngine {
  constructor(
    @InjectRepository(ReportColumnSecurity)
    private columnSecurityRepo: Repository<ReportColumnSecurity>,
  ) {}

  /**
   * Get column security rules for a report and role
   */
  async findColumnSecurityRules(reportId: string, roleId: string, tenantId: string) {
    return await this.columnSecurityRepo.find({
      where: { reportId, roleId, tenantId, isActive: true },
      order: { columnName: 'ASC' },
    });
  }

  /**
   * Create column security rule
   */
  async createColumnSecurity(tenantId: string, userId: string, data: any) {
    const rule = this.columnSecurityRepo.create({
      ...data,
      tenantId,
      createdBy: userId,
    });

    return await this.columnSecurityRepo.save(rule);
  }

  /**
   * Update column security rule
   */
  async updateColumnSecurity(id: string, tenantId: string, userId: string, data: any) {
    const rule = await this.columnSecurityRepo.findOne({
      where: { id, tenantId },
    });

    if (!rule) {
      throw new Error('Column security rule not found');
    }

    Object.assign(rule, {
      ...data,
      updatedBy: userId,
    });

    return await this.columnSecurityRepo.save(rule);
  }

  /**
   * Delete column security rule
   */
  async deleteColumnSecurity(id: string, tenantId: string) {
    const rule = await this.columnSecurityRepo.findOne({
      where: { id, tenantId },
    });

    if (!rule) {
      throw new Error('Column security rule not found');
    }

    rule.isActive = false;
    return await this.columnSecurityRepo.save(rule);
  }

  /**
   * Evaluate column access for a user
   */
  async evaluateColumnAccess(
    reportId: string,
    roleId: string,
    tenantId: string,
    columnName: string,
    userCountry?: string,
  ): Promise<ColumnAccessResult> {
    const rule = await this.columnSecurityRepo.findOne({
      where: { reportId, roleId, columnName, tenantId, isActive: true },
    });

    if (!rule) {
      // No rule = full visibility
      return {
        columnName,
        visibility: ColumnVisibility.VISIBLE,
        shouldMask: false,
        shouldRedact: false,
        shouldAggregate: false,
      };
    }

    // Check geographic restrictions
    if (userCountry) {
      if (rule.restrictedCountries?.includes(userCountry)) {
        return {
          columnName,
          visibility: ColumnVisibility.REDACTED,
          shouldMask: false,
          shouldRedact: true,
          shouldAggregate: false,
        };
      }

      if (rule.allowedCountries && !rule.allowedCountries.includes(userCountry)) {
        return {
          columnName,
          visibility: ColumnVisibility.REDACTED,
          shouldMask: false,
          shouldRedact: true,
          shouldAggregate: false,
        };
      }
    }

    // Return based on visibility setting
    return {
      columnName,
      visibility: rule.visibility,
      maskingType: rule.maskingType,
      shouldMask: rule.visibility === ColumnVisibility.MASKED,
      shouldRedact: rule.visibility === ColumnVisibility.REDACTED,
      shouldAggregate: rule.visibility === ColumnVisibility.AGGREGATED_ONLY,
    };
  }

  /**
   * Apply masking to a value
   */
  maskValue(value: any, maskingType: MaskingType, customPattern?: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    const strValue = String(value);

    switch (maskingType) {
      case MaskingType.FULL:
        return '*'.repeat(Math.min(strValue.length, 12));
      
      case MaskingType.PARTIAL:
        if (strValue.length <= 4) {
          return '*'.repeat(strValue.length);
        }
        // Show first 2 characters, mask the rest
        return strValue.substring(0, 2) + '*'.repeat(strValue.length - 2);
      
      case MaskingType.HASH:
        // Simple hash (in production, use crypto)
        return this.simpleHash(strValue);
      
      case MaskingType.REDACTED:
        return '[REDACTED]';
      
      case MaskingType.AGGREGATED_ONLY:
        return '[AGGREGATED DATA ONLY]';
      
      case MaskingType.TOKENIZED:
        // Generate a consistent token
        return `TOKEN_${this.simpleHash(strValue).substring(0, 8)}`;
      
      default:
        return strValue;
    }
  }

  /**
   * Apply masking to multiple rows
   */
  async applyColumnSecurity(
    reportId: string,
    roleId: string,
    tenantId: string,
    data: Record<string, any>[],
    userCountry?: string,
  ): Promise<Record<string, any>[]> {
    if (!data || data.length === 0) {
      return data;
    }

    // Get column names from first row
    const columns = Object.keys(data[0]);

    // Get security rules for all columns
    const rules = await this.findColumnSecurityRules(reportId, roleId, tenantId);
    const ruleMap = new Map(rules.map(r => [r.columnName, r]));

    // Apply masking to each row
    return data.map(row => {
      const maskedRow: Record<string, any> = {};

      for (const column of columns) {
        const rule = ruleMap.get(column);
        const value = row[column];

        if (!rule) {
          // No rule = visible
          maskedRow[column] = value;
          continue;
        }

        // Check geographic restrictions
        if (userCountry) {
          if (rule.restrictedCountries?.includes(userCountry)) {
            maskedRow[column] = '[REDACTED]';
            continue;
          }

          if (rule.allowedCountries && !rule.allowedCountries.includes(userCountry)) {
            maskedRow[column] = '[REDACTED]';
            continue;
          }
        }

        // Apply visibility rules
        switch (rule.visibility) {
          case ColumnVisibility.VISIBLE:
            maskedRow[column] = value;
            break;
          
          case ColumnVisibility.MASKED:
            maskedRow[column] = this.maskValue(value, rule.maskingType || MaskingType.PARTIAL);
            break;
          
          case ColumnVisibility.REDACTED:
            maskedRow[column] = '[REDACTED]';
            break;
          
          case ColumnVisibility.AGGREGATED_ONLY:
            maskedRow[column] = '[AGGREGATED DATA ONLY]';
            break;
          
          default:
            maskedRow[column] = value;
        }
      }

      return maskedRow;
    });
  }

  /**
   * Get list of columns that should be excluded from query
   */
  async getRedactedColumns(
    reportId: string,
    roleId: string,
    tenantId: string,
    userCountry?: string,
  ): Promise<string[]> {
    const rules = await this.findColumnSecurityRules(reportId, roleId, tenantId);
    const redacted: string[] = [];

    for (const rule of rules) {
      // Check geographic restrictions
      if (userCountry) {
        if (rule.restrictedCountries?.includes(userCountry)) {
          redacted.push(rule.columnName);
          continue;
        }

        if (rule.allowedCountries && !rule.allowedCountries.includes(userCountry)) {
          redacted.push(rule.columnName);
          continue;
        }
      }

      // Check visibility
      if (rule.visibility === ColumnVisibility.REDACTED) {
        redacted.push(rule.columnName);
      }
    }

    return redacted;
  }

  /**
   * Get aggregation-only columns
   */
  async getAggregationOnlyColumns(
    reportId: string,
    roleId: string,
    tenantId: string,
  ): Promise<string[]> {
    const rules = await this.findColumnSecurityRules(reportId, roleId, tenantId);
    
    return rules
      .filter(r => r.visibility === ColumnVisibility.AGGREGATED_ONLY)
      .map(r => r.columnName);
  }

  /**
   * Get PII columns
   */
  async getPiiColumns(reportId: string, tenantId: string): Promise<string[]> {
    const rules = await this.columnSecurityRepo.find({
      where: { reportId, tenantId, isPii: true, isActive: true },
    });

    return rules.map(r => r.columnName);
  }

  /**
   * Get financial columns
   */
  async getFinancialColumns(reportId: string, tenantId: string): Promise<string[]> {
    const rules = await this.columnSecurityRepo.find({
      where: { reportId, tenantId, isFinancial: true, isActive: true },
    });

    return rules.map(r => r.columnName);
  }

  /**
   * Validate aggregation request
   */
  validateAggregation(
    columnName: string,
    aggregationType: string,
    rule?: ReportColumnSecurity,
  ): { valid: boolean; reason?: string } {
    if (!rule) {
      return { valid: true };
    }

    if (!rule.allowAggregation) {
      return { valid: false, reason: 'Aggregation not allowed for this column' };
    }

    if (rule.allowedAggregations && rule.allowedAggregations.length > 0) {
      if (!rule.allowedAggregations.includes(aggregationType.toUpperCase())) {
        return { 
          valid: false, 
          reason: `Aggregation type ${aggregationType} not allowed. Allowed: ${rule.allowedAggregations.join(', ')}` 
        };
      }
    }

    return { valid: true };
  }

  /**
   * Simple hash function (for demo purposes)
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Classify data sensitivity
   */
  classifyColumn(columnName: string, sampleData?: any[]): DataClassification {
    const lowerName = columnName.toLowerCase();

    // PII detection
    if (
      lowerName.includes('ssn') ||
      lowerName.includes('social_security') ||
      lowerName.includes('passport') ||
      lowerName.includes('driver_license') ||
      lowerName.includes('tax_id')
    ) {
      return DataClassification.GOVERNMENT_ID;
    }

    if (
      lowerName.includes('salary') ||
      lowerName.includes('wage') ||
      lowerName.includes('bonus') ||
      lowerName.includes('bank') ||
      lowerName.includes('account')
    ) {
      return DataClassification.FINANCIAL;
    }

    if (
      lowerName.includes('health') ||
      lowerName.includes('medical') ||
      lowerName.includes('diagnosis') ||
      lowerName.includes('prescription')
    ) {
      return DataClassification.HEALTH_DATA;
    }

    if (
      lowerName.includes('name') ||
      lowerName.includes('email') ||
      lowerName.includes('phone') ||
      lowerName.includes('address')
    ) {
      return DataClassification.PII;
    }

    if (
      lowerName.includes('confidential') ||
      lowerName.includes('sensitive') ||
      lowerName.includes('restricted')
    ) {
      return DataClassification.RESTRICTED;
    }

    return DataClassification.INTERNAL;
  }
}
