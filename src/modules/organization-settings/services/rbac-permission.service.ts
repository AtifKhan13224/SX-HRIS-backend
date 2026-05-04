import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { RBACPermission, PermissionAction } from '../entities/rbac-permission.entity';
import {
  CreateRBACPermissionDto,
  UpdateRBACPermissionDto,
  BulkPermissionOperationDto,
} from '../dto/rbac-permission.dto';

@Injectable()
export class RBACPermissionService {
  constructor(
    @InjectRepository(RBACPermission)
    private readonly permissionRepository: Repository<RBACPermission>,
  ) {}

  /**
   * Create a new permission
   */
  async create(createDto: CreateRBACPermissionDto, userId: string): Promise<RBACPermission> {
    // Check for duplicate permission code
    const existingPermission = await this.permissionRepository.findOne({
      where: { permissionCode: createDto.permissionCode },
    });

    if (existingPermission) {
      throw new ConflictException(
        `Permission with code '${createDto.permissionCode}' already exists`,
      );
    }

    // Validate dependency permissions exist
    if (createDto.dependsOnPermissions && createDto.dependsOnPermissions.length > 0) {
      await this.validatePermissionCodes(createDto.dependsOnPermissions);
    }

    const permission = this.permissionRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.permissionRepository.save(permission);
  }

