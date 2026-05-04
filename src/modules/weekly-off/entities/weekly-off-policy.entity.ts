import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

export enum WeeklyOffType {
  FIXED = 'FIXED',
  ROTATIONAL = 'ROTATIONAL',
  SHIFT_BASED = 'SHIFT_BASED',
  FLEXIBLE_COMPRESSED = 'FLEXIBLE_COMPRESSED',
  CUSTOM = 'CUSTOM',
}

export enum ConfigurationLevel {
  GLOBAL = 'GLOBAL',
  COUNTRY = 'COUNTRY',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
  BUSINESS_UNIT = 'BUSINESS_UNIT',
  LOCATION = 'LOCATION',
  DEPARTMENT = 'DEPARTMENT',
  SHIFT = 'SHIFT',
  EMPLOYEE = 'EMPLOYEE',
}

export enum DayOfWeek {
  MONDAY = 0,
  TUESDAY = 1,
  WEDNESDAY = 2,
  THURSDAY = 3,
  FRIDAY = 4,
  SATURDAY = 5,
  SUNDAY = 6,
}

@Entity('weekly_off_policies')
@Index(['tenantId', 'isActive', 'effectiveFrom'])
@Index(['tenantId', 'configurationLevel', 'referenceId'])
export class WeeklyOffPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'policy_name', length: 255 })
  policyName: string;

  @Column({ name: 'policy_code', length: 100, unique: true })
  @Index()
  policyCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'weekly_off_type',
    type: 'enum',
    enum: WeeklyOffType,
    default: WeeklyOffType.FIXED,
  })
  weeklyOffType: WeeklyOffType;

  @Column({
    name: 'configuration_level',
    type: 'enum',
    enum: ConfigurationLevel,
  })
  configurationLevel: ConfigurationLevel;

  // Reference ID for the configuration level (country_id, business_unit_id, etc.)
  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  @Index()
  referenceId: string;

  // Priority for override resolution (lower number = higher priority)
  @Column({ type: 'int', default: 100 })
  priority: number;

  @Column({ name: 'effective_from', type: 'date' })
  @Index()
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  @Index()
  effectiveTo: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  // Country ID for labor law compliance
  @Column({ name: 'country_id', type: 'uuid', nullable: true })
  @Index()
  countryId: string;

  // Compliance status
  @Column({ name: 'is_compliant', type: 'boolean', default: true })
  isCompliant: boolean;

  @Column({ name: 'compliance_warnings', type: 'jsonb', nullable: true })
  complianceWarnings: any;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => WeeklyOffPattern, (pattern) => pattern.policy)
  patterns: WeeklyOffPattern[];

  @OneToMany(() => WeeklyOffAssignment, (assignment) => assignment.policy)
  assignments: WeeklyOffAssignment[];

  @OneToMany(() => WeeklyOffAudit, (audit) => audit.policy)
  auditLogs: WeeklyOffAudit[];
}

@Entity('weekly_off_patterns')
@Index(['policyId', 'isActive'])
export class WeeklyOffPattern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'policy_id', type: 'uuid' })
  @Index()
  policyId: string;

  @Column({ name: 'pattern_name', length: 255 })
  patternName: string;

  // For FIXED: Array of day numbers [5, 6] for Sat-Sun
  // For ROTATIONAL: Rotation cycle definition
  @Column({ name: 'off_days', type: 'jsonb' })
  offDays: number[];

  // Working days before off (for rotational)
  @Column({ name: 'working_days_cycle', type: 'int', nullable: true })
  workingDaysCycle: number;

  // Off days in cycle (for rotational)
  @Column({ name: 'off_days_cycle', type: 'int', nullable: true })
  offDaysCycle: number;

  // Start date for rotation cycle
  @Column({ name: 'rotation_start_date', type: 'date', nullable: true })
  rotationStartDate: Date;

  // For compressed work week
  @Column({ name: 'hours_per_day', type: 'decimal', precision: 5, scale: 2, nullable: true })
  hoursPerDay: number;

  @Column({ name: 'days_per_week', type: 'int', nullable: true })
  daysPerWeek: number;

  @Column({ name: 'is_paid', type: 'boolean', default: true })
  isPaid: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => WeeklyOffPolicy, (policy) => policy.patterns)
  @JoinColumn({ name: 'policy_id' })
  policy: WeeklyOffPolicy;
}

@Entity('weekly_off_assignments')
@Index(['tenantId', 'entityType', 'entityId', 'isActive'])
@Index(['policyId', 'effectiveFrom', 'effectiveTo'])
export class WeeklyOffAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'policy_id', type: 'uuid' })
  @Index()
  policyId: string;

  // Entity type: EMPLOYEE, DEPARTMENT, LOCATION, SHIFT, etc.
  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  @Index()
  entityId: string;

  @Column({ name: 'effective_from', type: 'date' })
  @Index()
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  @Index()
  effectiveTo: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  // Override flag for explicit employee assignments
  @Column({ name: 'is_override', type: 'boolean', default: false })
  isOverride: boolean;

  @Column({ name: 'override_reason', type: 'text', nullable: true })
  overrideReason: string;

  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ name: 'approval_status', length: 50, nullable: true })
  approvalStatus: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => WeeklyOffPolicy, (policy) => policy.assignments)
  @JoinColumn({ name: 'policy_id' })
  policy: WeeklyOffPolicy;
}

@Entity('weekly_off_audit_logs')
@Index(['tenantId', 'policyId', 'actionDate'])
export class WeeklyOffAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'policy_id', type: 'uuid', nullable: true })
  @Index()
  policyId: string;

  @Column({ name: 'assignment_id', type: 'uuid', nullable: true })
  @Index()
  assignmentId: string;

  @Column({ name: 'action_type', length: 100 })
  @Index()
  actionType: string;

  @Column({ name: 'action_by', type: 'uuid' })
  actionBy: string;

  @Column({ name: 'action_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  actionDate: Date;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: any;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: any;

  @Column({ name: 'affected_employees', type: 'jsonb', nullable: true })
  affectedEmployees: any;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => WeeklyOffPolicy, (policy) => policy.auditLogs)
  @JoinColumn({ name: 'policy_id' })
  policy: WeeklyOffPolicy;
}
