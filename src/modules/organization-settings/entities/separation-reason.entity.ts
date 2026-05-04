import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SeparationReasonCategory } from './separation-reason-category.entity';

@Entity('separation_reasons')
export class SeparationReason {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ==================== TENANT SCOPE ====================
  
  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  company_id: string;

  @Column({ type: 'uuid', nullable: true })
  legal_entity_id: string;

  // ==================== REASON IDENTITY ====================
  
  @Column({ type: 'varchar', length: 50, unique: true })
  reason_code: string; // e.g., 'RES_BETTER_OPP', 'TERM_PERFORMANCE', 'RET_AGE'

  @Column({ type: 'varchar', length: 200 })
  reason_name: string; // e.g., 'Resignation - Better Opportunity'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  internal_notes: string; // HR-only notes

  // ==================== CATEGORY LINKAGE ====================
  
  @Column({ type: 'uuid' })
  category_id: string;

  @ManyToOne(() => SeparationReasonCategory, category => category.reasons)
  @JoinColumn({ name: 'category_id' })
  category: SeparationReasonCategory;

  // ==================== DISPLAY & ORDERING ====================
  
  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color_code: string;

  // ==================== POLICY CONTROL FLAGS ====================
  
  @Column({ type: 'boolean', default: true })
  notice_period_required: boolean;

  @Column({ type: 'int', nullable: true })
  minimum_notice_days: number; // Override default notice period

  @Column({ type: 'boolean', default: true })
  eligible_for_gratuity: boolean;

  @Column({ type: 'boolean', default: true })
  eligible_for_final_settlement: boolean;

  @Column({ type: 'boolean', default: true })
  eligible_for_rehire: boolean;

  @Column({ type: 'int', nullable: true })
  rehire_waiting_period_months: number; // Cooling period before rehire

  @Column({ type: 'boolean', default: false })
  eligible_for_exit_interview: boolean;

  @Column({ type: 'boolean', default: false })
  requires_clearance_certificate: boolean;

  // ==================== LEGAL & COMPLIANCE ====================
  
  @Column({ type: 'boolean', default: false })
  government_reporting_required: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  government_reporting_code: string; // Official code for labor reports

  @Column({ type: 'boolean', default: false })
  is_disciplinary: boolean;

  @Column({ type: 'boolean', default: false })
  requires_legal_review: boolean;

  @Column({ type: 'text', nullable: true })
  labor_law_reference: string; // e.g., "UAE Labor Law Article 44"

  @Column({ type: 'boolean', default: false })
  is_protected_termination: boolean; // Cannot terminate protected categories

  // ==================== COUNTRY & LEGAL CONTEXT ====================
  
  @Column({ type: 'varchar', length: 10, nullable: true })
  applicable_country_code: string; // ISO 3166-1 alpha-2

  @Column({ type: 'jsonb', nullable: true })
  applicable_countries: string[]; // Multi-country applicability

  @Column({ type: 'boolean', default: false })
  union_applicable: boolean;

  @Column({ type: 'boolean', default: false })
  cba_applicable: boolean; // Collective Bargaining Agreement

  @Column({ type: 'varchar', length: 200, nullable: true })
  cba_reference: string;

  // ==================== WORKFLOW IMPACT MAPPING ====================
  
  @Column({ type: 'boolean', default: true })
  triggers_clearance_process: boolean;

  @Column({ type: 'boolean', default: true })
  triggers_payroll_settlement: boolean;

  @Column({ type: 'boolean', default: true })
  triggers_asset_recovery: boolean;

  @Column({ type: 'boolean', default: true })
  triggers_access_deactivation: boolean;

  @Column({ type: 'boolean', default: false })
  triggers_legal_workflow: boolean;

  @Column({ type: 'boolean', default: false })
  triggers_investigation_workflow: boolean;

  @Column({ type: 'jsonb', nullable: true })
  custom_workflow_triggers: string[]; // Extensible workflow IDs

