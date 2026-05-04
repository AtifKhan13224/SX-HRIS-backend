import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { PermissionResolutionEngine } from '../services/permission-resolution.engine';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto, UpdatePermissionDto, AssignPermissionToRoleDto } from '../dto/permission.dto';

@Controller('api/rbac/permissions')
export class PermissionController {
  constructor(
    private readonly permissionEngine: PermissionResolutionEngine,
    private readonly permissionService: PermissionService
  ) {}

  // ========== CRUD Operations ==========

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPermission(@Body() createDto: CreatePermissionDto): Promise<any> {
    return this.permissionService.createPermission(createDto);
  }

  @Get()
  async getAllPermissions(
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('riskScoreMin') riskScoreMin?: number,
    @Query('riskScoreMax') riskScoreMax?: number,
    @Query('isSensitive') isSensitive?: string,
    @Query('requiresSoD') requiresSoD?: string,
    @Query('isActive') isActive?: string
  ): Promise<any> {
    const filters: any = {};
    if (module) filters.module = module;
    if (action) filters.action = action;
    if (searchTerm) filters.searchTerm = searchTerm;
    if (riskScoreMin !== undefined) filters.riskScoreMin = Number(riskScoreMin);
    if (riskScoreMax !== undefined) filters.riskScoreMax = Number(riskScoreMax);
    if (isSensitive !== undefined) filters.isSensitive = isSensitive === 'true';
    if (requiresSoD !== undefined) filters.requiresSoD = requiresSoD === 'true';
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    return this.permissionService.findAll(filters);
  }

  @Get('statistics')
  async getStatistics(): Promise<any> {
    return this.permissionService.getStatistics();
  }

  @Get('templates')
  async getTemplates(): Promise<any> {
    return this.permissionService.getTemplates();
  }

  @Get('matrix')
  async getPermissionMatrix(@Query('roleIds') roleIds: string): Promise<any> {
    const roleIdArray = roleIds.split(',').filter(Boolean);
    return this.permissionService.getPermissionMatrix(roleIdArray);
  }

  @Get('module/:module')
  async getModulePermissions(
    @Param('module') module: string,
    @Query('userId') userId?: string,
    @Query('roleIds') roleIds?: string
  ): Promise<any> {
    if (userId && roleIds) {
      const roleIdArray = roleIds.split(',');
      return this.permissionEngine.getModulePermissions(module, userId, roleIdArray);
    }
    return this.permissionService.findByModule(module);
  }

  @Get('role/:roleId')
  async getRolePermissions(@Param('roleId') roleId: string): Promise<any> {
    return this.permissionService.findByRole(roleId);
  }

  @Get(':id')
  async getPermissionById(@Param('id') id: string): Promise<any> {
    return this.permissionService.findById(id);
  }

  @Get('code/:code')
  async getPermissionByCode(@Param('code') code: string): Promise<any> {
    return this.permissionService.findByCode(code);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updatePermission(
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionDto
  ): Promise<any> {
    return this.permissionService.updatePermission(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePermission(
    @Param('id') id: string,
    @Query('deletedBy') deletedBy: string
  ): Promise<void> {
    return this.permissionService.deletePermission(id, deletedBy);
  }

  // ========== Role Assignment Operations ==========

  @Post('assign-to-role')
  @HttpCode(HttpStatus.CREATED)
  async assignPermissionToRole(@Body() assignDto: AssignPermissionToRoleDto): Promise<any> {
    return this.permissionService.assignToRole(assignDto);
  }

  @Post('revoke-from-role')
  @HttpCode(HttpStatus.OK)
  async revokePermissionFromRole(
    @Body() body: { roleId: string; permissionCode: string; revokedBy: string }
  ): Promise<any> {
    await this.permissionService.revokeFromRole(body.roleId, body.permissionCode, body.revokedBy);
    return { success: true, message: 'Permission revoked successfully' };
  }

  @Post('bulk-assign')
  @HttpCode(HttpStatus.OK)
  async bulkAssignPermissions(
    @Body() body: { roleId: string; permissionIds: string[]; assignedBy: string }
  ): Promise<any> {
    return this.permissionService.bulkAssignToRole(body.roleId, body.permissionIds, body.assignedBy);
  }

  @Post('bulk-revoke')
  @HttpCode(HttpStatus.OK)
  async bulkRevokePermissions(
    @Body() body: { roleId: string; permissionCodes: string[]; revokedBy: string }
  ): Promise<any> {
    return this.permissionService.bulkRevokeFromRole(body.roleId, body.permissionCodes, body.revokedBy);
  }

  @Post('apply-template')
  @HttpCode(HttpStatus.OK)
  async applyTemplate(
    @Body() body: { roleId: string; templateName: string; appliedBy: string }
  ): Promise<any> {
    const templates = await this.permissionService.getTemplates();
    const template = templates.find(t => t.name === body.templateName);
    
    if (!template) {
      return { success: false, message: 'Template not found' };
    }

    return this.permissionService.applyTemplate(body.roleId, template, body.appliedBy);
  }

  // ========== Validation & Checking Operations ==========

  @Post('check')
  @HttpCode(HttpStatus.OK)
  async checkPermission(
    @Body() body: {
      userId: string;
      roleIds: string[];
      permissionCode: string;
      context?: Record<string, any>;
    }
  ): Promise<any> {
    return this.permissionEngine.hasPermission(
      body.userId,
      body.roleIds,
      body.permissionCode,
      body.context
    );
  }

  @Post('check-multiple')
  @HttpCode(HttpStatus.OK)
  async checkMultiplePermissions(
    @Body() body: {
      userId: string;
      roleIds: string[];
      permissionCodes: string[];
      context?: Record<string, any>;
    }
  ): Promise<any> {
    const results = await this.permissionEngine.hasPermissions(
      body.userId,
      body.roleIds,
      body.permissionCodes,
      body.context
    );
    return Object.fromEntries(results);
  }

  @Post('check-exclusions')
  @HttpCode(HttpStatus.OK)
  async checkExclusions(
    @Body() body: { roleId: string; permissionCode: string }
  ): Promise<any> {
    const conflicts = await this.permissionService.checkExclusions(body.roleId, body.permissionCode);
    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }

  @Post('validate-assignment')
  @HttpCode(HttpStatus.OK)
  async validateAssignment(
    @Body() body: { roleId: string; permissionCode: string }
  ): Promise<any> {
    return this.permissionEngine.validatePermissionAssignment(body.roleId, body.permissionCode);
  }

  @Get('user/:userId')
  async getUserPermissions(
    @Param('userId') userId: string,
    @Query('roleIds') roleIds: string,
    @Query('tenantId') tenantId?: string
  ): Promise<any> {
    const roleIdArray = roleIds.split(',');
    return this.permissionEngine.resolveUserPermissions(userId, roleIdArray, tenantId);
  }

  @Get('hierarchy/:permissionCode')
  async getPermissionHierarchy(@Param('permissionCode') permissionCode: string): Promise<any> {
    return this.permissionEngine.getPermissionHierarchy(permissionCode);
  }
}
