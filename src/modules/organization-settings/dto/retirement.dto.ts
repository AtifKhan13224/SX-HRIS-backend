import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsUUID,
  IsObject,
  IsArray,
  Min,
  Max,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  RetirementEligibilityCriteria,
  RetirementTriggerType,
  RetirementNoticeType,
  PostRetirementEmployment,
  GenderApplicability,
} from '../entities/retirement-policy.entity';
import {
  RetirementStatus,
  RetirementType,
  ApprovalStatus,
} from '../entities/employee-retirement.entity';

// ==================== POLICY DTOs ====================

export class CreateRetirementPolicyDto {
  @IsString()
  @Length(1, 50)
  policy_code: string;

  @IsString()
  @Length(1, 200)
  policy_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  rule_priority?: number;

  // Applicability
  @IsOptional()
  @IsString()
  @Length(3, 3)
  country_code?: string;

  @IsOptional()
  @IsUUID()
  legal_entity_id?: string;

  @IsOptional()
  @IsString()
  employee_type?: string;

  @IsOptional()
  @IsString()
  employee_sub_type?: string;

  @IsOptional()
  @IsString()
  grade_band?: string;

  @IsOptional()
  @IsString()
  contract_type?: string;

  @IsOptional()
  @IsEnum(GenderApplicability)
  gender_applicability?: GenderApplicability;

  @IsOptional()
  @IsBoolean()
  apply_to_union_members?: boolean;

  @IsOptional()
  @IsString()
  union_agreement_reference?: string;

  // Eligibility
  @IsEnum(RetirementEligibilityCriteria)
  eligibility_criteria: RetirementEligibilityCriteria;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  mandatory_retirement_age?: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  minimum_retirement_age?: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  maximum_retirement_age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimum_service_years?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimum_service_months?: number;

  @IsOptional()
  @IsString()
  custom_eligibility_formula?: string;

  @IsOptional()
  @IsBoolean()
  allow_early_retirement?: boolean;

  @IsOptional()
  @IsInt()
  @Min(18)
  early_retirement_age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  early_retirement_min_service?: number;

  @IsOptional()
  @IsBoolean()
  allow_deferred_retirement?: boolean;

  @IsOptional()
  @IsInt()
  @Min(18)
  deferred_retirement_max_age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  deferred_retirement_max_months?: number;

  // Trigger Configuration
  @IsEnum(RetirementTriggerType)
  trigger_type: RetirementTriggerType;

  @IsOptional()
  @IsInt()
  @Min(0)
  advance_notice_months?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  advance_notice_days?: number;

  @IsOptional()
  @IsBoolean()
  auto_status_transition?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_manual_override?: boolean;

  @IsOptional()
  @IsBoolean()
  require_approval_for_override?: boolean;

  // Notice Configuration
  @IsEnum(RetirementNoticeType)
  notice_type: RetirementNoticeType;

  @IsOptional()
  @IsInt()
  @Min(0)
  notice_period_days?: number;

  @IsOptional()
  @IsBoolean()
  employer_advance_notification_required?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  employer_notification_days?: number;

  @IsOptional()
  @IsBoolean()
  require_acknowledgment?: boolean;

  @IsOptional()
  @IsBoolean()
  auto_issue_notice?: boolean;

  // Post-Retirement
  @IsEnum(PostRetirementEmployment)
  post_retirement_employment: PostRetirementEmployment;

  @IsOptional()
  @IsBoolean()
  allow_rehire?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  rehire_cooling_off_months?: number;

  @IsOptional()
  @IsBoolean()
  allow_consultant_conversion?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  consultant_max_duration_months?: number;

  @IsOptional()
  @IsBoolean()
  allow_advisory_role?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  advisory_max_duration_months?: number;

  // Benefits
  @IsOptional()
  @IsBoolean()
  gratuity_eligible?: boolean;

  @IsOptional()
  @IsString()
  pension_scheme_code?: string;

  @IsOptional()
  @IsBoolean()
  trigger_final_settlement?: boolean;

  @IsOptional()
  @IsBoolean()
  continue_health_benefits?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  health_benefits_duration_months?: number;

