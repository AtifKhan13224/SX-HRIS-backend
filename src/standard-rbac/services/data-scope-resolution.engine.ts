import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataScopeConfig, ScopeType, ScopeLogic } from '../entities/data-scope-config.entity';

export interface ResolvedScope {
  scopeConfigId: string;
  scopeType: ScopeType;
  allowedValues: string[];
  hierarchyLevels?: Map<number, string[]>;
  filters?: Record<string, any>;
  isUnrestricted?: boolean;
}

@Injectable()
export class DataScopeResolutionEngine {
  constructor(
    @InjectRepository(DataScopeConfig)
    private readonly scopeRepository: Repository<DataScopeConfig>,
  ) {}

  /**
   * Resolve data scope for a user
   */
  async resolveScope(scopeConfigId: string, userId: string, context?: Record<string, any>): Promise<ResolvedScope> {
    const scopeConfig = await this.scopeRepository.findOne({
      where: { id: scopeConfigId },
    });

    if (!scopeConfig) {
      throw new NotFoundException(`Scope configuration ${scopeConfigId} not found`);
    }

    if (!scopeConfig.isActive) {
      throw new Error(`Scope configuration ${scopeConfig.scopeCode} is not active`);
    }

    // Handle global scope
    if (scopeConfig.scopeType === ScopeType.GLOBAL) {
      return {
        scopeConfigId,
        scopeType: ScopeType.GLOBAL,
        allowedValues: ['*'],
        isUnrestricted: true,
      };
    }

    // Dynamic resolution
    if (scopeConfig.dynamicResolution) {
      return this.resolveDynamicScope(scopeConfig, userId, context);
    }

    // Static scope values
    const allowedValues = scopeConfig.scopeValues || [];

    // Hierarchy resolution
    if (scopeConfig.isHierarchical) {
      const hierarchyLevels = await this.resolveHierarchy(
        scopeConfig,
        allowedValues,
        context
      );

      return {
        scopeConfigId,
        scopeType: scopeConfig.scopeType,
        allowedValues,
        hierarchyLevels,
        filters: scopeConfig.filters,
      };
    }

    // Layered scopes
    if (scopeConfig.layeredScopes && scopeConfig.layeredScopes.length > 0) {
      const resolvedValues = await this.resolveLayeredScopes(scopeConfig.layeredScopes, context);
      return {
        scopeConfigId,
        scopeType: scopeConfig.scopeType,
        allowedValues: resolvedValues,
        filters: scopeConfig.filters,
      };
    }

    return {
      scopeConfigId,
      scopeType: scopeConfig.scopeType,
      allowedValues,
      filters: scopeConfig.filters,
    };
  }

  /**
   * Resolve dynamic scope based on runtime data
   */
  private async resolveDynamicScope(
    scopeConfig: DataScopeConfig,
    userId: string,
    context?: Record<string, any>
  ): Promise<ResolvedScope> {
    const allowedValues: string[] = [];

    // Reporting line resolution
    if (scopeConfig.reportingLineConfig) {
      const reportingLineValues = await this.resolveReportingLine(
        userId,
        scopeConfig.reportingLineConfig,
        context
      );
      allowedValues.push(...reportingLineValues);
    }

    // Geographic scope resolution
    if (scopeConfig.geographicScope) {
      const geoValues = await this.resolveGeographicScope(
        scopeConfig.geographicScope,
        context
      );
      allowedValues.push(...geoValues);
    }

    // Custom resolution rule
    if (scopeConfig.resolutionRule) {
      const customValues = await this.executeResolutionRule(
        scopeConfig.resolutionRule,
        userId,
        context
      );
      allowedValues.push(...customValues);
    }

    // Remove exclusions
    const finalValues = allowedValues.filter(
      v => !scopeConfig.exclusions?.includes(v)
    );

    return {
      scopeConfigId: scopeConfig.id,
      scopeType: scopeConfig.scopeType,
      allowedValues: Array.from(new Set(finalValues)),
      filters: scopeConfig.filters,
    };
  }

  /**
   * Resolve reporting line hierarchy
   */
  private async resolveReportingLine(
    userId: string,
    config: {
      directReports: boolean;
      indirectReports: boolean;
      maxLevels: number;
      includeMatrix: boolean;
    },
    context?: Record<string, any>
  ): Promise<string[]> {
    const employeeIds: string[] = [userId]; // Include self

    // This would query your org hierarchy
    // Simplified implementation - you'd integrate with your employee service
    if (config.directReports) {
      // Query direct reports
      const directReports = context?.directReports || [];
      employeeIds.push(...directReports);
    }

    if (config.indirectReports) {
      // Query indirect reports up to maxLevels
      const indirectReports = context?.indirectReports || [];
      employeeIds.push(...indirectReports);
    }

    if (config.includeMatrix) {
      // Include matrix reporting relationships
      const matrixReports = context?.matrixReports || [];
      employeeIds.push(...matrixReports);
    }

    return Array.from(new Set(employeeIds));
  }

