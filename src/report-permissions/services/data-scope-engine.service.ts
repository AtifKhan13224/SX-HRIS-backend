import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReportDataScope,
  ScopeType,
  ScopeOperator,
  ScopeLogic,
} from '../entities';

interface UserContext {
  userId: string;
  roleId: string;
  legalEntityId?: string;
  countryCode?: string;
  locationId?: string;
  costCenterId?: string;
  businessUnitId?: string;
  managerId?: string;
  subordinateIds?: string[];
}

@Injectable()
export class DataScopeEngine {
  constructor(
    @InjectRepository(ReportDataScope)
    private dataScopeRepo: Repository<ReportDataScope>,
  ) {}

  /**
   * Get all active data scopes for a report and role
   */
  async findDataScopes(reportId: string, roleId: string, tenantId: string) {
    return await this.dataScopeRepo.find({
      where: { reportId, roleId, tenantId, isActive: true },
      order: { priorityOrder: 'ASC' },
    });
  }

  /**
   * Create a new data scope rule
   */
  async createDataScope(tenantId: string, userId: string, data: any) {
    const scope = this.dataScopeRepo.create({
      ...data,
      tenantId,
      createdBy: userId,
    });

    return await this.dataScopeRepo.save(scope);
  }

  /**
   * Update an existing data scope rule
   */
  async updateDataScope(id: string, tenantId: string, userId: string, data: any) {
    const scope = await this.dataScopeRepo.findOne({
      where: { id, tenantId },
    });

    if (!scope) {
      throw new Error('Data scope not found');
    }

    Object.assign(scope, {
      ...data,
      updatedBy: userId,
    });

    return await this.dataScopeRepo.save(scope);
  }

  /**
   * Delete a data scope rule
   */
  async deleteDataScope(id: string, tenantId: string) {
    const scope = await this.dataScopeRepo.findOne({
      where: { id, tenantId },
    });

    if (!scope) {
      throw new Error('Data scope not found');
    }

    scope.isActive = false;
    return await this.dataScopeRepo.save(scope);
  }

  /**
   * Build SQL WHERE clause from data scopes
   */
  async buildScopeFilter(
    reportId: string,
    roleId: string,
    tenantId: string,
    userContext: UserContext,
  ): Promise<{ whereClause: string; parameters: Record<string, any> }> {
    const scopes = await this.findDataScopes(reportId, roleId, tenantId);

    if (scopes.length === 0) {
      // No scopes = full access
      return { whereClause: '1=1', parameters: {} };
    }

    const conditions: string[] = [];
    const parameters: Record<string, any> = {};
    let paramCounter = 0;

    for (const scope of scopes) {
      const condition = this.buildCondition(scope, userContext, paramCounter);
      
      if (condition) {
        conditions.push(condition.clause);
        Object.assign(parameters, condition.params);
        paramCounter += Object.keys(condition.params).length;
      }
    }

    // Combine conditions based on scope logic
    let whereClause = '';
    if (conditions.length === 0) {
      whereClause = '1=1';
    } else if (conditions.length === 1) {
      whereClause = conditions[0];
    } else {
      // Most scopes use AND logic by default
      const andConditions = conditions.filter((_, i) => scopes[i].scopeLogic === ScopeLogic.AND);
      const orConditions = conditions.filter((_, i) => scopes[i].scopeLogic === ScopeLogic.OR);
      
      if (andConditions.length > 0) {
        whereClause = andConditions.join(' AND ');
      }
      if (orConditions.length > 0) {
        if (whereClause) {
          whereClause = `(${whereClause}) OR (${orConditions.join(' OR ')})`;
        } else {
          whereClause = orConditions.join(' OR ');
        }
      }
    }

    return { whereClause, parameters };
  }

  /**
   * Build a single condition from a scope
   */
  private buildCondition(
    scope: ReportDataScope,
    userContext: UserContext,
    paramCounter: number,
  ): { clause: string; params: Record<string, any> } | null {
    const params: Record<string, any> = {};
    let clause = '';

    // Handle dynamic scopes
    if (scope.isDynamic && scope.useUserContext) {
      const contextValue = userContext[scope.contextField];
      if (!contextValue) {
        return null;
      }
      scope.scopeValue = contextValue;
    }

    // Build condition based on scope type
    switch (scope.scopeType) {
      case ScopeType.ORG_HIERARCHY:
        clause = this.buildHierarchyCondition(scope, userContext, params, paramCounter);
        break;
      
      case ScopeType.LEGAL_ENTITY:
        clause = this.buildEntityCondition('legal_entity_id', scope, params, paramCounter);
        break;
      
      case ScopeType.COUNTRY:
        clause = this.buildEntityCondition('country_code', scope, params, paramCounter);
        break;
      
      case ScopeType.LOCATION:
        clause = this.buildEntityCondition('location_id', scope, params, paramCounter);
        break;
      
      case ScopeType.COST_CENTER:
        clause = this.buildEntityCondition('cost_center_id', scope, params, paramCounter);
        break;
      
      case ScopeType.EMPLOYEE_GROUP:
        clause = this.buildEntityCondition('employee_group_id', scope, params, paramCounter);
        break;
      
      case ScopeType.BUSINESS_UNIT:
        clause = this.buildEntityCondition('business_unit_id', scope, params, paramCounter);
        break;
      
      case ScopeType.TIME_BOUND:
        clause = this.buildTimeCondition(scope, params, paramCounter);
        break;
      
      case ScopeType.CUSTOM_FILTER:
        if (scope.dynamicExpression) {
          clause = scope.dynamicExpression;
        }
        break;
    }

    return clause ? { clause, params } : null;
  }

