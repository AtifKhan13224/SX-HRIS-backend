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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProjectSubActivityService } from '../services/project-sub-activity.service';
import {
  CreateProjectSubActivityDto,
  UpdateProjectSubActivityDto,
  SubActivityQueryDto,
  BulkSubActivityActionDto,
  SubActivityScopeMappingDto,
  SubActivityApprovalDto,
} from '../dto/project-sub-activity.dto';
import { ActivityStatus } from '../entities/project-activity.entity';
import { Request } from 'express';

@ApiTags('Project Sub-Activities')
@Controller('project-management/sub-activities')
export class ProjectSubActivityController {
  constructor(private readonly subActivityService: ProjectSubActivityService) {}

  /**
   * CREATE SUB-ACTIVITY
   * POST /api/project-management/sub-activities
   */
  @Post()
  @ApiOperation({ summary: 'Create new sub-activity', description: 'Creates a new sub-activity under a parent activity' })
  @ApiResponse({ status: 201, description: 'Sub-Activity created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or parent activity validation failed' })
  @ApiResponse({ status: 409, description: 'Sub-Activity code already exists' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.create')
  async create(@Body() dto: CreateProjectSubActivityDto, @Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const userId = (req as any).user?.id || 'system';
    return this.subActivityService.createSubActivity(dto, tenantId, userId);
  }

  /**
   * GET ALL SUB-ACTIVITIES WITH FILTERING
   * GET /api/project-management/sub-activities
   */
  @Get()
  @ApiOperation({ summary: 'Get all sub-activities', description: 'Retrieve sub-activities with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Sub-Activities retrieved successfully' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.view')
  async findAll(@Query() query: SubActivityQueryDto, @Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.subActivityService.getSubActivities(query, tenantId);
  }

  /**
   * GET SUB-ACTIVITY BY ID
   * GET /api/project-management/sub-activities/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get sub-activity by ID', description: 'Retrieve a single sub-activity with relations' })
  @ApiParam({ name: 'id', description: 'Sub-Activity UUID' })
  @ApiResponse({ status: 200, description: 'Sub-Activity found' })
  @ApiResponse({ status: 404, description: 'Sub-Activity not found' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.view')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.subActivityService.getSubActivityById(id, tenantId);
  }

  /**
   * GET SUB-ACTIVITIES BY PARENT ACTIVITY
   * GET /api/project-management/sub-activities/parent/:parentId
   */
  @Get('parent/:parentId')
  @ApiOperation({ summary: 'Get sub-activities by parent activity', description: 'Retrieve all sub-activities for a parent activity' })
  @ApiParam({ name: 'parentId', description: 'Parent Activity UUID' })
  @ApiQuery({ name: 'status', enum: ActivityStatus, required: false, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'Sub-Activities retrieved successfully' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.view')
  async findByParent(
    @Param('parentId') parentId: string,
    @Query('status') status: ActivityStatus,
    @Req() req: Request,
  ) {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.subActivityService.getSubActivitiesByParent(parentId, tenantId, status);
  }

  /**
   * UPDATE SUB-ACTIVITY
   * PUT /api/project-management/sub-activities/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update sub-activity', description: 'Update sub-activity configuration with version control' })
  @ApiParam({ name: 'id', description: 'Sub-Activity UUID' })
  @ApiResponse({ status: 200, description: 'Sub-Activity updated successfully' })
  @ApiResponse({ status: 404, description: 'Sub-Activity not found' })
  @ApiResponse({ status: 409, description: 'Code conflict' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.update')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectSubActivityDto, @Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const userId = (req as any).user?.id || 'system';
    return this.subActivityService.updateSubActivity(id, dto, tenantId, userId);
  }

  /**
   * UPDATE SUB-ACTIVITY STATUS
   * PATCH /api/project-management/sub-activities/:id/status
   */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update sub-activity status', description: 'Activate, deactivate, or change status' })
  @ApiParam({ name: 'id', description: 'Sub-Activity UUID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Sub-Activity not found' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.activate', 'project.subactivities.deactivate')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ActivityStatus; reason: string },
    @Req() req: Request,
  ) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const userId = (req as any).user?.id || 'system';
    return this.subActivityService.updateSubActivityStatus(id, body.status, body.reason, tenantId, userId);
  }

  /**
   * DELETE SUB-ACTIVITY (SOFT DELETE)
   * DELETE /api/project-management/sub-activities/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete sub-activity', description: 'Soft delete sub-activity with dependency validation' })
  @ApiParam({ name: 'id', description: 'Sub-Activity UUID' })
  @ApiResponse({ status: 204, description: 'Sub-Activity deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete - has blocking dependencies' })
  @ApiResponse({ status: 404, description: 'Sub-Activity not found' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.delete')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const userId = (req as any).user?.id || 'system';
    return this.subActivityService.deleteSubActivity(id, tenantId, userId);
  }

  /**
   * BULK ACTION ON SUB-ACTIVITIES
   * POST /api/project-management/sub-activities/bulk-action
   */
  @Post('bulk-action')
  @ApiOperation({ summary: 'Bulk action on sub-activities', description: 'Perform bulk activate, deactivate, or delete' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.bulk')
  async bulkAction(@Body() dto: BulkSubActivityActionDto, @Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const userId = (req as any).user?.id || 'system';
    return this.subActivityService.bulkAction(dto, tenantId, userId);
  }

  /**
   * APPROVE SUB-ACTIVITY
   * POST /api/project-management/sub-activities/approve
   */
  @Post('approve')
  @ApiOperation({ summary: 'Approve/reject sub-activity', description: 'Approval workflow for sub-activities' })
  @ApiResponse({ status: 200, description: 'Approval processed successfully' })
  @ApiResponse({ status: 404, description: 'Sub-Activity not found' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.approve')
  async approve(@Body() dto: SubActivityApprovalDto, @Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const userId = (req as any).user?.id || 'system';
    return this.subActivityService.approveSubActivity(dto, tenantId, userId);
  }

  /**
   * GET VERSION HISTORY
   * GET /api/project-management/sub-activities/:id/versions
   */
  @Get(':id/versions')
  @ApiOperation({ summary: 'Get version history', description: 'Retrieve complete version history for sub-activity' })
  @ApiParam({ name: 'id', description: 'Sub-Activity UUID' })
  @ApiResponse({ status: 200, description: 'Version history retrieved' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.view')
  async getVersions(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.subActivityService.getVersionHistory(id, tenantId);
  }

  /**
   * GET AUDIT LOGS
   * GET /api/project-management/sub-activities/:id/audit-logs
   */
  @Get(':id/audit-logs')
  @ApiOperation({ summary: 'Get audit logs', description: 'Retrieve complete audit trail for sub-activity' })
  @ApiParam({ name: 'id', description: 'Sub-Activity UUID' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.view')
  async getAuditLogs(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.subActivityService.getAuditLogs(id, tenantId);
  }

  /**
   * VALIDATE DEPENDENCIES
   * GET /api/project-management/sub-activities/:id/dependencies
   */
  @Get(':id/dependencies')
  @ApiOperation({ summary: 'Validate dependencies', description: 'Check if sub-activity has blocking dependencies' })
  @ApiParam({ name: 'id', description: 'Sub-Activity UUID' })
  @ApiResponse({ status: 200, description: 'Dependency check result' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.view')
  async validateDependencies(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const hasBlockingDeps = await this.subActivityService.validateDependencies(id, tenantId);
    return {
      subActivityId: id,
      hasBlockingDependencies: hasBlockingDeps,
      canDelete: !hasBlockingDeps,
    };
  }

  /**
   * ADD SCOPE MAPPING
   * POST /api/project-management/sub-activities/:id/scopes
   */
  @Post(':id/scopes')
  @ApiOperation({ summary: 'Add scope mapping', description: 'Add organizational scope to sub-activity' })
  @ApiParam({ name: 'id', description: 'Sub-Activity UUID' })
  @ApiResponse({ status: 201, description: 'Scope mapping added successfully' })
  // @UseGuards(JwtAuthGuard)
  // @RequirePermissions('project.subactivities.update')
  async addScope(
    @Param('id') id: string,
    @Body() dto: SubActivityScopeMappingDto,
    @Req() req: Request,
  ) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const userId = (req as any).user?.id || 'system';
    return this.subActivityService.addSubActivityScope(id, dto, tenantId, userId);
  }
}
