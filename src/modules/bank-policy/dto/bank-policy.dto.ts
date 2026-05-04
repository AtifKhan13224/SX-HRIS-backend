import {
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDecimal,
  IsArray,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsJSON,
  IsObject,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  Matches,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PolicyStatus,
  PaymentMode,
  DisbursementMethod,
  BankChangeFrequency,
  FailedPaymentAction,
  ApprovalLevel,
} from '../entities/bank-policy.entity';

/**
 * CREATE BANK POLICY DTO
 */
export class CreateBankPolicyDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @ApiProperty({ example: 'UAE_WPS_STANDARD' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  policy_code: string;

  @ApiProperty({ example: 'UAE WPS Standard Policy' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @IsNotEmpty()
  policy_name: string;

  @ApiPropertyOptional({ example: 'Standard WPS-compliant payroll policy for UAE operations' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'UAE' })
  @IsString()
  @MinLength(2)
  @MaxLength(3)
  @IsNotEmpty()
  country_code: string;

  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  legal_entity_id?: string;

  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  payroll_group_id?: string;

  @ApiProperty({ enum: PolicyStatus, example: PolicyStatus.ACTIVE })
  @IsEnum(PolicyStatus)
  @IsOptional()
  status?: PolicyStatus;

  // ===== PAYMENT CONFIGURATION =====
  @ApiProperty({ example: ['BANK_TRANSFER', 'CASH'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  allowed_payment_modes: string[];

  @ApiProperty({ example: 'BANK_TRANSFER' })
  @IsString()
  @IsNotEmpty()
  default_payment_mode: string;

  @ApiProperty({ enum: DisbursementMethod, example: DisbursementMethod.SINGLE_PAYMENT })
  @IsEnum(DisbursementMethod)
  @IsOptional()
  disbursement_method?: DisbursementMethod;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allow_split_salary?: boolean;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  max_split_accounts?: number;

  // ===== BANK ACCOUNT RULES =====
  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  max_bank_accounts_per_employee?: number;

  @ApiProperty({ example: ['SAVINGS', 'SALARY'] })
  @IsArray()
  @IsString({ each: true })
  allowed_account_types: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  require_iban?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  require_swift_code?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  require_branch_code?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  require_bank_verification?: boolean;

  @ApiProperty({ example: ['account_number', 'account_holder_name', 'bank_name'] })
  @IsArray()
  @IsString({ each: true })
  mandatory_fields: string[];

  // ===== BANK CHANGE POLICY =====
  @ApiProperty({ enum: BankChangeFrequency, example: BankChangeFrequency.ONCE_PER_MONTH })
  @IsEnum(BankChangeFrequency)
  @IsOptional()
  bank_change_frequency?: BankChangeFrequency;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  bank_change_freeze_days?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  allow_retroactive_bank_change?: boolean;

  @ApiProperty({ enum: ApprovalLevel, example: ApprovalLevel.HR })
  @IsEnum(ApprovalLevel)
  @IsOptional()
  bank_change_approval_level?: ApprovalLevel;

  // ===== PAYROLL CUT-OFF & TIMING =====
  @ApiPropertyOptional({ example: 25 })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  payroll_cutoff_day?: number;

  @ApiPropertyOptional({ example: 28 })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  salary_credit_day?: number;

  @ApiPropertyOptional({ example: 26 })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  bank_file_generation_day?: number;

  @ApiPropertyOptional({ example: '14:00:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  @IsOptional()
  bank_file_generation_time?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  bank_processing_lead_days?: number;

  // ===== WPS CONFIGURATION =====
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  wps_enabled?: boolean;

  @ApiPropertyOptional({ example: 'Emirates NBD' })
  @IsString()
  @IsOptional()
  wps_provider?: string;

  @ApiPropertyOptional({ example: 'EMP123456' })
  @IsString()
  @IsOptional()
  wps_employer_id?: string;

  @ApiPropertyOptional({ example: 'EST789012' })
  @IsString()
  @IsOptional()
  wps_establishment_id?: string;

  @ApiPropertyOptional({ example: 'ENBD001' })
  @IsString()
  @IsOptional()
  wps_routing_code?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  wps_mandatory_validation?: boolean;

  // ===== SEPA CONFIGURATION =====
  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  sepa_enabled?: boolean;

  @ApiPropertyOptional({ example: 'DE98ZZZ09999999999' })
  @IsString()
  @IsOptional()
  sepa_creditor_identifier?: string;

  @ApiPropertyOptional({ example: 'CORE' })
  @IsString()
  @IsOptional()
  sepa_scheme?: string;

  // ===== ACH CONFIGURATION =====
  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  ach_enabled?: boolean;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsString()
  @IsOptional()
  ach_company_id?: string;

  @ApiPropertyOptional({ example: 'ACME Corporation' })
  @IsString()
  @IsOptional()
  ach_company_name?: string;

  // ===== FAILED PAYMENT HANDLING =====
  @ApiProperty({ enum: FailedPaymentAction, example: FailedPaymentAction.RETRY_AUTO })
  @IsEnum(FailedPaymentAction)
  @IsOptional()
  failed_payment_action?: FailedPaymentAction;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  failed_payment_retry_attempts?: number;

  @ApiPropertyOptional({ example: 24 })
  @IsInt()
  @Min(1)
  @Max(168)
  @IsOptional()
  failed_payment_retry_interval_hours?: number;

  // ===== MULTI-CURRENCY =====
  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  multi_currency_enabled?: boolean;

  @ApiProperty({ example: 'AED' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  @IsNotEmpty()
  base_currency: string;

  @ApiPropertyOptional({ example: ['USD', 'EUR', 'GBP'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supported_currencies?: string[];

  // ===== REGULATORY & COMPLIANCE =====
  @ApiPropertyOptional({
    example: {
      mandatory_checks: ['KYC', 'AML'],
      blocking_validations: ['IBAN_VALIDATION', 'WPS_VALIDATION'],
      warning_validations: ['DUPLICATE_ACCOUNT'],
    },
  })
  @IsObject()
  @IsOptional()
  regulatory_validations?: {
    mandatory_checks: string[];
    blocking_validations: string[];
    warning_validations: string[];
  };

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  data_masking_enabled?: boolean;

  // ===== EFFECTIVE DATING =====
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  @IsNotEmpty()
  effective_from: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  effective_to?: string;

  // ===== CUSTOM FIELDS =====
  @ApiPropertyOptional({ example: { cost_center: 'CC001', department: 'Finance' } })
  @IsObject()
  @IsOptional()
  custom_fields?: Record<string, any>;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  created_by: string;
}

/**
 * UPDATE BANK POLICY DTO
 */
export class UpdateBankPolicyDto {
  @ApiPropertyOptional({ example: 'UAE WPS Standard Policy (Updated)' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @IsOptional()
  policy_name?: string;

  @ApiPropertyOptional({ example: 'Updated policy description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: PolicyStatus, example: PolicyStatus.ACTIVE })
  @IsEnum(PolicyStatus)
  @IsOptional()
  status?: PolicyStatus;

  @ApiPropertyOptional({ example: ['BANK_TRANSFER', 'CASH', 'CHEQUE'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowed_payment_modes?: string[];

  @ApiPropertyOptional({ example: 'BANK_TRANSFER' })
  @IsString()
  @IsOptional()
  default_payment_mode?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allow_split_salary?: boolean;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  max_split_accounts?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  max_bank_accounts_per_employee?: number;

  @ApiPropertyOptional({ example: ['SAVINGS', 'CURRENT', 'SALARY'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowed_account_types?: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  require_iban?: boolean;

  @ApiPropertyOptional({ example: 7 })
  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  bank_change_freeze_days?: number;

  @ApiPropertyOptional({ example: 26 })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  payroll_cutoff_day?: number;

  @ApiPropertyOptional({ example: 29 })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  salary_credit_day?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  wps_enabled?: boolean;

  @ApiPropertyOptional({ example: 'Emirates NBD' })
  @IsString()
  @IsOptional()
  wps_provider?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  sepa_enabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  ach_enabled?: boolean;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  failed_payment_retry_attempts?: number;

  @ApiPropertyOptional({ example: { cost_center: 'CC002' } })
  @IsObject()
  @IsOptional()
  custom_fields?: Record<string, any>;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  updated_by: string;
}

/**
 * BANK POLICY QUERY DTO
 */
export class BankPolicyQueryDto {
  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  tenant_id?: string;

  @ApiPropertyOptional({ example: 'UAE' })
  @IsString()
  @IsOptional()
  country_code?: string;

  @ApiPropertyOptional({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsOptional()
  legal_entity_id?: string;

  @ApiPropertyOptional({ enum: PolicyStatus, example: PolicyStatus.ACTIVE })
  @IsEnum(PolicyStatus)
  @IsOptional()
  status?: PolicyStatus;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  wps_enabled?: boolean;

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

  @ApiPropertyOptional({ example: 'policy_name' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'ASC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * CREATE POLICY EXCEPTION DTO
 */
export class CreatePolicyExceptionDto {
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
  employee_id?: string;

  @ApiProperty({ example: 'EARLY_SALARY' })
  @IsString()
  @IsNotEmpty()
  exception_type: string;

  @ApiProperty({ example: 'Employee requested early salary due to emergency' })
  @IsString()
  @IsNotEmpty()
  exception_reason: string;

  @ApiProperty({
    example: {
      overridden_field: 'allow_early_salary',
      original_value: false,
      exception_value: true,
    },
  })
  @IsObject()
  @IsNotEmpty()
  exception_config: {
    overridden_field: string;
    original_value: any;
    exception_value: any;
    conditions?: Record<string, any>;
  };

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  @IsNotEmpty()
  effective_from: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsDateString()
  @IsOptional()
  effective_to?: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  approved_by: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  created_by: string;
}

/**
 * CREATE POLICY SCHEDULE DTO
 */
export class CreatePolicyScheduleDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  policy_id: string;

  @ApiProperty({ example: '2026-01' })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  @IsNotEmpty()
  processing_month: string;

  @ApiProperty({ example: '2026-01-25' })
  @IsDateString()
  @IsNotEmpty()
  payroll_cutoff_date: string;

  @ApiProperty({ example: '2026-01-26' })
  @IsDateString()
  @IsNotEmpty()
  bank_file_generation_date: string;

  @ApiProperty({ example: '2026-01-27' })
  @IsDateString()
  @IsNotEmpty()
  bank_file_submission_date: string;

  @ApiProperty({ example: '2026-01-28' })
  @IsDateString()
  @IsNotEmpty()
  expected_salary_credit_date: string;

  @ApiPropertyOptional({ example: ['2026-01-01', '2026-01-26'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  holiday_dates?: string[];

  @ApiPropertyOptional({ example: 'Public holiday on 26th, adjusted schedule' })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * VALIDATE POLICY DTO
 */
export class ValidatePolicyDto {
  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  policy_id: string;

  @ApiProperty({ example: 'AED80DB4-1234-5678-90AB-CDEF12345678' })
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;

  @ApiProperty({ example: '2026-01' })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  @IsNotEmpty()
  processing_month: string;

  @ApiPropertyOptional({ example: { bank_change_requested: true } })
  @IsObject()
  @IsOptional()
  context?: Record<string, any>;
}

/**
 * COUNTRY TEMPLATE QUERY DTO
 */
export class CountryTemplateQueryDto {
  @ApiPropertyOptional({ example: 'UAE' })
  @IsString()
  @IsOptional()
  country_code?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
