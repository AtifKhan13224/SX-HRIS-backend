import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SeparationType } from './notice-period-policy.entity';

export enum SeparationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_NOTICE = 'IN_NOTICE',
  NOTICE_SERVED = 'NOTICE_SERVED',
  BOUGHT_OUT = 'BOUGHT_OUT',
  WAIVED = 'WAIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  WITHDRAWN = 'WITHDRAWN',
  ABSCONDED = 'ABSCONDED',
  ON_HOLD = 'ON_HOLD',
}

@Entity('employee_separations')
@Index(['tenant_id', 'employee_id'])
@Index(['separation_case_id'], { unique: true })
@Index(['status', 'last_working_day'])
export class EmployeeSeparation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  separation_case_id: string;

  @Column({ type: 'uuid' })
  @Index()
  employee_id: string;

  // Separation Details
  @Column({
    type: 'enum',
    enum: SeparationType,
  })
  separation_type: SeparationType;

  @Column({
    type: 'enum',
    enum: SeparationStatus,
    default: SeparationStatus.DRAFT,
  })
  status: SeparationStatus;

  @Column({ type: 'text', nullable: true })
  separation_reason: string;

  @Column({ type: 'date' })
  submission_date: Date;

  @Column({ type: 'uuid', nullable: true })
  applied_policy_id: string;

  // Notice Period Calculation
  @Column({ type: 'int' })
  notice_days_required: number;

  @Column({ type: 'varchar', length: 20 })
  notice_day_type: string; // CALENDAR, WORKING

  @Column({ type: 'date' })
  notice_start_date: Date;

  @Column({ type: 'date' })
  notice_end_date: Date;

  @Column({ type: 'date' })
  last_working_day: Date;

  // Leave & Attendance During Notice
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  leave_balance_at_notice: number;

  @Column({ type: 'int', default: 0 })
  leave_adjusted_days: number;

  @Column({ type: 'int', default: 0 })
  forced_leave_days: number;

  @Column({ type: 'int', default: 0 })
  unpaid_leave_days: number;

  @Column({ type: 'int', default: 0 })
  attendance_during_notice: number;

  @Column({ type: 'boolean', default: true })
  attendance_required: boolean;

  // Buyout/PILON
  @Column({ type: 'boolean', default: false })
  buyout_requested: boolean;

  @Column({ type: 'boolean', default: false })
  buyout_approved: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  buyout_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  pilon_amount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  buyout_tax_treatment: string;

  // Override Details
  @Column({ type: 'boolean', default: false })
  override_applied: boolean;

  @Column({ type: 'text', nullable: true })
  override_reason: string;

  @Column({ type: 'uuid', nullable: true })
  override_approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  override_approved_at: Date;

  @Column({ type: 'int', nullable: true })
  override_notice_days: number;

  // Compliance & Legal
  @Column({ type: 'boolean', default: true })
  country_law_compliant: boolean;

  @Column({ type: 'jsonb', nullable: true })
  compliance_checks: {
    minimum_notice_met?: boolean;
    visa_cancellation_allowed?: boolean;
    ministry_notification_sent?: boolean;
    union_approval_obtained?: boolean;
    [key: string]: any;
  };

  @Column({ type: 'varchar', length: 50, nullable: true })
  ministry_notification_status: string;

  @Column({ type: 'timestamp', nullable: true })
  ministry_notification_sent_at: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ministry_notification_reference: string;

  // Financial Settlement
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  payroll_settlement_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  gratuity_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  leave_encashment_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  other_dues: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  deductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  net_settlement_amount: number;

  @Column({ type: 'date', nullable: true })
  settlement_payment_date: Date;

  // Asset & Access Management
  @Column({ type: 'boolean', default: false })
  assets_returned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  asset_recovery_completed_at: Date;

  @Column({ type: 'boolean', default: false })
  access_deactivated: boolean;

  @Column({ type: 'timestamp', nullable: true })
  access_deactivated_at: Date;

  // Visa & Immigration
  @Column({ type: 'boolean', default: false })
  visa_cancelled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  visa_cancelled_at: Date;

  @Column({ type: 'date', nullable: true })
  visa_cancellation_due_date: Date;

  // Withdrawal & Absconding
  @Column({ type: 'boolean', default: false })
  withdrawal_requested: boolean;

  @Column({ type: 'timestamp', nullable: true })
  withdrawal_requested_at: Date;

  @Column({ type: 'boolean', default: false })
  withdrawal_approved: boolean;

  @Column({ type: 'uuid', nullable: true })
  withdrawal_approved_by: string;

  @Column({ type: 'boolean', default: false })
  absconded: boolean;

  @Column({ type: 'date', nullable: true })
  absconding_declared_at: Date;

  // Legal Hold
  @Column({ type: 'boolean', default: false })
  legal_hold_active: boolean;

  @Column({ type: 'text', nullable: true })
  legal_hold_reason: string;

  @Column({ type: 'date', nullable: true })
  legal_hold_applied_at: Date;

  // Cross-Country Transfer
  @Column({ type: 'uuid', nullable: true })
  cross_country_transfer_id: string;

  @Column({ type: 'boolean', default: false })
  is_transfer_separation: boolean;

  // Workflow State
  @Column({ type: 'varchar', length: 50, nullable: true })
  current_workflow_step: string;

  @Column({ type: 'uuid', nullable: true })
  current_approver_id: string;

  @Column({ type: 'jsonb', nullable: true })
  workflow_history: {
    step: string;
    action: string;
    actor_id: string;
    timestamp: Date;
    comments?: string;
  }[];

  // Approvals
  @Column({ type: 'uuid', nullable: true })
  immediate_manager_id: string;

  @Column({ type: 'boolean', default: false })
  manager_approved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  manager_approved_at: Date;

  @Column({ type: 'uuid', nullable: true })
  hr_approver_id: string;

  @Column({ type: 'boolean', default: false })
  hr_approved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  hr_approved_at: Date;

  @Column({ type: 'uuid', nullable: true })
  final_approver_id: string;

  @Column({ type: 'boolean', default: false })
  final_approved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  final_approved_at: Date;

  // Audit Fields
  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remarks: string;
}
