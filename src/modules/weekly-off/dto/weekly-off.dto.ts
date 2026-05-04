import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsUUID, IsArray, IsNumber, IsObject, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { WeeklyOffType, ConfigurationLevel } from '../entities/weekly-off-policy.entity';

export class CreateWeeklyOffPolicyDto {
  @IsString()
  policyName: string;

  @IsString()
  policyCode: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(WeeklyOffType)
  weeklyOffType: WeeklyOffType;

  @IsEnum(ConfigurationLevel)
  configurationLevel: ConfigurationLevel;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  priority?: number;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWeeklyOffPatternDto)
  patterns: CreateWeeklyOffPatternDto[];
}

export class CreateWeeklyOffPatternDto {
  @IsString()
  patternName: string;

  @IsArray()
  @IsNumber({}, { each: true })
  offDays: number[];

  @IsOptional()
  @IsNumber()
  workingDaysCycle?: number;

  @IsOptional()
  @IsNumber()
  offDaysCycle?: number;

  @IsOptional()
  @IsDateString()
  rotationStartDate?: string;

  @IsOptional()
  @IsNumber()
  hoursPerDay?: number;

  @IsOptional()
  @IsNumber()
  daysPerWeek?: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWeeklyOffPolicyDto {
  @IsOptional()
  @IsString()
  policyName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WeeklyOffType)
  weeklyOffType?: WeeklyOffType;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateWeeklyOffAssignmentDto {
  @IsUUID()
  policyId: string;

  @IsString()
  entityType: string;

  @IsUUID()
  entityId: string;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsBoolean()
  isOverride?: boolean;

  @IsOptional()
  @IsString()
  overrideReason?: string;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}

export class BulkAssignWeeklyOffDto {
  @IsUUID()
  policyId: string;

  @IsString()
  entityType: string;

  @IsArray()
  @IsUUID('all', { each: true })
  entityIds: string[];

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateWeeklyOffOverrideDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  overrideDate: string;

  @IsString()
  overrideType: string;

  @IsString()
  originalDayType: string;

  @IsString()
  newDayType: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsBoolean()
  requiresCompensation?: boolean;

  @IsOptional()
  @IsString()
  compensationType?: string;

  @IsOptional()
  @IsDateString()
  compensationDate?: string;

  @IsOptional()
  @IsNumber()
  otMultiplier?: number;
}

export class ValidateWeeklyOffPolicyDto {
  @IsUUID()
  policyId: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetEmployeeWorkCalendarDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;
}

export class RecalculateWorkCalendarDto {
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  employeeIds?: string[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  forceRecalculation?: boolean;
}

export class ApproveOverrideDto {
  @IsUUID()
  overrideId: string;

  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class WeeklyOffPolicyQueryDto {
  @IsOptional()
  @IsEnum(WeeklyOffType)
  weeklyOffType?: WeeklyOffType;

  @IsOptional()
  @IsEnum(ConfigurationLevel)
  configurationLevel?: ConfigurationLevel;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class WeeklyOffReportDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  employeeIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];

  @IsOptional()
  @IsString()
  reportType?: string;

  @IsOptional()
  @IsString()
  format?: string;
}

export class WeeklyOffPolicyResponseDto {
  id: string;
  tenantId: string;
  policyName: string;
  policyCode: string;
  description: string;
  weeklyOffType: WeeklyOffType;
  configurationLevel: ConfigurationLevel;
  referenceId: string;
  priority: number;
  effectiveFrom: Date;
  effectiveTo: Date;
  isActive: boolean;
  countryId: string;
  isCompliant: boolean;
  complianceWarnings: any;
  patterns: WeeklyOffPatternResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class WeeklyOffPatternResponseDto {
  id: string;
  patternName: string;
  offDays: number[];
  workingDaysCycle: number;
  offDaysCycle: number;
  rotationStartDate: Date;
  hoursPerDay: number;
  daysPerWeek: number;
  isPaid: boolean;
  isActive: boolean;
}

export class EmployeeWorkCalendarResponseDto {
  employeeId: string;
  calendarDate: Date;
  dayType: string;
  isWorkingDay: boolean;
  isPaidDay: boolean;
  plannedHours: number;
  actualHours: number;
  shiftId: string;
  shiftStartTime: string;
  shiftEndTime: string;
  hasConflicts: boolean;
  conflictDetails: any;
  isOverride: boolean;
  metadata: any;
}

export class ComplianceValidationResponseDto {
  isValid: boolean;
  status: string;
  violations: ComplianceViolationDto[];
  warnings: ComplianceWarningDto[];
  summary: {
    totalRulesChecked: number;
    violationsCount: number;
    warningsCount: number;
    validationDate: Date;
  };
}

export class ComplianceViolationDto {
  ruleCode: string;
  ruleName: string;
  severity: string;
  message: string;
  details: any;
}

export class ComplianceWarningDto {
  ruleCode: string;
  ruleName: string;
  message: string;
  recommendation: string;
}
