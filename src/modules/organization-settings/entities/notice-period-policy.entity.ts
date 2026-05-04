import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum NoticeDayType {
  CALENDAR = 'CALENDAR',
  WORKING = 'WORKING',
}

export enum SeparationType {
  VOLUNTARY_RESIGNATION = 'VOLUNTARY_RESIGNATION',
  ABSCONDING = 'ABSCONDING',
  MUTUAL_SEPARATION = 'MUTUAL_SEPARATION',
  RETIREMENT = 'RETIREMENT',
  END_OF_CONTRACT = 'END_OF_CONTRACT',
  TERMINATION_WITH_NOTICE = 'TERMINATION_WITH_NOTICE',
  TERMINATION_WITHOUT_NOTICE = 'TERMINATION_WITHOUT_NOTICE',
  REDUNDANCY = 'REDUNDANCY',
  MEDICAL_UNFITNESS = 'MEDICAL_UNFITNESS',
  LEGAL_SUSPENSION = 'LEGAL_SUSPENSION',
  DEATH_IN_SERVICE = 'DEATH_IN_SERVICE',
}

export enum SeparationInitiator {
  EMPLOYEE = 'EMPLOYEE',
  EMPLOYER = 'EMPLOYER',
  MUTUAL = 'MUTUAL',
  AUTOMATIC = 'AUTOMATIC',
}

@Entity('notice_period_policies')
@Index(['tenant_id', 'is_active', 'effective_from'])
@Index(['country_id', 'is_active'])
@Index(['policy_code'], { unique: true })
export class NoticePeriodPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  policy_code: string;

  @Column({ type: 'varchar', length: 200 })
  policy_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Hierarchy Filters
  @Column({ type: 'uuid', nullable: true })
  @Index()
  country_id: string;

  @Column({ type: 'uuid', nullable: true })
  legal_entity_id: string;

  @Column({ type: 'uuid', nullable: true })
  employee_type_id: string;

  @Column({ type: 'uuid', nullable: true })
  employee_subtype_id: string;

  @Column({ type: 'uuid', nullable: true })
  grade_id: string;

  @Column({ type: 'uuid', nullable: true })
  band_id: string;

  @Column({ type: 'uuid', nullable: true })
  contract_type_id: string;

  @Column({ type: 'boolean', default: false })
  applies_to_probation: boolean;

  // Separation Types
  @Column({ type: 'jsonb' })
  applicable_separation_types: SeparationType[];

  @Column({
    type: 'enum',
    enum: SeparationInitiator,
    nullable: true,
  })
  separation_initiator: SeparationInitiator;

  // Core Notice Period Configuration
  @Column({ type: 'int' })
  standard_notice_days: number;

  @Column({
    type: 'enum',
    enum: NoticeDayType,
    default: NoticeDayType.CALENDAR,
  })
  notice_day_type: NoticeDayType;

  @Column({ type: 'int' })
  minimum_legal_notice_days: number;

  @Column({ type: 'int', nullable: true })
  maximum_notice_days: number;

  // Probation-Specific Rules
  @Column({ type: 'int', nullable: true })
  probation_notice_days: number;

  @Column({ type: 'boolean', default: false })
  probation_immediate_termination_allowed: boolean;

  // Employer vs Employee Notice
  @Column({ type: 'int', nullable: true })
  employer_notice_days: number;

  @Column({ type: 'int', nullable: true })
  employee_notice_days: number;

  // Buyout & Pay-in-Lieu (PILON)
  @Column({ type: 'boolean', default: false })
  employee_buyout_allowed: boolean;

  @Column({ type: 'boolean', default: true })
  employer_pilon_allowed: boolean;

  @Column({ type: 'boolean', default: false })
  partial_buyout_allowed: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  buyout_multiplier: number;

  // Leave During Notice
  @Column({ type: 'boolean', default: true })
  leave_allowed_during_notice: boolean;

  @Column({ type: 'boolean', default: false })
  force_leave_utilization: boolean;

  @Column({ type: 'boolean', default: true })
  include_holidays_in_notice: boolean;

  @Column({ type: 'boolean', default: false })
  unpaid_leave_allowed: boolean;

  @Column({ type: 'boolean', default: true })
  attendance_required_during_notice: boolean;

  // Override & Approval Rules
  @Column({ type: 'boolean', default: true })
  override_requires_approval: boolean;

  @Column({ type: 'jsonb', nullable: true })
  override_approvers: string[];

  @Column({ type: 'boolean', default: true })
  override_requires_justification: boolean;

  // Country Law Enforcement
  @Column({ type: 'boolean', default: true })
  country_law_overrides_policy: boolean;

  @Column({ type: 'jsonb', nullable: true })
  country_law_reference: {
    law_name?: string;
    article_number?: string;
    minimum_notice_days?: number;
    special_conditions?: string;
  };

  // Visa/Work Permit Dependencies
  @Column({ type: 'boolean', default: false })
  visa_dependent: boolean;

  @Column({ type: 'int', nullable: true })
  visa_cancellation_notice_days: number;

  // Government Reporting
  @Column({ type: 'boolean', default: false })
  requires_ministry_notification: boolean;

  @Column({ type: 'int', nullable: true })
  ministry_notification_days_before: number;

  // Cross-Module Integration Flags
  @Column({ type: 'boolean', default: true })
  trigger_payroll_settlement: boolean;

  @Column({ type: 'boolean', default: true })
  trigger_gratuity_calculation: boolean;

  @Column({ type: 'boolean', default: true })
  trigger_leave_encashment: boolean;

  @Column({ type: 'boolean', default: true })
  trigger_access_deactivation: boolean;

  @Column({ type: 'boolean', default: true })
  trigger_asset_recovery: boolean;

  // Priority & Effective Dating
  @Column({ type: 'int', default: 100 })
  rule_priority: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'date' })
  effective_from: Date;

  @Column({ type: 'date', nullable: true })
  effective_to: Date;

  // Audit Fields
  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
