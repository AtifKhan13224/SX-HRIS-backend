import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SeparationReasonService } from '../../services/separation-reason/separation-reason.service';
import {
  CreateSeparationReasonCategoryDto,
  UpdateSeparationReasonCategoryDto,
  CreateSeparationReasonDto,
  UpdateSeparationReasonDto,
  DeactivateSeparationReasonDto,
} from '../../dto/separation-reason.dto';

@ApiTags('Separation Reasons Configuration')
@Controller('separation-reasons')
export class SeparationReasonController {
  constructor(private readonly separationReasonService: SeparationReasonService) {}

  // ==================== CATEGORY ENDPOINTS ====================

  @Post('categories')
  @ApiOperation({ summary: 'Create separation reason category (Configuration Only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category code already exists' })
  async createCategory(@Body() dto: CreateSeparationReasonCategoryDto) {
    const category = await this.separationReasonService.createCategory(dto);
    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all separation reason categories' })
  @ApiQuery({ name: 'tenant_id', required: false, description: 'Filter by tenant ID' })
  @ApiQuery({ name: 'company_id', required: false, description: 'Filter by company ID' })
  @ApiQuery({ name: 'active_only', required: false, type: Boolean, description: 'Get only active categories' })
  async getAllCategories(
    @Query('tenant_id') tenantId?: string,
    @Query('company_id') companyId?: string,
    @Query('active_only') activeOnly?: boolean,
  ) {
    const categories = await this.separationReasonService.getAllCategories(tenantId, companyId, activeOnly === true);
    return {
      success: true,
      data: categories,
      count: categories.length,
    };
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async getCategoryById(@Param('id') id: string) {
    const category = await this.separationReasonService.getCategoryById(id);
    return {
      success: true,
      data: category,
    };
  }

  @Get('categories/code/:categoryCode')
  @ApiOperation({ summary: 'Get category by code' })
  @ApiParam({ name: 'categoryCode', description: 'Category code' })
  @ApiQuery({ name: 'tenant_id', required: true, description: 'Tenant ID' })
  async getCategoryByCode(@Param('categoryCode') categoryCode: string, @Query('tenant_id') tenantId: string) {
    const category = await this.separationReasonService.getCategoryByCode(categoryCode, tenantId);
    return {
      success: true,
      data: category,
    };
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateSeparationReasonCategoryDto) {
    const category = await this.separationReasonService.updateCategory(id, dto);
    return {
      success: true,
      message: 'Category updated successfully',
      data: category,
    };
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category (soft delete)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async deleteCategory(@Param('id') id: string) {
    await this.separationReasonService.deleteCategory(id);
  }

  @Post('categories/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle category active/inactive status' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async toggleCategoryStatus(@Param('id') id: string) {
    const category = await this.separationReasonService.toggleCategoryStatus(id);
    return {
      success: true,
      message: `Category ${category.is_active ? 'activated' : 'deactivated'} successfully`,
      data: category,
    };
  }

  @Post('categories/reorder')
  @ApiOperation({ summary: 'Reorder categories (drag & drop support)' })
  async reorderCategories(@Body() orders: { id: string; display_order: number }[]) {
    await this.separationReasonService.reorderCategories(orders);
    return {
      success: true,
      message: 'Categories reordered successfully',
    };
  }

  @Get('categories/:id/statistics')
  @ApiOperation({ summary: 'Get category usage statistics' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async getCategoryStatistics(@Param('id') id: string) {
    const category = await this.separationReasonService.getCategoryById(id);
    return {
      success: true,
      data: {
        category_id: category.id,
        category_name: category.category_name,
        total_reasons: category.reasons?.length || 0,
        active_reasons: category.reasons?.filter((r) => r.is_active).length || 0,
      },
    };
  }

  // ==================== REASON ENDPOINTS ====================

  @Post('reasons')
  @ApiOperation({ summary: 'Create separation reason (Configuration Only - No Employee Data)' })
  @ApiResponse({ status: 201, description: 'Reason created successfully' })
  @ApiResponse({ status: 409, description: 'Reason code already exists' })
  async createReason(@Body() dto: CreateSeparationReasonDto) {
    const reason = await this.separationReasonService.createReason(dto);
    return {
      success: true,
      message: 'Separation reason created successfully',
      data: reason,
    };
  }

  @Get('reasons')
  @ApiOperation({ summary: 'Get all separation reasons with filters' })
  @ApiQuery({ name: 'tenant_id', required: false, description: 'Filter by tenant ID' })
  @ApiQuery({ name: 'company_id', required: false, description: 'Filter by company ID' })
  @ApiQuery({ name: 'category_id', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'active_only', required: false, type: Boolean, description: 'Get only active reasons' })
  @ApiQuery({ name: 'include_category', required: false, type: Boolean, description: 'Include category details' })
  async getAllReasons(
    @Query('tenant_id') tenantId?: string,
    @Query('company_id') companyId?: string,
    @Query('category_id') categoryId?: string,
    @Query('active_only') activeOnly?: boolean,
    @Query('include_category') includeCategory?: boolean,
  ) {
    const reasons = await this.separationReasonService.getAllReasons(tenantId, companyId, categoryId, activeOnly === true, includeCategory !== false);
    return {
      success: true,
      data: reasons,
      count: reasons.length,
    };
  }

  @Get('reasons/:id')
  @ApiOperation({ summary: 'Get reason by ID' })
  @ApiParam({ name: 'id', description: 'Reason ID' })
  async getReasonById(@Param('id') id: string) {
    const reason = await this.separationReasonService.getReasonById(id);
    return {
      success: true,
      data: reason,
    };
  }

  @Get('reasons/code/:reasonCode')
  @ApiOperation({ summary: 'Get reason by code' })
  @ApiParam({ name: 'reasonCode', description: 'Reason code' })
  @ApiQuery({ name: 'tenant_id', required: true, description: 'Tenant ID' })
  async getReasonByCode(@Param('reasonCode') reasonCode: string, @Query('tenant_id') tenantId: string) {
    const reason = await this.separationReasonService.getReasonByCode(reasonCode, tenantId);
    return {
      success: true,
      data: reason,
    };
  }

  @Put('reasons/:id')
  @ApiOperation({ summary: 'Update separation reason' })
  @ApiParam({ name: 'id', description: 'Reason ID' })
  async updateReason(@Param('id') id: string, @Body() dto: UpdateSeparationReasonDto) {
    const reason = await this.separationReasonService.updateReason(id, dto);
    return {
      success: true,
      message: 'Reason updated successfully',
      data: reason,
    };
  }

  @Post('reasons/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate reason with governance tracking' })
  @ApiParam({ name: 'id', description: 'Reason ID' })
  async deactivateReason(@Param('id') id: string, @Body() dto: DeactivateSeparationReasonDto) {
    const reason = await this.separationReasonService.deactivateReason(id, dto);
    return {
      success: true,
      message: 'Reason deactivated successfully',
      data: reason,
    };
  }

  @Delete('reasons/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete reason (hard delete - use cautiously)' })
  @ApiParam({ name: 'id', description: 'Reason ID' })
  async deleteReason(@Param('id') id: string) {
    await this.separationReasonService.deleteReason(id);
  }

  @Post('reasons/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle reason active/inactive status' })
  @ApiParam({ name: 'id', description: 'Reason ID' })
  async toggleReasonStatus(@Param('id') id: string) {
    const reason = await this.separationReasonService.toggleReasonStatus(id);
    return {
      success: true,
      message: `Reason ${reason.is_active ? 'activated' : 'deactivated'} successfully`,
      data: reason,
    };
  }

  @Post('reasons/reorder')
  @ApiOperation({ summary: 'Reorder reasons within category' })
  async reorderReasons(@Body() orders: { id: string; display_order: number }[]) {
    await this.separationReasonService.reorderReasons(orders);
    return {
      success: true,
      message: 'Reasons reordered successfully',
    };
  }

  @Get('reasons/:id/validate')
  @ApiOperation({ summary: 'Validate reason configuration' })
  @ApiParam({ name: 'id', description: 'Reason ID' })
  async validateReason(@Param('id') id: string) {
    const validation = await this.separationReasonService.validateReasonConfiguration(id);
    return {
      success: true,
      data: validation,
    };
  }

  @Get('reasons/:id/impact')
  @ApiOperation({ summary: 'Get deactivation impact preview' })
  @ApiParam({ name: 'id', description: 'Reason ID' })
  async getDeactivationImpact(@Param('id') id: string) {
    const impact = await this.separationReasonService.getDeactivationImpact(id);
    return {
      success: true,
      data: impact,
    };
  }

  // ==================== QUERY & FILTERING ENDPOINTS ====================

  @Get('reasons/visibility/:userRole')
  @ApiOperation({ summary: 'Get reasons by user role visibility (employee/manager/hr)' })
  @ApiParam({ name: 'userRole', enum: ['employee', 'manager', 'hr'], description: 'User role' })
  @ApiQuery({ name: 'tenant_id', required: true, description: 'Tenant ID' })
  @ApiQuery({ name: 'company_id', required: false, description: 'Company ID' })
  async getReasonsByVisibility(
    @Param('userRole') userRole: 'employee' | 'manager' | 'hr',
    @Query('tenant_id') tenantId: string,
    @Query('company_id') companyId?: string,
  ) {
    const reasons = await this.separationReasonService.getReasonsByVisibility(tenantId, userRole, companyId);
    return {
      success: true,
      data: reasons,
      count: reasons.length,
    };
  }

  @Get('reasons/classification/:classification')
  @ApiOperation({ summary: 'Get reasons by classification (Voluntary/Involuntary/Mutual)' })
  @ApiParam({ name: 'classification', description: 'Classification type' })
  @ApiQuery({ name: 'tenant_id', required: true, description: 'Tenant ID' })
  async getReasonsByClassification(@Param('classification') classification: string, @Query('tenant_id') tenantId: string) {
    const reasons = await this.separationReasonService.getReasonsByClassification(tenantId, classification);
    return {
      success: true,
      data: reasons,
      count: reasons.length,
    };
  }

  @Get('reasons/country/:countryCode')
  @ApiOperation({ summary: 'Get reasons applicable for specific country' })
  @ApiParam({ name: 'countryCode', description: 'ISO 3166-1 alpha-2 country code (e.g., AE, SA)' })
  @ApiQuery({ name: 'tenant_id', required: true, description: 'Tenant ID' })
  async getReasonsByCountry(@Param('countryCode') countryCode: string, @Query('tenant_id') tenantId: string) {
    const reasons = await this.separationReasonService.getReasonsByCountry(tenantId, countryCode);
    return {
      success: true,
      data: reasons,
      count: reasons.length,
    };
  }

  @Get('reasons/effective/:effectiveDate')
  @ApiOperation({ summary: 'Get reasons effective on specific date' })
  @ApiParam({ name: 'effectiveDate', description: 'Date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'tenant_id', required: true, description: 'Tenant ID' })
  async getEffectiveReasons(@Param('effectiveDate') effectiveDate: string, @Query('tenant_id') tenantId: string) {
    const reasons = await this.separationReasonService.getEffectiveReasons(tenantId, effectiveDate);
    return {
      success: true,
      data: reasons,
      count: reasons.length,
    };
  }

  // ==================== ANALYTICS & REPORTING ====================

  @Get('analytics/category-statistics')
  @ApiOperation({ summary: 'Get category-level analytics' })
  @ApiQuery({ name: 'tenant_id', required: true, description: 'Tenant ID' })
  async getCategoryStatisticsReport(@Query('tenant_id') tenantId: string) {
    const stats = await this.separationReasonService.getCategoryStatistics(tenantId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('analytics/most-used')
  @ApiOperation({ summary: 'Get most frequently used separation reasons' })
  @ApiQuery({ name: 'tenant_id', required: true, description: 'Tenant ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results (default: 10)' })
  async getMostUsedReasons(@Query('tenant_id') tenantId: string, @Query('limit') limit?: number) {
    const reasons = await this.separationReasonService.getMostUsedReasons(tenantId, limit ? parseInt(limit.toString()) : 10);
    return {
      success: true,
      data: reasons,
      count: reasons.length,
    };
  }

  // ==================== BULK OPERATIONS ====================

  @Post('reasons/bulk')
  @ApiOperation({ summary: 'Bulk create reasons from template' })
  async bulkCreateReasons(@Body() reasons: CreateSeparationReasonDto[]) {
    const created = await this.separationReasonService.bulkCreateReasons(reasons);
    return {
      success: true,
      message: `${created.length} of ${reasons.length} reasons created successfully`,
      data: created,
    };
  }

  @Post('reasons/:id/clone')
  @ApiOperation({ summary: 'Clone reason for different tenant/company' })
  @ApiParam({ name: 'id', description: 'Source reason ID' })
  async cloneReason(
    @Param('id') id: string,
    @Body() body: { new_tenant_id: string; new_company_id?: string; new_code?: string },
  ) {
    const cloned = await this.separationReasonService.cloneReason(id, body.new_tenant_id, body.new_company_id, body.new_code);
    return {
      success: true,
      message: 'Reason cloned successfully',
      data: cloned,
    };
  }

  // ==================== HELPER ENDPOINTS ====================

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get complete category → reason hierarchy' })
  @ApiQuery({ name: 'tenant_id', required: true, description: 'Tenant ID' })
  @ApiQuery({ name: 'company_id', required: false, description: 'Company ID' })
  @ApiQuery({ name: 'active_only', required: false, type: Boolean, description: 'Active items only' })
  async getHierarchy(@Query('tenant_id') tenantId: string, @Query('company_id') companyId?: string, @Query('active_only') activeOnly?: boolean) {
    const categories = await this.separationReasonService.getAllCategories(tenantId, companyId, activeOnly === true);

    const hierarchy = categories.map((category) => ({
      category_id: category.id,
      category_code: category.category_code,
      category_name: category.category_name,
      is_active: category.is_active,
      display_order: category.display_order,
      reasons: category.reasons
        ?.filter((r) => (activeOnly ? r.is_active : true))
        .map((r) => ({
          reason_id: r.id,
          reason_code: r.reason_code,
          reason_name: r.reason_name,
          is_active: r.is_active,
          display_order: r.display_order,
          notice_required: r.notice_period_required,
          rehire_eligible: r.eligible_for_rehire,
        })),
    }));

    return {
      success: true,
      data: hierarchy,
    };
  }

  @Get('config/summary')
  @ApiOperation({ summary: 'Get configuration summary dashboard' })
  @ApiQuery({ name: 'tenant_id', required: true, description: 'Tenant ID' })
  async getConfigurationSummary(@Query('tenant_id') tenantId: string) {
    const categories = await this.separationReasonService.getAllCategories(tenantId);
    const reasons = await this.separationReasonService.getAllReasons(tenantId);

    return {
      success: true,
      data: {
        total_categories: categories.length,
        active_categories: categories.filter((c) => c.is_active).length,
        total_reasons: reasons.length,
        active_reasons: reasons.filter((r) => r.is_active).length,
        voluntary_reasons: reasons.filter((r) => r.voluntary_classification === 'Voluntary').length,
        involuntary_reasons: reasons.filter((r) => r.voluntary_classification === 'Involuntary').length,
        hr_only_reasons: reasons.filter((r) => r.hr_only).length,
        employee_visible_reasons: reasons.filter((r) => r.employee_self_service_allowed).length,
      },
    };
  }
}
