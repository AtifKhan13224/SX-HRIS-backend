import { IsString, IsEnum, IsNumber, IsDateString, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { LeaveType, LeaveStatus } from '../entities/leave.entity';

export class CreateLeaveRequestDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ enum: LeaveType })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiProperty({ description: 'Start date', example: '2026-02-25' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date', example: '2026-02-27' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Total days', example: 3 })
  @IsNumber()
  @Min(0.5)
  totalDays: number;

  @ApiProperty({ description: 'Reason for leave' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Attachment URL', required: false })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiProperty({ description: 'Is half day', default: false })
  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;
}

export class UpdateLeaveRequestDto extends PartialType(CreateLeaveRequestDto) {}

export class ApproveLeaveDto {
  @ApiProperty({ description: 'Approver ID' })
  @IsString()
  approvedBy: string;

  @ApiProperty({ description: 'Manager notes', required: false })
  @IsOptional()
  @IsString()
  managerNotes?: string;
}

export class RejectLeaveDto {
  @ApiProperty({ description: 'Approver ID' })
  @IsString()
  approvedBy: string;

  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  rejectionReason: string;

  @ApiProperty({ description: 'Manager notes', required: false })
  @IsOptional()
  @IsString()
  managerNotes?: string;
}

export class LeaveQueryDto {
  @ApiProperty({ description: 'Employee ID', required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ enum: LeaveStatus, required: false })
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @ApiProperty({ enum: LeaveType, required: false })
  @IsOptional()
  @IsEnum(LeaveType)
  leaveType?: LeaveType;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreateLeaveBalanceDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ enum: LeaveType })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiProperty({ description: 'Year' })
  @IsNumber()
  year: number;

  @ApiProperty({ description: 'Total allocated' })
  @IsNumber()
  @Min(0)
  totalAllocated: number;

  @ApiProperty({ description: 'Carried forward', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carriedForward?: number;
}

export class UpdateLeaveBalanceDto extends PartialType(CreateLeaveBalanceDto) {}

export class CreateLeavePolicyDto {
  @ApiProperty({ description: 'Policy name' })
  @IsString()
  policyName: string;

  @ApiProperty({ enum: LeaveType })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiProperty({ description: 'Annual allocation' })
  @IsNumber()
  @Min(0)
  annualAllocation: number;

  @ApiProperty({ description: 'Max carry forward', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCarryForward?: number;

  @ApiProperty({ description: 'Min notice days', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minNoticeDays?: number;

  @ApiProperty({ description: 'Max consecutive days', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxConsecutiveDays?: number;

  @ApiProperty({ description: 'Requires approval', default: true })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiProperty({ description: 'Requires attachment', default: false })
  @IsOptional()
  @IsBoolean()
  requiresAttachment?: boolean;

  @ApiProperty({ description: 'Allow half day', default: false })
  @IsOptional()
  @IsBoolean()
  allowHalfDay?: boolean;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateLeavePolicyDto extends PartialType(CreateLeavePolicyDto) {}
