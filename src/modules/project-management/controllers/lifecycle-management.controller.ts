import {
  Controller,
  Get,
  Post,
  Put,
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
import { LifecycleManagementService } from '../services/lifecycle-management.service';
import {
  CreateLifecycleTemplateDto,
  UpdateLifecycleTemplateDto,
  CreateLifecycleStageDto,
} from '../dto/project-config.dto';

/**
 * LIFECYCLE MANAGEMENT CONTROLLER
 * REST API for lifecycle template and stage configuration
 * 
 * Endpoints: 12+ operations
 * - Template CRUD + cloning
 * - Stage CRUD within templates
 */
@ApiTags('Project Configuration - Lifecycle Management')
@Controller('project-management/lifecycle')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
@ApiBearerAuth()
export class LifecycleManagementController {
  constructor(private readonly lifecycleService: LifecycleManagementService) {}

  // ==========================================
  // LIFECYCLE TEMPLATE ENDPOINTS
  // ==========================================

  @Post('templates')
  @ApiOperation({ summary: 'Create new lifecycle template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 409, description: 'Template code already exists' })
  async createTemplate(
    @Body() dto: CreateLifecycleTemplateDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.lifecycleService.createTemplate(dto, tenantId, userId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all lifecycle templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAllTemplates(
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.lifecycleService.findAllTemplates(tenantId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get lifecycle template by ID' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findTemplateById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.lifecycleService.findTemplateById(id, tenantId);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update lifecycle template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateLifecycleTemplateDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.lifecycleService.updateTemplate(id, dto, tenantId, userId);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lifecycle template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiQuery({ name: 'reason', description: 'Deletion reason', required: true })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete - has dependencies' })
  async deleteTemplate(
    @Param('id') id: string,
    @Query('reason') reason: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    await this.lifecycleService.deleteTemplate(id, reason, tenantId, userId);
  }

  @Post('templates/:id/clone')
  @ApiOperation({ summary: 'Clone lifecycle template with all stages' })
  @ApiParam({ name: 'id', description: 'Source template UUID' })
  @ApiResponse({ status: 201, description: 'Template cloned successfully' })
  async cloneTemplate(
    @Param('id') id: string,
    @Body() body: { newCode: string; newName: string },
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.lifecycleService.cloneTemplate(id, body.newCode, body.newName, tenantId, userId);
  }

  // ==========================================
  // LIFECYCLE STAGE ENDPOINTS
  // ==========================================

  @Post('templates/:templateId/stages')
  @ApiOperation({ summary: 'Create lifecycle stage within template' })
  @ApiParam({ name: 'templateId', description: 'Template UUID' })
  @ApiResponse({ status: 201, description: 'Stage created successfully' })
  @ApiResponse({ status: 409, description: 'Stage code already exists in template' })
  async createStage(
    @Param('templateId') templateId: string,
    @Body() dto: CreateLifecycleStageDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    dto.lifecycleTemplateId = templateId;
    return this.lifecycleService.createStage(dto, tenantId, userId);
  }

  @Get('templates/:templateId/stages')
  @ApiOperation({ summary: 'Get all stages for template' })
  @ApiParam({ name: 'templateId', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Stages retrieved successfully' })
  async findStagesByTemplate(
    @Param('templateId') templateId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.lifecycleService.findStagesByTemplate(templateId, tenantId);
  }

  @Get('stages/:id')
  @ApiOperation({ summary: 'Get lifecycle stage by ID' })
  @ApiParam({ name: 'id', description: 'Stage UUID' })
  @ApiResponse({ status: 200, description: 'Stage retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Stage not found' })
  async findStageById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.lifecycleService.findStageById(id, tenantId);
  }

  @Put('stages/:id')
  @ApiOperation({ summary: 'Update lifecycle stage' })
  @ApiParam({ name: 'id', description: 'Stage UUID' })
  @ApiResponse({ status: 200, description: 'Stage updated successfully' })
  async updateStage(
    @Param('id') id: string,
    @Body() dto: Partial<CreateLifecycleStageDto>,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.lifecycleService.updateStage(id, dto, tenantId, userId);
  }

  @Delete('stages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lifecycle stage' })
  @ApiParam({ name: 'id', description: 'Stage UUID' })
  @ApiResponse({ status: 204, description: 'Stage deleted successfully' })
  async deleteStage(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    await this.lifecycleService.deleteStage(id, tenantId, userId);
  }
}