  @IsOptional()
  @IsBoolean()
  continue_life_insurance?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  life_insurance_duration_months?: number;

  @IsOptional()
  @IsObject()
  additional_benefits_config?: Record<string, any>;

  // Compliance
  @IsOptional()
  @IsBoolean()
  government_reporting_required?: boolean;

  @IsOptional()
  @IsString()
  reporting_authority?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  reporting_deadline_days?: number;

  @IsOptional()
  @IsBoolean()
  work_permit_dependent?: boolean;

  @IsOptional()
  @IsBoolean()
  visa_cancellation_required?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  visa_grace_period_days?: number;

  @IsOptional()
  @IsString()
  legal_reference_code?: string;

  @IsOptional()
  @IsString()
  compliance_notes?: string;

  // Overrides
  @IsOptional()
  @IsBoolean()
  allow_age_extension?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_extension_years?: number;

  @IsOptional()
  @IsBoolean()
  extension_requires_approval?: boolean;

  @IsOptional()
  @IsString()
  extension_approval_level?: string;

  @IsOptional()
  @IsBoolean()
  allow_early_retirement_approval?: boolean;

  @IsOptional()
  @IsBoolean()
  require_dual_approval?: boolean;

  @IsOptional()
  @IsBoolean()
  mandatory_justification?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  override_validity_months?: number;

  // Effective Dating
  @IsDateString()
  effective_from: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_retroactive_application?: boolean;

  // Rule Builder
  @IsOptional()
  @IsObject()
  conditional_logic?: Record<string, any>;

  @IsOptional()
  @IsObject()
  exception_rules?: Record<string, any>;

  // Event Outputs
  @IsOptional()
  @IsBoolean()
  trigger_eligibility_event?: boolean;

  @IsOptional()
  @IsBoolean()
  trigger_pre_retirement_notification?: boolean;

  @IsOptional()
  @IsBoolean()
  trigger_lifecycle_status_change?: boolean;

  @IsOptional()
  @IsBoolean()
  trigger_downstream_systems?: boolean;

  @IsOptional()
  @IsObject()
  downstream_system_config?: Record<string, any>;
}

export class UpdateRetirementPolicyDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  policy_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  rule_priority?: number;

  @IsOptional()
  @IsEnum(RetirementEligibilityCriteria)
  eligibility_criteria?: RetirementEligibilityCriteria;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  mandatory_retirement_age?: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  minimum_retirement_age?: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  maximum_retirement_age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimum_service_years?: number;

  @IsOptional()
  @IsBoolean()
  allow_early_retirement?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_deferred_retirement?: boolean;

  @IsOptional()
  @IsEnum(RetirementTriggerType)
  trigger_type?: RetirementTriggerType;

  @IsOptional()
  @IsInt()
  @Min(0)
  advance_notice_months?: number;

  @IsOptional()
  @IsBoolean()
  auto_status_transition?: boolean;

  @IsOptional()
  @IsEnum(PostRetirementEmployment)
  post_retirement_employment?: PostRetirementEmployment;

  @IsOptional()
  @IsBoolean()
  allow_rehire?: boolean;

  @IsOptional()
  @IsBoolean()
  gratuity_eligible?: boolean;

  @IsOptional()
  @IsString()
  pension_scheme_code?: string;

  @IsOptional()
  @IsBoolean()
  government_reporting_required?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_age_extension?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_extension_years?: number;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsObject()
  conditional_logic?: Record<string, any>;
}

// ==================== EMPLOYEE RETIREMENT DTOs ====================

export class CreateEmployeeRetirementDto {
  @IsUUID()
  employee_id: string;

  @IsUUID()
  policy_id: string;

  @IsEnum(RetirementType)
  retirement_type: RetirementType;

  @IsOptional()
  @IsString()
  retirement_reason?: string;

  @IsOptional()
  @IsDateString()
  employee_date_of_birth?: string;

  @IsOptional()
  @IsDateString()
  employee_date_of_joining?: string;

  @IsDateString()
  expected_retirement_date: string;

