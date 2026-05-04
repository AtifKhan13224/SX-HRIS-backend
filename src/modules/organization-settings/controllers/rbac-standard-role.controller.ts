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
import { RBACStandardRoleService } from '../services/rbac-standard-role.service';
import {
  CreateRBACStandardRoleDto,
  UpdateRBACStandardRoleDto,
  AssignPermissionsToRoleDto,
  RollbackRoleVersionDto,
  BulkRoleOperationDto,
} from '../dto/rbac-standard-role.dto';

@Controller('organization-settings/rbac/roles')
export class RBACStandardRoleController {
  constructor(private readonly rbacRoleService: RBACStandardRoleService) {}

  /**
   * Create a new standard role
   * POST /organization-settings/rbac/roles
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createDto: CreateRBACStandardRoleDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    const role = await this.rbacRoleService.create(createDto, userId);
    return {
      success: true,
      message: 'Role created successfully',
      data: role,
    };
  }

  /**
   * Get all roles with filtering and pagination
   * GET /organization-settings/rbac/roles
   */
  @Get()
  async findAll(
    @Query('tenantId') tenantId?: string,
    @Query('roleCategory') roleCategory?: string,
    @Query('isActive') isActive?: string,
    @Query('isSystemOwned') isSystemOwned?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      tenantId,
      roleCategory,
      isActive: isActive ? isActive === 'true' : undefined,
      isSystemOwned: isSystemOwned ? isSystemOwned === 'true' : undefined,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    };

    const result = await this.rbacRoleService.findAll(filters);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get a single role by ID
   * GET /organization-settings/rbac/roles/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const role = await this.rbacRoleService.findOne(id);
    return {
      success: true,
      data: role,
    };
  }

  /**
   * Get role by code
   * GET /organization-settings/rbac/roles/by-code/:code
   */
  @Get('by-code/:code')
  async findByCode(@Param('code') code: string) {
    const role = await this.rbacRoleService.findByCode(code);
    return {
      success: true,
      data: role,
    };
  }

  /**
   * Update a role
   * PUT /organization-settings/rbac/roles/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateRBACStandardRoleDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    const role = await this.rbacRoleService.update(id, updateDto, userId);
    return {
      success: true,
      message: 'Role updated successfully',
      data: role,
    };
  }

  /**
   * Assign permissions to a role
   * POST /organization-settings/rbac/roles/:id/permissions
   */
  @Post(':id/permissions')
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) assignDto: AssignPermissionsToRoleDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    assignDto.roleId = id; // Ensure consistency
    const role = await this.rbacRoleService.assignPermissions(assignDto, userId);
    return {
      success: true,
      message: 'Permissions assigned successfully',
      data: role,
    };
  }

  /**
   * Remove specific permissions from a role
   * DELETE /organization-settings/rbac/roles/:id/permissions
   */
  @Delete(':id/permissions')
  async removePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { permissionIds: string[]; reason?: string },
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    const role = await this.rbacRoleService.removePermissions(
      id,
      body.permissionIds,
      userId,
      body.reason,
    );
    return {
      success: true,
      message: 'Permissions removed successfully',
      data: role,
    };
  }

  /**
   * Activate a role
   * POST /organization-settings/rbac/roles/:id/activate
   */
  @Post(':id/activate')
  async activate(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user?.id || 'system';
    const role = await this.rbacRoleService.activate(id, userId);
    return {
      success: true,
      message: 'Role activated successfully',
      data: role,
    };
  }

  /**
   * Deactivate a role
   * POST /organization-settings/rbac/roles/:id/deactivate
   */
  @Post(':id/deactivate')
  async deactivate(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user?.id || 'system';
    const role = await this.rbacRoleService.deactivate(id, userId);
    return {
      success: true,
      message: 'Role deactivated successfully',
      data: role,
    };
  }

  /**
   * Archive a role
   * POST /organization-settings/rbac/roles/:id/archive
   */
  @Post(':id/archive')
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    const role = await this.rbacRoleService.archive(id, userId, body.reason);
    return {
      success: true,
      message: 'Role archived successfully',
      data: role,
    };
  }

  /**
   * Delete a role
   * DELETE /organization-settings/rbac/roles/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user?.id || 'system';
    await this.rbacRoleService.remove(id, userId);
    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }

  /**
   * Rollback role to a previous version
   * POST /organization-settings/rbac/roles/rollback
   */
  @Post('rollback')
  async rollback(@Body(ValidationPipe) rollbackDto: RollbackRoleVersionDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    const role = await this.rbacRoleService.rollback(rollbackDto, userId);
    return {
      success: true,
      message: 'Role rolled back successfully',
      data: role,
    };
  }

  /**
   * Get role version history
   * GET /organization-settings/rbac/roles/:id/versions
   */
  @Get(':id/versions')
  async getVersionHistory(@Param('id', ParseUUIDPipe) id: string) {
    const versions = await this.rbacRoleService.getVersionHistory(id);
    return {
      success: true,
      data: versions,
    };
  }

  /**
   * Get role audit logs
   * GET /organization-settings/rbac/roles/:id/audit-logs
   */
  @Get(':id/audit-logs')
  async getAuditLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('actionType') actionType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      actionType: actionType as any,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    const auditLogs = await this.rbacRoleService.getAuditLogs(id, filters);
    return {
      success: true,
      data: auditLogs,
    };
  }

  /**
   * Get permission matrix for a role
   * GET /organization-settings/rbac/roles/:id/permission-matrix
   */
  @Get(':id/permission-matrix')
  async getPermissionMatrix(@Param('id', ParseUUIDPipe) id: string) {
    const matrix = await this.rbacRoleService.getPermissionMatrix(id);
    return {
      success: true,
      data: matrix,
    };
  }

  /**
   * Bulk operations on roles
   * POST /organization-settings/rbac/roles/bulk
   */
  @Post('bulk')
  async bulkOperation(@Body(ValidationPipe) bulkDto: BulkRoleOperationDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    const result = await this.rbacRoleService.bulkOperation(bulkDto, userId);
    return {
      success: true,
      message: 'Bulk operation completed',
      data: result,
    };
  }
}
