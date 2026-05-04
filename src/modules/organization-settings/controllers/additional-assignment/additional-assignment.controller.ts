import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AdditionalAssignmentService } from '../../services/additional-assignment/additional-assignment.service';
import {
  CreateAdditionalAssignmentTypeDto,
  UpdateAdditionalAssignmentTypeDto,
  DeactivateAssignmentTypeDto,
  AssignmentTypeImpactDto,
} from '../../dto/additional-assignment.dto';
import { AdditionalAssignmentType } from '../../entities/additional-assignment-type.entity';

/**
 * Controller for Additional Assignment Type Configuration Management
 * 
 * ARCHITECTURE: Configuration-only REST API - No employee transactional data
 * PURPOSE: CRUD operations for additional assignment type policies and rules
 * 
 * @tag Additional Assignments
 */
@ApiTags('Additional Assignment Types Configuration')
@Controller('additional-assignment-types')
export class AdditionalAssignmentController {
  constructor(private readonly assignmentService: AdditionalAssignmentService) {}

  // ==================== CREATE OPERATIONS ====================

  @Post()
  @ApiOperation({ summary: 'Create a new additional assignment type configuration' })
  @ApiResponse({ status: 201, description: 'Assignment type created successfully', type: AdditionalAssignmentType })
  @ApiResponse({ status: 409, description: 'Assignment type code already exists' })
  @ApiResponse({ status: 400, description: 'Invalid configuration data' })
  async createAssignmentType(@Body() dto: CreateAdditionalAssignmentTypeDto): Promise<AdditionalAssignmentType> {
    return await this.assignmentService.createAssignmentType(dto);
  }

  // ==================== READ OPERATIONS ====================

