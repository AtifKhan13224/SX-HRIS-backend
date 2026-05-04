import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RetirementEligibilityCriteria {
  AGE_ONLY = 'AGE_ONLY',
  SERVICE_ONLY = 'SERVICE_ONLY',
  AGE_OR_SERVICE = 'AGE_OR_SERVICE',
  AGE_AND_SERVICE = 'AGE_AND_SERVICE',
  AGE_PLUS_SERVICE_FORMULA = 'AGE_PLUS_SERVICE_FORMULA', // e.g., Age + Service >= 80
  CUSTOM_FORMULA = 'CUSTOM_FORMULA',
}

export enum RetirementTriggerType {
  DATE_OF_BIRTH = 'DATE_OF_BIRTH',
  DATE_OF_JOINING = 'DATE_OF_JOINING',
  CONTRACT_END_DATE = 'CONTRACT_END_DATE',
  MANUAL_TRIGGER = 'MANUAL_TRIGGER',
  COMBINED_CRITERIA = 'COMBINED_CRITERIA',
}

export enum RetirementNoticeType {
  MANDATORY = 'MANDATORY',
  OPTIONAL = 'OPTIONAL',
  NOT_REQUIRED = 'NOT_REQUIRED',
  AUTO_ISSUED = 'AUTO_ISSUED',
}

export enum PostRetirementEmployment {
  NOT_ALLOWED = 'NOT_ALLOWED',
  CONSULTANT_ONLY = 'CONSULTANT_ONLY',
  ADVISORY_ONLY = 'ADVISORY_ONLY',
  FULL_REHIRE_ALLOWED = 'FULL_REHIRE_ALLOWED',
  CONTRACT_BASIS_ONLY = 'CONTRACT_BASIS_ONLY',
}

export enum GenderApplicability {
  ALL = 'ALL',
  MALE_ONLY = 'MALE_ONLY',
  FEMALE_ONLY = 'FEMALE_ONLY',
  NON_BINARY = 'NON_BINARY',
}

