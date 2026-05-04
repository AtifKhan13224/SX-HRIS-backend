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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EmployeeIDService } from '../services/employee-id.service';
import {
  CreateEmployeeIDPolicyDto,
  UpdateEmployeeIDPolicyDto,
  EmployeeIDPolicyQueryDto,
  ReserveEmployeeIDDto,
  AssignEmployeeIDDto,
  GenerateEmployeeIDDto,
  ValidateIDPatternDto,
  CorrectEmployeeIDDto,
  BulkReserveEmployeeIDDto,
  CancelReservationDto,
  ResetSequenceDto,
  GetApplicablePolicyDto,
  EmployeeIDSearchDto,
  TransitionEmployeeIDDto,
  CheckTransitionEligibilityDto,
  GetIDByTypeDto,
} from '../dto/employee-id.dto';

@ApiTags('Employee ID Numbering')
@Controller('api/employee-id')
// @UseGuards(JwtAuthGuard) // Uncomment in production
@ApiBearerAuth()
export class EmployeeIDController {
  constructor(private readonly employeeIdService: EmployeeIDService) {}

  // ===== POLICY MANAGEMENT =====

  @Post('policy')
  @ApiOperation({ summary: 'Create new employee ID policy' })
  @ApiResponse({
    status: 201,
    description: 'Policy created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid policy configuration' })
  @ApiResponse({ status: 409, description: 'Policy code already exists' })
  async createPolicy(@Body() dto: CreateEmployeeIDPolicyDto) {
    return await this.employeeIdService.createPolicy(dto);
  }

  @Get('policy')
  @ApiOperation({ summary: 'Get all employee ID policies with filters' })
  @ApiResponse({
    status: 200,
    description: 'Policies retrieved successfully',
  })
  async getPolicies(@Query() query: EmployeeIDPolicyQueryDto) {
    return await this.employeeIdService.getPolicies(query);
  }

