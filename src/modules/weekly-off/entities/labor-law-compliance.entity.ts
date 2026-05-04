import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

export enum ComplianceRuleType {
  MINIMUM_REST_DAYS = 'MINIMUM_REST_DAYS',
  MAXIMUM_CONSECUTIVE_DAYS = 'MAXIMUM_CONSECUTIVE_DAYS',
  MINIMUM_REST_HOURS = 'MINIMUM_REST_HOURS',
  PAID_WEEKLY_OFF = 'PAID_WEEKLY_OFF',
  WEEKLY_OFF_COMPENSATION = 'WEEKLY_OFF_COMPENSATION',
  OVERTIME_MULTIPLIER = 'OVERTIME_MULTIPLIER',
}

export enum ValidationSeverity {
  BLOCKING = 'BLOCKING',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

@Entity('country_labor_laws')
@Index(['countryCode', 'effectiveFrom', 'isActive'])
@Index(['tenantId', 'countryId'])
export class CountryLaborLaw {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  @Index()
  tenantId: string;

  @Column({ name: 'country_id', type: 'uuid' })
  @Index()
  countryId: string;

  @Column({ name: 'country_code', length: 3 })
  @Index()
  countryCode: string;

  @Column({ name: 'country_name', length: 255 })
  countryName: string;

  @Column({ name: 'law_version', length: 50 })
  lawVersion: string;

  @Column({ name: 'effective_from', type: 'date' })
  @Index()
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  @Index()
  effectiveTo: Date;

  // Minimum rest days per week
  @Column({ name: 'minimum_rest_days_per_week', type: 'int', default: 1 })
  minimumRestDaysPerWeek: number;

  // Maximum consecutive working days allowed
  @Column({ name: 'maximum_consecutive_working_days', type: 'int', default: 6 })
  maximumConsecutiveWorkingDays: number;

  // Minimum rest hours between shifts
  @Column({ name: 'minimum_rest_hours', type: 'decimal', precision: 5, scale: 2, default: 11 })
  minimumRestHours: number;

  // Standard working hours per week
  @Column({ name: 'standard_working_hours_per_week', type: 'decimal', precision: 5, scale: 2, default: 40 })
  standardWorkingHoursPerWeek: number;

  // Maximum working hours per week
  @Column({ name: 'maximum_working_hours_per_week', type: 'decimal', precision: 5, scale: 2, default: 48 })
  maximumWorkingHoursPerWeek: number;

  // Is weekly off paid by default
  @Column({ name: 'is_weekly_off_paid', type: 'boolean', default: true })
  isWeeklyOffPaid: boolean;

  // Mandatory weekly off days (JSON array of day numbers)
  @Column({ name: 'mandatory_weekly_off_days', type: 'jsonb', nullable: true })
  mandatoryWeeklyOffDays: number[];

  // OT multiplier for working on weekly off
  @Column({ name: 'weekly_off_ot_multiplier', type: 'decimal', precision: 5, scale: 2, default: 2.0 })
  weeklyOffOtMultiplier: number;

  // Requires compensatory off if worked on weekly off
  @Column({ name: 'requires_comp_off', type: 'boolean', default: false })
  requiresCompOff: boolean;

  // Additional compliance rules in JSON
  @Column({ name: 'additional_rules', type: 'jsonb', nullable: true })
  additionalRules: any;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'source_reference', type: 'text', nullable: true })
  sourceReference: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => LaborLawComplianceRule, (rule) => rule.laborLaw)
  complianceRules: LaborLawComplianceRule[];
}

@Entity('labor_law_compliance_rules')
@Index(['laborLawId', 'ruleType', 'isActive'])
export class LaborLawComplianceRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'labor_law_id', type: 'uuid' })
  @Index()
  laborLawId: string;

  @Column({ name: 'rule_code', length: 100, unique: true })
  @Index()
  ruleCode: string;

  @Column({ name: 'rule_name', length: 255 })
  ruleName: string;

  @Column({
    name: 'rule_type',
    type: 'enum',
    enum: ComplianceRuleType,
  })
  @Index()
  ruleType: ComplianceRuleType;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Rule definition in JSON (flexible for different rule types)
  @Column({ name: 'rule_definition', type: 'jsonb' })
  ruleDefinition: any;

  @Column({
    type: 'enum',
    enum: ValidationSeverity,
    default: ValidationSeverity.WARNING,
  })
  severity: ValidationSeverity;

  @Column({ name: 'error_message', type: 'text' })
  errorMessage: string;

  // Priority for rule execution (lower = higher priority)
  @Column({ type: 'int', default: 100 })
  priority: number;

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

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  laborLaw: CountryLaborLaw;
}

@Entity('compliance_validation_logs')
@Index(['tenantId', 'validationDate'])
@Index(['policyId', 'validationStatus'])
export class ComplianceValidationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'policy_id', type: 'uuid' })
  @Index()
  policyId: string;

  @Column({ name: 'assignment_id', type: 'uuid', nullable: true })
  assignmentId: string;

  @Column({ name: 'employee_id', type: 'uuid', nullable: true })
  employeeId: string;

  @Column({ name: 'country_id', type: 'uuid' })
  countryId: string;

  @Column({ name: 'validation_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  validationDate: Date;

  @Column({ name: 'validation_status', length: 50 })
  @Index()
  validationStatus: string;

  @Column({ name: 'rules_executed', type: 'jsonb' })
  rulesExecuted: any;

  @Column({ name: 'violations_found', type: 'jsonb', nullable: true })
  violationsFound: any;

  @Column({ name: 'warnings', type: 'jsonb', nullable: true })
  warnings: any;

  @Column({ name: 'validation_context', type: 'jsonb', nullable: true })
  validationContext: any;

  @Column({ name: 'validated_by', type: 'uuid', nullable: true })
  validatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