@Entity('retirement_policies')
@Index(['country_code', 'is_active', 'effective_from'])
@Index(['legal_entity_id', 'is_active'])
@Index(['rule_priority', 'effective_from'])
export class RetirementPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ==================== POLICY IDENTIFICATION ====================
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  policy_code: string;

  @Column({ type: 'varchar', length: 200 })
  policy_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 100 })
  rule_priority: number; // Lower number = higher priority

  // ==================== APPLICABILITY SCOPE ====================
  @Column({ type: 'varchar', length: 3, nullable: true })
  @Index()
  country_code: string; // ISO 3166-1 alpha-3

  @Column({ type: 'uuid', nullable: true })
  @Index()
  legal_entity_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  employee_type: string; // Permanent, Contract, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  employee_sub_type: string; // Full-Time, Part-Time, etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  grade_band: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contract_type: string; // Fixed-term, Indefinite, etc.

  @Column({
    type: 'enum',
    enum: GenderApplicability,
    default: GenderApplicability.ALL,
  })
  gender_applicability: GenderApplicability;

  @Column({ type: 'boolean', default: false })
  apply_to_union_members: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  union_agreement_reference: string;

  // ==================== ELIGIBILITY CONFIGURATION ====================
  @Column({
    type: 'enum',
    enum: RetirementEligibilityCriteria,
    default: RetirementEligibilityCriteria.AGE_ONLY,
  })
  eligibility_criteria: RetirementEligibilityCriteria;

  @Column({ type: 'int', nullable: true })
  mandatory_retirement_age: number; // Configurable, not hardcoded

  @Column({ type: 'int', nullable: true })
  minimum_retirement_age: number; // Early retirement threshold

  @Column({ type: 'int', nullable: true })
  maximum_retirement_age: number; // Legal/policy maximum

  @Column({ type: 'int', nullable: true })
  minimum_service_years: number;

  @Column({ type: 'int', nullable: true })
  minimum_service_months: number;

  @Column({ type: 'text', nullable: true })
  custom_eligibility_formula: string; // e.g., "age + service_years >= 80"

  @Column({ type: 'boolean', default: false })
  allow_early_retirement: boolean;

  @Column({ type: 'int', nullable: true })
  early_retirement_age: number;

  @Column({ type: 'int', nullable: true })
  early_retirement_min_service: number;

  @Column({ type: 'boolean', default: false })
  allow_deferred_retirement: boolean;

  @Column({ type: 'int', nullable: true })
  deferred_retirement_max_age: number;

  @Column({ type: 'int', nullable: true })
  deferred_retirement_max_months: number;

  // ==================== TRIGGER CONFIGURATION ====================
  @Column({
    type: 'enum',
    enum: RetirementTriggerType,
    default: RetirementTriggerType.DATE_OF_BIRTH,
  })
  trigger_type: RetirementTriggerType;

  @Column({ type: 'int', nullable: true })
  advance_notice_months: number; // Notify X months before retirement

  @Column({ type: 'int', nullable: true })
  advance_notice_days: number; // Additional days for notice

  @Column({ type: 'boolean', default: true })
  auto_status_transition: boolean; // Auto-change employee status

  @Column({ type: 'boolean', default: true })
  allow_manual_override: boolean;

  @Column({ type: 'boolean', default: false })
  require_approval_for_override: boolean;

  // ==================== NOTICE PERIOD CONFIGURATION ====================
  @Column({
    type: 'enum',
    enum: RetirementNoticeType,
    default: RetirementNoticeType.MANDATORY,
  })
  notice_type: RetirementNoticeType;

  @Column({ type: 'int', nullable: true })
  notice_period_days: number; // Employee must give notice

  @Column({ type: 'boolean', default: true })
  employer_advance_notification_required: boolean;

  @Column({ type: 'int', nullable: true })
  employer_notification_days: number;

  @Column({ type: 'boolean', default: false })
  require_acknowledgment: boolean;

  @Column({ type: 'boolean', default: true })
  auto_issue_notice: boolean;

  // ==================== POST-RETIREMENT CONFIGURATION ====================
  @Column({
    type: 'enum',
    enum: PostRetirementEmployment,
    default: PostRetirementEmployment.NOT_ALLOWED,
  })
  post_retirement_employment: PostRetirementEmployment;

  @Column({ type: 'boolean', default: false })
  allow_rehire: boolean;

  @Column({ type: 'int', nullable: true })
  rehire_cooling_off_months: number;

  @Column({ type: 'boolean', default: false })
  allow_consultant_conversion: boolean;

  @Column({ type: 'int', nullable: true })
  consultant_max_duration_months: number;

  @Column({ type: 'boolean', default: false })
  allow_advisory_role: boolean;

  @Column({ type: 'int', nullable: true })
  advisory_max_duration_months: number;

  // ==================== PAYROLL & BENEFITS HOOKS ====================
  @Column({ type: 'boolean', default: true })
  gratuity_eligible: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pension_scheme_code: string; // Reference to pension config

  @Column({ type: 'boolean', default: true })
  trigger_final_settlement: boolean;

  @Column({ type: 'boolean', default: false })
  continue_health_benefits: boolean;

  @Column({ type: 'int', nullable: true })
  health_benefits_duration_months: number;

  @Column({ type: 'boolean', default: false })
  continue_life_insurance: boolean;

  @Column({ type: 'int', nullable: true })
  life_insurance_duration_months: number;

  @Column({ type: 'json', nullable: true })
  additional_benefits_config: Record<string, any>; // Flexible benefits

  // ==================== COMPLIANCE & LEGAL ====================
  @Column({ type: 'boolean', default: false })
  government_reporting_required: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reporting_authority: string;

  @Column({ type: 'int', nullable: true })
  reporting_deadline_days: number;

  @Column({ type: 'boolean', default: false })
  work_permit_dependent: boolean; // Retirement affects work permit

  @Column({ type: 'boolean', default: false })
  visa_cancellation_required: boolean;

  @Column({ type: 'int', nullable: true })
  visa_grace_period_days: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legal_reference_code: string; // e.g., Labor Law Article

  @Column({ type: 'text', nullable: true })
  compliance_notes: string;

  // ==================== OVERRIDE & EXCEPTION MANAGEMENT ====================
  @Column({ type: 'boolean', default: false })
  allow_age_extension: boolean;

  @Column({ type: 'int', nullable: true })
  max_extension_years: number;

  @Column({ type: 'boolean', default: true })
  extension_requires_approval: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  extension_approval_level: string; // e.g., CEO, Board

  @Column({ type: 'boolean', default: false })
  allow_early_retirement_approval: boolean;

  @Column({ type: 'boolean', default: false })
  require_dual_approval: boolean;

  @Column({ type: 'boolean', default: true })
  mandatory_justification: boolean;

  @Column({ type: 'int', nullable: true })
  override_validity_months: number; // How long override is valid

  // ==================== EFFECTIVE DATING & VERSIONING ====================
  @Column({ type: 'date' })
  @Index()
  effective_from: Date;

  @Column({ type: 'date', nullable: true })
  effective_to: Date;

  @Column({ type: 'boolean', default: true })
  @Index()
  is_active: boolean;

  @Column({ type: 'int', default: 1 })
  policy_version: number;

  @Column({ type: 'uuid', nullable: true })
  supersedes_policy_id: string; // Reference to previous version

  @Column({ type: 'boolean', default: false })
  allow_retroactive_application: boolean;

  // ==================== RULE BUILDER CONFIGURATION ====================
  @Column({ type: 'json', nullable: true })
  conditional_logic: Record<string, any>; // IF/AND/OR conditions

  @Column({ type: 'json', nullable: true })
  exception_rules: Record<string, any>; // Special case handling

  @Column({ type: 'json', nullable: true })
  impact_preview_metadata: Record<string, any>; // Who will be affected

  // ==================== EVENT OUTPUTS ====================
  @Column({ type: 'boolean', default: true })
  trigger_eligibility_event: boolean;

  @Column({ type: 'boolean', default: true })
  trigger_pre_retirement_notification: boolean;

  @Column({ type: 'boolean', default: true })
  trigger_lifecycle_status_change: boolean;

  @Column({ type: 'boolean', default: false })
  trigger_downstream_systems: boolean; // Payroll, Benefits, etc.

  @Column({ type: 'json', nullable: true })
  downstream_system_config: Record<string, any>;

  // ==================== AUDIT & METADATA ====================
  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'text', nullable: true })
  approval_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'json', nullable: true })
  audit_metadata: Record<string, any>; // Full audit trail
}
