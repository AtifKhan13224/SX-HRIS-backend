import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeaveManagementService } from './leave-management.service';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveLeaveDto,
  RejectLeaveDto,
  LeaveQueryDto,
  CreateLeaveBalanceDto,
  UpdateLeaveBalanceDto,
  CreateLeavePolicyDto,
  UpdateLeavePolicyDto,
} from './dto/leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Leave Management')
@Controller('leave-management')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeaveManagementController {
  constructor(private readonly leaveManagementService: LeaveManagementService) {}

  // Leave Request Endpoints
  @Post('requests')
  @ApiOperation({ summary: 'Create a new leave request' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  createLeaveRequest(@Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    return this.leaveManagementService.createLeaveRequest(createLeaveRequestDto);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get all leave requests with filters' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findAllLeaveRequests(@Query() query: LeaveQueryDto) {
    return this.leaveManagementService.findAllLeaveRequests(query);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get leave request by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOneLeaveRequest(@Param('id') id: string) {
    return this.leaveManagementService.findOneLeaveRequest(id);
  }

  @Patch('requests/:id')
  @ApiOperation({ summary: 'Update leave request' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.EMPLOYEE)
  updateLeaveRequest(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
  ) {
    return this.leaveManagementService.updateLeaveRequest(id, updateLeaveRequestDto);
  }

  @Post('requests/:id/approve')
  @ApiOperation({ summary: 'Approve leave request' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  approveLeaveRequest(@Param('id') id: string, @Body() approveLeaveDto: ApproveLeaveDto) {
    return this.leaveManagementService.approveLeaveRequest(id, approveLeaveDto);
  }

  @Post('requests/:id/reject')
  @ApiOperation({ summary: 'Reject leave request' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  rejectLeaveRequest(@Param('id') id: string, @Body() rejectLeaveDto: RejectLeaveDto) {
    return this.leaveManagementService.rejectLeaveRequest(id, rejectLeaveDto);
  }

  @Post('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel leave request' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.EMPLOYEE)
  cancelLeaveRequest(@Param('id') id: string) {
    return this.leaveManagementService.cancelLeaveRequest(id);
  }

  @Delete('requests/:id')
  @ApiOperation({ summary: 'Delete leave request' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  deleteLeaveRequest(@Param('id') id: string) {
    return this.leaveManagementService.deleteLeaveRequest(id);
  }

  // Leave Balance Endpoints
  @Post('balances')
  @ApiOperation({ summary: 'Create leave balance for an employee' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  createLeaveBalance(@Body() createLeaveBalanceDto: CreateLeaveBalanceDto) {
    return this.leaveManagementService.createLeaveBalance(createLeaveBalanceDto);
  }

  @Get('balances/employee/:employeeId')
  @ApiOperation({ summary: 'Get all leave balances for an employee' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  getEmployeeLeaveBalances(@Param('employeeId') employeeId: string) {
    return this.leaveManagementService.getEmployeeLeaveBalances(employeeId);
  }

  @Patch('balances/:id')
  @ApiOperation({ summary: 'Update leave balance' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  updateLeaveBalance(
    @Param('id') id: string,
    @Body() updateLeaveBalanceDto: UpdateLeaveBalanceDto,
  ) {
    return this.leaveManagementService.updateLeaveBalance(id, updateLeaveBalanceDto);
  }

  // Leave Policy Endpoints
  @Post('policies')
  @ApiOperation({ summary: 'Create leave policy' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  createLeavePolicy(@Body() createLeavePolicyDto: CreateLeavePolicyDto) {
    return this.leaveManagementService.createLeavePolicy(createLeavePolicyDto);
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get all leave policies' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findAllLeavePolicies() {
    return this.leaveManagementService.findAllLeavePolicies();
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get leave policy by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findOneLeavePolicy(@Param('id') id: string) {
    return this.leaveManagementService.findOneLeavePolicy(id);
  }

  @Patch('policies/:id')
  @ApiOperation({ summary: 'Update leave policy' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  updateLeavePolicy(
    @Param('id') id: string,
    @Body() updateLeavePolicyDto: UpdateLeavePolicyDto,
  ) {
    return this.leaveManagementService.updateLeavePolicy(id, updateLeavePolicyDto);
  }

  @Delete('policies/:id')
  @ApiOperation({ summary: 'Delete leave policy' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  deleteLeavePolicy(@Param('id') id: string) {
    return this.leaveManagementService.deleteLeavePolicy(id);
  }

  // Statistics
  @Get('statistics/employee/:employeeId')
  @ApiOperation({ summary: 'Get leave statistics for an employee' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  getLeaveStatistics(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: number,
  ) {
    return this.leaveManagementService.getLeaveStatistics(employeeId, year);
  }
}