  /**
   * Resolve geographic scope
   */
  private async resolveGeographicScope(
    geoScope: {
      countries: string[];
      regions: string[];
      includeSubRegions: boolean;
    },
    context?: Record<string, any>
  ): Promise<string[]> {
    const locations: string[] = [];

    locations.push(...geoScope.countries);
    locations.push(...geoScope.regions);

    if (geoScope.includeSubRegions && context?.subRegions) {
      locations.push(...context.subRegions);
    }

    return Array.from(new Set(locations));
  }

  /**
   * Resolve hierarchy levels
   */
  private async resolveHierarchy(
    scopeConfig: DataScopeConfig,
    rootValues: string[],
    context?: Record<string, any>
  ): Promise<Map<number, string[]>> {
    const hierarchyLevels = new Map<number, string[]>();
    hierarchyLevels.set(0, rootValues);

    if (scopeConfig.includeChildren) {
      const maxDepth = scopeConfig.hierarchyDepth || 999;

      for (let level = 1; level <= maxDepth; level++) {
        const parentValues = hierarchyLevels.get(level - 1) || [];
        if (parentValues.length === 0) break;

        // Query children for each parent
        // This would integrate with your org hierarchy service
        const children = context?.[`level${level}Children`] || [];
        if (children.length === 0) break;

        hierarchyLevels.set(level, children);
      }
    }

    return hierarchyLevels;
  }

  /**
   * Resolve layered scopes with logic
   */
  private async resolveLayeredScopes(
    layers: Array<{
      scopeType: ScopeType;
      scopeValues: string[];
      logic: ScopeLogic;
    }>,
    context?: Record<string, any>
  ): Promise<string[]> {
    let resultSet = new Set<string>();

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const layerSet = new Set(layer.scopeValues);

      if (i === 0) {
        resultSet = layerSet;
        continue;
      }

      switch (layer.logic) {
        case ScopeLogic.AND:
          resultSet = new Set([...resultSet].filter(x => layerSet.has(x)));
          break;
        case ScopeLogic.OR:
          resultSet = new Set([...resultSet, ...layerSet]);
          break;
        case ScopeLogic.NOT:
          resultSet = new Set([...resultSet].filter(x => !layerSet.has(x)));
          break;
        case ScopeLogic.XOR:
          const intersection = new Set([...resultSet].filter(x => layerSet.has(x)));
          const union = new Set([...resultSet, ...layerSet]);
          resultSet = new Set([...union].filter(x => !intersection.has(x)));
          break;
      }
    }

    return Array.from(resultSet);
  }

  /**
   * Execute custom resolution rule
   */
  private async executeResolutionRule(
    rule: string,
    userId: string,
    context?: Record<string, any>
  ): Promise<string[]> {
    // This would execute a custom rule engine
    // Simplified implementation
    try {
      // Parse and execute rule (safely)
      // For example: "context.department === 'HR' ? context.allEmployees : context.departmentEmployees"
      // You'd use a proper rules engine library in production
      
      return context?.resolvedValues || [];
    } catch (error) {
      console.error('Error executing resolution rule:', error);
      return [];
    }
  }

  /**
   * Check if user has access to specific entity
   */
  async hasAccessToEntity(
    scopeConfigId: string,
    userId: string,
    entityId: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    const resolvedScope = await this.resolveScope(scopeConfigId, userId, context);

    if (resolvedScope.isUnrestricted) {
      return true;
    }

    // Check if entityId is in allowed values
    if (resolvedScope.allowedValues.includes(entityId)) {
      return true;
    }

    // Check hierarchy levels
    if (resolvedScope.hierarchyLevels) {
      for (const [_, values] of resolvedScope.hierarchyLevels) {
        if (values.includes(entityId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get scope filter for database queries
   */
  async getScopeFilter(
    scopeConfigId: string,
    userId: string,
    context?: Record<string, any>
  ): Promise<any> {
    const resolvedScope = await this.resolveScope(scopeConfigId, userId, context);

    if (resolvedScope.isUnrestricted) {
      return {}; // No filter needed
    }

    // Build filter based on scope type
    const filter: any = {};

    switch (resolvedScope.scopeType) {
      case ScopeType.LEGAL_ENTITY:
        filter.legalEntityId = { $in: resolvedScope.allowedValues };
        break;
      case ScopeType.COUNTRY:
        filter.countryCode = { $in: resolvedScope.allowedValues };
        break;
      case ScopeType.DEPARTMENT:
        filter.departmentId = { $in: resolvedScope.allowedValues };
        break;
      case ScopeType.REPORTING_LINE:
        filter.managerId = { $in: resolvedScope.allowedValues };
        break;
      // Add more scope types as needed
    }

    // Merge with additional filters
    if (resolvedScope.filters) {
      Object.assign(filter, resolvedScope.filters);
    }

    return filter;
  }
}
