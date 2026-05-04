import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { CustomRole } from '../entities/custom-role.entity';
import { CreateCustomRoleDto, UpdateCustomRoleDto, CustomRoleListQueryDto } from '../dto/custom-role.dto';
import { PermissionResolutionEngine } from './permission-resolution.engine';
import { InheritanceResolver } from './inheritance-resolver.service';
import { SoDEngine } from './sod-engine.service';
import { RiskScoringEngine } from './risk-scoring.engine';

@Injectable()
export class CustomRoleService {
  private readonly logger = new Logger(CustomRoleService.name);

  constructor(
    @InjectRepository(CustomRole)
    private readonly roleRepository: Repository<CustomRole>,
    private readonly permissionEngine: PermissionResolutionEngine,
    private readonly inheritanceResolver: InheritanceResolver,
    private readonly sodEngine: SoDEngine,
    private readonly riskEngine: RiskScoringEngine,
  ) {}

  /**
   * Create a new custom role
   */
  async create(
    dto: CreateCustomRoleDto,
    tenantId: string,
    userId: string
  ): Promise<CustomRole> {
    this.logger.log(`Creating custom role: ${dto.roleCode} for tenant ${tenantId}`);

    // Check if role code already exists
    const existing = await this.roleRepository.findOne({
      where: { tenantId, roleCode: dto.roleCode }
    });

    if (existing) {
      throw new BadRequestException(`Role with code '${dto.roleCode}' already exists`);
    }

    // Create role
    const role = this.roleRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      version: 1
    });

    const savedRole = await this.roleRepository.save(role);

    this.logger.log(`Custom role created: ${savedRole.id}`);
    return savedRole;
  }

  /**
   * Find all custom roles with filtering and pagination
   */
  async findAll(
    query: CustomRoleListQueryDto,
    tenantId: string
  ): Promise<{ data: CustomRole[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', ...filters } = query;

    const where: any = { tenantId };

    // Apply filters
    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.sensitivityLevel) {
      where.sensitivityLevel = filters.sensitivityLevel;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.roleName = Like(`%${filters.search}%`);
    }

    const [data, total] = await this.roleRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      data,
      total,
      page,
      limit
    };
  }

  /**
   * Find one custom role by ID
   */
  async findOne(id: string, tenantId: string): Promise<CustomRole> {
    const role = await this.roleRepository.findOne({
      where: { id, tenantId },
      relations: ['permissions', 'compositions']
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }

  /**
   * Update a custom role
   */
  async update(
    id: string,
    dto: UpdateCustomRoleDto,
    tenantId: string,
    userId: string
  ): Promise<CustomRole> {
    const role = await this.findOne(id, tenantId);

    // Update fields
    Object.assign(role, dto);
    role.modifiedBy = userId;
    role.modifiedAt = new Date();
    role.version += 1;

    const updated = await this.roleRepository.save(role);

    // Recalculate risk score
    await this.recalculateRiskScore(id, tenantId);

    this.logger.log(`Custom role updated: ${id}`);
    return updated;
  }

  /**
   * Delete a custom role
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const role = await this.findOne(id, tenantId);

    await this.roleRepository.remove(role);
    this.logger.log(`Custom role deleted: ${id}`);
  }

  /**
   * Deactivate a role (soft delete)
   */
  async deactivate(id: string, tenantId: string, userId: string): Promise<CustomRole> {
    const role = await this.findOne(id, tenantId);

    role.isActive = false;
    role.modifiedBy = userId;
    role.modifiedAt = new Date();

    const updated = await this.roleRepository.save(role);
    this.logger.log(`Custom role deactivated: ${id}`);
    return updated;
  }

  /**
   * Get effective permissions for a role
   */
  async getEffectivePermissions(id: string, tenantId: string): Promise<any> {
    const role = await this.findOne(id, tenantId);

    const effectivePerms = await this.permissionEngine.resolveEffectivePermissions(
      id,
      {
        timestamp: new Date()
      }
    );

    return effectivePerms;
  }

  /**
   * Get inheritance tree for a role
   */
  async getInheritanceTree(id: string, tenantId: string): Promise<any> {
    const role = await this.findOne(id, tenantId);

    const tree = await this.inheritanceResolver.resolveInheritance(id);
    return tree;
  }

  /**
   * Validate a role for SoD violations
   */
  async validateRole(id: string, tenantId: string): Promise<any> {
    const role = await this.findOne(id, tenantId);

    const violations = await this.sodEngine.detectViolations(id, tenantId);
    const validation = await this.sodEngine.validateBeforeSave(
      id,
      [], // Will be populated from role permissions
      tenantId
    );

    return {
      roleId: id,
      roleCode: role.roleCode,
      violations,
      validation
    };
  }

  /**
   * Get risk score for a role
   */
  async getRiskScore(id: string, tenantId: string): Promise<any> {
    const role = await this.findOne(id, tenantId);

    const riskAnalysis = await this.riskEngine.calculateRiskScore(id, tenantId);
    return riskAnalysis;
  }

  /**
   * Recalculate and update risk score
   */
  async recalculateRiskScore(id: string, tenantId: string): Promise<void> {
    const riskAnalysis = await this.riskEngine.calculateRiskScore(id, tenantId);

    await this.roleRepository.update(id, {
      riskScore: riskAnalysis.totalScore
    });
  }

  /**
   * Simulate role changes
   */
  async simulate(id: string, tenantId: string, changes: any): Promise<any> {
    // Placeholder for simulation logic
    return {
      roleId: id,
      usersAffected: 0,
      permissionsAdded: [],
      permissionsRemoved: [],
      riskScoreChange: 0,
      sodViolations: []
    };
  }

  /**
   * Clone a role
   */
  async clone(
    id: string,
    newRoleCode: string,
    newRoleName: string,
    tenantId: string,
    userId: string
  ): Promise<CustomRole> {
    const source = await this.findOne(id, tenantId);

    const cloned = this.roleRepository.create({
      ...source,
      id: undefined,
      roleCode: newRoleCode,
      roleName: newRoleName,
      createdBy: userId,
      createdAt: new Date(),
      modifiedBy: null,
      modifiedAt: null,
      version: 1
    });

    const saved = await this.roleRepository.save(cloned);
    this.logger.log(`Role cloned: ${id} -> ${saved.id}`);
    return saved;
  }

  /**
   * Get role statistics
   */
  async getStatistics(tenantId: string): Promise<any> {
    const total = await this.roleRepository.count({ where: { tenantId } });
    const active = await this.roleRepository.count({ where: { tenantId, isActive: true } });
    
    const byCategory = await this.roleRepository
      .createQueryBuilder('role')
      .select('role.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('role.tenantId = :tenantId', { tenantId })
      .groupBy('role.category')
      .getRawMany();

    const bySensitivity = await this.roleRepository
      .createQueryBuilder('role')
      .select('role.sensitivityLevel', 'level')
      .addSelect('COUNT(*)', 'count')
      .where('role.tenantId = :tenantId', { tenantId })
      .groupBy('role.sensitivityLevel')
      .getRawMany();

    return {
      total,
      active,
      inactive: total - active,
      byCategory,
      bySensitivity
    };
  }
}
