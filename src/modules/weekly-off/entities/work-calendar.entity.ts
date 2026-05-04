import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CalendarDayType {
  WORKING_DAY = 'WORKING_DAY',
  WEEKLY_OFF = 'WEEKLY_OFF',
  PUBLIC_HOLIDAY = 'PUBLIC_HOLIDAY',
  PAID_LEAVE = 'PAID_LEAVE',
  UNPAID_LEAVE = 'UNPAID_LEAVE',
  REST_DAY = 'REST_DAY',
  COMP_OFF = 'COMP_OFF',
  ATTENDANCE_EXCEPTION = 'ATTENDANCE_EXCEPTION',
}

export enum OverrideType {
  MANUAL = 'MANUAL',
  SHIFT_SWAP = 'SHIFT_SWAP',
  EMERGENCY = 'EMERGENCY',
  BUSINESS_REQUIREMENT = 'BUSINESS_REQUIREMENT',
}

@Entity('employee_work_calendars')
@Index(['tenantId', 'employeeId', 'calendarDate'])
@Index(['employeeId', 'calendarDate'], { unique: true })
export class EmployeeWorkCalendar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  @Index()
  employeeId: string;

  @Column({ name: 'calendar_date', type: 'date' })
  @Index()
  calendarDate: Date;

  @Column({
    name: 'day_type',
    type: 'enum',
    enum: CalendarDayType,
  })
  dayType: CalendarDayType;

  @Column({ name: 'is_working_day', type: 'boolean' })
  isWorkingDay: boolean;

  @Column({ name: 'is_paid_day', type: 'boolean' })
  isPaidDay: boolean;

  // Source policy/rule that determined this day's type
  @Column({ name: 'source_policy_id', type: 'uuid', nullable: true })
  sourcePolicyId: string;

  @Column({ name: 'source_type', length: 100, nullable: true })
  sourceType: string;

  // Planned working hours for the day
  @Column({ name: 'planned_hours', type: 'decimal', precision: 5, scale: 2, nullable: true })
  plannedHours: number;

  // Actual working hours (populated from attendance)
  @Column({ name: 'actual_hours', type: 'decimal', precision: 5, scale: 2, nullable: true })
  actualHours: number;

  // Shift information
  @Column({ name: 'shift_id', type: 'uuid', nullable: true })
  shiftId: string;

  @Column({ name: 'shift_start_time', type: 'time', nullable: true })
  shiftStartTime: string;

  @Column({ name: 'shift_end_time', type: 'time', nullable: true })
  shiftEndTime: string;

  // Resolution priority (used for conflict resolution)
  @Column({ name: 'resolution_priority', type: 'int', default: 100 })
  resolutionPriority: number;

  // Conflicts and overrides
  @Column({ name: 'has_conflicts', type: 'boolean', default: false })
  hasConflicts: boolean;

  @Column({ name: 'conflict_details', type: 'jsonb', nullable: true })
  conflictDetails: any;

  @Column({ name: 'is_override', type: 'boolean', default: false })
  isOverride: boolean;

  @Column({ name: 'override_reason', type: 'text', nullable: true })
  overrideReason: string;

  @Column({ name: 'override_approved_by', type: 'uuid', nullable: true })
  overrideApprovedBy: string;

  @Column({ name: 'override_approved_at', type: 'timestamp', nullable: true })
  overrideApprovedAt: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ name: 'generated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generatedAt: Date;

  @Column({ name: 'last_recalculated_at', type: 'timestamp', nullable: true })
  lastRecalculatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('weekly_off_overrides')
@Index(['tenantId', 'employeeId', 'overrideDate'])
@Index(['approvalStatus', 'isActive'])
export class WeeklyOffOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  @Index()
  employeeId: string;

  @Column({ name: 'override_date', type: 'date' })
  @Index()
  overrideDate: Date;

  @Column({
    name: 'override_type',
    type: 'enum',
    enum: OverrideType,
  })
  overrideType: OverrideType;

  // Converting weekly off to working day or vice versa
  @Column({ name: 'original_day_type', type: 'varchar', length: 50 })
  originalDayType: string;

  @Column({ name: 'new_day_type', type: 'varchar', length: 50 })
  newDayType: string;

  @Column({ type: 'text' })
  reason: string;

  // Compensation details
  @Column({ name: 'requires_compensation', type: 'boolean', default: false })
  requiresCompensation: boolean;

  @Column({ name: 'compensation_type', length: 50, nullable: true })
  compensationType: string;

  @Column({ name: 'compensation_date', type: 'date', nullable: true })
  compensationDate: Date;

  @Column({ name: 'ot_multiplier', type: 'decimal', precision: 5, scale: 2, nullable: true })
  otMultiplier: number;

  // Approval workflow
  @Column({ name: 'approval_status', length: 50, default: 'PENDING' })
  @Index()
  approvalStatus: string;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy: string;

  @Column({ name: 'requested_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('calendar_resolution_rules')
@Index(['tenantId', 'isActive'])
export class CalendarResolutionRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'rule_name', length: 255 })
  ruleName: string;

  @Column({ name: 'rule_code', length: 100, unique: true })
  @Index()
  ruleCode: string;

  // Priority for resolving conflicts (lower = higher priority)
  // Example: Leave > Public Holiday > Weekly Off > Working Day
  @Column({ name: 'day_type_priority', type: 'jsonb' })
  dayTypePriority: any;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
