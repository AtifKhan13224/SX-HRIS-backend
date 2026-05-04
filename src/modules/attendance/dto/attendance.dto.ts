import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { AttendanceStatus, CheckType } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Attendance date', example: '2026-02-21' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Check-in time', example: '09:00:00', required: false })
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @ApiProperty({ description: 'Check-out time', example: '17:00:00', required: false })
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiProperty({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({ description: 'Work hours', example: 8, required: false })
  @IsOptional()
  @IsNumber()
  workHours?: number;

  @ApiProperty({ description: 'Overtime hours', example: 2, required: false })
  @IsOptional()
  @IsNumber()
  overtimeHours?: number;

  @ApiProperty({ description: 'Remarks', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ description: 'Is manually entered', default: false })
  @IsOptional()
  @IsBoolean()
  isManual?: boolean;

  @ApiProperty({ description: 'Latitude', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'Device info', required: false })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}

export class CheckInOutDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ enum: CheckType })
  @IsEnum(CheckType)
  type: CheckType;

  @ApiProperty({ description: 'Latitude', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: 'Longitude', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: 'Device info', required: false })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}

export class AttendanceQueryDto {
  @ApiProperty({ description: 'Start date', example: '2026-02-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', example: '2026-02-28', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Employee ID', required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ enum: AttendanceStatus, required: false })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 10, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
