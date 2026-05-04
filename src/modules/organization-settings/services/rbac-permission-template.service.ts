import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RBACPermissionTemplate } from '../entities/rbac-permission-template.entity';
import { RBACStandardRole } from '../entities/rbac-standard-role.entity';
import { RBACPermission } from '../entities/rbac-permission.entity';
import { RBACRolePermission } from '../entities/rbac-role-permission.entity';
import {
  CreatePermissionTemplateDto,
  UpdatePermissionTemplateDto,
  ApplyTemplateToRoleDto,
} from '../dto/rbac-permission-template.dto';

@Injectable()
export class RBACPermissionTemplateService {
  constructor(
    @InjectRepository(RBACPermissionTemplate)
    private readonly templateRepository: Repository<RBACPermissionTemplate>,
    @InjectRepository(RBACStandardRole)
    private readonly roleRepository: Repository<RBACStandardRole>,
    @InjectRepository(RBACPermission)
    private readonly permissionRepository: Repository<RBACPermission>,
    @InjectRepository(RBACRolePermission)
    private readonly rolePermissionRepository: Repository<RBACRolePermission>,
  ) {}

  /**
   * Create a new permission template
   */
  async create(createDto: CreatePermissionTemplateDto, userId: string): Promise<RBACPermissionTemplate> {
    // Check for duplicate template code
    const existing = await this.templateRepository.findOne({
      where: { templateCode: createDto.templateCode },
    });

    if (existing) {
      throw new ConflictException(`Template with code '${createDto.templateCode}' already exists`);
    }

    const template = this.templateRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.templateRepository.save(template);
  }

  /**
   * Find all templates with filtering
   */
  async findAll(filters?: {
    templateCategory?: string;
    isActive?: boolean;
    isRecommended?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: RBACPermissionTemplate[]; total: number; page: number; totalPages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.templateRepository.createQueryBuilder('template')
      .where('template.isDeleted = :isDeleted', { isDeleted: false });

    if (filters?.templateCategory) {
      queryBuilder.andWhere('template.templateCategory = :category', { category: filters.templateCategory });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('template.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.isRecommended !== undefined) {
      queryBuilder.andWhere('template.isRecommended = :isRecommended', { isRecommended: filters.isRecommended });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(template.templateName ILIKE :search OR template.templateCode ILIKE :search OR template.templateDescription ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    queryBuilder.orderBy('template.displayOrder', 'ASC')
      .addOrderBy('template.templateName', 'ASC');

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one template by ID
   */
  async findOne(id: string): Promise<RBACPermissionTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!template) {
      throw new NotFoundException(`Permission template with ID '${id}' not found`);
    }

    return template;
  }

  /**
   * Find template by code
   */
  async findByCode(code: string): Promise<RBACPermissionTemplate> {
    const template = await this.templateRepository.findOne({
      where: { templateCode: code, isDeleted: false },
    });

    if (!template) {
      throw new NotFoundException(`Permission template with code '${code}' not found`);
    }

    return template;
  }

  /**
   * Update a template
   */
  async update(id: string, updateDto: UpdatePermissionTemplateDto, userId: string): Promise<RBACPermissionTemplate> {
    const template = await this.findOne(id);

    if (template.isSystemTemplate) {
      throw new ConflictException('System templates cannot be modified');
    }

    Object.assign(template, updateDto, {
      updatedBy: userId,
    });

    return await this.templateRepository.save(template);
  }

  /**
   * Delete a template
   */
  async remove(id: string, userId: string): Promise<void> {
    const template = await this.findOne(id);

    if (template.isSystemTemplate) {
      throw new ConflictException('System templates cannot be deleted');
    }

    template.isDeleted = true;
    template.deletedAt = new Date();
    template.deletedBy = userId;

    await this.templateRepository.save(template);
  }

  /**
   * Apply template to a role
   */
  async applyToRole(applyDto: ApplyTemplateToRoleDto, userId: string): Promise<RBACStandardRole> {
    const template = await this.findOne(applyDto.templateId);
    const role = await this.roleRepository.findOne({
      where: { id: applyDto.roleId },
      relations: ['permissions', 'permissions.permission'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${applyDto.roleId}' not found`);
    }

    // If replace existing, remove all current permissions
    if (applyDto.replaceExisting) {
      await this.rolePermissionRepository.delete({ roleId: role.id });
    }

    // Apply template permissions
    const permissionsToAdd: string[] = [];
    for (const templatePerm of template.permissions) {
      permissionsToAdd.push(...templatePerm.permissions);
    }

    // Get permission entities
    const permissions = await this.permissionRepository.find({
      where: permissionsToAdd.map(code => ({ permissionCode: code })),
    });

    // Create role-permission associations
    const rolePermissions = [];
    for (const permission of permissions) {
      const templatePerm = template.permissions.find(tp => 
        tp.permissions.includes(permission.permissionCode)
      );

      const rolePerm = this.rolePermissionRepository.create();
      rolePerm.roleId = role.id;
      rolePerm.permissionId = permission.id;
      rolePerm.dataScope = (templatePerm?.dataScope as any) || role.defaultDataScope;
      rolePerm.isActive = true;
      rolePermissions.push(rolePerm);
    }

    await this.rolePermissionRepository.save(rolePermissions);

    // Update template usage statistics
    template.usageCount += 1;
    template.lastUsedAt = new Date();
    await this.templateRepository.save(template);

    // Return updated role
    return await this.roleRepository.findOne({
      where: { id: role.id },
      relations: ['permissions', 'permissions.permission'],
    });
  }

  /**
   * Get recommended templates
   */
  async getRecommended(category?: string): Promise<RBACPermissionTemplate[]> {
    const queryBuilder = this.templateRepository.createQueryBuilder('template')
      .where('template.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('template.isActive = :isActive', { isActive: true })
      .andWhere('template.isRecommended = :isRecommended', { isRecommended: true });

    if (category) {
      queryBuilder.andWhere('template.templateCategory = :category', { category });
    }

    return await queryBuilder
      .orderBy('template.usageCount', 'DESC')
      .addOrderBy('template.displayOrder', 'ASC')
      .take(10)
      .getMany();
  }
}
