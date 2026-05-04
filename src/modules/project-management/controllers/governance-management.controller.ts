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
import { GovernanceManagementService } from '../services/governance-management.service';
import {
  CreateGovernanceRuleDto,
  UpdateGovernanceRuleDto,
  ApplyGovernanceRuleDto,
} from '../dto/project-config.dto';

/**
 * GOVERNANCE MANAGEMENT CONTROLLER
 * REST API for governance rule configuration and application
 * 
 * Endpoints: 12+ operations
 * - Rule CRUD
 * - Rule-to-Type mapping management
 * - Rule validation and violation checking
 */
@ApiTags('Project Configuration - Governance Management')
@Controller('project-management/governance')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
@ApiBearerAuth()
export class GovernanceManagementController {
  constructor(private readonly governanceService: GovernanceManagementService) {}

  // ==========================================
  // GOVERNANCE RULE ENDPOINTS
  // ==========================================

  @Post('rules')
  @ApiOperation({ summary: 'Create new governance rule' })
  @ApiResponse({ status: 201, description: 'Rule created successfully' })
  @ApiResponse({ status: 409, description: 'Rule code already exists' })
  async createRule(
    @Body() dto: CreateGovernanceRuleDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.governanceService.createRule(dto, tenantId, userId);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all governance rules' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'Rules retrieved successfully' })
  async findAllRules(
    @Query('category') category: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (category) {
      return this.governanceService.getRulesByCategory(category, tenantId);
    }
    return this.governanceService.findAllRules(tenantId);
  }

  @Get('rules/:id')
  @ApiOperation({ summary: 'Get governance rule by ID' })
  @ApiParam({ name: 'id', description: 'Rule UUID' })
  @ApiResponse({ status: 200, description: 'Rule retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  async findRuleById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.governanceService.findRuleById(id, tenantId);
  }

  @Put('rules/:id')
  @ApiOperation({ summary: 'Update governance rule' })
  @ApiParam({ name: 'id', description: 'Rule UUID' })
  @ApiResponse({ status: 200, description: 'Rule updated successfully' })
  async updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateGovernanceRuleDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.governanceService.updateRule(id, dto, tenantId, userId);
  }

  @Delete('rules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete governance rule' })
  @ApiParam({ name: 'id', description: 'Rule UUID' })
  @ApiQuery({ name: 'reason', description: 'Deletion reason', required: true })
  @ApiResponse({ status: 204, description: 'Rule deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete - applied to project types' })
  async deleteRule(
    @Param('id') id: string,
    @Query('reason') reason: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    await this.governanceService.deleteRule(id, reason, tenantId, userId);
  }

  // ==========================================
  // RULE VALIDATION ENDPOINTS
  // ==========================================

  @Post('rules/:id/validate')
  @ApiOperation({ summary: 'Validate rule logic against sample data' })
  @ApiParam({ name: 'id', description: 'Rule UUID' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateRule(
    @Param('id') ruleId: string,
    @Body() body: { sampleData: any },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.governanceService.validateRule(ruleId, body.sampleData, tenantId);
  }

  @Post('rules/:id/check-violation')
  @ApiOperation({ summary: 'Check if rule would be violated' })
  @ApiParam({ name: 'id', description: 'Rule UUID' })
  @ApiResponse({ status: 200, description: 'Violation check result' })
  async checkViolation(
    @Param('id') ruleId: string,
    @Body() body: { projectData: any },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.governanceService.checkViolation(ruleId, body.projectData, tenantId);
  }

  // ==========================================
  // RULE-TO-TYPE MAPPING ENDPOINTS
  // ==========================================

  @Post('rules/:ruleId/apply-to-type/:typeId')
  @ApiOperation({ summary: 'Apply governance rule to project type' })
  @ApiParam({ name: 'ruleId', description: 'Rule UUID' })
  @ApiParam({ name: 'typeId', description: 'Project type UUID' })
  @ApiResponse({ status: 201, description: 'Rule applied successfully' })
  async applyRuleToProjectType(
    @Param('ruleId') ruleId: string,
    @Param('typeId') typeId: string,
    @Body() dto: ApplyGovernanceRuleDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    dto.governanceRuleId = ruleId;
    dto.projectTypeId = typeId;
    return this.governanceService.applyRuleToProjectType(dto, tenantId, userId);
  }

  @Get('project-types/:typeId/rules')
  @ApiOperation({ summary: 'Get all governance rules applied to project type' })
  @ApiParam({ name: 'typeId', description: 'Project type UUID' })
  @ApiResponse({ status: 200, description: 'Rules retrieved successfully' })
  async getRulesByProjectType(
    @Param('typeId') projectTypeId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.governanceService.getRulesByProjectType(projectTypeId, tenantId);
  }

  @Delete('rules/mappings/:mappingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove governance rule from project type' })
  @ApiParam({ name: 'mappingId', description: 'Mapping UUID' })
  @ApiResponse({ status: 204, description: 'Mapping removed successfully' })
  async removeRuleMapping(
    @Param('mappingId') mappingId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    await this.governanceService.removeRuleMapping(mappingId, tenantId, userId);
  }
}
