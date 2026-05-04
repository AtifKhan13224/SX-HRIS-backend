import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ProjectRoleService } from '../services/project-role.service';
import {
  CreateProjectRoleDto,
  UpdateProjectRoleDto,
  ProjectRoleQueryDto,
  BulkProjectRoleActionDto,
  ProjectRoleScopeMappingDto,
  ProjectRoleApprovalDto,
  ProjectRoleHierarchyDto,
  UpdateProjectRoleStatusDto,
} from '../dto/project-role.dto';
import { ProjectRole } from '../entities/project-role.entity';

/**
 * PROJECT ROLE CONTROLLER
 * RESTful API endpoints for project role management
 * Includes hierarchical operations and comprehensive querying
 */
@ApiTags('Project Roles')
@Controller('project-management/project-roles')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectRoleController {
  constructor(private readonly projectRoleService: ProjectRoleService) {}

  /**
   * CREATE PROJECT ROLE
   * POST /project-management/project-roles
   */
  @Post()
  @ApiOperation({
    summary: 'Create new project role',
    description:
      'Creates a new project role with tenant isolation, validation, and audit trail. Supports hierarchical parent-child relationships.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Role created successfully',
    type: ProjectRole,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Role code already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  // @RequirePermissions('project.roles.create')
  async createRole(
    @Req() req: any,
    @Body(ValidationPipe) createDto: CreateProjectRoleDto,
  ): Promise<ProjectRole> {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.id || 'system';

    return this.projectRoleService.createRole(tenantId, userId, createDto);
  }

  /**
   * GET ALL PROJECT ROLES
   * GET /project-management/project-roles
   */
  @Get()
  @ApiOperation({
    summary: 'Get all project roles with filters',
    description:
      'Retrieves paginated list of project roles with advanced filtering by category, skill level, status, hierarchy, and more.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by role code or name',
  })
  @ApiQuery({
    name: 'roleCategory',
    required: false,
    description: 'Filter by role category',
  })
  @ApiQuery({
    name: 'skillLevel',
    required: false,
    description: 'Filter by skill level',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'parentRoleId',
    required: false,
    description: 'Filter by parent role ID',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: 'Filter by department ID',
  })
  @ApiQuery({
    name: 'practiceArea',
    required: false,
    description: 'Filter by practice area',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    description: 'Include inactive roles',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles retrieved successfully',
  })
  // @RequirePermissions('project.roles.view')
  async getRoles(
    @Req() req: any,
    @Query(ValidationPipe) queryDto: ProjectRoleQueryDto,
  ): Promise<{
    roles: ProjectRole[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenantId = req.headers['x-tenant-id'];

    return this.projectRoleService.getRoles(tenantId, queryDto);
  }

  /**
   * GET PROJECT ROLE BY ID
   * GET /project-management/project-roles/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get project role by ID',
    description:
      'Retrieves a single project role with related data including parent, children, and scope mappings.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the project role',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role retrieved successfully',
    type: ProjectRole,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
  })
  // @RequirePermissions('project.roles.view')
  async getRoleById(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProjectRole> {
    const tenantId = req.headers['x-tenant-id'];

    return this.projectRoleService.getRoleById(tenantId, id);
  }

  /**
   * GET ROLE HIERARCHY TREE
   * GET /project-management/project-roles/:id/hierarchy
   */
  @Get(':id/hierarchy')
  @ApiOperation({
    summary: 'Get role hierarchy tree',
    description:
      'Retrieves complete hierarchy tree starting from a role, including all descendants in nested structure.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the root role',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hierarchy tree retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
  })
  // @RequirePermissions('project.roles.view')
  async getRoleHierarchy(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<any> {
    const tenantId = req.headers['x-tenant-id'];

    return this.projectRoleService.getRoleHierarchy(tenantId, id);
  }

  /**
   * GET ROLE CHILDREN
   * GET /project-management/project-roles/:id/children
   */
  @Get(':id/children')
  @ApiOperation({
    summary: 'Get direct children of a role',
    description: 'Retrieves only the immediate child roles of a parent role.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the parent role',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Child roles retrieved successfully',
    type: [ProjectRole],
  })
  // @RequirePermissions('project.roles.view')
  async getRoleChildren(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProjectRole[]> {
    const tenantId = req.headers['x-tenant-id'];

    return this.projectRoleService.getRoleChildren(tenantId, id);
  }

  /**
   * GET ROLE ANCESTORS
   * GET /project-management/project-roles/:id/ancestors
   */
  @Get(':id/ancestors')
  @ApiOperation({
    summary: 'Get ancestor chain of a role',
    description:
      'Retrieves the complete parent chain from root to the specified role.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ancestors retrieved successfully',
    type: [ProjectRole],
  })
  // @RequirePermissions('project.roles.view')
  async getRoleAncestors(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProjectRole[]> {
    const tenantId = req.headers['x-tenant-id'];

    return this.projectRoleService.getRoleAncestors(tenantId, id);
  }

  /**
   * UPDATE PROJECT ROLE
   * PUT /project-management/project-roles/:id
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update project role',
    description:
      'Updates an existing project role with version control and audit trail. Supports changing parent role.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role to update',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated successfully',
    type: ProjectRole,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error or circular reference',
  })
  // @RequirePermissions('project.roles.update')
  async updateRole(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateProjectRoleDto,
  ): Promise<ProjectRole> {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.id || 'system';

    return this.projectRoleService.updateRole(tenantId, userId, id, updateDto);
  }

  /**
   * UPDATE ROLE STATUS
   * PATCH /project-management/project-roles/:id/status
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update role status',
    description:
      'Changes the status of a role following defined workflow transitions.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status updated successfully',
    type: ProjectRole,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status transition',
  })
  // @RequirePermissions('project.roles.update')
  async updateRoleStatus(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) statusDto: UpdateProjectRoleStatusDto,
  ): Promise<ProjectRole> {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.id || 'system';

    return this.projectRoleService.updateRoleStatus(
      tenantId,
      userId,
      id,
      statusDto,
    );
  }

  /**
   * DELETE PROJECT ROLE
   * DELETE /project-management/project-roles/:id
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete project role (soft delete)',
    description:
      'Soft deletes a project role after validating no blocking dependencies or child roles exist.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role to delete',
    type: String,
  })
  @ApiQuery({
    name: 'reason',
    required: false,
    description: 'Reason for deletion',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete - has dependencies or child roles',
  })
  // @RequirePermissions('project.roles.delete')
  async deleteRole(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reason') reason?: string,
  ): Promise<{ message: string }> {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.id || 'system';

    await this.projectRoleService.deleteRole(tenantId, userId, id, reason);

    return { message: 'Role deleted successfully' };
  }

  /**
   * BULK ACTION ON ROLES
   * POST /project-management/project-roles/bulk-action
   */
  @Post('bulk-action')
  @ApiOperation({
    summary: 'Perform bulk action on multiple roles',
    description:
      'Executes bulk operations (activate, deactivate, delete, approve, deprecate) on multiple roles.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk action completed',
  })
  // @RequirePermissions('project.roles.bulk')
  async bulkAction(
    @Req() req: any,
    @Body(ValidationPipe) bulkDto: BulkProjectRoleActionDto,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.id || 'system';

    return this.projectRoleService.bulkAction(tenantId, userId, bulkDto);
  }

  /**
   * APPROVE/REJECT ROLE
   * POST /project-management/project-roles/approve
   */
  @Post('approve')
  @ApiOperation({
    summary: 'Approve or reject a role',
    description: 'Handles approval workflow for roles in PENDING_APPROVAL status.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role approval decision recorded',
    type: ProjectRole,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Role not in pending approval status',
  })
  // @RequirePermissions('project.roles.approve')
  async approveRole(
    @Req() req: any,
    @Body(ValidationPipe) approvalDto: ProjectRoleApprovalDto,
  ): Promise<ProjectRole> {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.id || 'system';

    return this.projectRoleService.approveRole(tenantId, userId, approvalDto);
  }

  /**
   * ADD SCOPE MAPPING
   * POST /project-management/project-roles/:id/scopes
   */
  @Post(':id/scopes')
  @ApiOperation({
    summary: 'Add scope mapping to role',
    description:
      'Creates organizational scope mapping for a role (GLOBAL, DEPARTMENT, etc.).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Scope mapping created successfully',
  })
  // @RequirePermissions('project.roles.update')
  async addRoleScope(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) scopeDto: ProjectRoleScopeMappingDto,
  ): Promise<any> {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.id || 'system';

    const result = await this.projectRoleService.addRoleScope(
      tenantId,
      userId,
      id,
      scopeDto,
    );

    // Return as array if it's a single object for consistency
    return Array.isArray(result) ? result : result;
  }

  /**
   * ADD HIERARCHY RELATIONSHIP
   * POST /project-management/project-roles/hierarchy
   */
  @Post('hierarchy')
  @ApiOperation({
    summary: 'Create explicit hierarchy relationship',
    description:
      'Creates explicit parent-child relationship between two roles with relationship type (REPORTS_TO, LEADS, SUPERVISES).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hierarchy relationship created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid relationship or circular reference',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Relationship already exists',
  })
  // @RequirePermissions('project.roles.update')
  async addHierarchyRelationship(
    @Req() req: any,
    @Body(ValidationPipe) hierarchyDto: ProjectRoleHierarchyDto,
  ): Promise<any> {
    const tenantId = req.headers['x-tenant-id'];
    const userId = req.user?.id || 'system';

    return this.projectRoleService.addHierarchyRelationship(
      tenantId,
      userId,
      hierarchyDto,
    );
  }

  /**
   * GET VERSION HISTORY
   * GET /project-management/project-roles/:id/versions
   */
  @Get(':id/versions')
  @ApiOperation({
    summary: 'Get version history',
    description: 'Retrieves complete version history with change tracking.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Version history retrieved successfully',
  })
  // @RequirePermissions('project.roles.view')
  async getVersionHistory(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<any[]> {
    const tenantId = req.headers['x-tenant-id'];

    return this.projectRoleService.getVersionHistory(tenantId, id);
  }

  /**
   * GET AUDIT LOGS
   * GET /project-management/project-roles/:id/audit-logs
   */
  @Get(':id/audit-logs')
  @ApiOperation({
    summary: 'Get audit trail',
    description: 'Retrieves complete audit trail with before/after states.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs retrieved successfully',
  })
  // @RequirePermissions('project.roles.view')
  async getAuditLogs(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<any[]> {
    const tenantId = req.headers['x-tenant-id'];

    return this.projectRoleService.getAuditLogs(tenantId, id);
  }

  /**
   * VALIDATE DEPENDENCIES
   * GET /project-management/project-roles/:id/dependencies
   */
  @Get(':id/dependencies')
  @ApiOperation({
    summary: 'Validate role dependencies',
    description:
      'Checks for blocking dependencies preventing deletion and returns dependency details.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the role',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dependencies validated successfully',
  })
  // @RequirePermissions('project.roles.view')
  async validateDependencies(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ canDelete: boolean; dependencies: any[] }> {
    const tenantId = req.headers['x-tenant-id'];

    return this.projectRoleService.validateDependencies(tenantId, id);
  }

  /**
   * GET FULL HIERARCHY TREE
   * GET /project-management/project-roles/tree
   */
  @Get('tree/all')
  @ApiOperation({
    summary: 'Get complete role hierarchy tree',
    description:
      'Retrieves entire role hierarchy as nested tree structure starting from root roles.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Complete hierarchy tree retrieved successfully',
  })
  // @RequirePermissions('project.roles.view')
  async getCompleteHierarchyTree(@Req() req: any): Promise<any> {
    const tenantId = req.headers['x-tenant-id'];

    // Get all root roles (no parent)
    const rootRoles = await this.projectRoleService.getRoles(tenantId, {
      parentRoleId: null as any,
      includeInactive: false,
      page: 1,
      limit: 100,
      sortBy: 'display_order',
      sortOrder: 'ASC',
    });

    // Build tree for each root
    const trees = await Promise.all(
      rootRoles.roles.map((role) =>
        this.projectRoleService.getRoleHierarchy(tenantId, role.id),
      ),
    );

    return trees;
  }
}
