import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectActivityService } from '../services/project-activity.service';
import {
  CreateProjectActivityDto,
  UpdateProjectActivityDto,
  ActivityQueryDto,
  UpdateActivityStatusDto,
  BulkActivityActionDto,
  ValidateActivityDependenciesDto,
  ApproveActivityDto,
  PaginatedActivityResponseDto,
} from '../dto/project-activity.dto';

/**
 * PROJECT ACTIVITY CONTROLLER
 * Enterprise-grade REST API for project activity configuration
 * 
 * Features:
 * - Full CRUD operations with audit trail
 * - Advanced filtering and pagination
 * - Bulk operations support
 * - Dependency validation
 * - Version history tracking
 * - Multi-tenant isolation
 * - RBAC integration (commented out for now)
 */
@ApiTags('Project Management - Activities')
@Controller('api/project-management/activities')
// @UseGuards(JwtAuthGuard, RBACGuard) // Uncomment when auth is integrated
@ApiBearerAuth()
export class ProjectActivityController {
  constructor(
    private readonly projectActivityService: ProjectActivityService,
  ) {}

  // ============================================================================
  // ACTIVITY CRUD OPERATIONS
  // ============================================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new project activity',
    description:
      'Creates a new activity configuration with tenant isolation, scope mappings, and audit trail. Supports workflow approval if configured.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Activity successfully created',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Activity code already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  // @RequirePermission('project.activities.create') // RBAC decorator
  async createActivity(
    @Body() dto: CreateProjectActivityDto,
    @Req() req: any,
  ) {
    // TODO: Extract from authenticated user context
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

    const activity = await this.projectActivityService.createActivity(
      dto,
      tenantId,
      userId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Activity created successfully',
      data: activity,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all activities with filtering and pagination',
    description:
      'Retrieves activities with advanced filtering by status, category, type, scope, and effective date. Supports pagination and sorting.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activities retrieved successfully',
    type: PaginatedActivityResponseDto,
  })
  // @RequirePermission('project.activities.view')
  async getActivities(@Query() query: ActivityQueryDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';

    const result = await this.projectActivityService.getActivities(
      query,
      tenantId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Activities retrieved successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get activity by ID',
    description:
      'Retrieves detailed activity information including scope mappings and dependencies',
  })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Activity not found',
  })
  // @RequirePermission('project.activities.view')
  async getActivityById(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';

    const activity = await this.projectActivityService.getActivityById(
      id,
      tenantId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Activity retrieved successfully',
      data: activity,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update activity configuration',
    description:
      'Updates activity details with version control and complete audit trail. Change reason is tracked.',
  })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Activity not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No changes detected or validation failed',
  })
  // @RequirePermission('project.activities.update')
  async updateActivity(
    @Param('id') id: string,
    @Body() dto: UpdateProjectActivityDto,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

    const activity = await this.projectActivityService.updateActivity(
      id,
      dto,
      tenantId,
      userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Activity updated successfully',
      data: activity,
    };
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update activity status',
    description:
      'Changes activity status with validation of allowed transitions. Tracks deactivation details.',
  })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status transition',
  })
  // @RequirePermission('project.activities.activate')
  async updateActivityStatus(
    @Param('id') id: string,
    @Body() dto: UpdateActivityStatusDto,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

    const activity = await this.projectActivityService.updateActivityStatus(
      id,
      dto,
      tenantId,
      userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Activity status updated successfully',
      data: activity,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete activity (soft delete)',
    description:
      'Soft deletes activity after validating it has no blocking dependencies. Activity remains in database for audit purposes.',
  })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiQuery({
    name: 'reason',
    required: false,
    description: 'Reason for deletion',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Activity has blocking dependencies',
  })
  // @RequirePermission('project.activities.delete')
  async deleteActivity(
    @Param('id') id: string,
    @Query('reason') reason: string,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

    await this.projectActivityService.deleteActivity(
      id,
      tenantId,
      userId,
      reason,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Activity deleted successfully',
    };
  }

  // ============================================================================
  // APPROVAL & GOVERNANCE
  // ============================================================================

  @Post('approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve pending activity',
    description:
      'Approves activity that is in pending approval status. Changes status to active.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity approved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Activity is not in pending approval status',
  })
  // @RequirePermission('project.activities.approve')
  async approveActivity(@Body() dto: ApproveActivityDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

    const activity = await this.projectActivityService.approveActivity(
      dto,
      tenantId,
      userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Activity approved successfully',
      data: activity,
    };
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  @Post('bulk-action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Perform bulk operations on activities',
    description:
      'Execute bulk actions (activate, deactivate, delete) on multiple activities. Returns summary of success and failures.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk operation completed',
  })
  // @RequirePermission('project.activities.bulk-update')
  async bulkAction(@Body() dto: BulkActivityActionDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

    const results = await this.projectActivityService.bulkAction(
      dto,
      tenantId,
      userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: `Bulk operation completed: ${results.success} succeeded, ${results.failed} failed`,
      data: results,
    };
  }

  // ============================================================================
  // DEPENDENCY VALIDATION
  // ============================================================================

  @Get(':id/dependencies')
  @ApiOperation({
    summary: 'Validate activity dependencies',
    description:
      'Checks if activity is referenced by other entities. Returns list of dependencies.',
  })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiQuery({
    name: 'blockingOnly',
    required: false,
    type: Boolean,
    description: 'Return only blocking dependencies',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dependencies retrieved',
  })
  // @RequirePermission('project.activities.view')
  async validateDependencies(
    @Param('id') id: string,
    @Query('blockingOnly') blockingOnly: boolean,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';

    const dependencies =
      await this.projectActivityService.validateDependencies(
        id,
        tenantId,
        blockingOnly,
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Dependencies retrieved successfully',
      data: dependencies,
      count: dependencies.length,
    };
  }

  // ============================================================================
  // VERSION HISTORY
  // ============================================================================

  @Get(':id/versions')
  @ApiOperation({
    summary: 'Get activity version history',
    description:
      'Retrieves complete version history showing all configuration changes over time',
  })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Version history retrieved',
  })
  // @RequirePermission('project.activities.view')
  async getActivityVersions(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';

    const versions = await this.projectActivityService.getActivityVersions(
      id,
      tenantId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Version history retrieved successfully',
      data: versions,
      count: versions.length,
    };
  }

  // ============================================================================
  // AUDIT TRAIL
  // ============================================================================

  @Get(':id/audit-logs')
  @ApiOperation({
    summary: 'Get activity audit trail',
    description:
      'Retrieves comprehensive audit logs showing all changes, who made them, and when',
  })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs retrieved',
  })
  // @RequirePermission('project.activities.view')
  async getActivityAuditLogs(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';

    const auditLogs = await this.projectActivityService.getActivityAuditLogs(
      id,
      tenantId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Audit logs retrieved successfully',
      data: auditLogs,
      count: auditLogs.length,
    };
  }

  // ============================================================================
  // SCOPE MANAGEMENT
  // ============================================================================

  @Post(':id/scopes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add organizational scope to activity',
    description:
      'Adds scope mapping (global, legal entity, business unit, etc.) to activity',
  })
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Scope added successfully',
  })
  // @RequirePermission('project.activities.update')
  async addActivityScope(
    @Param('id') id: string,
    @Body() scopeData: any,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

    const scope = await this.projectActivityService.addActivityScope(
      id,
      scopeData,
      tenantId,
      userId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Scope added successfully',
      data: scope,
    };
  }
}