  @IsOptional()
  @IsBoolean()
  is_early_retirement?: boolean;

  @IsOptional()
  @IsString()
  early_retirement_justification?: string;

  @IsOptional()
  @IsBoolean()
  is_deferred?: boolean;

  @IsOptional()
  @IsDateString()
  deferred_until_date?: string;

  @IsOptional()
  @IsString()
  deferral_justification?: string;
}

export class UpdateEmployeeRetirementDto {
  @IsOptional()
  @IsEnum(RetirementStatus)
  retirement_status?: RetirementStatus;

  @IsOptional()
  @IsString()
  retirement_reason?: string;

  @IsOptional()
  @IsDateString()
  expected_retirement_date?: string;

  @IsOptional()
  @IsDateString()
  actual_retirement_date?: string;

  @IsOptional()
  @IsDateString()
  last_working_day?: string;

  @IsOptional()
  @IsDateString()
  notice_acknowledgment_date?: string;

  @IsOptional()
  @IsString()
  internal_notes?: string;

  @IsOptional()
  @IsString()
  employee_comments?: string;

  @IsOptional()
  @IsString()
  hr_comments?: string;
}

export class RequestExtensionDto {
  @IsUUID()
  retirement_id: string;

  @IsInt()
  @Min(1)
  @Max(60)
  extension_months_requested: number;

  @IsString()
  extension_justification: string;

  @IsOptional()
  @IsUUID()
  requested_by?: string;
}

export class ApproveExtensionDto {
  @IsUUID()
  retirement_id: string;

  @IsInt()
  @Min(1)
  extension_months_approved: number;

  @IsDateString()
  extended_retirement_date: string;

  @IsUUID()
  approved_by: string;

  @IsOptional()
  @IsString()
  approval_comments?: string;
}

export class RejectExtensionDto {
  @IsUUID()
  retirement_id: string;

  @IsString()
  rejection_reason: string;

  @IsUUID()
  rejected_by: string;
}

export class RequestEarlyRetirementDto {
  @IsUUID()
  employee_id: string;

  @IsUUID()
  policy_id: string;

  @IsDateString()
  requested_retirement_date: string;

  @IsString()
  justification: string;

  @IsOptional()
  @IsUUID()
  requested_by?: string;
}

export class ApproveRetirementDto {
  @IsUUID()
  retirement_id: string;

  @IsUUID()
  approved_by: string;

  @IsOptional()
  @IsUUID()
  secondary_approver_id?: string;

  @IsOptional()
  @IsString()
  approval_comments?: string;
}

export class RejectRetirementDto {
  @IsUUID()
  retirement_id: string;

  @IsString()
  rejection_reason: string;

  @IsUUID()
  rejected_by: string;
}

export class CancelRetirementDto {
  @IsUUID()
  retirement_id: string;

  @IsString()
  cancellation_reason: string;

  @IsUUID()
  cancelled_by: string;
}

export class CheckEligibilityDto {
  @IsUUID()
  employee_id: string;

  @IsOptional()
  @IsDateString()
  as_of_date?: string; // Check eligibility as of specific date
}

export class BulkEligibilityCheckDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  employee_ids: string[];

  @IsOptional()
  @IsDateString()
  as_of_date?: string;
}

export class RetirementQueryDto {
  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsUUID()
  policy_id?: string;

  @IsOptional()
  @IsEnum(RetirementStatus)
  status?: RetirementStatus;

  @IsOptional()
  @IsEnum(RetirementType)
  retirement_type?: RetirementType;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;

  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class PolicyImpactPreviewDto {
  @IsUUID()
  policy_id: string;

  @IsOptional()
  @IsDateString()
  as_of_date?: string;

  @IsOptional()
  @IsBoolean()
  include_projections?: boolean; // Project future retirements
}

export class OverridePolicyDto {
  @IsUUID()
  retirement_id: string;

  @IsUUID()
  override_policy_id: string;

  @IsString()
  override_justification: string;

  @IsUUID()
  override_approved_by: string;

  @IsOptional()
  @IsDateString()
  override_valid_until?: string;
}