  /**
   * Build hierarchical condition (manager-employee relationships)
   */
  private buildHierarchyCondition(
    scope: ReportDataScope,
    userContext: UserContext,
    params: Record<string, any>,
    counter: number,
  ): string {
    const paramName = `param${counter}`;
    
    if (scope.includeSubordinates && userContext.subordinateIds) {
      params[paramName] = [...userContext.subordinateIds, userContext.userId];
      return `employee_id = ANY(:${paramName})`;
    } else {
      params[paramName] = userContext.userId;
      return `employee_id = :${paramName}`;
    }
  }

  /**
   * Build entity condition (legal entity, country, etc.)
   */
  private buildEntityCondition(
    columnName: string,
    scope: ReportDataScope,
    params: Record<string, any>,
    counter: number,
  ): string {
    const paramName = `param${counter}`;

    switch (scope.scopeOperator) {
      case ScopeOperator.EQUALS:
        params[paramName] = scope.scopeValue;
        return `${columnName} = :${paramName}`;
      
      case ScopeOperator.IN:
        params[paramName] = scope.scopeValueArray || [scope.scopeValue];
        return `${columnName} = ANY(:${paramName})`;
      
      case ScopeOperator.NOT_IN:
        params[paramName] = scope.scopeValueArray || [scope.scopeValue];
        return `${columnName} != ALL(:${paramName})`;
      
      case ScopeOperator.CONTAINS:
        params[paramName] = `%${scope.scopeValue}%`;
        return `${columnName} ILIKE :${paramName}`;
      
      case ScopeOperator.STARTS_WITH:
        params[paramName] = `${scope.scopeValue}%`;
        return `${columnName} ILIKE :${paramName}`;
      
      case ScopeOperator.ENDS_WITH:
        params[paramName] = `%${scope.scopeValue}`;
        return `${columnName} ILIKE :${paramName}`;
      
      default:
        return '';
    }
  }

  /**
   * Build time-based condition
   */
  private buildTimeCondition(
    scope: ReportDataScope,
    params: Record<string, any>,
    counter: number,
  ): string {
    const { startDate, endDate } = this.calculateTimePeriod(scope);
    
    const startParam = `param${counter}`;
    const endParam = `param${counter + 1}`;
    
    params[startParam] = startDate;
    params[endParam] = endDate;
    
    return `date_column BETWEEN :${startParam} AND :${endParam}`;
  }

  /**
   * Calculate time period based on scope configuration
   */
  private calculateTimePeriod(scope: ReportDataScope): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (scope.timePeriodType) {
      case 'CURRENT_MONTH':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      
      case 'LAST_MONTH':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      
      case 'CURRENT_QUARTER':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      
      case 'LAST_12_MONTHS':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        endDate = now;
        break;
      
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
    }

    // Apply offset if configured
    if (scope.timePeriodOffset) {
      startDate.setMonth(startDate.getMonth() + scope.timePeriodOffset);
      endDate.setMonth(endDate.getMonth() + scope.timePeriodOffset);
    }

    return { startDate, endDate };
  }

  /**
   * Validate that a scope configuration is correct
   */
  validateScope(scope: Partial<ReportDataScope>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!scope.scopeName) {
      errors.push('Scope name is required');
    }

    if (!scope.scopeType) {
      errors.push('Scope type is required');
    }

    if (!scope.scopeOperator) {
      errors.push('Scope operator is required');
    }

    if (scope.scopeOperator === ScopeOperator.IN || scope.scopeOperator === ScopeOperator.NOT_IN) {
      if (!scope.scopeValueArray || scope.scopeValueArray.length === 0) {
        errors.push('Scope value array is required for IN/NOT_IN operators');
      }
    } else if (!scope.scopeValue) {
      errors.push('Scope value is required');
    }

    if (scope.isDynamic && scope.useUserContext && !scope.contextField) {
      errors.push('Context field is required for dynamic user-context scopes');
    }

    return { valid: errors.length === 0, errors };
  }
}