  /**
   * Find all permissions with filtering
   */
  async findAll(filters?: {
    module?: string;
    subModule?: string;
    action?: PermissionAction;
    category?: string;
    isActive?: boolean;
    isSensitive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: RBACPermission[]; total: number; page: number; totalPages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 100;
    const skip = (page - 1) * limit;

    const queryBuilder = this.permissionRepository.createQueryBuilder('permission');

    // Apply filters
    if (filters?.module) {
      queryBuilder.andWhere('permission.module = :module', { module: filters.module });
    }

    if (filters?.subModule) {
      queryBuilder.andWhere('permission.subModule = :subModule', {
        subModule: filters.subModule,
      });
    }

    if (filters?.action) {
      queryBuilder.andWhere('permission.action = :action', { action: filters.action });
    }

    if (filters?.category) {
      queryBuilder.andWhere('permission.category = :category', { category: filters.category });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('permission.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.isSensitive !== undefined) {
      queryBuilder.andWhere('permission.isSensitive = :isSensitive', {
        isSensitive: filters.isSensitive,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(permission.permissionName LIKE :search OR permission.permissionCode LIKE :search OR permission.permissionDescription LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder
      .orderBy('permission.module', 'ASC')
      .addOrderBy('permission.subModule', 'ASC')
      .addOrderBy('permission.displayOrder', 'ASC')
      .addOrderBy('permission.permissionName', 'ASC');

    const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one permission by ID
   */
  async findOne(id: string): Promise<RBACPermission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID '${id}' not found`);
    }

    return permission;
  }

  /**
   * Find permission by code
   */
  async findByCode(permissionCode: string): Promise<RBACPermission> {
    const permission = await this.permissionRepository.findOne({
      where: { permissionCode },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with code '${permissionCode}' not found`);
    }

    return permission;
  }

  /**
   * Update a permission
   */
  async update(
    id: string,
    updateDto: UpdateRBACPermissionDto,
    userId: string,
  ): Promise<RBACPermission> {
    const permission = await this.findOne(id);

    if (permission.isSystemPermission) {
      throw new BadRequestException('System permissions cannot be modified');
    }

    Object.assign(permission, updateDto);
    permission.updatedBy = userId;

    return this.permissionRepository.save(permission);
  }

  /**
   * Delete a permission
   */
  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);

    if (permission.isSystemPermission) {
      throw new BadRequestException('System permissions cannot be deleted');
    }

    await this.permissionRepository.remove(permission);
  }

  /**
   * Get permissions grouped by module hierarchy
   */
  async getPermissionHierarchy(): Promise<any> {
    const permissions = await this.permissionRepository.find({
      where: { isActive: true },
      order: {
        module: 'ASC',
        subModule: 'ASC',
        feature: 'ASC',
        displayOrder: 'ASC',
      },
    });

    const hierarchy = {};

    for (const perm of permissions) {
      if (!hierarchy[perm.module]) {
        hierarchy[perm.module] = {
          moduleName: perm.module,
          category: perm.category,
          subModules: {},
        };
      }

      const subModuleName = perm.subModule || '_root';
      if (!hierarchy[perm.module].subModules[subModuleName]) {
        hierarchy[perm.module].subModules[subModuleName] = {
          subModuleName: perm.subModule,
          features: {},
        };
      }

      const featureName = perm.feature || '_default';
      if (!hierarchy[perm.module].subModules[subModuleName].features[featureName]) {
        hierarchy[perm.module].subModules[subModuleName].features[featureName] = {
          featureName: perm.feature,
          permissions: [],
        };
      }

      hierarchy[perm.module].subModules[subModuleName].features[featureName].permissions.push({
        id: perm.id,
        permissionCode: perm.permissionCode,
        permissionName: perm.permissionName,
        action: perm.action,
        isSensitive: perm.isSensitive,
        requiresApproval: perm.requiresApproval,
        riskLevel: perm.riskLevel,
        requiresMFA: perm.requiresMFA,
      });
    }

    return hierarchy;
  }

  /**
   * Get all unique modules
   */
  async getModules(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.module', 'module')
      .where('permission.isActive = :isActive', { isActive: true })
      .getRawMany();

    return result.map((r) => r.module).sort();
  }

  /**
   * Get sub-modules for a specific module
   */
  async getSubModules(module: string): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.subModule', 'subModule')
      .where('permission.module = :module', { module })
      .andWhere('permission.isActive = :isActive', { isActive: true })
      .andWhere('permission.subModule IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.subModule).sort();
  }

  /**
   * Bulk operations on permissions
   */
  async bulkOperation(bulkDto: BulkPermissionOperationDto, userId: string): Promise<any> {
    const permissions = await this.permissionRepository.find({
      where: { id: In(bulkDto.permissionIds) },
    });

    if (permissions.length !== bulkDto.permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    const results = [];

    for (const permission of permissions) {
      try {
        switch (bulkDto.operation) {
          case 'ACTIVATE':
            permission.isActive = true;
            permission.updatedBy = userId;
            await this.permissionRepository.save(permission);
            results.push({ id: permission.id, status: 'success', operation: 'activated' });
            break;

          case 'DEACTIVATE':
            permission.isActive = false;
            permission.updatedBy = userId;
            await this.permissionRepository.save(permission);
            results.push({ id: permission.id, status: 'success', operation: 'deactivated' });
            break;

          case 'DELETE':
            if (!permission.isSystemPermission) {
              await this.permissionRepository.remove(permission);
              results.push({ id: permission.id, status: 'success', operation: 'deleted' });
            } else {
              results.push({
                id: permission.id,
                status: 'skipped',
                reason: 'System permission cannot be deleted',
              });
            }
            break;

          case 'UPDATE_RISK_LEVEL':
            if (bulkDto.updateData?.riskLevel !== undefined) {
              permission.riskLevel = bulkDto.updateData.riskLevel;
              permission.updatedBy = userId;
              await this.permissionRepository.save(permission);
              results.push({
                id: permission.id,
                status: 'success',
                operation: 'risk_level_updated',
              });
            }
            break;
        }
      } catch (error) {
        results.push({ id: permission.id, status: 'error', error: error.message });
      }
    }

    return { results, totalProcessed: permissions.length };
  }

  /**
   * Validate permission codes exist
   */
  private async validatePermissionCodes(permissionCodes: string[]): Promise<void> {
    const permissions = await this.permissionRepository.find({
      where: { permissionCode: In(permissionCodes) },
    });

    if (permissions.length !== permissionCodes.length) {
      const foundCodes = permissions.map((p) => p.permissionCode);
      const missing = permissionCodes.filter((code) => !foundCodes.includes(code));
      throw new NotFoundException(`Permission codes not found: ${missing.join(', ')}`);
    }
  }

  /**
   * Get permission statistics
   */
  async getStatistics(): Promise<any> {
    const total = await this.permissionRepository.count();
    const active = await this.permissionRepository.count({ where: { isActive: true } });
    const inactive = await this.permissionRepository.count({ where: { isActive: false } });
    const sensitive = await this.permissionRepository.count({ where: { isSensitive: true } });
    const systemPermissions = await this.permissionRepository.count({
      where: { isSystemPermission: true },
    });

    const byModule = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('permission.module', 'module')
      .addSelect('COUNT(*)', 'count')
      .groupBy('permission.module')
      .getRawMany();

    const byAction = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('permission.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('permission.action')
      .getRawMany();

    return {
      total,
      active,
      inactive,
      sensitive,
      systemPermissions,
      byModule,
      byAction,
    };
  }

  /**
   * Search permissions with advanced filters
   */
  async advancedSearch(searchParams: {
    modules?: string[];
    actions?: PermissionAction[];
    riskLevelMin?: number;
    riskLevelMax?: number;
    accessesPII?: boolean;
    accessesFinancialData?: boolean;
    requiresMFA?: boolean;
  }): Promise<RBACPermission[]> {
    const queryBuilder = this.permissionRepository.createQueryBuilder('permission');

    if (searchParams.modules && searchParams.modules.length > 0) {
      queryBuilder.andWhere('permission.module IN (:...modules)', { modules: searchParams.modules });
    }

    if (searchParams.actions && searchParams.actions.length > 0) {
      queryBuilder.andWhere('permission.action IN (:...actions)', { actions: searchParams.actions });
    }

    if (searchParams.riskLevelMin !== undefined) {
      queryBuilder.andWhere('permission.riskLevel >= :riskLevelMin', {
        riskLevelMin: searchParams.riskLevelMin,
      });
    }

    if (searchParams.riskLevelMax !== undefined) {
      queryBuilder.andWhere('permission.riskLevel <= :riskLevelMax', {
        riskLevelMax: searchParams.riskLevelMax,
      });
    }

    if (searchParams.accessesPII !== undefined) {
      queryBuilder.andWhere('permission.accessesPII = :accessesPII', {
        accessesPII: searchParams.accessesPII,
      });
    }

    if (searchParams.accessesFinancialData !== undefined) {
      queryBuilder.andWhere('permission.accessesFinancialData = :accessesFinancialData', {
        accessesFinancialData: searchParams.accessesFinancialData,
      });
    }

    if (searchParams.requiresMFA !== undefined) {
      queryBuilder.andWhere('permission.requiresMFA = :requiresMFA', {
        requiresMFA: searchParams.requiresMFA,
      });
    }

    return queryBuilder.orderBy('permission.riskLevel', 'DESC').getMany();
  }
}
