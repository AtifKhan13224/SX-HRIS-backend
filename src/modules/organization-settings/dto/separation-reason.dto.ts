import { IsString, IsBoolean, IsOptional, IsNumber, IsArray, IsDateString, IsUUID, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== CATEGORY DTOs ====================

export class CreateSeparationReasonCategoryDto {
  @ApiProperty({ example: 'abc123', description: 'Tenant ID' })
  @IsUUID()
  tenant_id: string;

  @ApiPropertyOptional({ example: 'company123', description: 'Company ID (optional)' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiProperty({ example: 'VOL', description: 'Unique category code' })
  @IsString()
  @Length(2, 50)
  category_code: string;

  @ApiProperty({ example: 'Voluntary Separation', description: 'Category name' })
  @IsString()
  @Length(1, 200)
  category_name: string;

  @ApiPropertyOptional({ example: 'Employee-initiated resignations', description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'Display order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  display_order?: number;

  @ApiPropertyOptional({ example: 'user-check', description: 'Icon name' })
  @IsOptional()
  @IsString()
  icon_name?: string;

  @ApiPropertyOptional({ example: '#3B82F6', description: 'Color code' })
  @IsOptional()
  @IsString()
  color_code?: string;

  @ApiPropertyOptional({ example: true, description: 'Is voluntary separation' })
  @IsOptional()
  @IsBoolean()
  is_voluntary?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is involuntary termination' })
  @IsOptional()
  @IsBoolean()
  is_involuntary?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is mutual separation' })
  @IsOptional()
  @IsBoolean()
  is_mutual?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is retirement' })
  @IsOptional()
  @IsBoolean()
  is_retirement?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is contract end' })
  @IsOptional()
  @IsBoolean()
  is_contract_end?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is death in service' })
  @IsOptional()
  @IsBoolean()
  is_death?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Requires legal review' })
  @IsOptional()
  @IsBoolean()
  requires_legal_review?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Requires government reporting' })
  @IsOptional()
  @IsBoolean()
  requires_government_reporting?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is disciplinary' })
  @IsOptional()
  @IsBoolean()
  is_disciplinary?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is sensitive (HR-only)' })
  @IsOptional()
  @IsBoolean()
  is_sensitive?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Default notice required' })
  @IsOptional()
  @IsBoolean()
  default_notice_required?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Default gratuity eligible' })
  @IsOptional()
  @IsBoolean()
  default_gratuity_eligible?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Default rehire eligible' })
  @IsOptional()
  @IsBoolean()
  default_rehire_eligible?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Default final settlement eligible' })
  @IsOptional()
  @IsBoolean()
  default_final_settlement_eligible?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Triggers clearance process' })
  @IsOptional()
  @IsBoolean()
  triggers_clearance_process?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Triggers asset recovery' })
  @IsOptional()
  @IsBoolean()
  triggers_asset_recovery?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Triggers access deactivation' })
  @IsOptional()
  @IsBoolean()
  triggers_access_deactivation?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Triggers legal workflow' })
  @IsOptional()
  @IsBoolean()
  triggers_legal_workflow?: boolean;

  @ApiPropertyOptional({ example: 'Regretted', description: 'Attrition type' })
  @IsOptional()
  @IsString()
  attrition_type?: string;

  @ApiPropertyOptional({ example: 'Medium', description: 'Risk indicator' })
  @IsOptional()
  @IsString()
  risk_indicator?: string;

  @ApiPropertyOptional({ example: false, description: 'Exclude from attrition rate' })
  @IsOptional()
  @IsBoolean()
  exclude_from_attrition_rate?: boolean;

  @ApiPropertyOptional({ example: false, description: 'HR only' })
  @IsOptional()
  @IsBoolean()
  hr_only?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Manager visible' })
  @IsOptional()
  @IsBoolean()
  manager_visible?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Employee self-service allowed' })
  @IsOptional()
  @IsBoolean()
  employee_self_service_allowed?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Mask in employee view' })
  @IsOptional()
  @IsBoolean()
  mask_in_employee_view?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Requires dual approval' })
  @IsOptional()
  @IsBoolean()
  requires_dual_approval?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Requires mandatory justification' })
  @IsOptional()
  @IsBoolean()
  requires_mandatory_justification?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Allow manual override' })
  @IsOptional()
  @IsBoolean()
  allow_manual_override?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Audit flag' })
  @IsOptional()
  @IsBoolean()
  audit_flag?: boolean;

  @ApiProperty({ example: '2024-01-01', description: 'Effective from date' })
  @IsDateString()
  effective_from: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @ApiPropertyOptional({ example: true, description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: {}, description: 'Metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateSeparationReasonCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  category_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  display_order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_voluntary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_involuntary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_mutual?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_retirement?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_contract_end?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_death?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requires_legal_review?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requires_government_reporting?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_disciplinary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_sensitive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  default_notice_required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  default_gratuity_eligible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  default_rehire_eligible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  default_final_settlement_eligible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  triggers_clearance_process?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  triggers_asset_recovery?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  triggers_access_deactivation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  triggers_legal_workflow?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attrition_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  risk_indicator?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  exclude_from_attrition_rate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hr_only?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  manager_visible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  employee_self_service_allowed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mask_in_employee_view?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requires_dual_approval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requires_mandatory_justification?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allow_manual_override?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  audit_flag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

// ==================== REASON DTOs ====================

export class CreateSeparationReasonDto {
  @ApiProperty({ example: 'abc123', description: 'Tenant ID' })
  @IsUUID()
  tenant_id: string;

  @ApiPropertyOptional({ example: 'company123', description: 'Company ID' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ example: 'legal123', description: 'Legal entity ID' })
  @IsOptional()
  @IsUUID()
  legal_entity_id?: string;

  @ApiProperty({ example: 'RES_BETTER_OPP', description: 'Unique reason code' })
  @IsString()
  @Length(2, 50)
  reason_code: string;

  @ApiProperty({ example: 'Resignation - Better Opportunity', description: 'Reason name' })
  @IsString()
  @Length(1, 200)
  reason_name: string;

  @ApiPropertyOptional({ example: 'Employee found a better role elsewhere', description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Commonly cited in exit interviews', description: 'Internal notes' })
  @IsOptional()
  @IsString()
  internal_notes?: string;

  @ApiProperty({ example: 'category-uuid', description: 'Category ID' })
  @IsUUID()
  category_id: string;

  @ApiPropertyOptional({ example: 1, description: 'Display order' })
  @IsOptional()
  @IsNumber()
  display_order?: number;

  @ApiPropertyOptional({ example: 'briefcase', description: 'Icon name' })
  @IsOptional()
  @IsString()
  icon_name?: string;

  @ApiPropertyOptional({ example: '#10B981', description: 'Color code' })
  @IsOptional()
  @IsString()
  color_code?: string;

  @ApiPropertyOptional({ example: true, description: 'Notice period required' })
  @IsOptional()
  @IsBoolean()
  notice_period_required?: boolean;

  @ApiPropertyOptional({ example: 30, description: 'Minimum notice days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimum_notice_days?: number;

  @ApiPropertyOptional({ example: true, description: 'Eligible for gratuity' })
  @IsOptional()
  @IsBoolean()
  eligible_for_gratuity?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Eligible for final settlement' })
  @IsOptional()
  @IsBoolean()
  eligible_for_final_settlement?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Eligible for rehire' })
  @IsOptional()
  @IsBoolean()
  eligible_for_rehire?: boolean;

  @ApiPropertyOptional({ example: 6, description: 'Rehire waiting period (months)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rehire_waiting_period_months?: number;

  @ApiPropertyOptional({ example: true, description: 'Eligible for exit interview' })
  @IsOptional()
  @IsBoolean()
  eligible_for_exit_interview?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Requires clearance certificate' })
  @IsOptional()
  @IsBoolean()
  requires_clearance_certificate?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Government reporting required' })
  @IsOptional()
  @IsBoolean()
  government_reporting_required?: boolean;

  @ApiPropertyOptional({ example: 'VOL_RES', description: 'Government reporting code' })
  @IsOptional()
  @IsString()
  government_reporting_code?: string;

  @ApiPropertyOptional({ example: false, description: 'Is disciplinary' })
  @IsOptional()
  @IsBoolean()
  is_disciplinary?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Requires legal review' })
  @IsOptional()
  @IsBoolean()
  requires_legal_review?: boolean;

  @ApiPropertyOptional({ example: 'UAE Labor Law Article 42', description: 'Labor law reference' })
  @IsOptional()
  @IsString()
  labor_law_reference?: string;

  @ApiPropertyOptional({ example: false, description: 'Is protected termination' })
  @IsOptional()
  @IsBoolean()
  is_protected_termination?: boolean;

  @ApiPropertyOptional({ example: 'AE', description: 'Applicable country code' })
  @IsOptional()
  @IsString()
  applicable_country_code?: string;

  @ApiPropertyOptional({ example: ['AE', 'SA', 'OM'], description: 'Applicable countries' })
  @IsOptional()
  @IsArray()
  applicable_countries?: string[];

  @ApiPropertyOptional({ example: false, description: 'Union applicable' })
  @IsOptional()
  @IsBoolean()
  union_applicable?: boolean;

  @ApiPropertyOptional({ example: false, description: 'CBA applicable' })
  @IsOptional()
  @IsBoolean()
  cba_applicable?: boolean;

  @ApiPropertyOptional({ example: 'CBA-2024-001', description: 'CBA reference' })
  @IsOptional()
  @IsString()
  cba_reference?: string;

  @ApiPropertyOptional({ example: true, description: 'Triggers clearance process' })
  @IsOptional()
  @IsBoolean()
  triggers_clearance_process?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Triggers payroll settlement' })
  @IsOptional()
  @IsBoolean()
  triggers_payroll_settlement?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Triggers asset recovery' })
  @IsOptional()
  @IsBoolean()
  triggers_asset_recovery?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Triggers access deactivation' })
  @IsOptional()
  @IsBoolean()
  triggers_access_deactivation?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Triggers legal workflow' })
  @IsOptional()
  @IsBoolean()
  triggers_legal_workflow?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Triggers investigation workflow' })
  @IsOptional()
  @IsBoolean()
  triggers_investigation_workflow?: boolean;

  @ApiPropertyOptional({ example: ['workflow-1', 'workflow-2'], description: 'Custom workflow triggers' })
  @IsOptional()
  @IsArray()
  custom_workflow_triggers?: string[];

  @ApiPropertyOptional({ example: false, description: 'HR only' })
  @IsOptional()
  @IsBoolean()
  hr_only?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Manager visible' })
  @IsOptional()
  @IsBoolean()
  manager_visible?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Employee self-service allowed' })
  @IsOptional()
  @IsBoolean()
  employee_self_service_allowed?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Mask in employee view' })
  @IsOptional()
  @IsBoolean()
  mask_in_employee_view?: boolean;

  @ApiPropertyOptional({ example: 'General Separation', description: 'Masked display name' })
  @IsOptional()
  @IsString()
  masked_display_name?: string;

  @ApiPropertyOptional({ example: 'Regretted', description: 'Attrition type' })
  @IsOptional()
  @IsString()
  attrition_type?: string;

  @ApiPropertyOptional({ example: 'Voluntary', description: 'Voluntary classification' })
  @IsOptional()
  @IsString()
  voluntary_classification?: string;

  @ApiPropertyOptional({ example: 'Medium', description: 'Risk indicator' })
  @IsOptional()
  @IsString()
  risk_indicator?: string;

  @ApiPropertyOptional({ example: false, description: 'Compliance sensitivity flag' })
  @IsOptional()
  @IsBoolean()
  compliance_sensitivity_flag?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Exclude from attrition metrics' })
  @IsOptional()
  @IsBoolean()
  exclude_from_attrition_metrics?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Counts as turnover' })
  @IsOptional()
  @IsBoolean()
  counts_as_turnover?: boolean;

  @ApiPropertyOptional({ example: ['voluntary', 'career-growth'], description: 'Analytics tags' })
  @IsOptional()
  @IsArray()
  analytics_tags?: string[];

  @ApiPropertyOptional({ example: false, description: 'Allow manual override' })
  @IsOptional()
  @IsBoolean()
  allow_manual_override?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Requires dual approval' })
  @IsOptional()
  @IsBoolean()
  requires_dual_approval?: boolean;

  @ApiPropertyOptional({ example: 'HR', description: 'Approval authority level' })
  @IsOptional()
  @IsString()
  approval_authority_level?: string;

  @ApiPropertyOptional({ example: true, description: 'Mandatory justification required' })
  @IsOptional()
  @IsBoolean()
  mandatory_justification_required?: boolean;

  @ApiPropertyOptional({ example: 100, description: 'Minimum justification length' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimum_justification_length?: number;

  @ApiPropertyOptional({ example: true, description: 'Override audit flag' })
  @IsOptional()
  @IsBoolean()
  override_audit_flag?: boolean;

  @ApiPropertyOptional({ example: ['resignation-letter', 'clearance-form'], description: 'Required documents' })
  @IsOptional()
  @IsArray()
  required_documents?: string[];

  @ApiPropertyOptional({ example: false, description: 'Affects severance calculation' })
  @IsOptional()
  @IsBoolean()
  affects_severance_calculation?: boolean;

  @ApiPropertyOptional({ example: 1.5, description: 'Severance multiplier' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  severance_multiplier?: number;

  @ApiPropertyOptional({ example: false, description: 'Affects notice pay calculation' })
  @IsOptional()
  @IsBoolean()
  affects_notice_pay_calculation?: boolean;

  @ApiPropertyOptional({ example: 'PAYROLL_CODE_123', description: 'Payroll impact code' })
  @IsOptional()
  @IsString()
  payroll_impact_code?: string;

  @ApiProperty({ example: '2024-01-01', description: 'Effective from date' })
  @IsDateString()
  effective_from: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @ApiPropertyOptional({ example: {}, description: 'Validation rules' })
  @IsOptional()
  validation_rules?: Record<string, any>;

  @ApiPropertyOptional({ example: false, description: 'Requires manager confirmation' })
  @IsOptional()
  @IsBoolean()
  requires_manager_confirmation?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Requires employee acknowledgment' })
  @IsOptional()
  @IsBoolean()
  requires_employee_acknowledgment?: boolean;

  @ApiPropertyOptional({ example: 'EXT_CODE_123', description: 'External system code' })
  @IsOptional()
  @IsString()
  external_system_code?: string;

  @ApiPropertyOptional({ example: {}, description: 'Integration mapping' })
  @IsOptional()
  integration_mapping?: Record<string, any>;

  @ApiPropertyOptional({ example: {}, description: 'Metadata' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: true, description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateSeparationReasonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internal_notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  display_order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notice_period_required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minimum_notice_days?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  eligible_for_gratuity?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  eligible_for_final_settlement?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  eligible_for_rehire?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rehire_waiting_period_months?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  eligible_for_exit_interview?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requires_clearance_certificate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  government_reporting_required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  government_reporting_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_disciplinary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requires_legal_review?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  labor_law_reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_protected_termination?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicable_country_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  applicable_countries?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  union_applicable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  cba_applicable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cba_reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  triggers_clearance_process?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  triggers_payroll_settlement?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  triggers_asset_recovery?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  triggers_access_deactivation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  triggers_legal_workflow?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  triggers_investigation_workflow?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  custom_workflow_triggers?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hr_only?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  manager_visible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  employee_self_service_allowed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mask_in_employee_view?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  masked_display_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attrition_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voluntary_classification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  risk_indicator?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  compliance_sensitivity_flag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  exclude_from_attrition_metrics?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  counts_as_turnover?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  analytics_tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allow_manual_override?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requires_dual_approval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  approval_authority_level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mandatory_justification_required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minimum_justification_length?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  override_audit_flag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  required_documents?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  affects_severance_calculation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  severance_multiplier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  affects_notice_pay_calculation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payroll_impact_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  validation_rules?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requires_manager_confirmation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requires_employee_acknowledgment?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  external_system_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  integration_mapping?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class DeactivateSeparationReasonDto {
  @ApiProperty({ example: 'Policy changed', description: 'Reason for deactivation' })
  @IsString()
  @Length(1, 100)
  deactivation_reason: string;

  @ApiPropertyOptional({ example: 'new-reason-uuid', description: 'Replacement reason ID' })
  @IsOptional()
  @IsUUID()
  superseded_by?: string;
}
