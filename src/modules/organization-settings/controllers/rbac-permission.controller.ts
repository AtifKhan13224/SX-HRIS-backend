import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { RBACPermissionService } from '../services/rbac-permission.service';
import {
  CreateRBACPermissionDto,
  UpdateRBACPermissionDto,
  BulkPermissionOperationDto,
} from '../dto/rbac-permission.dto';
import { PermissionAction } from '../entities/rbac-permission.entity';

@Controller('organization-settings/rbac/permissions')
export class RBACPermissionController {
  constructor(private readonly rbacPermissionService: RBACPermissionService) {}

  /**
   * Create a new permission
   * POST /organization-settings/rbac/permissions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createDto: CreateRBACPermissionDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    const permission = await this.rbacPermissionService.create(createDto, userId);
    return {
      success: true,
      message: 'Permission created successfully',
      data: permission,
    };
  }

  /**
   * Get all permissions with filtering and pagination
   * GET /organization-settings/rbac/permissions
   */
  @Get()
  async findAll(
    @Query('module') module?: string,
    @Query('subModule') subModule?: string,
    @Query('action') action?: PermissionAction,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('isSensitive') isSensitive?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      module,
      subModule,
      action,
      category,
      isActive: isActive ? isActive === 'true' : undefined,
      isSensitive: isSensitive ? isSensitive === 'true' : undefined,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 100,
    };

    const result = await this.rbacPermissionService.findAll(filters);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get a single permission by ID
   * GET /organization-settings/rbac/permissions/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const permission = await this.rbacPermissionService.findOne(id);
    return {
      success: true,
      data: permission,
    };
  }

  /**
   * Get permission by code
   * GET /organization-settings/rbac/permissions/by-code/:code
   */
  @Get('by-code/:code')
  async findByCode(@Param('code') code: string) {
    const permission = await this.rbacPermissionService.findByCode(code);
    return {
      success: true,
      data: permission,
    };
  }

  /**
   * Update a permission
   * PUT /organization-settings/rbac/permissions/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateRBACPermissionDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    const permission = await this.rbacPermissionService.update(id, updateDto, userId);
    return {
      success: true,
      message: 'Permission updated successfully',
      data: permission,
    };
  }

  /**
   * Delete a permission
   * DELETE /organization-settings/rbac/permissions/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.rbacPermissionService.remove(id);
    return {
      success: true,
      message: 'Permission deleted successfully',
    };
  }

  /**
   * Get permission hierarchy (grouped by module/submodule/feature)
   * GET /organization-settings/rbac/permissions/hierarchy
   */
  @Get('meta/hierarchy')
  async getPermissionHierarchy() {
    const hierarchy = await this.rbacPermissionService.getPermissionHierarchy();
    return {
      success: true,
      data: hierarchy,
    };
  }

  /**
   * Get all unique modules
   * GET /organization-settings/rbac/permissions/modules
   */
  @Get('meta/modules')
  async getModules() {
    const modules = await this.rbacPermissionService.getModules();
    return {
      success: true,
      data: modules,
    };
  }

  /**
   * Get sub-modules for a specific module
   * GET /organization-settings/rbac/permissions/modules/:module/sub-modules
   */
  @Get('meta/modules/:module/sub-modules')
  async getSubModules(@Param('module') module: string) {
    const subModules = await this.rbacPermissionService.getSubModules(module);
    return {
      success: true,
      data: subModules,
    };
  }

  /**
   * Get permission statistics
   * GET /organization-settings/rbac/permissions/statistics
   */
  @Get('meta/statistics')
  async getStatistics() {
    const stats = await this.rbacPermissionService.getStatistics();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Advanced search for permissions
   * POST /organization-settings/rbac/permissions/search
   */
  @Post('search')
  async advancedSearch(
    @Body()
    searchParams: {
      modules?: string[];
      actions?: PermissionAction[];
      riskLevelMin?: number;
      riskLevelMax?: number;
      accessesPII?: boolean;
      accessesFinancialData?: boolean;
      requiresMFA?: boolean;
    },
  ) {
    const results = await this.rbacPermissionService.advancedSearch(searchParams);
    return {
      success: true,
      data: results,
      total: results.length,
    };
  }

  /**
   * Bulk operations on permissions
   * POST /organization-settings/rbac/permissions/bulk
   */
  @Post('bulk')
  async bulkOperation(
    @Body(ValidationPipe) bulkDto: BulkPermissionOperationDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    const result = await this.rbacPermissionService.bulkOperation(bulkDto, userId);
    return {
      success: true,
      message: 'Bulk operation completed',
      data: result,
    };
  }
}
