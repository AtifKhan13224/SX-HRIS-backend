import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { SystemRoleService } from '../services/system-role.service';
import { CreateSystemRoleDto, UpdateSystemRoleDto, AssignSystemRoleDto, RevokeSystemRoleDto } from '../dto/system-role.dto';
import { SystemRole } from '../entities/system-role.entity';

@Controller('api/rbac/system-roles')
// @UseGuards(JwtAuthGuard, RBACGuard) // Uncomment when implementing auth
export class SystemRoleController {
  constructor(private readonly systemRoleService: SystemRoleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRole(@Body() createDto: CreateSystemRoleDto): Promise<SystemRole> {
    return this.systemRoleService.createSystemRole(createDto);
  }

  @Get()
  async getAllRoles(
    @Query('tenantId') tenantId?: string,
    @Query('category') category?: string
  ): Promise<SystemRole[]> {
    if (category) {
      return this.systemRoleService.findByCategory(category, tenantId);
    }
    return this.systemRoleService.findAll(tenantId);
  }

  @Get('privileged')
  async getPrivilegedRoles(@Query('tenantId') tenantId?: string): Promise<SystemRole[]> {
    return this.systemRoleService.getPrivilegedRoles(tenantId);
  }

  @Get('break-glass')
  async getBreakGlassRoles(@Query('tenantId') tenantId?: string): Promise<SystemRole[]> {
    return this.systemRoleService.getBreakGlassRoles(tenantId);
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string): Promise<SystemRole> {
    return this.systemRoleService.findById(id);
  }

  @Get('code/:roleCode')
  async getRoleByCode(@Param('roleCode') roleCode: string): Promise<SystemRole> {
    return this.systemRoleService.findByCode(roleCode);
  }

  @Put(':id')
  async updateRole(
    @Param('id') id: string,
    @Body() updateDto: UpdateSystemRoleDto
  ): Promise<SystemRole> {
    return this.systemRoleService.updateSystemRole(id, updateDto);
  }

  @Post('assign')
  @HttpCode(HttpStatus.OK)
  async assignRole(@Body() assignDto: AssignSystemRoleDto): Promise<any> {
    return this.systemRoleService.assignRole(assignDto);
  }

  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  async revokeRole(@Body() revokeDto: RevokeSystemRoleDto): Promise<any> {
    return this.systemRoleService.revokeRole(revokeDto);
  }

  @Get(':id/versions')
  async getRoleVersions(@Param('id') id: string): Promise<any[]> {
    return this.systemRoleService.getRoleVersions(id);
  }

  @Post(':id/rollback')
  @HttpCode(HttpStatus.OK)
  async rollbackRole(
    @Param('id') roleId: string,
    @Body() body: { versionId: string; rolledBackBy: string }
  ): Promise<SystemRole> {
    return this.systemRoleService.rollbackToVersion(roleId, body.versionId, body.rolledBackBy);
  }
}
