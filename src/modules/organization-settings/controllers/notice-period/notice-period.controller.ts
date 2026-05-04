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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { NoticePeriodService } from '../../services/notice-period/notice-period.service';
import {
  CreateNoticePeriodPolicyDto,
  UpdateNoticePeriodPolicyDto,
  CreateSeparationDto,
  UpdateSeparationDto,
  ApproveSeparationDto,
  CalculateBuyoutDto,
  BuyoutResponseDto,
  WithdrawalRequestDto,
  NoticePeriodQueryDto,
  SeparationQueryDto,
} from '../../dto/notice-period.dto';
import { NoticePeriodPolicy } from '../../entities/notice-period-policy.entity';
import { EmployeeSeparation } from '../../entities/employee-separation.entity';

@ApiTags('Notice Period')
@Controller('notice-period')
@ApiBearerAuth()
export class NoticePeriodController {
  constructor(private readonly noticePeriodService: NoticePeriodService) {}

  // ==================== POLICY MANAGEMENT ====================

  @Post('policies')
  @ApiOperation({ summary: 'Create a new notice period policy' })
  @ApiResponse({
    status: 201,
    description: 'Policy created successfully',
    type: NoticePeriodPolicy,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or policy conflict' })
  async createPolicy(
    @Body() dto: CreateNoticePeriodPolicyDto,
    // TODO: Get these from authenticated user
    // @Req() req: Request,
  ): Promise<NoticePeriodPolicy> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    const userId = 'user-123'; // TODO: Extract from auth token
    return this.noticePeriodService.createPolicy(tenantId, userId, dto);
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get all notice period policies' })
  @ApiResponse({
    status: 200,
    description: 'Policies retrieved successfully',
  })
  async getPolicies(
    @Query() query: NoticePeriodQueryDto,
  ): Promise<{ data: NoticePeriodPolicy[]; total: number }> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    return this.noticePeriodService.getPolicies(tenantId, query);
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get policy by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Policy retrieved successfully',
    type: NoticePeriodPolicy,
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async getPolicyById(@Param('id') id: string): Promise<NoticePeriodPolicy> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    return this.noticePeriodService.getPolicyById(tenantId, id);
  }

  @Put('policies/:id')
  @ApiOperation({ summary: 'Update a notice period policy' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Policy updated successfully',
    type: NoticePeriodPolicy,
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async updatePolicy(
    @Param('id') id: string,
    @Body() dto: UpdateNoticePeriodPolicyDto,
  ): Promise<NoticePeriodPolicy> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    const userId = 'user-123'; // TODO: Extract from auth token
    return this.noticePeriodService.updatePolicy(tenantId, userId, id, dto);
  }

  @Delete('policies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notice period policy' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Policy deleted successfully' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async deletePolicy(@Param('id') id: string): Promise<void> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    return this.noticePeriodService.deletePolicy(tenantId, id);
  }

  @Post('policies/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle policy active status' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Policy status toggled successfully',
    type: NoticePeriodPolicy,
  })
  async togglePolicyStatus(@Param('id') id: string): Promise<NoticePeriodPolicy> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    const userId = 'user-123'; // TODO: Extract from auth token
    return this.noticePeriodService.togglePolicyStatus(tenantId, userId, id);
  }

  // ==================== SEPARATION MANAGEMENT ====================

