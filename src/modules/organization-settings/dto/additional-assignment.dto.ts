import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  IsUUID,
  IsDateString,
  Length,
  Min,
  Max,
  IsArray,
  IsObject,
  IsNumber,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new Additional Assignment Type configuration
 */
export class CreateAdditionalAssignmentTypeDto {
  @ApiProperty({ description: 'Tenant ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  tenant_id: string;

  @ApiPropertyOptional({ description: 'Company ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ description: 'Legal Entity ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsOptional()
  @IsUUID()
  legal_entity_id?: string;

  // ==================== ASSIGNMENT TYPE IDENTITY ====================
  @ApiProperty({ description: 'Unique assignment type code', example: 'ACTING' })
  @IsString()
  @Length(2, 50)
  assignment_type_code: string;

  @ApiProperty({ description: 'Assignment type name', example: 'Acting Role Assignment' })
  @IsString()
  @Length(1, 200)
  assignment_type_name: string;

  @ApiPropertyOptional({ description: 'Detailed description of assignment type' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Assignment category', example: 'Acting' })
  @IsOptional()
  @IsString()
  @IsIn(['Temporary', 'Acting', 'Project', 'Strategic', 'Cross-Entity', 'Secondment', 'Dual', 'Advisory'])
  assignment_category?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;

  @ApiPropertyOptional({ description: 'Icon name', example: 'briefcase' })
  @IsOptional()
  @IsString()
  icon_name?: string;

  @ApiPropertyOptional({ description: 'Color code', example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color_code?: string;

  // ==================== DURATION & LIMITS ====================
  @ApiPropertyOptional({ description: 'Minimum duration in days', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minimum_duration_days?: number;

  @ApiPropertyOptional({ description: 'Maximum duration in days', example: 365 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maximum_duration_days?: number;

  @ApiPropertyOptional({ description: 'Default duration in days', example: 180 })
  @IsOptional()
  @IsInt()
  @Min(1)
  default_duration_days?: number;

  @ApiPropertyOptional({ description: 'Auto-end assignment on expiry', example: false })
  @IsOptional()
  @IsBoolean()
  auto_end_on_expiry?: boolean;

  @ApiPropertyOptional({ description: 'Allow extension of assignment', example: true })
  @IsOptional()
  @IsBoolean()
  extension_allowed?: boolean;

  @ApiPropertyOptional({ description: 'Maximum number of extensions allowed', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maximum_extensions_count?: number;

  @ApiPropertyOptional({ description: 'Extension requires approval', example: false })
  @IsOptional()
  @IsBoolean()
  extension_approval_required?: boolean;

  @ApiPropertyOptional({ description: 'Cooling-off period between assignments (days)', example: 90 })
  @IsOptional()
  @IsInt()
  @Min(0)
  cooling_off_period_days?: number;

  @ApiPropertyOptional({ description: 'Allow overlapping assignments of same type', example: false })
  @IsOptional()
  @IsBoolean()
  allow_overlapping_assignments?: boolean;

  // ==================== PAYROLL & COMPENSATION IMPACT ====================
  @ApiPropertyOptional({ description: 'Allow additional allowance', example: false })
  @IsOptional()
  @IsBoolean()
  allow_additional_allowance?: boolean;

  @ApiPropertyOptional({ description: 'Allow temporary salary uplift', example: false })
  @IsOptional()
  @IsBoolean()
  allow_temporary_salary_uplift?: boolean;

  @ApiPropertyOptional({ description: 'Default salary uplift percentage', example: 10.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  default_salary_uplift_percentage?: number;

  @ApiPropertyOptional({ description: 'Impacts overtime eligibility', example: false })
  @IsOptional()
  @IsBoolean()
  overtime_eligibility_impact?: boolean;

  @ApiPropertyOptional({ description: 'Overtime eligibility rule', example: 'Inherited' })
  @IsOptional()
  @IsString()
  @IsIn(['Enabled', 'Disabled', 'Inherited'])
  overtime_eligibility_rule?: string;

  @ApiPropertyOptional({ description: 'Impacts bonus eligibility', example: false })
  @IsOptional()
  @IsBoolean()
  bonus_eligibility_impact?: boolean;

  @ApiPropertyOptional({ description: 'Bonus eligibility rule', example: 'Prorated' })
  @IsOptional()
  @IsString()
  @IsIn(['Prorated', 'Full', 'None', 'Inherited'])
  bonus_eligibility_rule?: string;

  @ApiPropertyOptional({ description: 'Allow cost center override', example: false })
  @IsOptional()
  @IsBoolean()
  cost_center_override_allowed?: boolean;

  @ApiPropertyOptional({ description: 'Allow pay stacking for multiple assignments', example: false })
  @IsOptional()
  @IsBoolean()
  multiple_assignment_pay_stacking_allowed?: boolean;

  @ApiPropertyOptional({ description: 'Payroll integration code' })
  @IsOptional()
  @IsString()
  payroll_integration_code?: string;

  // ==================== AUTHORITY & DELEGATION CONTROLS ====================
  @ApiPropertyOptional({ description: 'Allow delegation of authority', example: false })
  @IsOptional()
  @IsBoolean()
  delegation_of_authority_allowed?: boolean;

  @ApiPropertyOptional({ description: 'Allow financial approval limit override', example: false })
  @IsOptional()
  @IsBoolean()
  financial_approval_limit_override?: boolean;

  @ApiPropertyOptional({ description: 'Financial approval limit amount', example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  financial_approval_limit_amount?: number;

  @ApiPropertyOptional({ description: 'Enable signing authority', example: false })
  @IsOptional()
  @IsBoolean()
  signing_authority_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Allow system role elevation', example: false })
  @IsOptional()
  @IsBoolean()
  system_role_elevation_allowed?: boolean;

  @ApiPropertyOptional({ description: 'Elevated system roles allowed', type: [String] })
  @IsOptional()
  @IsArray()
  elevated_system_roles?: string[];

  @ApiPropertyOptional({ description: 'Flag conflict of interest', example: false })
  @IsOptional()
  @IsBoolean()
  conflict_of_interest_flag?: boolean;

  @ApiPropertyOptional({ description: 'Require conflict check', example: false })
  @IsOptional()
  @IsBoolean()
  conflict_check_required?: boolean;

  // ==================== LEAVE, ATTENDANCE & WORKING TIME IMPACT ====================
  @ApiPropertyOptional({ description: 'Allow leave policy override', example: false })
  @IsOptional()
  @IsBoolean()
  leave_policy_override_allowed?: boolean;

  @ApiPropertyOptional({ description: 'Override leave policy ID (UUID)' })
  @IsOptional()
  @IsUUID()
  override_leave_policy_id?: string;

  @ApiPropertyOptional({ description: 'Allow shift override', example: false })
  @IsOptional()
  @IsBoolean()
  shift_override_allowed?: boolean;

  @ApiPropertyOptional({ description: 'Enable location-based attendance rules', example: false })
  @IsOptional()
  @IsBoolean()
  location_based_attendance_rules?: boolean;

  @ApiPropertyOptional({ description: 'Work location enforcement', example: 'Inherited' })
  @IsOptional()
  @IsString()
  @IsIn(['Remote', 'OnSite', 'Hybrid', 'Inherited'])
  work_location_enforcement?: string;

  @ApiPropertyOptional({ description: 'Allow holiday calendar override', example: false })
  @IsOptional()
  @IsBoolean()
  holiday_calendar_override_allowed?: boolean;

  @ApiPropertyOptional({ description: 'Override holiday calendar ID (UUID)' })
  @IsOptional()
  @IsUUID()
  override_holiday_calendar_id?: string;

  @ApiPropertyOptional({ description: 'Allow working hours override', example: false })
  @IsOptional()
  @IsBoolean()
  working_hours_override_allowed?: boolean;

  // ==================== COMPLIANCE & LEGAL CONFIGURATION ====================
  @ApiPropertyOptional({ description: 'Applicable country code', example: 'US' })
  @IsOptional()
  @IsString()
  applicable_country_code?: string;

  @ApiPropertyOptional({ description: 'Applicable countries (multi-country)', type: [String] })
  @IsOptional()
  @IsArray()
  applicable_countries?: string[];

  @ApiPropertyOptional({ description: 'Applicable legal entities (UUIDs)', type: [String] })
  @IsOptional()
  @IsArray()
  applicable_legal_entities?: string[];

  @ApiPropertyOptional({ description: 'Union applicable', example: false })
  @IsOptional()
  @IsBoolean()
  union_applicable?: boolean;

  @ApiPropertyOptional({ description: 'CBA (Collective Bargaining Agreement) applicable', example: false })
  @IsOptional()
  @IsBoolean()
  cba_applicable?: boolean;

  @ApiPropertyOptional({ description: 'CBA reference' })
  @IsOptional()
  @IsString()
  cba_reference?: string;

  @ApiPropertyOptional({ description: 'Work permit dependency', example: false })
  @IsOptional()
  @IsBoolean()
  work_permit_dependency?: boolean;

  @ApiPropertyOptional({ description: 'Regulatory reporting required', example: false })
  @IsOptional()
  @IsBoolean()
  regulatory_reporting_required?: boolean;

  @ApiPropertyOptional({ description: 'Regulatory reporting code' })
  @IsOptional()
  @IsString()
  regulatory_reporting_code?: string;

  @ApiPropertyOptional({ description: 'Labor law reference' })
  @IsOptional()
  @IsString()
  labor_law_reference?: string;

  // ==================== LIFECYCLE INTERACTION RULES ====================
  @ApiPropertyOptional({ description: 'Behavior during notice period', example: 'AutoTerminate' })
  @IsOptional()
  @IsString()
  @IsIn(['AutoTerminate', 'Freeze', 'AllowCompletion', 'ManualReview'])
  behavior_during_notice_period?: string;

  @ApiPropertyOptional({ description: 'Behavior during retirement', example: 'AutoTerminate' })
  @IsOptional()
  @IsString()
  @IsIn(['AutoTerminate', 'Freeze', 'AllowCompletion', 'ManualReview'])
  behavior_during_retirement?: string;

  @ApiPropertyOptional({ description: 'Behavior during separation', example: 'AutoTerminate' })
  @IsOptional()
  @IsString()
  @IsIn(['AutoTerminate', 'Freeze', 'AllowCompletion', 'ManualReview'])
  behavior_during_separation?: string;

  @ApiPropertyOptional({ description: 'Behavior during long leave', example: 'Freeze' })
  @IsOptional()
  @IsString()
  @IsIn(['AutoTerminate', 'Freeze', 'AllowCompletion', 'ManualReview'])
  behavior_during_long_leave?: string;

  @ApiPropertyOptional({ description: 'Behavior during suspension', example: 'Freeze' })
  @IsOptional()
  @IsString()
  @IsIn(['AutoTerminate', 'Freeze', 'AllowCompletion', 'ManualReview'])
  behavior_during_suspension?: string;

  @ApiPropertyOptional({ description: 'Auto-terminate on primary role change', example: false })
  @IsOptional()
  @IsBoolean()
  auto_terminate_on_primary_role_change?: boolean;

  @ApiPropertyOptional({ description: 'Auto-terminate on transfer', example: false })
  @IsOptional()
  @IsBoolean()
  auto_terminate_on_transfer?: boolean;

  @ApiPropertyOptional({ description: 'Auto-terminate on promotion', example: false })
  @IsOptional()
  @IsBoolean()
  auto_terminate_on_promotion?: boolean;

  // ==================== APPROVAL & GOVERNANCE CONFIGURATION ====================
  @ApiPropertyOptional({ description: 'Approval workflow required', example: true })
  @IsOptional()
  @IsBoolean()
  approval_workflow_required?: boolean;

  @ApiPropertyOptional({ description: 'Approval authority level', example: 'Manager' })
  @IsOptional()
  @IsString()
  @IsIn(['Manager', 'HR', 'Legal', 'Executive'])
  approval_authority_level?: string;

  @ApiPropertyOptional({ description: 'Dual approval required', example: false })
  @IsOptional()
  @IsBoolean()
  dual_approval_required?: boolean;

  @ApiPropertyOptional({ description: 'Legal approval required', example: false })
  @IsOptional()
  @IsBoolean()
  legal_approval_required?: boolean;

  @ApiPropertyOptional({ description: 'Executive approval required', example: false })
  @IsOptional()
  @IsBoolean()
  executive_approval_required?: boolean;

  @ApiPropertyOptional({ description: 'Mandatory justification', example: false })
  @IsOptional()
  @IsBoolean()
  mandatory_justification?: boolean;

  @ApiPropertyOptional({ description: 'Minimum justification length', example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimum_justification_length?: number;

  @ApiPropertyOptional({ description: 'Required documents', type: [String] })
  @IsOptional()
  @IsArray()
  required_documents?: string[];

  @ApiPropertyOptional({ description: 'Custom approval workflow triggers' })
  @IsOptional()
  @IsObject()
  custom_approval_workflow_triggers?: object;

  // ==================== SECURITY, VISIBILITY & AUDIT CONTROLS ====================
  @ApiPropertyOptional({ description: 'Visibility scope', example: 'Public' })
  @IsOptional()
  @IsString()
  @IsIn(['Public', 'ManagerOnly', 'HROnly', 'Restricted'])
  visibility_scope?: string;

  @ApiPropertyOptional({ description: 'Mask in employee view', example: false })
  @IsOptional()
  @IsBoolean()
  mask_in_employee_view?: boolean;

  @ApiPropertyOptional({ description: 'Masked display name' })
  @IsOptional()
  @IsString()
  masked_display_name?: string;

  @ApiPropertyOptional({ description: 'Manager visible', example: true })
  @IsOptional()
  @IsBoolean()
  manager_visible?: boolean;

  @ApiPropertyOptional({ description: 'HR visible', example: true })
  @IsOptional()
  @IsBoolean()
  hr_visible?: boolean;

  @ApiPropertyOptional({ description: 'Employee self-view allowed', example: false })
  @IsOptional()
  @IsBoolean()
  employee_self_view_allowed?: boolean;

  @ApiPropertyOptional({ description: 'Enable audit logging', example: true })
  @IsOptional()
  @IsBoolean()
  audit_logging_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable historical tracking', example: true })
  @IsOptional()
  @IsBoolean()
  historical_tracking_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Sensitive assignment', example: false })
  @IsOptional()
  @IsBoolean()
  sensitive_assignment?: boolean;

  @ApiPropertyOptional({ description: 'Sensitivity classification', example: 'Public' })
  @IsOptional()
  @IsString()
  @IsIn(['Confidential', 'Restricted', 'Public'])
  sensitivity_classification?: string;

  // ==================== PLANNING & WORKFORCE STRATEGY TAGS ====================
  @ApiPropertyOptional({ description: 'Succession relevance', example: false })
  @IsOptional()
  @IsBoolean()
  succession_relevance?: boolean;

  @ApiPropertyOptional({ description: 'Critical role exposure', example: false })
  @IsOptional()
  @IsBoolean()
  critical_role_exposure?: boolean;

  @ApiPropertyOptional({ description: 'Skill development indicator', example: false })
  @IsOptional()
  @IsBoolean()
  skill_development_indicator?: boolean;

  @ApiPropertyOptional({ description: 'Skill development category' })
  @IsOptional()
  @IsString()
  skill_development_category?: string;

  @ApiPropertyOptional({ description: 'Leadership pipeline indicator', example: false })
  @IsOptional()
  @IsBoolean()
  leadership_pipeline_indicator?: boolean;

  @ApiPropertyOptional({ description: 'Workforce planning category', example: 'Talent Development' })
  @IsOptional()
  @IsString()
  @IsIn(['Talent Development', 'Coverage', 'Strategic', 'Operational'])
  workforce_planning_category?: string;

  @ApiPropertyOptional({ description: 'Strategic tags for analytics' })
  @IsOptional()
  @IsObject()
  strategic_tags?: object;

  @ApiPropertyOptional({ description: 'Counts as leadership experience', example: false })
  @IsOptional()
  @IsBoolean()
  counts_as_leadership_experience?: boolean;

  @ApiPropertyOptional({ description: 'Impacts performance review', example: false })
  @IsOptional()
  @IsBoolean()
  performance_review_impact?: boolean;

  // ==================== REPORTING & ANALYTICS CONFIGURATION ====================
  @ApiPropertyOptional({ description: 'Include in headcount', example: true })
  @IsOptional()
  @IsBoolean()
  include_in_headcount?: boolean;

  @ApiPropertyOptional({ description: 'Include in org chart', example: true })
  @IsOptional()
  @IsBoolean()
  include_in_org_chart?: boolean;

  @ApiPropertyOptional({ description: 'Org chart display mode', example: 'DottedLine' })
  @IsOptional()
  @IsString()
  @IsIn(['DottedLine', 'SolidLine', 'Separate', 'Hidden'])
  org_chart_display_mode?: string;

  @ApiPropertyOptional({ description: 'Include in workforce reports', example: true })
  @IsOptional()
  @IsBoolean()
  include_in_workforce_reports?: boolean;

  @ApiPropertyOptional({ description: 'Analytics tags' })
  @IsOptional()
  @IsObject()
  analytics_tags?: object;

  @ApiPropertyOptional({ description: 'Reporting category' })
  @IsOptional()
  @IsString()
  reporting_category?: string;

  // ==================== INTEGRATION & EXTERNAL SYSTEM MAPPING ====================
  @ApiPropertyOptional({ description: 'External system code' })
  @IsOptional()
  @IsString()
  external_system_code?: string;

  @ApiPropertyOptional({ description: 'Integration mapping' })
  @IsOptional()
  @IsObject()
  integration_mapping?: object;

  @ApiPropertyOptional({ description: 'Sync to payroll', example: false })
  @IsOptional()
  @IsBoolean()
  sync_to_payroll?: boolean;

  @ApiPropertyOptional({ description: 'Sync to time & attendance', example: false })
  @IsOptional()
  @IsBoolean()
  sync_to_time_attendance?: boolean;

  @ApiPropertyOptional({ description: 'Sync to access control', example: false })
  @IsOptional()
  @IsBoolean()
  sync_to_access_control?: boolean;

  // ==================== EFFECTIVE DATING & VERSION CONTROL ====================
  @ApiProperty({ description: 'Effective from date', example: '2026-01-01' })
  @IsDateString()
  effective_from: string;

  @ApiPropertyOptional({ description: 'Effective to date', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @ApiPropertyOptional({ description: 'Version notes' })
  @IsOptional()
  @IsString()
  version_notes?: string;
}

/**
 * DTO for updating an Additional Assignment Type configuration
 * All fields optional except those needed for validation
 */
export class UpdateAdditionalAssignmentTypeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  assignment_type_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(['Temporary', 'Acting', 'Project', 'Strategic', 'Cross-Entity', 'Secondment', 'Dual', 'Advisory'])
  assignment_category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color_code?: string;

  // Include all other optional fields from Create DTO
  // (Truncated for brevity - same structure as Create but all optional)
}

/**
 * DTO for deactivating an assignment type with governance tracking
 */
export class DeactivateAssignmentTypeDto {
  @ApiProperty({ description: 'Reason for deactivation' })
  @IsString()
  @Length(10, 1000)
  deactivation_reason: string;

  @ApiPropertyOptional({ description: 'ID of assignment type that supersedes this one' })
  @IsOptional()
  @IsUUID()
  superseded_by?: string;

  @ApiPropertyOptional({ description: 'Action for active assignments', example: 'AllowCompletion' })
  @IsOptional()
  @IsString()
  @IsIn(['AutoTerminate', 'AllowCompletion', 'RequireTransition'])
  active_assignments_action?: string;
}

/**
 * Response DTO for impact analysis
 */
export class AssignmentTypeImpactDto {
  @ApiProperty()
  assignment_type_id: string;

  @ApiProperty()
  assignment_type_code: string;

  @ApiProperty()
  active_assignments_count: number;

  @ApiProperty({ type: [String] })
  affected_workflows: string[];

  @ApiProperty({ type: [String] })
  integration_dependencies: string[];

  @ApiProperty()
  can_deactivate_safely: boolean;

  @ApiProperty({ type: [String] })
  warnings: string[];
}
