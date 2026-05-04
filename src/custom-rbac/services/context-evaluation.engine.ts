import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContextEvaluationRule, ContextType } from '../entities/context-evaluation-rule.entity';
import { RolePermission } from '../entities/role-permission.entity';

/**
 * Context for permission evaluation
 */
export interface PermissionContext {
  userId: string;
  tenantId: string;
  timestamp: Date;
  
  // Employee Context
  employeeId?: string;
  lifecycleStage?: 'ONBOARDING' | 'ACTIVE' | 'NOTICE_PERIOD' | 'EXITING' | 'EXITED';
  noticePeriod?: {
    isActive: boolean;
    startDate: Date;
    endDate: Date;
    remainingDays: number;
  };
  
  // Temporary Assignments
  actingAssignment?: {
    roleId: string;
    startDate: Date;
    endDate: Date;
    authority: string;
  };
  temporaryElevation?: {
    reason: string;
    elevatedBy: string;
    startDate: Date;
    endDate: Date;
    additionalPermissions: string[];
  };
  
  // Time and Location
  currentTime?: Date;
  timezone?: string;
  ipAddress?: string;
  location?: {
    country: string;
    region: string;
    office?: string;
  };
  
  // Emergency Context
  emergencyMode?: {
    isActive: boolean;
    type: 'BUSINESS_CONTINUITY' | 'DISASTER_RECOVERY' | 'SECURITY_INCIDENT';
    activatedBy: string;
    activatedAt: Date;
  };
  
  // Request Context
  requestedAction?: string;
  requestedResource?: string;
  requestedScope?: any;
}

/**
 * Result of context evaluation
 */
export interface ContextEvaluationResult {
  isAllowed: boolean;
  matchedRules: string[];
  appliedConditions: any[];
  scopeModifications: any[];
  fieldRestrictions: any[];
  temporaryPermissions: string[];
  warnings: string[];
  expiresAt?: Date;
  reason?: string;
}

/**
 * Enterprise Context-Aware Permission Evaluation Engine
 * 
 * Evaluates permissions based on:
 * - Employee lifecycle stage
 * - Notice period status
 * - Acting assignments
 * - Temporary elevation
 * - Time-bound access
 * - Emergency mode
 * - Location and IP restrictions
 */
@Injectable()
export class ContextEvaluationEngine {
  private readonly logger = new Logger(ContextEvaluationEngine.name);