  @Get('policy/:policyId')
  @ApiOperation({ summary: 'Get employee ID policy by ID' })
  @ApiParam({ name: 'policyId', description: 'Policy UUID' })
  @ApiResponse({
    status: 200,
    description: 'Policy retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async getPolicyById(@Param('policyId') policyId: string) {
    return await this.employeeIdService.getPolicyById(policyId);
  }

  @Put('policy/:policyId')
  @ApiOperation({ summary: 'Update employee ID policy' })
  @ApiParam({ name: 'policyId', description: 'Policy UUID' })
  @ApiResponse({
    status: 200,
    description: 'Policy updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async updatePolicy(
    @Param('policyId') policyId: string,
    @Body() dto: UpdateEmployeeIDPolicyDto,
  ) {
    return await this.employeeIdService.updatePolicy(policyId, dto);
  }

  @Post('policy/:policyId/activate')
  @ApiOperation({ summary: 'Activate employee ID policy' })
  @ApiParam({ name: 'policyId', description: 'Policy UUID' })
  @ApiResponse({
    status: 200,
    description: 'Policy activated successfully',
  })
  @ApiResponse({ status: 400, description: 'Policy cannot be activated' })
  async activatePolicy(
    @Param('policyId') policyId: string,
    @Body('activated_by') activatedBy: string,
  ) {
    return await this.employeeIdService.activatePolicy(policyId, activatedBy);
  }

  @Post('policy/:policyId/deactivate')
  @ApiOperation({ summary: 'Deactivate employee ID policy' })
  @ApiParam({ name: 'policyId', description: 'Policy UUID' })
  @ApiResponse({
    status: 200,
    description: 'Policy deactivated successfully',
  })
  async deactivatePolicy(
    @Param('policyId') policyId: string,
    @Body('deactivated_by') deactivatedBy: string,
  ) {
    return await this.employeeIdService.deactivatePolicy(policyId, deactivatedBy);
  }

  @Post('policy/applicable')
  @ApiOperation({
    summary: 'Get applicable policy for employee context',
    description:
      'Resolves policy hierarchy (EMPLOYMENT_TYPE > BU > LEGAL_ENTITY > COUNTRY > GLOBAL)',
  })
  @ApiResponse({
    status: 200,
    description: 'Applicable policy retrieved',
  })
  async getApplicablePolicy(@Body() dto: GetApplicablePolicyDto) {
    return await this.employeeIdService.getApplicablePolicy(dto);
  }

  // ===== ID GENERATION =====

  @Post('generate')
  @ApiOperation({
    summary: 'Generate employee ID',
    description: 'Generates employee ID using token-based pattern resolution',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee ID generated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid generation context' })
  @ApiResponse({ status: 409, description: 'ID collision detected' })
  async generateEmployeeID(@Body() dto: GenerateEmployeeIDDto) {
    return await this.employeeIdService.generateEmployeeID(dto);
  }

  @Post('validate-pattern')
  @ApiOperation({
    summary: 'Validate ID pattern',
    description: 'Validates token-based ID pattern and generates example output',
  })
  @ApiResponse({
    status: 200,
    description: 'Pattern validation result',
  })
  async validateIDPattern(@Body() dto: ValidateIDPatternDto) {
    return await this.employeeIdService.validateIDPattern(dto);
  }

  // ===== ID ASSIGNMENT =====

  @Post('assign')
  @ApiOperation({
    summary: 'Assign employee ID to employee',
    description:
      'Creates immutable employee ID assignment with audit trail. Generates ID if not provided.',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee ID assigned successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid assignment data' })
  @ApiResponse({ status: 409, description: 'Employee already has active ID' })
  async assignEmployeeID(@Body() dto: AssignEmployeeIDDto) {
    return await this.employeeIdService.assignEmployeeID(dto);
  }

  @Get('assignment')
  @ApiOperation({
    summary: 'Search employee ID assignments',
    description: 'Query assignments by employee_number, employee_id, or status',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
  })
  async searchAssignments(@Query() query: EmployeeIDSearchDto) {
    return await this.employeeIdService.searchAssignments(query);
  }

  @Get('assignment/:employeeId/history')
  @ApiOperation({
    summary: 'Get employee ID assignment history',
    description: 'Retrieve all ID assignments for an employee (rehires, corrections)',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee UUID' })
  @ApiResponse({
    status: 200,
    description: 'Assignment history retrieved',
  })
  async getAssignmentHistory(@Param('employeeId') employeeId: string) {
    return await this.employeeIdService.searchAssignments({
      tenant_id: 'tenant_id_from_auth', // Extract from auth context
      employee_id: employeeId,
      is_current: undefined,
    });
  }

  @Post('correct')
  @ApiOperation({
    summary: 'Correct employee ID',
    description:
      'Creates corrected assignment within grace period. Requires approval if configured.',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee ID corrected successfully',
  })
  @ApiResponse({ status: 400, description: 'Correction not allowed or grace period expired' })
  async correctEmployeeID(@Body() dto: CorrectEmployeeIDDto) {
    return await this.employeeIdService.correctEmployeeID(dto);
  }

  // ===== ID RESERVATION =====

  @Post('reserve')
  @ApiOperation({
    summary: 'Reserve employee ID(s)',
    description:
      'Pre-reserves employee IDs for candidates. IDs expire after configured hours.',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee ID(s) reserved successfully',
  })
  @ApiResponse({ status: 400, description: 'Reservation not allowed by policy' })
  async reserveEmployeeID(@Body() dto: ReserveEmployeeIDDto) {
    return await this.employeeIdService.reserveEmployeeID(dto);
  }

  @Post('reserve/bulk')
  @ApiOperation({
    summary: 'Bulk reserve employee IDs',
    description: 'Reserve multiple IDs for hiring campaigns',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk reservation successful',
  })
  async bulkReserve(@Body() dto: BulkReserveEmployeeIDDto) {
    return await this.employeeIdService.reserveEmployeeID({
      ...dto,
      count: dto.count,
    });
  }

  @Get('reservation')
  @ApiOperation({
    summary: 'Get active reservations',
    description: 'Query reservations by status, reserved_for, or policy',
  })
  @ApiQuery({ name: 'tenant_id', required: true })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'reserved_for', required: false })
  @ApiResponse({
    status: 200,
    description: 'Reservations retrieved',
  })
  async getReservations(@Query() query: any) {
    // Implement query in service
    return { message: 'Get reservations endpoint' };
  }

  @Post('reservation/:reservationId/cancel')
  @ApiOperation({
    summary: 'Cancel ID reservation',
    description: 'Cancels reservation and releases ID back to pool',
  })
  @ApiParam({ name: 'reservationId', description: 'Reservation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation cancelled',
  })
  async cancelReservation(
    @Param('reservationId') reservationId: string,
    @Body() dto: Omit<CancelReservationDto, 'reservation_id'>,
  ) {
    return await this.employeeIdService.cancelReservation({
      ...dto,
      reservation_id: reservationId,
    });
  }

  // ===== SEQUENCE MANAGEMENT =====

  @Get('sequence/:policyId')
  @ApiOperation({
    summary: 'Get sequence status',
    description: 'Retrieve sequence counters and status for policy',
  })
  @ApiParam({ name: 'policyId', description: 'Policy UUID' })
  @ApiQuery({ name: 'scope_key', required: false })
  @ApiResponse({
    status: 200,
    description: 'Sequence status retrieved',
  })
  async getSequenceStatus(
    @Param('policyId') policyId: string,
    @Query('scope_key') scopeKey?: string,
  ) {
    // Implement in service
    return { message: 'Get sequence status endpoint' };
  }

  @Post('sequence/reset')
  @ApiOperation({
    summary: 'Reset sequence counter',
    description: 'Manually reset sequence to specified value. CAUTION: Use for new year/period.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sequence reset successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid reset configuration' })
  async resetSequence(@Body() dto: ResetSequenceDto) {
    return await this.employeeIdService.resetSequence(dto);
  }

  // ===== AUDIT & REPORTING =====

  @Get('audit/:employeeId')
  @ApiOperation({
    summary: 'Get employee ID audit trail',
    description: 'Retrieve complete audit history for employee ID changes',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee UUID' })
  @ApiResponse({
    status: 200,
    description: 'Audit trail retrieved',
  })
  async getAuditTrail(@Param('employeeId') employeeId: string) {
    // Implement in service
    return { message: 'Get audit trail endpoint' };
  }

  @Get('statistics/:tenantId')
  @ApiOperation({
    summary: 'Get ID numbering statistics',
    description:
      'Retrieve statistics: total IDs issued, sequence usage, reservation metrics',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant UUID' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved',
  })
  async getStatistics(@Param('tenantId') tenantId: string) {
    // Implement statistics aggregation
    return {
      total_policies: 0,
      active_policies: 0,
      total_ids_issued: 0,
      total_reservations: 0,
      sequences_exhausted: 0,
      corrections_count: 0,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for Employee ID module' })
  @ApiResponse({ status: 200, description: 'Service healthy' })
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'Employee ID Numbering & Identity Management',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  // ===== TOKEN MANAGEMENT =====

  @Get('tokens')
  @ApiOperation({
    summary: 'Get available tokens',
    description: 'Retrieve all available tokens for ID pattern building',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens retrieved',
  })
  async getAvailableTokens() {
    // Return standard tokens from token repository
    return {
      tokens: [
        {
          token_code: 'COUNTRY',
          category: 'GEOGRAPHY',
          description: 'ISO 3166-1 alpha-3 country code',
          example: 'UAE',
        },
        {
          token_code: 'YEAR',
          category: 'DATE',
          description: 'Four-digit year (YYYY) or two-digit (YY:2)',
          example: '2026',
        },
        {
          token_code: 'MONTH',
          category: 'DATE',
          description: 'Two-digit month (01-12)',
          example: '01',
        },
        {
          token_code: 'SEQUENCE',
          category: 'SEQUENCE',
          description: 'Auto-incrementing sequence number',
          example: '00001',
          required: true,
        },
        {
          token_code: 'TYPE',
          category: 'ORGANIZATION',
          description: 'Employment type code (FT, PT, CT)',
          example: 'FT',
        },
        {
          token_code: 'COMPANY',
          category: 'ORGANIZATION',
          description: 'Company/Legal entity code',
          example: 'ACME',
        },
        {
          token_code: 'BUSINESS_UNIT',
          category: 'ORGANIZATION',
          description: 'Business unit code',
          example: 'SALES',
        },
      ],
    };
  }

  @Post('tokens/custom')
  @ApiOperation({
    summary: 'Create custom token',
    description: 'Define custom token with resolution logic',
  })
  @ApiResponse({
    status: 201,
    description: 'Custom token created',
  })
  async createCustomToken(@Body() dto: any) {
    // Implement custom token creation
    return { message: 'Create custom token endpoint' };
  }

  // ===== ID TRANSITION ENDPOINTS =====

  @Post('transition')
  @ApiOperation({
    summary: 'Transition temporary/candidate ID to master ID',
    description: 'Transitions a temporary onboarding or candidate ID to permanent master employee ID',
  })
  @ApiResponse({
    status: 201,
    description: 'ID transitioned successfully',
  })
  @ApiResponse({ status: 400, description: 'Transition not allowed or requirements not met' })
  async transitionEmployeeID(@Body() dto: TransitionEmployeeIDDto) {
    return await this.employeeIdService.transitionEmployeeID(dto);
  }

  @Post('transition/check-eligibility')
  @ApiOperation({
    summary: 'Check if ID is eligible for transition',
    description: 'Validates if temporary/candidate ID can be transitioned to master ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Eligibility check result',
  })
  async checkTransitionEligibility(@Body() dto: CheckTransitionEligibilityDto) {
    return await this.employeeIdService.checkTransitionEligibility(dto);
  }

  @Post('ids-by-type')
  @ApiOperation({
    summary: 'Get IDs by type (MASTER, TEMPORARY, CANDIDATE)',
    description: 'Retrieve all IDs of a specific type',
  })
  @ApiResponse({
    status: 200,
    description: 'IDs retrieved successfully',
  })
  async getIDsByType(@Body() dto: GetIDByTypeDto) {
    return await this.employeeIdService.getIDsByType(dto);
  }

  @Get('expiring-soon/:tenantId')
  @ApiOperation({
    summary: 'Get temporary/candidate IDs expiring soon',
    description: 'Retrieve IDs that will expire within specified days (default 30)',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant UUID' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  @ApiResponse({
    status: 200,
    description: 'Expiring IDs retrieved',
  })
  async getExpiringSoonIDs(
    @Param('tenantId') tenantId: string,
    @Query('days') days?: number,
  ) {
    return await this.employeeIdService.getExpiringSoonIDs(
      tenantId,
      days ? parseInt(days.toString()) : 30,
    );
  }
}
