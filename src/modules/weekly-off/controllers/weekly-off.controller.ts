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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WeeklyOffService } from '../services/weekly-off.service';
import {
  CreateWeeklyOffPolicyDto,
  UpdateWeeklyOffPolicyDto,
  CreateWeeklyOffAssignmentDto,
  BulkAssignWeeklyOffDto,
  CreateWeeklyOffOverrideDto,
  ValidateWeeklyOffPolicyDto,
  GetEmployeeWorkCalendarDto,
  RecalculateWorkCalendarDto,
  ApproveOverrideDto,
  WeeklyOffPolicyQueryDto,
} from '../dto/weekly-off.dto';

@Controller('api/weekly-off')
export class WeeklyOffController {
  constructor(private readonly weeklyOffService: WeeklyOffService) {}

  /**
   * Create new weekly off policy
   * POST /api/weekly-off/policies
   */
  @Post('policies')
  async createPolicy(@Request() req: any, @Body() dto: CreateWeeklyOffPolicyDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return await this.weeklyOffService.createPolicy(tenantId, userId, dto);
  }

  /**
   * Get all policies with filtering
   * GET /api/weekly-off/policies
   */
  @Get('policies')
  async getPolicies(@Request() req: any, @Query() query: WeeklyOffPolicyQueryDto) {
    const tenantId = req.user.tenantId;
    return await this.weeklyOffService.queryPolicies(tenantId, query);
  }

  /**
   * Get policy by ID
   * GET /api/weekly-off/policies/:id
   */
  @Get('policies/:id')
  async getPolicyById(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return await this.weeklyOffService.getPolicyById(tenantId, id);
  }

  /**
   * Update policy
   * PUT /api/weekly-off/policies/:id
   */
  @Put('policies/:id')
  async updatePolicy(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateWeeklyOffPolicyDto,
  ) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return await this.weeklyOffService.updatePolicy(tenantId, id, userId, dto);
  }

  /**
   * Delete policy
   * DELETE /api/weekly-off/policies/:id
   */
  @Delete('policies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePolicy(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    await this.weeklyOffService.deletePolicy(tenantId, id, userId);
  }

  /**
   * Validate policy compliance
   * POST /api/weekly-off/policies/validate
   */
  @Post('policies/validate')
  async validatePolicy(@Request() req: any, @Body() dto: ValidateWeeklyOffPolicyDto) {
    const tenantId = req.user.tenantId;
    return await this.weeklyOffService.validatePolicy(tenantId, dto);
  }

  /**
   * Assign policy to entity
   * POST /api/weekly-off/assignments
   */
  @Post('assignments')
  async assignPolicy(@Request() req: any, @Body() dto: CreateWeeklyOffAssignmentDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return await this.weeklyOffService.assignPolicy(tenantId, userId, dto);
  }

  /**
   * Bulk assign policy
   * POST /api/weekly-off/assignments/bulk
   */
  @Post('assignments/bulk')
  async bulkAssignPolicy(@Request() req: any, @Body() dto: BulkAssignWeeklyOffDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return await this.weeklyOffService.bulkAssignPolicy(tenantId, userId, dto);
  }

  /**
   * Get employee resolved policy
   * GET /api/weekly-off/employees/:employeeId/policy
   */
  @Get('employees/:employeeId/policy')
  async getEmployeePolicy(
    @Request() req: any,
    @Param('employeeId') employeeId: string,
    @Query('effectiveDate') effectiveDate?: string,
  ) {
    const tenantId = req.user.tenantId;
    const date = effectiveDate ? new Date(effectiveDate) : new Date();
    return await this.weeklyOffService.getEmployeeResolvedPolicy(tenantId, employeeId, date);
  }

  /**
   * Get employee work calendar
   * POST /api/weekly-off/employees/calendar
   */
  @Post('employees/calendar')
  async getEmployeeCalendar(@Request() req: any, @Body() dto: GetEmployeeWorkCalendarDto) {
    const tenantId = req.user.tenantId;
    return await this.weeklyOffService.getEmployeeWorkCalendar(tenantId, dto);
  }

  /**
   * Recalculate work calendar
   * POST /api/weekly-off/calendar/recalculate
   */
  @Post('calendar/recalculate')
  async recalculateCalendar(@Request() req: any, @Body() dto: RecalculateWorkCalendarDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return await this.weeklyOffService.recalculateWorkCalendar(tenantId, userId, dto);
  }

  /**
   * Create weekly off override
   * POST /api/weekly-off/overrides
   */
  @Post('overrides')
  async createOverride(@Request() req: any, @Body() dto: CreateWeeklyOffOverrideDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return await this.weeklyOffService.createOverride(tenantId, userId, dto);
  }

  /**
   * Approve/reject override
   * POST /api/weekly-off/overrides/:id/approve
   */
  @Post('overrides/:id/approve')
  async approveOverride(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: { approved: boolean; comments?: string },
  ) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return await this.weeklyOffService.approveOverride(tenantId, userId, {
      overrideId: id,
      ...dto,
    });
  }
}
