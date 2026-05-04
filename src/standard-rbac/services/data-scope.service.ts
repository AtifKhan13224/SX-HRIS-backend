import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { DataScopeConfig, ScopeType, ScopeLogic } from '../entities/data-scope-config.entity';
import { CreateDataScopeDto, UpdateDataScopeDto } from '../dto/data-scope.dto';
import { AuditService } from './audit.service';

@Injectable()
export class DataScopeService {
  constructor(
    @InjectRepository(DataScopeConfig)
    private readonly scopeRepository: Repository<DataScopeConfig>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new data scope configuration
   */
  async createScope(createDto: CreateDataScopeDto, createdBy: string): Promise<DataScopeConfig> {
    // Check for duplicate scope code
    const existing = await this.scopeRepository.findOne({
      where: { scopeCode: createDto.scopeCode },
    });

    if (existing) {
      throw new ConflictException(`Data scope with code '${createDto.scopeCode}' already exists`);
    }

    const scope = this.scopeRepository.create({
      ...createDto,
      isActive: true,
    });

    const savedScope = await this.scopeRepository.save(scope);

    // Audit log
    await this.auditService.log({
      tenantId: createDto.tenantId || 'DEFAULT_TENANT',
      userId: createdBy,
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Created data scope: ${createDto.scopeName} (${savedScope.scopeCode})`,
    });

    return savedScope;
  }

  /**
   * Find all data scopes with optional filters
   */
  async findAll(filters?: {
    scopeType?: ScopeType;
    tenantId?: string;
    isActive?: boolean;
    searchTerm?: string;
    isHierarchical?: boolean;
  }): Promise<DataScopeConfig[]> {
    const queryBuilder = this.scopeRepository.createQueryBuilder('scope');

    if (filters?.scopeType) {
      queryBuilder.andWhere('scope.scopeType = :scopeType', { scopeType: filters.scopeType });
    }

    if (filters?.tenantId) {
      queryBuilder.andWhere('scope.tenantId = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('scope.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.isHierarchical !== undefined) {
      queryBuilder.andWhere('scope.isHierarchical = :isHierarchical', { isHierarchical: filters.isHierarchical });
    }

    if (filters?.searchTerm) {
      queryBuilder.andWhere(
        '(scope.scopeName ILIKE :search OR scope.scopeCode ILIKE :search OR scope.scopeDescription ILIKE :search)',
        { search: `%${filters.searchTerm}%` }
      );
    }

    queryBuilder.orderBy('scope.scopeType', 'ASC').addOrderBy('scope.scopeName', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * Find scope by ID
   */
  async findById(scopeId: string): Promise<DataScopeConfig> {
    const scope = await this.scopeRepository.findOne({ where: { id: scopeId } });
    
    if (!scope) {
      throw new NotFoundException(`Data scope with ID '${scopeId}' not found`);
    }

    return scope;
  }

  /**
   * Find scope by code
   */
  async findByCode(scopeCode: string): Promise<DataScopeConfig> {
    const scope = await this.scopeRepository.findOne({ where: { scopeCode } });
    
    if (!scope) {
      throw new NotFoundException(`Data scope with code '${scopeCode}' not found`);
    }

    return scope;
  }

  /**
   * Update an existing data scope
   */
  async updateScope(scopeId: string, updateDto: UpdateDataScopeDto, modifiedBy: string): Promise<DataScopeConfig> {
    const scope = await this.findById(scopeId);

    // Store old values for audit
    const oldSnapshot = { ...scope };

    // Apply updates
    Object.assign(scope, updateDto);
    const updatedScope = await this.scopeRepository.save(scope);

    // Audit log
    await this.auditService.log({
      tenantId: scope.tenantId || 'DEFAULT_TENANT',
      userId: modifiedBy,
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Updated data scope: ${updatedScope.scopeName} (${updatedScope.scopeCode})`,
      oldValue: JSON.stringify(oldSnapshot),
      newValue: JSON.stringify(updatedScope),
    });

    return updatedScope;
  }

  /**
   * Soft delete a data scope (set isActive = false)
   */
  async deleteScope(scopeId: string, deletedBy: string): Promise<void> {
    const scope = await this.findById(scopeId);

    // Check if scope is being used by any roles
    // This would require checking SystemRolePermission table
    // For now, we'll allow deletion and set isActive = false

    scope.isActive = false;
    await this.scopeRepository.save(scope);

    // Audit log
    await this.auditService.log({
      tenantId: scope.tenantId || 'DEFAULT_TENANT',
      userId: deletedBy,
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: 'HIGH' as any,
      eventDescription: `Deleted data scope: ${scope.scopeName} (${scope.scopeCode})`,
    });
  }

  /**
   * Hard delete a data scope (permanent removal)
   */
  async hardDeleteScope(scopeId: string, deletedBy: string): Promise<void> {
    const scope = await this.findById(scopeId);

    // Audit log before deletion
    await this.auditService.log({
      tenantId: scope.tenantId || 'DEFAULT_TENANT',
      userId: deletedBy,
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: 'CRITICAL' as any,
      eventDescription: `Permanently deleted data scope: ${scope.scopeName} (${scope.scopeCode})`,
    });

    await this.scopeRepository.remove(scope);
  }

  /**
   * Get scopes by type
   */
  async getScopesByType(scopeType: ScopeType): Promise<DataScopeConfig[]> {
    return this.scopeRepository.find({
      where: { scopeType, isActive: true },
      order: { scopeName: 'ASC' },
    });
  }

  /**
   * Get hierarchical scopes
   */
  async getHierarchicalScopes(): Promise<DataScopeConfig[]> {
    return this.scopeRepository.find({
      where: { isHierarchical: true, isActive: true },
      order: { scopeType: 'ASC', scopeName: 'ASC' },
    });
  }

  /**
   * Get scopes with layered configuration
   */
  async getLayeredScopes(): Promise<DataScopeConfig[]> {
    const scopes = await this.scopeRepository
      .createQueryBuilder('scope')
      .where('scope.layeredScopes IS NOT NULL')
      .andWhere('scope.isActive = :isActive', { isActive: true })
      .getMany();

    return scopes;
  }

  /**
   * Get scopes with dynamic resolution
   */
  async getDynamicScopes(): Promise<DataScopeConfig[]> {
    return this.scopeRepository.find({
      where: { dynamicResolution: true, isActive: true },
      order: { scopeName: 'ASC' },
    });
  }

  /**
   * Get statistics about data scopes
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<ScopeType, number>;
    hierarchical: number;
    dynamic: number;
    layered: number;
  }> {
    const allScopes = await this.scopeRepository.find();

    const stats = {
      total: allScopes.length,
      active: allScopes.filter(s => s.isActive).length,
      inactive: allScopes.filter(s => !s.isActive).length,
      byType: {} as Record<ScopeType, number>,
      hierarchical: allScopes.filter(s => s.isHierarchical).length,
      dynamic: allScopes.filter(s => s.dynamicResolution).length,
      layered: allScopes.filter(s => s.layeredScopes && s.layeredScopes.length > 0).length,
    };

    // Count by type
    Object.values(ScopeType).forEach(type => {
      stats.byType[type] = allScopes.filter(s => s.scopeType === type).length;
    });

    return stats;
  }

  /**
   * Validate scope configuration
   */
  async validateScopeConfig(scopeId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const scope = await this.findById(scopeId);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate hierarchical configuration
    if (scope.isHierarchical && scope.hierarchyDepth === 0) {
      warnings.push('Hierarchical scope has depth of 0, which means no inheritance');
    }

    // Validate layered scopes
    if (scope.layeredScopes && scope.layeredScopes.length > 0) {
      if (!scope.scopeValues || scope.scopeValues.length === 0) {
        errors.push('Layered scopes require at least one scope value');
      }

      scope.layeredScopes.forEach((layer, index) => {
        if (!layer.scopeValues || layer.scopeValues.length === 0) {
          errors.push(`Layer ${index + 1} has no scope values`);
        }
      });
    }

    // Validate dynamic resolution
    if (scope.dynamicResolution && !scope.resolutionRule) {
      errors.push('Dynamic resolution requires a resolution rule');
    }

    // Validate reporting line configuration
    if (scope.scopeType === ScopeType.REPORTING_LINE) {
      if (!scope.reportingLineConfig) {
        errors.push('Reporting line scope requires reportingLineConfig');
      } else {
        if (!scope.reportingLineConfig.directReports && !scope.reportingLineConfig.indirectReports) {
          errors.push('Reporting line must include either direct or indirect reports');
        }
        if (scope.reportingLineConfig.maxLevels < 1) {
          errors.push('Reporting line maxLevels must be at least 1');
        }
      }
    }

    // Validate global scope
    if (scope.scopeType === ScopeType.GLOBAL) {
      if (scope.isHierarchical) {
        warnings.push('Global scope should typically not be hierarchical');
      }
      if (scope.scopeValues && scope.scopeValues.length > 0) {
        warnings.push('Global scope should not have specific scope values');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Clone an existing scope configuration
   */
  async cloneScope(
    scopeId: string,
    newScopeCode: string,
    newScopeName: string,
    clonedBy: string
  ): Promise<DataScopeConfig> {
    const originalScope = await this.findById(scopeId);

    // Check for duplicate code
    const existing = await this.scopeRepository.findOne({
      where: { scopeCode: newScopeCode },
    });

    if (existing) {
      throw new ConflictException(`Data scope with code '${newScopeCode}' already exists`);
    }

    // Create new scope with copied configuration
    const clonedScope = this.scopeRepository.create({
      ...originalScope,
      id: undefined, // Let database generate new ID
      scopeCode: newScopeCode,
      scopeName: newScopeName,
      scopeDescription: `Cloned from ${originalScope.scopeName}`,
    });

    const savedScope = await this.scopeRepository.save(clonedScope);

    // Audit log
    await this.auditService.log({
      tenantId: savedScope.tenantId || 'DEFAULT_TENANT',
      userId: clonedBy,
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Cloned data scope '${originalScope.scopeName}' to '${newScopeName}' (${savedScope.scopeCode})`,
    });

    return savedScope;
  }

  /**
   * Bulk update scope status
   */
  async bulkUpdateStatus(
    scopeIds: string[],
    isActive: boolean,
    modifiedBy: string
  ): Promise<{ successful: number; failed: number; errors: any[] }> {
    const result = {
      successful: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const scopeId of scopeIds) {
      try {
        const scope = await this.findById(scopeId);
        scope.isActive = isActive;
        await this.scopeRepository.save(scope);

        await this.auditService.log({
          tenantId: scope.tenantId || 'DEFAULT_TENANT',
          userId: modifiedBy,
          eventType: 'CONFIGURATION_CHANGE' as any,
          severity: 'MEDIUM' as any,
          eventDescription: `Bulk ${isActive ? 'activated' : 'deactivated'} scope: ${scope.scopeName} (${scope.scopeCode})`,
        });

        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          scopeId,
          error: error.message,
        });
      }
    }

    return result;
  }

  /**
   * Get scope templates/presets
   */
  getTemplates(): Array<{
    name: string;
    description: string;
    scopeType: ScopeType;
    config: Partial<CreateDataScopeDto>;
  }> {
    return [
      {
        name: 'Global Access',
        description: 'Unrestricted access to all data across the organization',
        scopeType: ScopeType.GLOBAL,
        config: {
          scopeType: ScopeType.GLOBAL,
          isHierarchical: false,
          includeChildren: false,
          hierarchyDepth: 0,
          scopeLogic: ScopeLogic.OR,
          dynamicResolution: false,
          scopeValues: [],
        },
      },
      {
        name: 'Legal Entity Restricted',
        description: 'Access limited to specific legal entities',
        scopeType: ScopeType.LEGAL_ENTITY,
        config: {
          scopeType: ScopeType.LEGAL_ENTITY,
          isHierarchical: true,
          includeChildren: true,
          hierarchyDepth: 2,
          scopeLogic: ScopeLogic.OR,
          dynamicResolution: false,
        },
      },
      {
        name: 'Country/Region Based',
        description: 'Geographic data boundaries by country',
        scopeType: ScopeType.COUNTRY,
        config: {
          scopeType: ScopeType.COUNTRY,
          isHierarchical: true,
          includeChildren: true,
          hierarchyDepth: 3,
          scopeLogic: ScopeLogic.OR,
          dynamicResolution: false,
          geographicScope: {
            countries: [],
            regions: [],
            includeSubRegions: true,
          },
        },
      },
      {
        name: 'Department Scope',
        description: 'Access restricted to specific departments',
        scopeType: ScopeType.DEPARTMENT,
        config: {
          scopeType: ScopeType.DEPARTMENT,
          isHierarchical: true,
          includeChildren: true,
          hierarchyDepth: 3,
          scopeLogic: ScopeLogic.OR,
          dynamicResolution: false,
        },
      },
      {
        name: 'Direct Reports Only',
        description: 'Manager can only access their direct reports',
        scopeType: ScopeType.REPORTING_LINE,
        config: {
          scopeType: ScopeType.REPORTING_LINE,
          isHierarchical: true,
          includeChildren: false,
          hierarchyDepth: 1,
          scopeLogic: ScopeLogic.AND,
          dynamicResolution: true,
          resolutionRule: 'manager_id = @userId AND reporting_depth = 1',
          reportingLineConfig: {
            directReports: true,
            indirectReports: false,
            maxLevels: 1,
            includeMatrix: false,
          },
        },
      },
      {
        name: 'Full Reporting Tree',
        description: 'Manager can access entire reporting hierarchy',
        scopeType: ScopeType.REPORTING_LINE,
        config: {
          scopeType: ScopeType.REPORTING_LINE,
          isHierarchical: true,
          includeChildren: true,
          hierarchyDepth: 10,
          scopeLogic: ScopeLogic.OR,
          dynamicResolution: true,
          resolutionRule: 'manager_id IN (SELECT employee_id FROM reporting_tree WHERE root_manager = @userId)',
          reportingLineConfig: {
            directReports: true,
            indirectReports: true,
            maxLevels: 10,
            includeMatrix: true,
          },
        },
      },
      {
        name: 'Business Unit Exclusive',
        description: 'Access limited to one or more business units',
        scopeType: ScopeType.BUSINESS_UNIT,
        config: {
          scopeType: ScopeType.BUSINESS_UNIT,
          isHierarchical: true,
          includeChildren: true,
          hierarchyDepth: 2,
          scopeLogic: ScopeLogic.OR,
          dynamicResolution: false,
        },
      },
      {
        name: 'Location Based',
        description: 'Physical location/office based data access',
        scopeType: ScopeType.LOCATION,
        config: {
          scopeType: ScopeType.LOCATION,
          isHierarchical: false,
          includeChildren: false,
          hierarchyDepth: 0,
          scopeLogic: ScopeLogic.OR,
          dynamicResolution: false,
        },
      },
    ];
  }
}
