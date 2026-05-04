import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RetirementService } from '../../services/retirement/retirement.service';
import {
  CreateRetirementPolicyDto,
  UpdateRetirementPolicyDto,
  CreateEmployeeRetirementDto,
  UpdateEmployeeRetirementDto,
  RequestExtensionDto,
  ApproveExtensionDto,
  RejectExtensionDto,
  RequestEarlyRetirementDto,
  ApproveRetirementDto,
  RejectRetirementDto,
  CancelRetirementDto,
  CheckEligibilityDto,
  BulkEligibilityCheckDto,
  RetirementQueryDto,
  PolicyImpactPreviewDto,
  OverridePolicyDto,
} from '../../dto/retirement.dto';

@ApiTags('Retirement Management')
@Controller('retirement')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is implemented
@ApiBearerAuth()
export class RetirementController {
  constructor(private readonly retirementService: RetirementService) {}

  // ==================== POLICY ENDPOINTS ====================

  @Post('policies')
  @ApiOperation({ summary: 'Create new retirement policy' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createPolicy(@Body() dto: CreateRetirementPolicyDto, @Request() req?: any) {
    const userId = req?.user?.id;
    const policy = await this.retirementService.createPolicy(dto, userId);
    return {
      success: true,
      message: 'Retirement policy created successfully',
      data: policy,
    };
  }

  @Put('policies/:id')
  @ApiOperation({ summary: 'Update retirement policy' })
  @ApiResponse({ status: 200, description: 'Policy updated successfully' })
  async updatePolicy(
    @Param('id') id: string,
    @Body() dto: UpdateRetirementPolicyDto,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    const policy = await this.retirementService.updatePolicy(id, dto, userId);
    return {
      success: true,
      message: 'Retirement policy updated successfully',
      data: policy,
    };
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get all retirement policies' })
  @ApiResponse({ status: 200, description: 'Policies retrieved successfully' })
  async getAllPolicies(
    @Query('country_code') countryCode?: string,
    @Query('legal_entity_id') legalEntityId?: string,
    @Query('is_active') isActive?: string,
  ) {
    const filters: any = {};
    if (countryCode) filters.country_code = countryCode;
    if (legalEntityId) filters.legal_entity_id = legalEntityId;
    if (isActive !== undefined) filters.is_active = isActive === 'true';

    const policies = await this.retirementService.getAllPolicies(filters);
    return {
      success: true,
      data: policies,
      count: policies.length,
    };
  }

  @Get('policies/active')
  @ApiOperation({ summary: 'Get all active retirement policies' })
  @ApiResponse({ status: 200, description: 'Active policies retrieved successfully' })
  async getActivePolicies(@Query('as_of_date') asOfDate?: string) {
    const date = asOfDate ? new Date(asOfDate) : undefined;
    const policies = await this.retirementService.getActivePolicies(date);
    return {
      success: true,
      data: policies,
      count: policies.length,
    };
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get retirement policy by ID' })
  @ApiResponse({ status: 200, description: 'Policy retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async getPolicyById(@Param('id') id: string) {
    const policy = await this.retirementService.getPolicyById(id);
    return {
      success: true,
      data: policy,
    };
  }

  @Post('policies/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle policy active status' })
  @ApiResponse({ status: 200, description: 'Policy status updated successfully' })
  async togglePolicyStatus(@Param('id') id: string, @Request() req?: any) {
    const userId = req?.user?.id;
    const policy = await this.retirementService.togglePolicyStatus(id, userId);
    return {
      success: true,
      message: `Policy ${policy.is_active ? 'activated' : 'deactivated'} successfully`,
      data: policy,
    };
  }

  @Delete('policies/:id')
  @ApiOperation({ summary: 'Delete retirement policy' })
  @ApiResponse({ status: 200, description: 'Policy deleted successfully' })
  @ApiResponse({ status: 400, description: 'Policy in use, cannot delete' })
  async deletePolicy(@Param('id') id: string) {
    await this.retirementService.deletePolicy(id);
    return {
      success: true,
      message: 'Retirement policy deleted successfully',
    };
  }

  @Post('policies/:id/impact-preview')
  @ApiOperation({ summary: 'Preview policy impact on employees' })
  @ApiResponse({ status: 200, description: 'Impact preview generated' })
  async previewPolicyImpact(@Param('id') id: string, @Body() dto: PolicyImpactPreviewDto) {
    dto.policy_id = id;
    const preview = await this.retirementService.previewPolicyImpact(dto);
    return {
      success: true,
      data: preview,
    };
  }

  // ==================== ELIGIBILITY ENDPOINTS ====================

  @Post('eligibility/check')
  @ApiOperation({ summary: 'Check retirement eligibility for an employee' })
  @ApiResponse({ status: 200, description: 'Eligibility check completed' })
  async checkEligibility(@Body() dto: CheckEligibilityDto) {
    const result = await this.retirementService.checkEmployeeEligibility(dto);
    return {
      success: true,
      data: result,
    };
  }

  @Post('eligibility/bulk-check')
  @ApiOperation({ summary: 'Bulk eligibility check for multiple employees' })
  @ApiResponse({ status: 200, description: 'Bulk eligibility check completed' })
  async bulkEligibilityCheck(@Body() dto: BulkEligibilityCheckDto) {
    const results = await this.retirementService.bulkEligibilityCheck(dto);
    return {
      success: true,
      data: results,
      count: results.length,
    };
  }

  // ==================== RETIREMENT CASE ENDPOINTS ====================

  @Post('retirements')
  @ApiOperation({ summary: 'Create new retirement case' })
  @ApiResponse({ status: 201, description: 'Retirement case created successfully' })
  async createRetirement(@Body() dto: CreateEmployeeRetirementDto, @Request() req?: any) {
    const userId = req?.user?.id;
    const retirement = await this.retirementService.createRetirement(dto, userId);
    return {
      success: true,
      message: 'Retirement case created successfully',
      data: retirement,
    };
  }

  @Put('retirements/:id')
  @ApiOperation({ summary: 'Update retirement case' })
  @ApiResponse({ status: 200, description: 'Retirement case updated successfully' })
  async updateRetirement(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeRetirementDto,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    const retirement = await this.retirementService.updateRetirement(id, dto, userId);
    return {
      success: true,
      message: 'Retirement case updated successfully',
      data: retirement,
    };
  }

  @Get('retirements')
  @ApiOperation({ summary: 'Query retirement cases' })
  @ApiResponse({ status: 200, description: 'Retirement cases retrieved successfully' })
  async queryRetirements(@Query() query: RetirementQueryDto) {
    const result = await this.retirementService.queryRetirements(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('retirements/upcoming')
  @ApiOperation({ summary: 'Get upcoming retirements' })
  @ApiResponse({ status: 200, description: 'Upcoming retirements retrieved' })
  async getUpcomingRetirements(@Query('months') months?: string) {
    const monthsAhead = months ? parseInt(months) : 6;
    const retirements = await this.retirementService.getUpcomingRetirements(monthsAhead);
    return {
      success: true,
      data: retirements,
      count: retirements.length,
    };
  }

  @Get('retirements/:id')
  @ApiOperation({ summary: 'Get retirement case by ID' })
  @ApiResponse({ status: 200, description: 'Retirement case retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Retirement case not found' })
  async getRetirementById(@Param('id') id: string) {
    const retirement = await this.retirementService.getRetirementById(id);
    return {
      success: true,
      data: retirement,
    };
  }

  @Get('retirements/employee/:employeeId')
  @ApiOperation({ summary: 'Get all retirements for an employee' })
  @ApiResponse({ status: 200, description: 'Employee retirements retrieved successfully' })
  async getRetirementsByEmployee(@Param('employeeId') employeeId: string) {
    const retirements = await this.retirementService.getRetirementsByEmployee(employeeId);
    return {
      success: true,
      data: retirements,
      count: retirements.length,
    };
  }

  // ==================== EXTENSION ENDPOINTS ====================

  @Post('retirements/extension/request')
  @ApiOperation({ summary: 'Request retirement age extension' })
  @ApiResponse({ status: 200, description: 'Extension requested successfully' })
  async requestExtension(@Body() dto: RequestExtensionDto, @Request() req?: any) {
    const userId = req?.user?.id;
    const retirement = await this.retirementService.requestExtension(dto, userId);
    return {
      success: true,
      message: 'Retirement extension requested successfully',
      data: retirement,
    };
  }

  @Post('retirements/extension/approve')
  @ApiOperation({ summary: 'Approve retirement extension' })
  @ApiResponse({ status: 200, description: 'Extension approved successfully' })
  async approveExtension(@Body() dto: ApproveExtensionDto) {
    const retirement = await this.retirementService.approveExtension(dto);
    return {
      success: true,
      message: 'Retirement extension approved successfully',
      data: retirement,
    };
  }

  @Post('retirements/extension/reject')
  @ApiOperation({ summary: 'Reject retirement extension' })
  @ApiResponse({ status: 200, description: 'Extension rejected successfully' })
  async rejectExtension(@Body() dto: RejectExtensionDto) {
    const retirement = await this.retirementService.rejectExtension(dto);
    return {
      success: true,
      message: 'Retirement extension rejected',
      data: retirement,
    };
  }

  // ==================== EARLY RETIREMENT ENDPOINTS ====================

  @Post('retirements/early/request')
  @ApiOperation({ summary: 'Request early retirement' })
  @ApiResponse({ status: 201, description: 'Early retirement requested successfully' })
  async requestEarlyRetirement(@Body() dto: RequestEarlyRetirementDto, @Request() req?: any) {
    const userId = req?.user?.id;
    const retirement = await this.retirementService.requestEarlyRetirement(dto, userId);
    return {
      success: true,
      message: 'Early retirement requested successfully',
      data: retirement,
    };
  }

  // ==================== APPROVAL ENDPOINTS ====================

  @Post('retirements/:id/approve')
  @ApiOperation({ summary: 'Approve retirement case' })
  @ApiResponse({ status: 200, description: 'Retirement approved successfully' })
  async approveRetirement(@Param('id') id: string, @Body() dto: ApproveRetirementDto) {
    dto.retirement_id = id;
    const retirement = await this.retirementService.approveRetirement(dto);
    return {
      success: true,
      message: 'Retirement approved successfully',
      data: retirement,
    };
  }

  @Post('retirements/:id/reject')
  @ApiOperation({ summary: 'Reject retirement case' })
  @ApiResponse({ status: 200, description: 'Retirement rejected successfully' })
  async rejectRetirement(@Param('id') id: string, @Body() dto: RejectRetirementDto) {
    dto.retirement_id = id;
    const retirement = await this.retirementService.rejectRetirement(dto);
    return {
      success: true,
      message: 'Retirement rejected',
      data: retirement,
    };
  }

  @Post('retirements/:id/cancel')
  @ApiOperation({ summary: 'Cancel retirement case' })
  @ApiResponse({ status: 200, description: 'Retirement cancelled successfully' })
  async cancelRetirement(@Param('id') id: string, @Body() dto: CancelRetirementDto) {
    dto.retirement_id = id;
    const retirement = await this.retirementService.cancelRetirement(dto);
    return {
      success: true,
      message: 'Retirement cancelled successfully',
      data: retirement,
    };
  }

  // ==================== OVERRIDE ENDPOINTS ====================

  @Post('retirements/:id/override')
  @ApiOperation({ summary: 'Override retirement policy for specific case' })
  @ApiResponse({ status: 200, description: 'Policy overridden successfully' })
  async overridePolicy(@Param('id') id: string, @Body() dto: OverridePolicyDto, @Request() req?: any) {
    dto.retirement_id = id;
    const userId = req?.user?.id;
    const retirement = await this.retirementService.overridePolicy(dto, userId);
    return {
      success: true,
      message: 'Retirement policy overridden successfully',
      data: retirement,
    };
  }
}
