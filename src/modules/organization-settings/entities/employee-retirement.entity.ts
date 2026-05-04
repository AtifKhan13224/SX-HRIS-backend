import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RetirementStatus {
  DRAFT = 'DRAFT',
  ELIGIBILITY_IDENTIFIED = 'ELIGIBILITY_IDENTIFIED',
  PRE_RETIREMENT_NOTICE_ISSUED = 'PRE_RETIREMENT_NOTICE_ISSUED',
  NOTICE_ACKNOWLEDGED = 'NOTICE_ACKNOWLEDGED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETIREMENT_IN_PROGRESS = 'RETIREMENT_IN_PROGRESS',
  RETIREMENT_COMPLETED = 'RETIREMENT_COMPLETED',
  EXTENSION_REQUESTED = 'EXTENSION_REQUESTED',
  EXTENSION_APPROVED = 'EXTENSION_APPROVED',
  EXTENSION_REJECTED = 'EXTENSION_REJECTED',
  EARLY_RETIREMENT_REQUESTED = 'EARLY_RETIREMENT_REQUESTED',
  EARLY_RETIREMENT_APPROVED = 'EARLY_RETIREMENT_APPROVED',
  DEFERRED_RETIREMENT = 'DEFERRED_RETIREMENT',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export enum RetirementType {
  MANDATORY = 'MANDATORY',
  EARLY_VOLUNTARY = 'EARLY_VOLUNTARY',
  DEFERRED = 'DEFERRED',
  MEDICAL = 'MEDICAL',
  SPECIAL_SCHEME = 'SPECIAL_SCHEME',
  CONTRACTUAL = 'CONTRACTUAL',
}

export enum ApprovalStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
}