  @Get()
  @ApiOperation({ summary: 'Get all assignment types with optional filters' })
  @ApiQuery({ name: 'tenant_id', required: false, description: 'Filter by tenant ID' })
  @ApiQuery({ name: 'company_id', required: false, description: 'Filter by company ID' })
  @ApiQuery({ name: 'legal_entity_id', required: false, description: 'Filter by legal entity ID' })
  @ApiQuery({ name: 'assignment_category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'List of assignment types', type: [AdditionalAssignmentType] })
  async getAllAssignmentTypes(
    @Query('tenant_id') tenant_id?: string,
    @Query('company_id') company_id?: string,
    @Query('legal_entity_id') legal_entity_id?: string,
    @Query('assignment_category') assignment_category?: string,
    @Query('is_active') is_active?: boolean,
  ): Promise<AdditionalAssignmentType[]> {
    return await this.assignmentService.getAllAssignmentTypes({
      tenant_id,
      company_id,
      legal_entity_id,
      assignment_category,
      is_active,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment type by ID' })
  @ApiParam({ name: 'id', description: 'Assignment type ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Assignment type details', type: AdditionalAssignmentType })
  @ApiResponse({ status: 404, description: 'Assignment type not found' })
  async getAssignmentTypeById(@Param('id') id: string): Promise<AdditionalAssignmentType> {
    return await this.assignmentService.getAssignmentTypeById(id);
  }

  @Get('code/:tenantId/:code')
  @ApiOperation({ summary: 'Get assignment type by code (tenant-scoped)' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID (UUID)' })
  @ApiParam({ name: 'code', description: 'Assignment type code' })
  @ApiResponse({ status: 200, description: 'Assignment type details', type: AdditionalAssignmentType })
  @ApiResponse({ status: 404, description: 'Assignment type not found' })
  async getAssignmentTypeByCode(
    @Param('tenantId') tenantId: string,
    @Param('code') code: string,
  ): Promise<AdditionalAssignmentType> {
    return await this.assignmentService.getAssignmentTypeByCode(tenantId, code);
  }

  // ==================== UPDATE OPERATIONS ====================

  @Put(':id')
  @ApiOperation({ summary: 'Update an assignment type configuration' })
  @ApiParam({ name: 'id', description: 'Assignment type ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Assignment type updated successfully', type: AdditionalAssignmentType })
  @ApiResponse({ status: 404, description: 'Assignment type not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  async updateAssignmentType(
    @Param('id') id: string,
    @Body() dto: UpdateAdditionalAssignmentTypeDto,
  ): Promise<AdditionalAssignmentType> {
    return await this.assignmentService.updateAssignmentType(id, dto);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate an assignment type with governance tracking' })
  @ApiParam({ name: 'id', description: 'Assignment type ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Assignment type deactivated successfully', type: AdditionalAssignmentType })
  @ApiResponse({ status: 404, description: 'Assignment type not found' })
  @ApiResponse({ status: 400, description: 'Assignment type already inactive or validation failed' })
  async deactivateAssignmentType(
    @Param('id') id: string,
    @Body() dto: DeactivateAssignmentTypeDto,
  ): Promise<AdditionalAssignmentType> {
    return await this.assignmentService.deactivateAssignmentType(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an assignment type (hard delete)' })
  @ApiParam({ name: 'id', description: 'Assignment type ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Assignment type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Assignment type not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete system-defined or used assignment type' })
  async deleteAssignmentType(@Param('id') id: string): Promise<void> {
    await this.assignmentService.deleteAssignmentType(id);
  }

  @Post(':id/toggle-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle assignment type active/inactive status' })
  @ApiParam({ name: 'id', description: 'Assignment type ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Status toggled successfully', type: AdditionalAssignmentType })
  @ApiResponse({ status: 404, description: 'Assignment type not found' })
  async toggleStatus(@Param('id') id: string): Promise<AdditionalAssignmentType> {
    return await this.assignmentService.toggleStatus(id);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder assignment types (bulk display_order update)' })
  @ApiResponse({ status: 200, description: 'Assignment types reordered successfully' })
  async reorderAssignmentTypes(@Body('orderedIds') orderedIds: string[]): Promise<{ success: boolean }> {
    await this.assignmentService.reorderAssignmentTypes(orderedIds);
    return { success: true };
  }

  // ==================== QUERY & FILTERING OPERATIONS ====================

  @Get('category/:tenantId/:category')
  @ApiOperation({ summary: 'Get assignment types by category' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID (UUID)' })
  @ApiParam({ name: 'category', description: 'Assignment category' })
  @ApiQuery({ name: 'active_only', required: false, type: Boolean, description: 'Filter active only' })
  @ApiResponse({ status: 200, description: 'List of assignment types by category', type: [AdditionalAssignmentType] })
  async getAssignmentTypesByCategory(
    @Param('tenantId') tenantId: string,
    @Param('category') category: string,
    @Query('active_only') active_only?: boolean,
  ): Promise<AdditionalAssignmentType[]> {
    return await this.assignmentService.getAssignmentTypesByCategory(tenantId, category, active_only ?? true);
  }

  @Get('country/:tenantId/:countryCode')
  @ApiOperation({ summary: 'Get assignment types applicable for a specific country' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID (UUID)' })
  @ApiParam({ name: 'countryCode', description: 'Country code (ISO)' })
  @ApiQuery({ name: 'active_only', required: false, type: Boolean, description: 'Filter active only' })
  @ApiResponse({ status: 200, description: 'List of assignment types for country', type: [AdditionalAssignmentType] })
  async getAssignmentTypesByCountry(
    @Param('tenantId') tenantId: string,
    @Param('countryCode') countryCode: string,
    @Query('active_only') active_only?: boolean,
  ): Promise<AdditionalAssignmentType[]> {
    return await this.assignmentService.getAssignmentTypesByCountry(tenantId, countryCode, active_only ?? true);
  }

  @Get('effective/:tenantId/:effectiveDate')
  @ApiOperation({ summary: 'Get effective assignment types for a specific date' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID (UUID)' })
  @ApiParam({ name: 'effectiveDate', description: 'Effective date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'List of effective assignment types', type: [AdditionalAssignmentType] })
  async getEffectiveAssignmentTypes(
    @Param('tenantId') tenantId: string,
    @Param('effectiveDate') effectiveDate: string,
  ): Promise<AdditionalAssignmentType[]> {
    return await this.assignmentService.getEffectiveAssignmentTypes(tenantId, effectiveDate);
  }

  @Get('approval/:tenantId/:approvalType')
  @ApiOperation({ summary: 'Get assignment types requiring specific approval types' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID (UUID)' })
  @ApiParam({ name: 'approvalType', description: 'Approval type', enum: ['dual', 'legal', 'executive'] })
  @ApiResponse({
    status: 200,
    description: 'List of assignment types requiring approval',
    type: [AdditionalAssignmentType],
  })
  async getAssignmentTypesRequiringApproval(
    @Param('tenantId') tenantId: string,
    @Param('approvalType') approvalType: 'dual' | 'legal' | 'executive',
  ): Promise<AdditionalAssignmentType[]> {
    return await this.assignmentService.getAssignmentTypesRequiringApproval(tenantId, approvalType);
  }

  // ==================== ANALYTICS & STATISTICS ====================

  @Get('analytics/statistics/:tenantId')
  @ApiOperation({ summary: 'Get assignment type usage statistics for tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Assignment type statistics' })
  async getAssignmentTypeStatistics(@Param('tenantId') tenantId: string): Promise<any> {
    return await this.assignmentService.getAssignmentTypeStatistics(tenantId);
  }

  @Get('analytics/most-used/:tenantId')
  @ApiOperation({ summary: 'Get most used assignment types' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID (UUID)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiResponse({ status: 200, description: 'Most used assignment types', type: [AdditionalAssignmentType] })
  async getMostUsedAssignmentTypes(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: number,
  ): Promise<AdditionalAssignmentType[]> {
    return await this.assignmentService.getMostUsedAssignmentTypes(tenantId, limit || 10);
  }

  @Get(':id/validate')
  @ApiOperation({ summary: 'Validate assignment type configuration' })
  @ApiParam({ name: 'id', description: 'Assignment type ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Validation results' })
  async validateConfiguration(@Param('id') id: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return await this.assignmentService.validateConfiguration(id);
  }

  @Get(':id/impact')
  @ApiOperation({ summary: 'Get deactivation impact analysis' })
  @ApiParam({ name: 'id', description: 'Assignment type ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Impact analysis', type: AssignmentTypeImpactDto })
  async getDeactivationImpact(@Param('id') id: string): Promise<AssignmentTypeImpactDto> {
    return await this.assignmentService.getDeactivationImpact(id);
  }

  // ==================== BULK OPERATIONS ====================

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create assignment types from templates' })
  @ApiResponse({ status: 201, description: 'Assignment types created', type: [AdditionalAssignmentType] })
  async bulkCreateAssignmentTypes(
    @Body() dtos: CreateAdditionalAssignmentTypeDto[],
  ): Promise<AdditionalAssignmentType[]> {
    return await this.assignmentService.bulkCreateAssignmentTypes(dtos);
  }

  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clone an assignment type to another tenant/company' })
  @ApiParam({ name: 'id', description: 'Source assignment type ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Assignment type cloned successfully', type: AdditionalAssignmentType })
  async cloneAssignmentType(
    @Param('id') id: string,
    @Body('target_tenant_id') target_tenant_id: string,
    @Body('target_company_id') target_company_id?: string,
  ): Promise<AdditionalAssignmentType> {
    return await this.assignmentService.cloneAssignmentType(id, target_tenant_id, target_company_id);
  }

  // ==================== HELPER ENDPOINTS ====================

  @Get('config/summary/:tenantId')
  @ApiOperation({ summary: 'Get configuration summary for dashboard' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Configuration summary' })
  async getConfigurationSummary(@Param('tenantId') tenantId: string): Promise<any> {
    const statistics = await this.assignmentService.getAssignmentTypeStatistics(tenantId);
    const mostUsed = await this.assignmentService.getMostUsedAssignmentTypes(tenantId, 5);

    return {
      statistics,
      topAssignmentTypes: mostUsed.map((at) => ({
        id: at.id,
        code: at.assignment_type_code,
        name: at.assignment_type_name,
        category: at.assignment_category,
        usage: at.total_assignments_count,
        active_count: at.active_assignments_count,
      })),
    };
  }

  @Get('config/categories/:tenantId')
  @ApiOperation({ summary: 'Get list of available assignment categories' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID (UUID)' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getAvailableCategories(@Param('tenantId') tenantId: string): Promise<string[]> {
    const assignmentTypes = await this.assignmentService.getAllAssignmentTypes({ tenant_id: tenantId });
    const categories = [...new Set(assignmentTypes.map((at) => at.assignment_category).filter(Boolean))];
    return categories;
  }
}
