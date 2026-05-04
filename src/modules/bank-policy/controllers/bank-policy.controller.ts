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
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BankPolicyService } from '../services/bank-policy.service';
import {
  CreateBankPolicyDto,
  UpdateBankPolicyDto,
  BankPolicyQueryDto,
  CreatePolicyExceptionDto,
  CreatePolicyScheduleDto,
  ValidatePolicyDto,
  CountryTemplateQueryDto,
} from '../dto/bank-policy.dto';

@ApiTags('Bank Policy Management')
@Controller('api/bank-policy')
export class BankPolicyController {
  constructor(private readonly policyService: BankPolicyService) {}

  /**
   * CREATE BANK POLICY
   */
  @Post('/')
  @ApiOperation({ summary: 'Create a new bank policy', description: 'Create bank policy with country-specific rules and payroll configuration' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Policy code already exists' })
  async createPolicy(@Body() dto: CreateBankPolicyDto) {
    return this.policyService.createPolicy(dto);
  }

  /**
   * GET ALL POLICIES
   */
  @Get('/')
  @ApiOperation({ summary: 'Get all bank policies', description: 'Retrieve bank policies with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Policies retrieved successfully' })
  async getPolicies(@Query() query: BankPolicyQueryDto) {
    return this.policyService.getPolicies(query);
  }

  /**
   * GET POLICY BY ID
   */
  @Get('/:id')
  @ApiOperation({ summary: 'Get policy by ID', description: 'Retrieve detailed policy information including schedules and exceptions' })
  @ApiParam({ name: 'id', description: 'Policy UUID' })
  @ApiResponse({ status: 200, description: 'Policy found' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async getPolicyById(@Param('id') id: string) {
    return this.policyService.getPolicyById(id);
  }

  /**
   * UPDATE POLICY
   */
  @Put('/:id')
  @ApiOperation({ summary: 'Update bank policy', description: 'Update policy configuration. Creates new version if breaking changes detected on active policy.' })
  @ApiParam({ name: 'id', description: 'Policy UUID' })
  @ApiResponse({ status: 200, description: 'Policy updated successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async updatePolicy(@Param('id') id: string, @Body() dto: UpdateBankPolicyDto) {
    return this.policyService.updatePolicy(id, dto);
  }

  /**
   * ACTIVATE POLICY
   */
  @Patch('/:id/activate')
  @ApiOperation({ summary: 'Activate policy', description: 'Activate a draft policy after validation' })
  @ApiParam({ name: 'id', description: 'Policy UUID' })
  @ApiResponse({ status: 200, description: 'Policy activated' })
  @ApiResponse({ status: 400, description: 'Policy validation failed or already active' })
  async activatePolicy(@Param('id') id: string, @Body('user_id') userId: string) {
    return this.policyService.activatePolicy(id, userId);
  }

  /**
   * SUSPEND POLICY
   */
  @Patch('/:id/suspend')
  @ApiOperation({ summary: 'Suspend policy', description: 'Suspend an active policy with reason' })
  @ApiParam({ name: 'id', description: 'Policy UUID' })
  @ApiResponse({ status: 200, description: 'Policy suspended' })
  async suspendPolicy(
    @Param('id') id: string,
    @Body('user_id') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.policyService.suspendPolicy(id, userId, reason);
  }

  /**
   * DELETE POLICY
   */
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete policy', description: 'Soft delete a policy (archived, not removed from database)' })
  @ApiParam({ name: 'id', description: 'Policy UUID' })
  @ApiResponse({ status: 204, description: 'Policy deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete policy with active schedules' })
  async deletePolicy(@Param('id') id: string, @Body('user_id') userId: string) {
    await this.policyService.deletePolicy(id, userId);
  }

  /**
   * GET POLICIES BY COUNTRY
   */
  @Get('/country/:countryCode')
  @ApiOperation({ summary: 'Get policies by country', description: 'Retrieve all active policies for a specific country' })
  @ApiParam({ name: 'countryCode', description: 'Country code (UAE, USA, GBR, IND, etc.)' })
  @ApiResponse({ status: 200, description: 'Policies retrieved' })
  async getPoliciesByCountry(@Param('countryCode') countryCode: string) {
    return this.policyService.getPoliciesByCountry(countryCode);
  }

  /**
   * GET ACTIVE POLICY FOR LEGAL ENTITY
   */
  @Get('/entity/:tenantId/:legalEntityId')
  @ApiOperation({ summary: 'Get active policy for legal entity', description: 'Retrieve the currently active policy for a specific legal entity' })
  @ApiParam({ name: 'tenantId', description: 'Tenant UUID' })
  @ApiParam({ name: 'legalEntityId', description: 'Legal Entity UUID' })
  @ApiQuery({ name: 'date', required: false, description: 'Effective date (YYYY-MM-DD), defaults to today' })
  @ApiResponse({ status: 200, description: 'Policy found' })
  @ApiResponse({ status: 404, description: 'No active policy found' })
  async getActivePolicyForEntity(
    @Param('tenantId') tenantId: string,
    @Param('legalEntityId') legalEntityId: string,
    @Query('date') date?: string,
  ) {
    const effectiveDate = date ? new Date(date) : undefined;
    return this.policyService.getActivePolicyForEntity(tenantId, legalEntityId, effectiveDate);
  }

  /**
   * VALIDATE POLICY
   */
  @Post('/validate')
  @ApiOperation({ summary: 'Validate policy rules', description: 'Validate policy against business rules and regulatory requirements' })
  @ApiResponse({ status: 200, description: 'Validation result returned' })
  async validatePolicy(@Body() dto: ValidatePolicyDto) {
    return this.policyService.validatePolicy(dto);
  }

  // ===== POLICY EXCEPTIONS =====

  /**
   * CREATE POLICY EXCEPTION
   */
  @Post('/exceptions')
  @ApiOperation({ summary: 'Create policy exception', description: 'Create employee or group-level exception to policy rules' })
  @ApiResponse({ status: 201, description: 'Exception created' })
  async createException(@Body() dto: CreatePolicyExceptionDto) {
    return this.policyService.createException(dto);
  }

  /**
   * GET EXCEPTIONS FOR EMPLOYEE
   */
  @Get('/exceptions/:policyId/employee/:employeeId')
  @ApiOperation({ summary: 'Get exceptions for employee', description: 'Retrieve all active exceptions for an employee' })
  @ApiParam({ name: 'policyId', description: 'Policy UUID' })
  @ApiParam({ name: 'employeeId', description: 'Employee UUID' })
  @ApiQuery({ name: 'date', required: false, description: 'Effective date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Exceptions retrieved' })
  async getExceptionsForEmployee(
    @Param('policyId') policyId: string,
    @Param('employeeId') employeeId: string,
    @Query('date') date?: string,
  ) {
    const effectiveDate = date ? new Date(date) : undefined;
    return this.policyService.getExceptionsForEmployee(policyId, employeeId, effectiveDate);
  }

  // ===== POLICY SCHEDULES =====

  /**
   * CREATE POLICY SCHEDULE
   */
  @Post('/schedules')
  @ApiOperation({ summary: 'Create policy schedule', description: 'Create payment processing schedule for a specific month' })
  @ApiResponse({ status: 201, description: 'Schedule created' })
  @ApiResponse({ status: 409, description: 'Schedule already exists for this month' })
  async createSchedule(@Body() dto: CreatePolicyScheduleDto) {
    return this.policyService.createSchedule(dto);
  }

  /**
   * GET SCHEDULE FOR MONTH
   */
  @Get('/schedules/:policyId/:processingMonth')
  @ApiOperation({ summary: 'Get schedule for month', description: 'Retrieve payment schedule for a specific processing month' })
  @ApiParam({ name: 'policyId', description: 'Policy UUID' })
  @ApiParam({ name: 'processingMonth', description: 'Processing month (YYYY-MM)' })
  @ApiResponse({ status: 200, description: 'Schedule found' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async getScheduleForMonth(
    @Param('policyId') policyId: string,
    @Param('processingMonth') processingMonth: string,
  ) {
    return this.policyService.getScheduleForMonth(policyId, processingMonth);
  }

  // ===== COUNTRY TEMPLATES =====

  /**
   * GET COUNTRY TEMPLATES
   */
  @Get('/templates/country')
  @ApiOperation({ summary: 'Get country templates', description: 'Retrieve pre-configured policy templates for different countries' })
  @ApiResponse({ status: 200, description: 'Templates retrieved' })
  async getCountryTemplates(@Query() query: CountryTemplateQueryDto) {
    return this.policyService.getCountryTemplates(query);
  }

  /**
   * CREATE POLICY FROM TEMPLATE
   */
  @Post('/templates/:templateId/create-policy')
  @ApiOperation({ summary: 'Create policy from template', description: 'Create a new policy using a country template with custom overrides' })
  @ApiParam({ name: 'templateId', description: 'Template UUID' })
  @ApiResponse({ status: 201, description: 'Policy created from template' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async createPolicyFromTemplate(
    @Param('templateId') templateId: string,
    @Body() overrides: Partial<CreateBankPolicyDto>,
  ) {
    return this.policyService.createPolicyFromTemplate(templateId, overrides);
  }

  // ===== AUDIT & REPORTING =====

  /**
   * GET AUDIT LOGS
   */
  @Get('/:policyId/audit')
  @ApiOperation({ summary: 'Get policy audit logs', description: 'Retrieve complete change history for a policy' })
  @ApiParam({ name: 'policyId', description: 'Policy UUID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of logs to return', type: Number })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async getAuditLogs(@Param('policyId') policyId: string, @Query('limit') limit?: string) {
    return this.policyService.getAuditLogs(policyId, limit ? parseInt(limit) : 50);
  }

  /**
   * HEALTH CHECK
   */
  @Get('/health/check')
  @ApiOperation({ summary: 'Health check', description: 'Check if bank policy service is running' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'bank-policy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET STATISTICS
   */
  @Get('/stats/summary')
  @ApiOperation({ summary: 'Get policy statistics', description: 'Retrieve summary statistics about policies' })
  @ApiQuery({ name: 'tenant_id', required: false, description: 'Filter by tenant' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(@Query('tenant_id') tenantId?: string) {
    const query: BankPolicyQueryDto = tenantId ? { tenant_id: tenantId } : {};
    const { data, total } = await this.policyService.getPolicies(query);

    const stats = {
      total_policies: total,
      active_policies: data.filter((p) => p.status === 'ACTIVE').length,
      draft_policies: data.filter((p) => p.status === 'DRAFT').length,
      suspended_policies: data.filter((p) => p.status === 'SUSPENDED').length,
      wps_enabled: data.filter((p) => p.wps_enabled).length,
      sepa_enabled: data.filter((p) => p.sepa_enabled).length,
      ach_enabled: data.filter((p) => p.ach_enabled).length,
      countries: [...new Set(data.map((p) => p.country_code))].length,
    };

    return stats;
  }
}
