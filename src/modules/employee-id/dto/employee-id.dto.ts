import {
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsObject,
  ValidateNested,
  Matches,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PolicyStatus,
  PolicyLevel,
  SequenceResetFrequency,
  IDGenerationTrigger,
  RehireIDStrategy,
  IDReservationStatus,
  EmployeeIDType,
  IDTransitionTrigger,
} from '../entities/employee-id.entity';

/**
 * CREATE EMPLOYEE ID POLICY DTO
 */
export class CreateEmployeeIDPolicyDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @ApiProperty({ example: 'GLOBAL_EMP_STANDARD' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  policy_code: string;

  @ApiProperty({ example: 'Global Employee ID Standard Policy' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @IsNotEmpty()
  policy_name: string;

  @ApiPropertyOptional({ example: 'Standard employee ID policy with country-year-sequence pattern' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: PolicyLevel, example: PolicyLevel.GLOBAL })
  @IsEnum(PolicyLevel)
  @IsNotEmpty()
  policy_level: PolicyLevel;

  @ApiPropertyOptional({ example: 'UAE' })
  @IsString()
  @IsOptional()
  level_value?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsInt()
  @IsOptional()
  priority?: number;

  // ===== ID PATTERN =====
  @ApiProperty({ example: '{COUNTRY}-{YEAR}-{SEQUENCE:5}' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @IsNotEmpty()
  id_pattern: string;

  @ApiPropertyOptional({ example: 'EMP' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  prefix?: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  suffix?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  min_length?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  max_length?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allow_alphabets?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allow_numbers?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allow_hyphens?: boolean;

  @ApiPropertyOptional({ example: 'UAE-2026-00001, UAE-2026-00002' })
  @IsString()
  @IsOptional()
  example_ids?: string;

  // ===== SEQUENCE CONFIGURATION =====
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  sequence_start?: number;

  @ApiPropertyOptional({ example: 999999 })
  @IsNumber()
  @IsOptional()
  sequence_end?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  sequence_increment?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  sequence_padding?: number;

  @ApiProperty({ enum: SequenceResetFrequency, example: SequenceResetFrequency.YEARLY })
  @IsEnum(SequenceResetFrequency)
  @IsOptional()
  sequence_reset_frequency?: SequenceResetFrequency;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  use_global_sequence?: boolean;

  @ApiPropertyOptional({ example: 'TENANT' })
  @IsString()
  @IsOptional()
  sequence_scope?: string;

  // ===== ID GENERATION RULES =====
  @ApiProperty({ enum: IDGenerationTrigger, example: IDGenerationTrigger.ON_HIRING })
  @IsEnum(IDGenerationTrigger)
  @IsOptional()
  generation_trigger?: IDGenerationTrigger;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  auto_generate?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allow_manual_override?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  require_approval?: boolean;

  @ApiPropertyOptional({ example: 'HR_MANAGER' })
  @IsString()
  @IsOptional()
  approval_role?: string;

  // ===== RESERVATION =====
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allow_reservation?: boolean;

  @ApiPropertyOptional({ example: 24 })
  @IsInt()
  @Min(1)
  @Max(168)
  @IsOptional()
  reservation_expiry_hours?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  pre_reserve_count?: number;

  // ===== REHIRE HANDLING =====
  @ApiProperty({ enum: RehireIDStrategy, example: RehireIDStrategy.GENERATE_NEW })
  @IsEnum(RehireIDStrategy)
  @IsOptional()
  rehire_id_strategy?: RehireIDStrategy;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  retain_id_on_internal_transfer?: boolean;

  @ApiPropertyOptional({ example: '-R{N}' })
  @IsString()
  @IsOptional()
  rehire_suffix_pattern?: string;

  // ===== ID TYPE & LIFECYCLE =====
  @ApiProperty({ enum: EmployeeIDType, example: EmployeeIDType.MASTER })
  @IsEnum(EmployeeIDType)
  @IsOptional()
  id_type?: EmployeeIDType;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  is_temporary?: boolean;

  @ApiPropertyOptional({ example: 'uuid-of-master-policy' })
  @IsUUID()
  @IsOptional()
  master_policy_id?: string;

  @ApiPropertyOptional({ enum: IDTransitionTrigger, example: IDTransitionTrigger.ONBOARDING_COMPLETE })
  @IsEnum(IDTransitionTrigger)
  @IsOptional()
  transition_trigger?: IDTransitionTrigger;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  auto_transition?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  retain_temporary_in_history?: boolean;

  @ApiPropertyOptional({ example: 'TEMP-' })
  @IsString()
  @IsOptional()
  temporary_id_prefix?: string;

  @ApiPropertyOptional({ example: 'CAND-' })
  @IsString()
  @IsOptional()
  candidate_id_prefix?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  temporary_id_validity_days?: number;

  @ApiPropertyOptional({ example: 180 })
  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  candidate_id_validity_days?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  notify_on_transition?: boolean;

  @ApiPropertyOptional({
    example: {
      require_approval: false,
      approval_role: 'HR_MANAGER',
      pre_conditions: ['CONTRACT_SIGNED', 'BACKGROUND_CHECK_COMPLETE']
    }
  })
  @IsObject()
  @IsOptional()
  transition_rules?: Record<string, any>;

  // ===== COUNTRY COMPLIANCE =====
  @ApiPropertyOptional({ example: 'UAE' })
  @IsString()
  @MinLength(2)
  @MaxLength(3)
  @IsOptional()
  country_code?: string;

  @ApiPropertyOptional({
    example: {
      requires_national_id_mapping: false,
      max_id_length: 20,
      min_id_length: 8,
    },
  })
  @IsObject()
  @IsOptional()
  country_rules?: Record<string, any>;

  // ===== IMMUTABILITY =====
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_immutable?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  allow_correction?: boolean;

  @ApiPropertyOptional({ example: 48 })
  @IsInt()
  @Min(1)
  @Max(168)
  @IsOptional()
  correction_grace_period_hours?: number;

  // ===== EFFECTIVE DATING =====
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  @IsNotEmpty()
  effective_from: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  effective_to?: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  created_by: string;
}

/**
 * UPDATE EMPLOYEE ID POLICY DTO
 */
export class UpdateEmployeeIDPolicyDto {
  @ApiPropertyOptional({ example: 'Global Employee ID Standard Policy (Updated)' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @IsOptional()
  policy_name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: PolicyStatus, example: PolicyStatus.ACTIVE })
  @IsEnum(PolicyStatus)
  @IsOptional()
  status?: PolicyStatus;

  @ApiPropertyOptional({ example: '{COUNTRY}-{YEAR}-{SEQUENCE:6}' })
  @IsString()
  @IsOptional()
  id_pattern?: string;

  @ApiPropertyOptional({ example: 6 })
  @IsInt()
  @IsOptional()
  sequence_padding?: number;

  @ApiPropertyOptional({ example: 48 })
  @IsInt()
  @IsOptional()
  reservation_expiry_hours?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  auto_generate?: boolean;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  updated_by: string;
}

/**
 * POLICY QUERY DTO
 */
export class EmployeeIDPolicyQueryDto {
  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  tenant_id?: string;

  @ApiPropertyOptional({ enum: PolicyLevel, example: PolicyLevel.COUNTRY })
  @IsEnum(PolicyLevel)
  @IsOptional()
  policy_level?: PolicyLevel;

  @ApiPropertyOptional({ example: 'UAE' })
  @IsString()
  @IsOptional()
  level_value?: string;

  @ApiPropertyOptional({ enum: PolicyStatus, example: PolicyStatus.ACTIVE })
  @IsEnum(PolicyStatus)
  @IsOptional()
  status?: PolicyStatus;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_current_version?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

/**
 * RESERVE EMPLOYEE ID DTO
 */
export class ReserveEmployeeIDDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  policy_id: string;

  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  reserved_for?: string;

  @ApiPropertyOptional({ example: 'John Doe - Candidate REQ-2026-001' })
  @IsString()
  @IsOptional()
  reserved_for_context?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  count?: number;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  reserved_by: string;
}

/**
 * ASSIGN EMPLOYEE ID DTO
 */
export class AssignEmployeeIDDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  policy_id: string;

  @ApiPropertyOptional({ example: 'UAE-2026-00001' })
  @IsString()
  @IsOptional()
  employee_number?: string; // Manual override

  @ApiPropertyOptional({ example: 'INITIAL' })
  @IsString()
  @IsOptional()
  assignment_type?: string;

  @ApiPropertyOptional({ example: '2026-01-22' })
  @IsDateString()
  @IsOptional()
  effective_from?: string;

  @ApiPropertyOptional({
    example: {
      country_code: 'UAE',
      legal_entity_id: 'uuid',
      employment_type: 'FULL_TIME',
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  assigned_by: string;
}

/**
 * GENERATE EMPLOYEE ID DTO
 */
export class GenerateEmployeeIDDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  policy_id: string;

  @ApiPropertyOptional({
    example: {
      country_code: 'UAE',
      legal_entity_id: 'uuid',
      business_unit_id: 'uuid',
      employment_type: 'FULL_TIME',
      hire_date: '2026-01-22',
    },
  })
  @IsObject()
  @IsNotEmpty()
  context: Record<string, any>;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  preview_only?: boolean; // Generate but don't commit
}

/**
 * VALIDATE ID PATTERN DTO
 */
export class ValidateIDPatternDto {
  @ApiProperty({ example: '{COUNTRY}-{YEAR}-{SEQUENCE:5}' })
  @IsString()
  @IsNotEmpty()
  id_pattern: string;

  @ApiPropertyOptional({
    example: {
      country_code: 'UAE',
      year: 2026,
    },
  })
  @IsObject()
  @IsOptional()
  sample_context?: Record<string, any>;
}

/**
 * CORRECT EMPLOYEE ID DTO
 */
export class CorrectEmployeeIDDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  assignment_id: string;

  @ApiProperty({ example: 'UAE-2026-00001' })
  @IsString()
  @IsNotEmpty()
  new_employee_number: string;

  @ApiProperty({ example: 'Typographical error in original ID' })
  @IsString()
  @MinLength(10)
  @IsNotEmpty()
  correction_reason: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  corrected_by: string;

  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  approved_by?: string;
}

/**
 * BULK RESERVE DTO
 */
export class BulkReserveEmployeeIDDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  policy_id: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsNotEmpty()
  count: number;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  reserved_by: string;
}

/**
 * CANCEL RESERVATION DTO
 */
export class CancelReservationDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  reservation_id: string;

  @ApiProperty({ example: 'Candidate withdrew application' })
  @IsString()
  @IsNotEmpty()
  cancellation_reason: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  cancelled_by: string;
}

/**
 * RESET SEQUENCE DTO
 */
export class ResetSequenceDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  policy_id: string;

  @ApiPropertyOptional({ example: 'GLOBAL' })
  @IsString()
  @IsOptional()
  scope_key?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  reset_to_value: number;

  @ApiProperty({ example: 'Start of new fiscal year' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  reset_by: string;
}

/**
 * GET APPLICABLE POLICY DTO
 */
export class GetApplicablePolicyDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @ApiPropertyOptional({ example: 'UAE' })
  @IsString()
  @IsOptional()
  country_code?: string;

  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  legal_entity_id?: string;

  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  business_unit_id?: string;

  @ApiPropertyOptional({ example: 'FULL_TIME' })
  @IsString()
  @IsOptional()
  employment_type?: string;

  @ApiPropertyOptional({ example: '2026-01-22' })
  @IsDateString()
  @IsOptional()
  effective_date?: string;
}

/**
 * EMPLOYEE ID SEARCH DTO
 */
export class EmployeeIDSearchDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @ApiPropertyOptional({ example: 'UAE-2026-00001' })
  @IsString()
  @IsOptional()
  employee_number?: string;

  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  employee_id?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_current?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsInt()
  @IsOptional()
  limit?: number;
}

/**
 * TOKEN DEFINITION DTO
 */
export class TokenDefinitionDto {
  @ApiProperty({ example: 'COUNTRY' })
  @IsString()
  @IsNotEmpty()
  token_code: string;

  @ApiProperty({ example: 'Country Code' })
  @IsString()
  @IsNotEmpty()
  token_name: string;

  @ApiProperty({ example: 'ISO 3166-1 alpha-3 country code' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'GEOGRAPHY' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'UAE' })
  @IsString()
  @IsNotEmpty()
  example_output: string;
}
/**
 * TRANSITION ID DTO (Temporary/Candidate to Master)
 */
export class TransitionEmployeeIDDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  assignment_id: string; // Current temp/candidate assignment ID

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  master_policy_id: string; // Master policy to use

  @ApiProperty({ enum: IDTransitionTrigger, example: IDTransitionTrigger.ONBOARDING_COMPLETE })
  @IsEnum(IDTransitionTrigger)
  @IsNotEmpty()
  trigger: IDTransitionTrigger;

  @ApiPropertyOptional({ example: 'Onboarding completed successfully' })
  @IsString()
  @IsOptional()
  transition_notes?: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  transitioned_by: string;

  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  approved_by?: string;
}

/**
 * CHECK TRANSITION ELIGIBILITY DTO
 */
export class CheckTransitionEligibilityDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  assignment_id: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;
}

/**
 * GET ID BY TYPE DTO
 */
export class GetIDByTypeDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @ApiProperty({ enum: EmployeeIDType, example: EmployeeIDType.CANDIDATE })
  @IsEnum(EmployeeIDType)
  @IsNotEmpty()
  id_type: EmployeeIDType;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