@Entity('employee_retirements')
@Index(['employee_id', 'retirement_status'])
@Index(['retirement_case_id'])
@Index(['expected_retirement_date', 'retirement_status'])
@Index(['policy_id', 'retirement_status'])
export class EmployeeRetirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ==================== CASE IDENTIFICATION ====================
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  retirement_case_id: string; // e.g., RET-2026-0001

  @Column({ type: 'uuid' })
  @Index()
  employee_id: string;

  @Column({ type: 'uuid' })
  @Index()
  policy_id: string; // Applied retirement policy

  @Column({ type: 'varchar', length: 50, nullable: true })
  policy_snapshot_version: string; // Policy version at application time

  // ==================== RETIREMENT TYPE & STATUS ====================
  @Column({
    type: 'enum',
    enum: RetirementType,
    default: RetirementType.MANDATORY,
  })
  retirement_type: RetirementType;

  @Column({
    type: 'enum',
    enum: RetirementStatus,
    default: RetirementStatus.DRAFT,
  })
  @Index()
  retirement_status: RetirementStatus;

  @Column({ type: 'text', nullable: true })
  retirement_reason: string;

  // ==================== ELIGIBILITY CALCULATION ====================
  @Column({ type: 'date', nullable: true })
  employee_date_of_birth: Date; // Snapshot at calculation time

  @Column({ type: 'date', nullable: true })
  employee_date_of_joining: Date; // Snapshot at calculation time

  @Column({ type: 'int', nullable: true })
  age_at_eligibility: number; // Calculated age

  @Column({ type: 'int', nullable: true })
  service_years_at_eligibility: number;

  @Column({ type: 'int', nullable: true })
  service_months_at_eligibility: number;

  @Column({ type: 'date' })
  @Index()
  eligibility_determination_date: Date; // When eligibility was determined

  @Column({ type: 'text', nullable: true })
  eligibility_calculation_notes: string;

  @Column({ type: 'boolean', default: false })
  meets_age_criteria: boolean;

  @Column({ type: 'boolean', default: false })
  meets_service_criteria: boolean;

  @Column({ type: 'boolean', default: true })
  is_eligible: boolean;

  // ==================== RETIREMENT DATES ====================
  @Column({ type: 'date' })
  expected_retirement_date: Date; // Calculated retirement date

  @Column({ type: 'date', nullable: true })
  actual_retirement_date: Date; // May differ due to extensions

  @Column({ type: 'date', nullable: true })
  last_working_day: Date;

  @Column({ type: 'date', nullable: true })
  notice_issue_date: Date;

  @Column({ type: 'date', nullable: true })
  notice_acknowledgment_date: Date;

  @Column({ type: 'date', nullable: true })
  employee_notification_date: Date;

  @Column({ type: 'date', nullable: true })
  employer_notification_date: Date;

  // ==================== EARLY RETIREMENT ====================
  @Column({ type: 'boolean', default: false })
  is_early_retirement: boolean;

  @Column({ type: 'date', nullable: true })
  early_retirement_request_date: Date;

  @Column({ type: 'text', nullable: true })
  early_retirement_justification: string;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.NOT_REQUIRED,
  })
  early_retirement_approval_status: ApprovalStatus;

  @Column({ type: 'uuid', nullable: true })
  early_retirement_approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  early_retirement_approved_at: Date;

  // ==================== DEFERRED RETIREMENT ====================
  @Column({ type: 'boolean', default: false })
  is_deferred: boolean;

  @Column({ type: 'date', nullable: true })
  deferral_request_date: Date;

  @Column({ type: 'date', nullable: true })
  deferred_until_date: Date;

  @Column({ type: 'int', nullable: true })
  deferral_duration_months: number;

  @Column({ type: 'text', nullable: true })
  deferral_justification: string;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.NOT_REQUIRED,
  })
  deferral_approval_status: ApprovalStatus;

  @Column({ type: 'uuid', nullable: true })
  deferral_approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  deferral_approved_at: Date;

  // ==================== EXTENSION MANAGEMENT ====================
  @Column({ type: 'boolean', default: false })
  extension_requested: boolean;

  @Column({ type: 'int', nullable: true })
  extension_months_requested: number;

  @Column({ type: 'date', nullable: true })
  extension_request_date: Date;

  @Column({ type: 'text', nullable: true })
  extension_justification: string;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.NOT_REQUIRED,
  })
  extension_approval_status: ApprovalStatus;

  @Column({ type: 'int', nullable: true })
  extension_months_approved: number;

  @Column({ type: 'date', nullable: true })
  extended_retirement_date: Date;

  @Column({ type: 'uuid', nullable: true })
  extension_approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  extension_approved_at: Date;

  @Column({ type: 'text', nullable: true })
  extension_rejection_reason: string;

  // ==================== APPROVALS & WORKFLOW ====================
  @Column({ type: 'boolean', default: false })
  requires_approval: boolean;

  @Column({ type: 'uuid', nullable: true })
  primary_approver_id: string;

  @Column({ type: 'uuid', nullable: true })
  secondary_approver_id: string; // For dual approval

  @Column({ type: 'timestamp', nullable: true })
  primary_approval_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  secondary_approval_date: Date;

  @Column({ type: 'text', nullable: true })
  approval_comments: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'uuid', nullable: true })
  rejected_by: string;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date;

  // ==================== POST-RETIREMENT EMPLOYMENT ====================
  @Column({ type: 'boolean', default: false })
  rehire_eligible: boolean;

  @Column({ type: 'date', nullable: true })
  rehire_eligible_from: Date; // After cooling-off period

  @Column({ type: 'boolean', default: false })
  consultant_conversion_eligible: boolean;

  @Column({ type: 'boolean', default: false })
  advisory_role_eligible: boolean;

  @Column({ type: 'date', nullable: true })
  post_retirement_employment_start_date: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  post_retirement_employment_type: string;

  // ==================== PAYROLL & BENEFITS ====================
  @Column({ type: 'boolean', default: false })
  gratuity_calculation_triggered: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimated_gratuity_amount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pension_scheme_assigned: string;

  @Column({ type: 'boolean', default: false })
  final_settlement_triggered: boolean;

  @Column({ type: 'date', nullable: true })
  final_settlement_date: Date;

  @Column({ type: 'boolean', default: false })
  health_benefits_continued: boolean;

  @Column({ type: 'date', nullable: true })
  health_benefits_end_date: Date;

  @Column({ type: 'boolean', default: false })
  life_insurance_continued: boolean;

  @Column({ type: 'date', nullable: true })
  life_insurance_end_date: Date;

  @Column({ type: 'json', nullable: true })
  additional_benefits_snapshot: Record<string, any>;

  // ==================== COMPLIANCE & REPORTING ====================
  @Column({ type: 'boolean', default: false })
  government_reporting_required: boolean;

  @Column({ type: 'boolean', default: false })
  government_report_submitted: boolean;

  @Column({ type: 'date', nullable: true })
  government_report_submission_date: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  government_report_reference: string;

  @Column({ type: 'boolean', default: false })
  work_permit_cancelled: boolean;

  @Column({ type: 'date', nullable: true })
  work_permit_cancellation_date: Date;

  @Column({ type: 'boolean', default: false })
  visa_cancelled: boolean;

  @Column({ type: 'date', nullable: true })
  visa_cancellation_date: Date;

  @Column({ type: 'date', nullable: true })
  visa_grace_period_end: Date;

  // ==================== OVERRIDE & EXCEPTION TRACKING ====================
  @Column({ type: 'boolean', default: false })
  is_override: boolean;

  @Column({ type: 'text', nullable: true })
  override_justification: string;

  @Column({ type: 'uuid', nullable: true })
  override_approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  override_approved_at: Date;

  @Column({ type: 'date', nullable: true })
  override_valid_until: Date;

  @Column({ type: 'text', nullable: true })
  exception_notes: string;

  // ==================== LIFECYCLE TRANSITIONS ====================
  @Column({ type: 'varchar', length: 50, nullable: true })
  previous_employee_status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  new_employee_status: string;

  @Column({ type: 'date', nullable: true })
  status_transition_date: Date;

  @Column({ type: 'boolean', default: false })
  auto_status_transitioned: boolean;

  // ==================== EVENT TRIGGERS ====================
  @Column({ type: 'boolean', default: false })
  eligibility_event_triggered: boolean;

  @Column({ type: 'timestamp', nullable: true })
  eligibility_event_triggered_at: Date;

  @Column({ type: 'boolean', default: false })
  pre_retirement_notification_sent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  pre_retirement_notification_sent_at: Date;

  @Column({ type: 'boolean', default: false })
  lifecycle_event_triggered: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lifecycle_event_triggered_at: Date;

  @Column({ type: 'boolean', default: false })
  downstream_systems_notified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  downstream_systems_notified_at: Date;

  @Column({ type: 'json', nullable: true })
  event_log: Record<string, any>; // Full event history

  // ==================== CANCELLATION ====================
  @Column({ type: 'boolean', default: false })
  is_cancelled: boolean;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  @Column({ type: 'uuid', nullable: true })
  cancelled_by: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  // ==================== AUDIT & METADATA ====================
  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'json', nullable: true })
  audit_trail: Record<string, any>; // Complete audit log

  @Column({ type: 'json', nullable: true })
  policy_snapshot: Record<string, any>; // Policy state at application time

  @Column({ type: 'text', nullable: true })
  internal_notes: string;

  @Column({ type: 'text', nullable: true })
  employee_comments: string;

  @Column({ type: 'text', nullable: true })
  hr_comments: string;
}
