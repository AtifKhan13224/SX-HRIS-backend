import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * CONFIGURATION-ONLY Entity: Additional Assignment Type Configuration
 * 
 * PURPOSE: Define how temporary, acting, project-based, and cross-functional assignments
 *          are configured, governed, and integrated with payroll, authority, and compliance.
 * 
 * ARCHITECTURE: Zero employee data - Pure policy/configuration storage
 * SCOPE: Tenant-level assignment type definitions and behavioral rules
 * 
 * This entity enables admins to define assignment types and their complete behavior
 * without any hardcoded logic. All assignment types are configuration-driven.
 */
@Entity('additional_assignment_types')
@Index(['tenant_id', 'is_active'])
@Index(['tenant_id', 'company_id'])
@Index(['tenant_id', 'assignment_type_code'], { unique: true })
@Index(['assignment_category'])
@Index(['effective_from', 'effective_to'])
@Index(['is_active'])
export class AdditionalAssignmentType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ==================== TENANT SCOPING ====================
  @Column({ type: 'uuid', nullable: false })
  @Index()
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  company_id: string;

  @Column({ type: 'uuid', nullable: true })
  legal_entity_id: string;

  // ==================== ASSIGNMENT TYPE IDENTITY ====================
  @Column({ type: 'varchar', length: 50, nullable: false })
  assignment_type_code: string; // ACTING, TEMP, PROJ, SECOND, DUAL, ADVISORY

  @Column({ type: 'varchar', length: 200, nullable: false })
  assignment_type_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assignment_category: string; // Temporary, Acting, Project, Strategic, Cross-Entity

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  color_code: string;

  // ==================== DURATION & LIMITS ====================
  @Column({ type: 'int', nullable: true })
  minimum_duration_days: number;

  @Column({ type: 'int', nullable: true })
  maximum_duration_days: number;

  @Column({ type: 'int', nullable: true })
  default_duration_days: number;

  @Column({ type: 'boolean', default: false })
  auto_end_on_expiry: boolean;

  @Column({ type: 'boolean', default: true })
  extension_allowed: boolean;

  @Column({ type: 'int', nullable: true })
  maximum_extensions_count: number;

  @Column({ type: 'boolean', default: false })
  extension_approval_required: boolean;

  @Column({ type: 'int', nullable: true })
  cooling_off_period_days: number; // Minimum gap between assignments

  @Column({ type: 'boolean', default: false })
  allow_overlapping_assignments: boolean;

  // ==================== PAYROLL & COMPENSATION IMPACT ====================
  @Column({ type: 'boolean', default: false })
  allow_additional_allowance: boolean;

  @Column({ type: 'boolean', default: false })
  allow_temporary_salary_uplift: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  default_salary_uplift_percentage: number;

  @Column({ type: 'boolean', default: false })
  overtime_eligibility_impact: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  overtime_eligibility_rule: string; // Enabled, Disabled, Inherited

  @Column({ type: 'boolean', default: false })
  bonus_eligibility_impact: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bonus_eligibility_rule: string; // Prorated, Full, None, Inherited

  @Column({ type: 'boolean', default: false })
  cost_center_override_allowed: boolean;

  @Column({ type: 'boolean', default: false })
  multiple_assignment_pay_stacking_allowed: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payroll_integration_code: string;

  // ==================== AUTHORITY & DELEGATION CONTROLS ====================
  @Column({ type: 'boolean', default: false })
  delegation_of_authority_allowed: boolean;

  @Column({ type: 'boolean', default: false })
  financial_approval_limit_override: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  financial_approval_limit_amount: number;

  @Column({ type: 'boolean', default: false })
  signing_authority_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  system_role_elevation_allowed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  elevated_system_roles: string[]; // Array of role codes that can be granted

  @Column({ type: 'boolean', default: false })
  conflict_of_interest_flag: boolean;

  @Column({ type: 'boolean', default: false })
  conflict_check_required: boolean;

  // ==================== LEAVE, ATTENDANCE & WORKING TIME IMPACT ====================
  @Column({ type: 'boolean', default: false })
  leave_policy_override_allowed: boolean;

  @Column({ type: 'uuid', nullable: true })
  override_leave_policy_id: string;

  @Column({ type: 'boolean', default: false })
  shift_override_allowed: boolean;

  @Column({ type: 'boolean', default: false })
  location_based_attendance_rules: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  work_location_enforcement: string; // Remote, OnSite, Hybrid, Inherited

  @Column({ type: 'boolean', default: false })
  holiday_calendar_override_allowed: boolean;

  @Column({ type: 'uuid', nullable: true })
  override_holiday_calendar_id: string;

  @Column({ type: 'boolean', default: false })
  working_hours_override_allowed: boolean;

  // ==================== COMPLIANCE & LEGAL CONFIGURATION ====================
  @Column({ type: 'varchar', length: 10, nullable: true })
  applicable_country_code: string;

  @Column({ type: 'jsonb', nullable: true })
  applicable_countries: string[]; // Multi-country support

  @Column({ type: 'jsonb', nullable: true })
  applicable_legal_entities: string[]; // UUIDs of legal entities

  @Column({ type: 'boolean', default: false })
  union_applicable: boolean;

  @Column({ type: 'boolean', default: false })
  cba_applicable: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  cba_reference: string;

  @Column({ type: 'boolean', default: false })
  work_permit_dependency: boolean;

  @Column({ type: 'boolean', default: false })
  regulatory_reporting_required: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  regulatory_reporting_code: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  labor_law_reference: string;

  // ==================== LIFECYCLE INTERACTION RULES ====================
  @Column({ type: 'varchar', length: 50, nullable: true })
  behavior_during_notice_period: string; // AutoTerminate, Freeze, AllowCompletion, ManualReview

  @Column({ type: 'varchar', length: 50, nullable: true })
  behavior_during_retirement: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  behavior_during_separation: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  behavior_during_long_leave: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  behavior_during_suspension: string;

  @Column({ type: 'boolean', default: false })
  auto_terminate_on_primary_role_change: boolean;

  @Column({ type: 'boolean', default: false })
  auto_terminate_on_transfer: boolean;

  @Column({ type: 'boolean', default: false })
  auto_terminate_on_promotion: boolean;

  // ==================== APPROVAL & GOVERNANCE CONFIGURATION ====================
  @Column({ type: 'boolean', default: true })
  approval_workflow_required: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approval_authority_level: string; // Manager, HR, Legal, Executive

  @Column({ type: 'boolean', default: false })
  dual_approval_required: boolean;

  @Column({ type: 'boolean', default: false })
  legal_approval_required: boolean;

  @Column({ type: 'boolean', default: false })
  executive_approval_required: boolean;

  @Column({ type: 'boolean', default: false })
  mandatory_justification: boolean;

  @Column({ type: 'int', nullable: true })
  minimum_justification_length: number;

  @Column({ type: 'jsonb', nullable: true })
  required_documents: string[]; // Array of document types required

  @Column({ type: 'jsonb', nullable: true })
  custom_approval_workflow_triggers: object;

  // ==================== SECURITY, VISIBILITY & AUDIT CONTROLS ====================
  @Column({ type: 'varchar', length: 50, nullable: true })
  visibility_scope: string; // Public, ManagerOnly, HROnly, Restricted

  @Column({ type: 'boolean', default: false })
  mask_in_employee_view: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  masked_display_name: string;

  @Column({ type: 'boolean', default: true })
  manager_visible: boolean;

  @Column({ type: 'boolean', default: true })
  hr_visible: boolean;

  @Column({ type: 'boolean', default: false })
  employee_self_view_allowed: boolean;

  @Column({ type: 'boolean', default: true })
  audit_logging_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  historical_tracking_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  sensitive_assignment: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sensitivity_classification: string; // Confidential, Restricted, Public

  // ==================== PLANNING & WORKFORCE STRATEGY TAGS ====================
  @Column({ type: 'boolean', default: false })
  succession_relevance: boolean;

  @Column({ type: 'boolean', default: false })
  critical_role_exposure: boolean;

  @Column({ type: 'boolean', default: false })
  skill_development_indicator: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  skill_development_category: string;

  @Column({ type: 'boolean', default: false })
  leadership_pipeline_indicator: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  workforce_planning_category: string; // Talent Development, Coverage, Strategic

  @Column({ type: 'jsonb', nullable: true })
  strategic_tags: object; // Flexible tagging for analytics

  @Column({ type: 'boolean', default: false })
  counts_as_leadership_experience: boolean;

  @Column({ type: 'boolean', default: false })
  performance_review_impact: boolean;

  // ==================== REPORTING & ANALYTICS CONFIGURATION ====================
  @Column({ type: 'boolean', default: true })
  include_in_headcount: boolean;

  @Column({ type: 'boolean', default: true })
  include_in_org_chart: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  org_chart_display_mode: string; // DottedLine, SolidLine, Separate, Hidden

  @Column({ type: 'boolean', default: true })
  include_in_workforce_reports: boolean;

  @Column({ type: 'jsonb', nullable: true })
  analytics_tags: object;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reporting_category: string;

  // ==================== INTEGRATION & EXTERNAL SYSTEM MAPPING ====================
  @Column({ type: 'varchar', length: 100, nullable: true })
  external_system_code: string;

  @Column({ type: 'jsonb', nullable: true })
  integration_mapping: object;

  @Column({ type: 'boolean', default: false })
  sync_to_payroll: boolean;

  @Column({ type: 'boolean', default: false })
  sync_to_time_attendance: boolean;

  @Column({ type: 'boolean', default: false })
  sync_to_access_control: boolean;

  // ==================== EFFECTIVE DATING & VERSION CONTROL ====================
  @Column({ type: 'date', nullable: false })
  effective_from: string;

  @Column({ type: 'date', nullable: true })
  effective_to: string;

  @Column({ type: 'boolean', default: false })
  is_historical: boolean;

  @Column({ type: 'uuid', nullable: true })
  superseded_by: string;

  @Column({ type: 'uuid', nullable: true })
  supersedes: string;

  @Column({ type: 'int', default: 1 })
  version_number: number;

  @Column({ type: 'text', nullable: true })
  version_notes: string;

  // ==================== STATUS & GOVERNANCE ====================
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_system_defined: boolean;

  @Column({ type: 'boolean', default: false })
  allow_deletion: boolean;

  @Column({ type: 'text', nullable: true })
  deactivation_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  deactivated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  deactivated_by: string;

  // ==================== USAGE TRACKING (Transactional Counts - No Employee Data) ====================
  @Column({ type: 'int', default: 0 })
  active_assignments_count: number; // Current active assignments using this type

  @Column({ type: 'int', default: 0 })
  total_assignments_count: number; // Historical total

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: Date;

  // ==================== AUDIT TRAIL ====================
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'jsonb', nullable: true })
  audit_metadata: object;
}