  // ==================== VISIBILITY & SECURITY ====================
  
  @Column({ type: 'boolean', default: false })
  hr_only: boolean;

  @Column({ type: 'boolean', default: true })
  manager_visible: boolean;

  @Column({ type: 'boolean', default: false })
  employee_self_service_allowed: boolean;

  @Column({ type: 'boolean', default: false })
  mask_in_employee_view: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  masked_display_name: string; // What employee sees instead

  // ==================== ANALYTICS & REPORTING TAGS ====================
  
  @Column({ type: 'varchar', length: 50, nullable: true })
  attrition_type: string; // 'Regretted', 'Non-Regretted', 'Neutral'

  @Column({ type: 'varchar', length: 50, nullable: true })
  voluntary_classification: string; // 'Voluntary', 'Involuntary', 'Mutual'

  @Column({ type: 'varchar', length: 50, nullable: true })
  risk_indicator: string; // 'High', 'Medium', 'Low', 'None'

  @Column({ type: 'boolean', default: false })
  compliance_sensitivity_flag: boolean;

  @Column({ type: 'boolean', default: false })
  exclude_from_attrition_metrics: boolean;

  @Column({ type: 'boolean', default: false })
  counts_as_turnover: boolean; // For turnover rate calculations

  @Column({ type: 'jsonb', nullable: true })
  analytics_tags: string[]; // Custom tags for BI/reporting

  // ==================== OVERRIDE & GOVERNANCE ====================
  
  @Column({ type: 'boolean', default: false })
  allow_manual_override: boolean;

  @Column({ type: 'boolean', default: false })
  requires_dual_approval: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  approval_authority_level: string; // 'Manager', 'HR', 'Director', 'C-Level'

  @Column({ type: 'boolean', default: false })
  mandatory_justification_required: boolean;

  @Column({ type: 'int', nullable: true })
  minimum_justification_length: number; // Characters

  @Column({ type: 'boolean', default: true })
  override_audit_flag: boolean;

  @Column({ type: 'jsonb', nullable: true })
  required_documents: string[]; // List of document types required

  // ==================== FINANCIAL IMPACT ====================
  
  @Column({ type: 'boolean', default: false })
  affects_severance_calculation: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  severance_multiplier: number; // Factor for severance pay

  @Column({ type: 'boolean', default: false })
  affects_notice_pay_calculation: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payroll_impact_code: string; // For payroll system integration

  // ==================== EFFECTIVE DATING & VERSIONING ====================
  
  @Column({ type: 'date' })
  effective_from: string;

  @Column({ type: 'date', nullable: true })
  effective_to: string;

  @Column({ type: 'boolean', default: false })
  is_historical: boolean; // Retired but kept for historical data

  @Column({ type: 'uuid', nullable: true })
  superseded_by: string; // Points to new reason if replaced

  @Column({ type: 'uuid', nullable: true })
  supersedes: string; // Points to old reason if this replaces it

  // ==================== STATUS ====================
  
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_system_defined: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deactivation_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  deactivated_at: string;

  @Column({ type: 'uuid', nullable: true })
  deactivated_by: string;

  @Column({ type: 'int', default: 0 })
  usage_count: number; // Track how many times used (transactional count)

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: string;

  // ==================== VALIDATION RULES ====================
  
  @Column({ type: 'jsonb', nullable: true })
  validation_rules: Record<string, any>; // Custom validation logic

  @Column({ type: 'boolean', default: false })
  requires_manager_confirmation: boolean;

  @Column({ type: 'boolean', default: false })
  requires_employee_acknowledgment: boolean;

  // ==================== INTEGRATION ====================
  
  @Column({ type: 'varchar', length: 100, nullable: true })
  external_system_code: string; // For third-party system mapping

  @Column({ type: 'jsonb', nullable: true })
  integration_mapping: Record<string, any>;

  // ==================== METADATA ====================
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