  constructor(
    @InjectRepository(ContextEvaluationRule)
    private readonly ruleRepository: Repository<ContextEvaluationRule>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  /**
   * Evaluates if permission is allowed in given context
   */
  async evaluatePermission(
    permissionId: string,
    roleId: string,
    context: PermissionContext
  ): Promise<ContextEvaluationResult> {
    this.logger.log(`Evaluating permission ${permissionId} for role ${roleId} in context`);

    try {
      // 1. Get role permission with context conditions
      const rolePermission = await this.rolePermissionRepository.findOne({
        where: { roleId, permissionId, isActive: true }
      });

      if (!rolePermission) {
        return {
          isAllowed: false,
          matchedRules: [],
          appliedConditions: [],
          scopeModifications: [],
          fieldRestrictions: [],
          temporaryPermissions: [],
          warnings: [],
          reason: 'Permission not assigned to role'
        };
      }

      // 2. Check lifecycle stage restrictions
      const lifecycleCheck = this.evaluateLifecycleStage(
        rolePermission.conditionalRules,
        context
      );
      if (!lifecycleCheck.isAllowed) {
        return lifecycleCheck;
      }

      // 3. Check notice period restrictions
      const noticePeriodCheck = this.evaluateNoticePeriod(
        rolePermission.conditionalRules,
        context
      );
      if (!noticePeriodCheck.isAllowed) {
        return noticePeriodCheck;
      }

      // 4. Check acting assignments
      const actingCheck = this.evaluateActingAssignment(context);
      
      // 5. Check temporary elevation
      const temporaryCheck = this.evaluateTemporaryElevation(context);

      // 6. Check time-bound access
      const timeCheck = this.evaluateTimeBound(
        rolePermission.effectiveStartDate,
        rolePermission.effectiveEndDate,
        context
      );
      if (!timeCheck.isAllowed) {
        return timeCheck;
      }

      // 7. Check emergency mode
      const emergencyCheck = this.evaluateEmergencyMode(
        rolePermission.conditionalRules,
        context
      );

      // 8. Apply scope modifications
      const scopeMods = this.applyScopeModifications(
        rolePermission.dataScope?.scopeDefinition,
        context
      );

      // 9. Apply field restrictions
      const fieldRestrictions = this.applyFieldRestrictions(
        rolePermission.fieldAccessRules,
        context
      );

      // 10. Aggregate results
      const matchedRules = [
        ...lifecycleCheck.matchedRules,
        ...noticePeriodCheck.matchedRules,
        ...actingCheck.matchedRules,
        ...temporaryCheck.matchedRules,
        ...timeCheck.matchedRules,
        ...emergencyCheck.matchedRules
      ];

      const warnings = [
        ...lifecycleCheck.warnings,
        ...noticePeriodCheck.warnings,
        ...actingCheck.warnings,
        ...temporaryCheck.warnings,
        ...timeCheck.warnings,
        ...emergencyCheck.warnings
      ];

      return {
        isAllowed: true,
        matchedRules,
        appliedConditions: [
          lifecycleCheck.appliedConditions,
          noticePeriodCheck.appliedConditions,
          actingCheck.appliedConditions,
          temporaryCheck.appliedConditions,
          timeCheck.appliedConditions,
          emergencyCheck.appliedConditions
        ].flat(),
        scopeModifications: scopeMods,
        fieldRestrictions,
        temporaryPermissions: [
          ...actingCheck.temporaryPermissions,
          ...temporaryCheck.temporaryPermissions,
          ...emergencyCheck.temporaryPermissions
        ],
        warnings,
        expiresAt: this.calculateExpiry(rolePermission, context)
      };
    } catch (error) {
      this.logger.error(`Error evaluating permission: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Evaluate lifecycle stage conditions
   */
  private evaluateLifecycleStage(
    conditions: any,
    context: PermissionContext
  ): ContextEvaluationResult {
    const result: ContextEvaluationResult = {
      isAllowed: true,
      matchedRules: [],
      appliedConditions: [],
      scopeModifications: [],
      fieldRestrictions: [],
      temporaryPermissions: [],
      warnings: []
    };

    if (!conditions?.lifecycleStage) {
      return result;
    }

    const allowedStages = conditions.lifecycleStage.allowedStages || [];
    const deniedStages = conditions.lifecycleStage.deniedStages || [];

    // Check denied stages first (deny wins)
    if (context.lifecycleStage && deniedStages.includes(context.lifecycleStage)) {
      result.isAllowed = false;
      result.reason = `Permission denied during lifecycle stage: ${context.lifecycleStage}`;
      return result;
    }

    // Check allowed stages
    if (allowedStages.length > 0 && context.lifecycleStage) {
      if (!allowedStages.includes(context.lifecycleStage)) {
        result.isAllowed = false;
        result.reason = `Permission not allowed during lifecycle stage: ${context.lifecycleStage}`;
        return result;
      }
    }

    // Add warnings for sensitive stages
    if (context.lifecycleStage === 'NOTICE_PERIOD' || context.lifecycleStage === 'EXITING') {
      result.warnings.push(`User is in ${context.lifecycleStage} stage - access may be restricted`);
    }

    result.matchedRules.push('LIFECYCLE_STAGE_CHECK');
    result.appliedConditions.push({
      type: 'LIFECYCLE_STAGE',
      stage: context.lifecycleStage,
      allowedStages,
      deniedStages
    });

    return result;
  }

  /**
   * Evaluate notice period restrictions
   */
  private evaluateNoticePeriod(
    conditions: any,
    context: PermissionContext
  ): ContextEvaluationResult {
    const result: ContextEvaluationResult = {
      isAllowed: true,
      matchedRules: [],
      appliedConditions: [],
      scopeModifications: [],
      fieldRestrictions: [],
      temporaryPermissions: [],
      warnings: []
    };

    if (!context.noticePeriod?.isActive) {
      return result;
    }

    if (conditions?.noticePeriod?.blockAccess) {
      result.isAllowed = false;
      result.reason = 'Access blocked during notice period';
      return result;
    }

    // Restrict sensitive operations during notice period
    if (conditions?.noticePeriod?.restrictSensitive) {
      result.fieldRestrictions.push({
        type: 'NOTICE_PERIOD_RESTRICTION',
        restrictedFields: ['salary', 'financialData', 'confidentialDocuments']
      });
      result.warnings.push('Sensitive data access restricted during notice period');
    }

    // Reduce scope during notice period
    if (conditions?.noticePeriod?.reduceScope) {
      result.scopeModifications.push({
        type: 'NOTICE_PERIOD_SCOPE_REDUCTION',
        modification: 'SELF_ONLY'
      });
    }

    result.matchedRules.push('NOTICE_PERIOD_CHECK');
    result.appliedConditions.push({
      type: 'NOTICE_PERIOD',
      remainingDays: context.noticePeriod.remainingDays,
      endDate: context.noticePeriod.endDate
    });

    return result;
  }

  /**
   * Evaluate acting assignment permissions
   */
  private evaluateActingAssignment(
    context: PermissionContext
  ): ContextEvaluationResult {
    const result: ContextEvaluationResult = {
      isAllowed: true,
      matchedRules: [],
      appliedConditions: [],
      scopeModifications: [],
      fieldRestrictions: [],
      temporaryPermissions: [],
      warnings: []
    };

    if (!context.actingAssignment) {
      return result;
    }

    const now = context.timestamp || new Date();
    const start = new Date(context.actingAssignment.startDate);
    const end = new Date(context.actingAssignment.endDate);

    // Check if acting assignment is currently valid
    if (now >= start && now <= end) {
      result.temporaryPermissions.push(context.actingAssignment.roleId);
      result.matchedRules.push('ACTING_ASSIGNMENT_ACTIVE');
      result.appliedConditions.push({
        type: 'ACTING_ASSIGNMENT',
        roleId: context.actingAssignment.roleId,
        authority: context.actingAssignment.authority,
        expiresAt: end
      });
      result.expiresAt = end;
      result.warnings.push(`Acting assignment expires on ${end.toISOString()}`);
    }

    return result;
  }

  /**
   * Evaluate temporary elevation
   */
  private evaluateTemporaryElevation(
    context: PermissionContext
  ): ContextEvaluationResult {
    const result: ContextEvaluationResult = {
      isAllowed: true,
      matchedRules: [],
      appliedConditions: [],
      scopeModifications: [],
      fieldRestrictions: [],
      temporaryPermissions: [],
      warnings: []
    };

    if (!context.temporaryElevation) {
      return result;
    }

    const now = context.timestamp || new Date();
    const start = new Date(context.temporaryElevation.startDate);
    const end = new Date(context.temporaryElevation.endDate);

    // Check if elevation is currently valid
    if (now >= start && now <= end) {
      result.temporaryPermissions.push(...context.temporaryElevation.additionalPermissions);
      result.matchedRules.push('TEMPORARY_ELEVATION_ACTIVE');
      result.appliedConditions.push({
        type: 'TEMPORARY_ELEVATION',
        reason: context.temporaryElevation.reason,
        elevatedBy: context.temporaryElevation.elevatedBy,
        permissions: context.temporaryElevation.additionalPermissions,
        expiresAt: end
      });
      result.expiresAt = end;
      result.warnings.push(`Temporary elevation expires on ${end.toISOString()}`);
    }

    return result;
  }

  /**
   * Evaluate time-bound access
   */
  private evaluateTimeBound(
    effectiveStart: Date,
    effectiveEnd: Date,
    context: PermissionContext
  ): ContextEvaluationResult {
    const result: ContextEvaluationResult = {
      isAllowed: true,
      matchedRules: [],
      appliedConditions: [],
      scopeModifications: [],
      fieldRestrictions: [],
      temporaryPermissions: [],
      warnings: []
    };

    const now = context.timestamp || new Date();

    // Check effective start date
    if (effectiveStart && now < new Date(effectiveStart)) {
      result.isAllowed = false;
      result.reason = `Permission not yet effective. Becomes effective on ${effectiveStart}`;
      return result;
    }

    // Check effective end date
    if (effectiveEnd && now > new Date(effectiveEnd)) {
      result.isAllowed = false;
      result.reason = `Permission expired on ${effectiveEnd}`;
      return result;
    }

    // Add warning if permission expires soon
    if (effectiveEnd) {
      const daysUntilExpiry = Math.floor(
        (new Date(effectiveEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 7) {
        result.warnings.push(`Permission expires in ${daysUntilExpiry} days`);
      }
      result.expiresAt = new Date(effectiveEnd);
    }

    result.matchedRules.push('TIME_BOUND_CHECK');
    result.appliedConditions.push({
      type: 'TIME_BOUND',
      effectiveStart,
      effectiveEnd
    });

    return result;
  }

  /**
   * Evaluate emergency mode
   */
  private evaluateEmergencyMode(
    conditions: any,
    context: PermissionContext
  ): ContextEvaluationResult {
    const result: ContextEvaluationResult = {
      isAllowed: true,
      matchedRules: [],
      appliedConditions: [],
      scopeModifications: [],
      fieldRestrictions: [],
      temporaryPermissions: [],
      warnings: []
    };

    if (!context.emergencyMode?.isActive) {
      return result;
    }

    // Grant emergency permissions
    if (conditions?.emergencyMode?.grantAccess) {
      result.temporaryPermissions.push(...(conditions.emergencyMode.additionalPermissions || []));
      result.matchedRules.push('EMERGENCY_MODE_ACTIVE');
      result.appliedConditions.push({
        type: 'EMERGENCY_MODE',
        emergencyType: context.emergencyMode.type,
        activatedBy: context.emergencyMode.activatedBy,
        activatedAt: context.emergencyMode.activatedAt
      });
      result.warnings.push(`Emergency mode active: ${context.emergencyMode.type}`);
    }

    // Remove restrictions during emergency
    if (conditions?.emergencyMode?.removeRestrictions) {
      result.scopeModifications.push({
        type: 'EMERGENCY_SCOPE_EXPANSION',
        modification: 'FULL_ACCESS'
      });
    }

    return result;
  }

  /**
   * Apply scope modifications based on context
   */
  private applyScopeModifications(
    scopeDefinition: any,
    context: PermissionContext
  ): any[] {
    const modifications = [];

    if (!scopeDefinition) {
      return modifications;
    }

    // Dynamic hierarchy scope
    if (scopeDefinition.type === 'DYNAMIC_HIERARCHY') {
      modifications.push({
        type: 'HIERARCHY',
        root: context.employeeId,
        includeSubordinates: true,
        depth: scopeDefinition.depth || -1
      });
    }

    // Conditional scope
    if (scopeDefinition.type === 'CONDITIONAL') {
      const conditions = scopeDefinition.conditions || [];
      for (const condition of conditions) {
        if (this.evaluateCondition(condition, context)) {
          modifications.push({
            type: 'CONDITIONAL',
            appliedCondition: condition,
            scope: condition.thenScope
          });
        }
      }
    }

    // Location-based scope
    if (scopeDefinition.locationRestrictions && context.location) {
      if (scopeDefinition.locationRestrictions.includes(context.location.country)) {
        modifications.push({
          type: 'LOCATION',
          restriction: 'COUNTRY',
          value: context.location.country
        });
      }
    }

    return modifications;
  }

  /**
   * Apply field-level restrictions
   */
  private applyFieldRestrictions(
    fieldRestrictions: any,
    context: PermissionContext
  ): any[] {
    const restrictions = [];

    if (!fieldRestrictions) {
      return restrictions;
    }

    // Salary protection
    if (fieldRestrictions.protectSalary) {
      restrictions.push({
        field: 'salary',
        action: 'MASK',
        condition: fieldRestrictions.salaryCondition
      });
    }

    // ID masking
    if (fieldRestrictions.maskIds) {
      restrictions.push({
        field: 'identificationNumber',
        action: 'MASK',
        patternretained: 'LAST_4'
      });
    }

    // Financial controls
    if (fieldRestrictions.financialControls) {
      restrictions.push({
        fields: ['bankAccount', 'taxInfo', 'compensationDetails'],
        action: 'RESTRICT',
        requiresElevation: true
      });
    }

    return restrictions;
  }

  /**
   * Evaluate a condition expression
   */
  private evaluateCondition(condition: any, context: PermissionContext): boolean {
    // Simple condition evaluation
    // In production, use a proper expression evaluator
    try {
      if (condition.field && condition.operator && condition.value !== undefined) {
        const contextValue = this.getNestedValue(context, condition.field);
        
        switch (condition.operator) {
          case '==':
            return contextValue == condition.value;
          case '!=':
            return contextValue != condition.value;
          case '>':
            return contextValue > condition.value;
          case '<':
            return contextValue < condition.value;
          case 'in':
            return Array.isArray(condition.value) && condition.value.includes(contextValue);
          case 'contains':
            return Array.isArray(contextValue) && contextValue.includes(condition.value);
          default:
            return false;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  }

  /**
   * Calculate expiry date for permission
   */
  private calculateExpiry(rolePermission: RolePermission, context: PermissionContext): Date | undefined {
    const expiryDates = [
      rolePermission.effectiveEndDate,
      context.actingAssignment?.endDate,
      context.temporaryElevation?.endDate
    ].filter(Boolean);

    if (expiryDates.length === 0) {
      return undefined;
    }

    // Return earliest expiry date
    return new Date(Math.min(...expiryDates.map(d => new Date(d).getTime())));
  }

  /**
   * Batch evaluate multiple permissions
   */
  async evaluateMultiplePermissions(
    permissionIds: string[],
    roleId: string,
    context: PermissionContext
  ): Promise<Map<string, ContextEvaluationResult>> {
    const results = new Map<string, ContextEvaluationResult>();

    for (const permissionId of permissionIds) {
      try {
        const result = await this.evaluatePermission(permissionId, roleId, context);
        results.set(permissionId, result);
      } catch (error) {
        this.logger.error(`Error evaluating permission ${permissionId}: ${error.message}`);
        results.set(permissionId, {
          isAllowed: false,
          matchedRules: [],
          appliedConditions: [],
          scopeModifications: [],
          fieldRestrictions: [],
          temporaryPermissions: [],
          warnings: [],
          reason: `Evaluation error: ${error.message}`
        });
      }
    }

    return results;
  }
}