  @Post('separations')
  @ApiOperation({ summary: 'Create a new employee separation' })
  @ApiResponse({
    status: 201,
    description: 'Separation created successfully',
    type: EmployeeSeparation,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'No applicable policy found' })
  async createSeparation(
    @Body() dto: CreateSeparationDto,
  ): Promise<EmployeeSeparation> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    const userId = 'user-123'; // TODO: Extract from auth token
    return this.noticePeriodService.createSeparation(tenantId, userId, dto);
  }

  @Get('separations')
  @ApiOperation({ summary: 'Get all employee separations' })
  @ApiResponse({
    status: 200,
    description: 'Separations retrieved successfully',
  })
  async getSeparations(
    @Query() query: SeparationQueryDto,
  ): Promise<{ data: EmployeeSeparation[]; total: number }> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    return this.noticePeriodService.getSeparations(tenantId, query);
  }

  @Get('separations/:id')
  @ApiOperation({ summary: 'Get separation by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Separation retrieved successfully',
    type: EmployeeSeparation,
  })
  @ApiResponse({ status: 404, description: 'Separation not found' })
  async getSeparationById(@Param('id') id: string): Promise<EmployeeSeparation> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    return this.noticePeriodService.getSeparationById(tenantId, id);
  }

  @Put('separations/:id')
  @ApiOperation({ summary: 'Update a separation' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Separation updated successfully',
    type: EmployeeSeparation,
  })
  @ApiResponse({ status: 404, description: 'Separation not found' })
  async updateSeparation(
    @Param('id') id: string,
    @Body() dto: UpdateSeparationDto,
  ): Promise<EmployeeSeparation> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    const userId = 'user-123'; // TODO: Extract from auth token
    return this.noticePeriodService.updateSeparation(tenantId, userId, id, dto);
  }

  @Post('separations/:id/approve')
  @ApiOperation({ summary: 'Approve or reject a separation' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Separation approval processed',
    type: EmployeeSeparation,
  })
  @ApiResponse({ status: 404, description: 'Separation not found' })
  async approveSeparation(
    @Param('id') id: string,
    @Body() dto: ApproveSeparationDto,
  ): Promise<EmployeeSeparation> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    const userId = 'user-123'; // TODO: Extract from auth token
    return this.noticePeriodService.approveSeparation(tenantId, userId, id, dto);
  }

  // ==================== BUYOUT OPERATIONS ====================

  @Post('buyout/calculate')
  @ApiOperation({ summary: 'Calculate buyout amount for a separation' })
  @ApiResponse({
    status: 200,
    description: 'Buyout calculated successfully',
    type: BuyoutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Buyout not allowed or invalid request' })
  @ApiResponse({ status: 404, description: 'Separation not found' })
  async calculateBuyout(
    @Body() dto: CalculateBuyoutDto,
  ): Promise<BuyoutResponseDto> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    return this.noticePeriodService.calculateBuyout(tenantId, dto);
  }

  @Post('buyout/apply')
  @ApiOperation({ summary: 'Apply buyout to a separation' })
  @ApiResponse({
    status: 200,
    description: 'Buyout applied successfully',
    type: EmployeeSeparation,
  })
  @ApiResponse({ status: 400, description: 'Buyout not allowed' })
  @ApiResponse({ status: 404, description: 'Separation not found' })
  async applyBuyout(
    @Body() dto: CalculateBuyoutDto,
  ): Promise<EmployeeSeparation> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    const userId = 'user-123'; // TODO: Extract from auth token
    return this.noticePeriodService.applyBuyout(tenantId, userId, dto);
  }

  // ==================== WITHDRAWAL & CANCELLATION ====================

  @Post('separations/:id/withdraw')
  @ApiOperation({ summary: 'Request withdrawal of separation' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal request processed',
    type: EmployeeSeparation,
  })
  @ApiResponse({ status: 400, description: 'Cannot withdraw completed separation' })
  @ApiResponse({ status: 404, description: 'Separation not found' })
  async withdrawSeparation(
    @Body() dto: WithdrawalRequestDto,
  ): Promise<EmployeeSeparation> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    const userId = 'user-123'; // TODO: Extract from auth token
    return this.noticePeriodService.withdrawSeparation(tenantId, userId, dto);
  }

  @Post('separations/:id/cancel')
  @ApiOperation({ summary: 'Cancel a separation' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Separation cancelled',
    type: EmployeeSeparation,
  })
  @ApiResponse({ status: 404, description: 'Separation not found' })
  async cancelSeparation(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<EmployeeSeparation> {
    const tenantId = 'tenant-123'; // TODO: Extract from auth token
    const userId = 'user-123'; // TODO: Extract from auth token
    return this.noticePeriodService.cancelSeparation(tenantId, userId, id, reason);
  }
}
