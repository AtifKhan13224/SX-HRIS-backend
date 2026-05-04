import {
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsArray,
  IsNumber,
  IsObject,
  Min,
  Max,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SeparationType,
  SeparationInitiator,
  NoticeDayType,
} from '../entities/notice-period-policy.entity';
import { SeparationStatus } from '../entities/employee-separation.entity';

// ==================== NOTICE PERIOD POLICY DTOs ====================

export class CreateNoticePeriodPolicyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  policy_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  policy_name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  country_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  legal_entity_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  employee_type_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  employee_subtype_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  grade_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  band_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  contract_type_id?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  applies_to_probation?: boolean;

  @ApiProperty({ enum: SeparationType, isArray: true })
  @IsArray()
  @IsEnum(SeparationType, { each: true })
  applicable_separation_types: SeparationType[];

  @ApiPropertyOptional({ enum: SeparationInitiator })
  @IsEnum(SeparationInitiator)
  @IsOptional()
  separation_initiator?: SeparationInitiator;

  @ApiProperty()
  @IsInt()
  @Min(0)
  standard_notice_days: number;

  @ApiProperty({ enum: NoticeDayType })
  @IsEnum(NoticeDayType)
  notice_day_type: NoticeDayType;

  @ApiProperty()
  @IsInt()
  @Min(0)
  minimum_legal_notice_days: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  maximum_notice_days?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  probation_notice_days?: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  probation_immediate_termination_allowed?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  employer_notice_days?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  employee_notice_days?: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  employee_buyout_allowed?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  employer_pilon_allowed?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  partial_buyout_allowed?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  buyout_multiplier?: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  leave_allowed_during_notice?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  force_leave_utilization?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  include_holidays_in_notice?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  unpaid_leave_allowed?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  attendance_required_during_notice?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  override_requires_approval?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  override_approvers?: string[];

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  override_requires_justification?: boolean;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  country_law_overrides_policy?: boolean;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  country_law_reference?: {
    law_name?: string;
    article_number?: string;
    minimum_notice_days?: number;
    special_conditions?: string;
  };

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  visa_dependent?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  visa_cancellation_notice_days?: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  requires_ministry_notification?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  ministry_notification_days_before?: number;

  @ApiProperty({ default: 100 })
  @IsInt()
  @Min(1)
  @IsOptional()
  rule_priority?: number;

  @ApiProperty()
  @IsDateString()
  effective_from: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  effective_to?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateNoticePeriodPolicyDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  policy_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  standard_notice_days?: number;

  @ApiPropertyOptional({ enum: NoticeDayType })
  @IsEnum(NoticeDayType)
  @IsOptional()
  notice_day_type?: NoticeDayType;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  minimum_legal_notice_days?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  maximum_notice_days?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  employee_buyout_allowed?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  employer_pilon_allowed?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  leave_allowed_during_notice?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  force_leave_utilization?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  effective_to?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

// ==================== EMPLOYEE SEPARATION DTOs ====================

export class CreateSeparationDto {
  @ApiProperty()
  @IsUUID()
  employee_id: string;

  @ApiProperty({ enum: SeparationType })
  @IsEnum(SeparationType)
  separation_type: SeparationType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  separation_reason?: string;

  @ApiProperty()
  @IsDateString()
  submission_date: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  preferred_last_working_day?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateSeparationDto {
  @ApiPropertyOptional({ enum: SeparationStatus })
  @IsEnum(SeparationStatus)
  @IsOptional()
  status?: SeparationStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  separation_reason?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  last_working_day?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ApproveSeparationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  approval_level: string; // MANAGER, HR, FINAL

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty()
  @IsBoolean()
  approved: boolean;
}

export class CalculateBuyoutDto {
  @ApiProperty()
  @IsUUID()
  separation_id: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  buyout_days?: number; // For partial buyout
}

export class BuyoutResponseDto {
  @ApiProperty()
  separation_id: string;

  @ApiProperty()
  notice_days_remaining: number;

  @ApiProperty()
  buyout_amount: number;

  @ApiProperty()
  daily_salary: number;

  @ApiProperty()
  multiplier: number;

  @ApiProperty()
  tax_treatment: string;

  @ApiProperty()
  is_partial: boolean;
}

export class WithdrawalRequestDto {
  @ApiProperty()
  @IsUUID()
  separation_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  withdrawal_reason: string;
}

export class NoticePeriodQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  country_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  legal_entity_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  employee_type_id?: string;

  @ApiPropertyOptional({ enum: SeparationType })
  @IsEnum(SeparationType)
  @IsOptional()
  separation_type?: SeparationType;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class SeparationQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  employee_id?: string;

  @ApiPropertyOptional({ enum: SeparationStatus })
  @IsEnum(SeparationStatus)
  @IsOptional()
  status?: SeparationStatus;

  @ApiPropertyOptional({ enum: SeparationType })
  @IsEnum(SeparationType)
  @IsOptional()
  separation_type?: SeparationType;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  from_date?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  to_date?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
