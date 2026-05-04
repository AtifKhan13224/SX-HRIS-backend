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
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectTypeService } from '../services/project-type.service';
import {
  CreateProjectTypeDto,
  UpdateProjectTypeDto,
  ProjectTypeQueryDto,
  BulkProjectTypeActionDto,
  CreateResourceAllocationSettingsDto,
  CreateBillingCostSettingsDto,
  UpdateStatusDto,
} from '../dto/project-config.dto';

/**
 * PROJECT TYPE CONTROLLER
 * REST API for project type configuration management
 * 
 * Endpoints: 17+ operations
 */
@ApiTags('Project Configuration - Project Types')
@Controller('project-management/project-types')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
@ApiBearerAuth()
export class ProjectTypeController {
  constructor(private readonly projectTypeService: ProjectTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create new project type' })
  @ApiResponse({ status: 201, description: 'Project type created successfully' })
  @ApiResponse({ status: 409, description: 'Project type code already exists' })
  async create(
    @Body() dto: CreateProjectTypeDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.projectTypeService.create(dto, tenantId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all project types with filters' })
  @ApiResponse({ status: 200, description: 'Project types retrieved successfully' })
  async findAll(
    @Query() query: ProjectTypeQueryDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.projectTypeService.findAll(query, tenantId);
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get project type hierarchy tree' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved successfully' })
  async getHierarchy(
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.projectTypeService.getHierarchy(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project type by ID' })
  @ApiParam({ name: 'id', description: 'Project type UUID' })
  @ApiResponse({ status: 200, description: 'Project type retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project type not found' })
  async findById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.projectTypeService.findById(id, tenantId);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get direct child project types' })
  @ApiParam({ name: 'id', description: 'Parent project type UUID' })
  @ApiResponse({ status: 200, description: 'Child types retrieved successfully' })
  async getChildren(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.projectTypeService.getChildren(id, tenantId);
  }

  @Get(':id/ancestors')
  @ApiOperation({ summary: 'Get all ancestor project types' })
  @ApiParam({ name: 'id', description: 'Project type UUID' })
  @ApiResponse({ status: 200, description: 'Ancestors retrieved successfully' })
  async getAncestors(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.projectTypeService.getAncestors(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project type' })
  @ApiParam({ name: 'id', description: 'Project type UUID' })
  @ApiResponse({ status: 200, description: 'Project type updated successfully' })
  @ApiResponse({ status: 404, description: 'Project type not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectTypeDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.projectTypeService.update(id, dto, tenantId, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update project type status' })
  @ApiParam({ name: 'id', description: 'Project type UUID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.projectTypeService.updateStatus(id, dto.status, dto.changeReason, tenantId, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete project type' })
  @ApiParam({ name: 'id', description: 'Project type UUID' })
  @ApiQuery({ name: 'reason', description: 'Deletion reason', required: true })
  @ApiResponse({ status: 204, description: 'Project type deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete - has dependencies' })
  async delete(
    @Param('id') id: string,
    @Query('reason') reason: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    await this.projectTypeService.delete(id, reason, tenantId, userId);
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk action on multiple project types' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulkAction(
    @Body() dto: BulkProjectTypeActionDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.projectTypeService.bulkAction(dto, tenantId, userId);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone existing project type' })
  @ApiParam({ name: 'id', description: 'Source project type UUID' })
  @ApiResponse({ status: 201, description: 'Project type clone successfully' })
  async clone(
    @Param('id') id: string,
    @Body() body: { newCode: string; newName: string },
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.projectTypeService.clone(id, body.newCode, body.newName, tenantId, userId);
  }

  // ==========================================
  // RESOURCE ALLOCATION SETTINGS ENDPOINTS
  // ==========================================

  @Post(':id/resource-allocation-settings')
  @ApiOperation({ summary: 'Create resource allocation settings for project type' })
  @ApiParam({ name: 'id', description: 'Project type UUID' })
  @ApiResponse({ status: 201, description: 'Settings created successfully' })
  async createResourceAllocationSettings(
    @Param('id') projectTypeId: string,
    @Body() dto: CreateResourceAllocationSettingsDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    dto.projectTypeId = projectTypeId;
    return this.projectTypeService.createResourceAllocationSettings(dto, tenantId, userId);
  }

  // ==========================================
  // BILLING / COST SETTINGS ENDPOINTS
  // ==========================================

  @Post(':id/billing-cost-settings')
  @ApiOperation({ summary: 'Create billing/cost settings for project type' })
  @ApiParam({ name: 'id', description: 'Project type UUID' })
  @ApiResponse({ status: 201, description: 'Settings created successfully' })
  async createBillingCostSettings(
    @Param('id') projectTypeId: string,
    @Body() dto: CreateBillingCostSettingsDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    dto.projectTypeId = projectTypeId;
    return this.projectTypeService.createBillingCostSettings(dto, tenantId, userId);
  }
}
