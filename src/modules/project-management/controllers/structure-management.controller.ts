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
import { StructureManagementService } from '../services/structure-management.service';
import {
  CreateStructureTemplateDto,
  CreateStructureLevelDto,
} from '../dto/project-config.dto';

/**
 * STRUCTURE MANAGEMENT CONTROLLER
 * REST API for project structure template and level configuration
 * 
 * Endpoints: 13+ operations
 * - Template CRUD + validation + cloning
 * - Level CRUD within templates
 * - WBS code generation
 */
@ApiTags('Project Configuration - Structure Management')
@Controller('project-management/structure')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
@ApiBearerAuth()
export class StructureManagementController {
  constructor(private readonly structureService: StructureManagementService) {}

  // ==========================================
  // STRUCTURE TEMPLATE ENDPOINTS
  // ==========================================

  @Post('templates')
  @ApiOperation({ summary: 'Create new structure template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 409, description: 'Template code already exists' })
  async createTemplate(
    @Body() dto: CreateStructureTemplateDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.structureService.createTemplate(dto, tenantId, userId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all structure templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAllTemplates(
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.structureService.findAllTemplates(tenantId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get structure template by ID' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findTemplateById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.structureService.findTemplateById(id, tenantId);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update structure template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() body: { updates: Partial<CreateStructureTemplateDto>; changeReason: string },
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.structureService.updateTemplate(id, body.updates, body.changeReason, tenantId, userId);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete structure template' })
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
    await this.structureService.deleteTemplate(id, reason, tenantId, userId);
  }

  @Post('templates/:id/clone')
  @ApiOperation({ summary: 'Clone structure template with all levels' })
  @ApiParam({ name: 'id', description: 'Source template UUID' })
  @ApiResponse({ status: 201, description: 'Template cloned successfully' })
  async cloneTemplate(
    @Param('id') id: string,
    @Body() body: { newCode: string; newName: string },
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.structureService.cloneTemplate(id, body.newCode, body.newName, tenantId, userId);
  }

  @Post('templates/:id/validate')
  @ApiOperation({ summary: 'Validate structure template configuration' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateTemplate(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.structureService.validateTemplate(id, tenantId);
  }

  // ==========================================
  // STRUCTURE LEVEL ENDPOINTS
  // ==========================================

  @Post('templates/:templateId/levels')
  @ApiOperation({ summary: 'Create structure level within template' })
  @ApiParam({ name: 'templateId', description: 'Template UUID' })
  @ApiResponse({ status: 201, description: 'Level created successfully' })
  @ApiResponse({ status: 409, description: 'Level code already exists in template' })
  async createLevel(
    @Param('templateId') templateId: string,
    @Body() dto: CreateStructureLevelDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    dto.structureTemplateId = templateId;
    return this.structureService.createLevel(dto, tenantId, userId);
  }

  @Get('templates/:templateId/levels')
  @ApiOperation({ summary: 'Get all levels for template' })
  @ApiParam({ name: 'templateId', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Levels retrieved successfully' })
  async findLevelsByTemplate(
    @Param('templateId') templateId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.structureService.findLevelsByTemplate(templateId, tenantId);
  }

  @Get('levels/:id')
  @ApiOperation({ summary: 'Get structure level by ID' })
  @ApiParam({ name: 'id', description: 'Level UUID' })
  @ApiResponse({ status: 200, description: 'Level retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Level not found' })
  async findLevelById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.structureService.findLevelById(id, tenantId);
  }

  @Put('levels/:id')
  @ApiOperation({ summary: 'Update structure level' })
  @ApiParam({ name: 'id', description: 'Level UUID' })
  @ApiResponse({ status: 200, description: 'Level updated successfully' })
  async updateLevel(
    @Param('id') id: string,
    @Body() dto: Partial<CreateStructureLevelDto>,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.structureService.updateLevel(id, dto, tenantId, userId);
  }

  @Delete('levels/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete structure level' })
  @ApiParam({ name: 'id', description: 'Level UUID' })
  @ApiResponse({ status: 204, description: 'Level deleted successfully' })
  async deleteLevel(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    await this.structureService.deleteLevel(id, tenantId, userId);
  }

  // ==========================================
  // WBS CODE GENERATION ENDPOINT
  // ==========================================

  @Post('wbs-code/generate')
  @ApiOperation({ summary: 'Generate WBS code for structure level' })
  @ApiResponse({ status: 200, description: 'WBS code generated successfully' })
  async generateWbsCode(
    @Body() body: { templateId: string; levelCode: string; parentWbs: string; itemNumber: number },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return {
      wbsCode: await this.structureService.generateWbsCode(
        body.templateId,
        body.levelCode,
        body.parentWbs,
        body.itemNumber,
        tenantId,
      ),
    };
  }
}
