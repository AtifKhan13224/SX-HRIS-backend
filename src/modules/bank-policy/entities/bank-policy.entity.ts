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
  Unique,
} from 'typeorm';

/**
 * BANK POLICY ENTITY
 * Enterprise-grade bank policy management with country-specific compliance
 * Supports: WPS, SEPA, ACH, regulatory validations, and approval workflows
 */

export enum PolicyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum PaymentMode {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  CASH = 'CASH',
  WALLET = 'WALLET',
  CARD = 'CARD',
  INSTANT_PAY = 'INSTANT_PAY',
}

export enum DisbursementMethod {
  SINGLE_PAYMENT = 'SINGLE_PAYMENT', // All in one transaction
  SPLIT_PAYMENT = 'SPLIT_PAYMENT', // Split across multiple accounts
  STAGED_PAYMENT = 'STAGED_PAYMENT', // Phased disbursement
}

export enum BankChangeFrequency {
  NO_RESTRICTION = 'NO_RESTRICTION',
  ONCE_PER_MONTH = 'ONCE_PER_MONTH',
  ONCE_PER_QUARTER = 'ONCE_PER_QUARTER',
  ONCE_PER_YEAR = 'ONCE_PER_YEAR',
  REQUIRES_APPROVAL = 'REQUIRES_APPROVAL',
}

export enum FailedPaymentAction {
  RETRY_AUTO = 'RETRY_AUTO',
  RETRY_MANUAL = 'RETRY_MANUAL',
  HOLD_FOR_REVIEW = 'HOLD_FOR_REVIEW',
  ALTERNATIVE_METHOD = 'ALTERNATIVE_METHOD',
  CANCEL_PAYMENT = 'CANCEL_PAYMENT',
}

export enum ApprovalLevel {
  NONE = 'NONE',
  MANAGER = 'MANAGER',
  HR = 'HR',
  FINANCE = 'FINANCE',
  MULTI_LEVEL = 'MULTI_LEVEL',
}

/**
 * BANK POLICY MASTER
 * Core policy configuration with country and company specific rules
 */
@Entity('bank_policy_master')
@Index(['tenant_id', 'country_code', 'legal_entity_id'])
@Unique(['tenant_id', 'policy_code'])
export class BankPolicyMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'varchar', length: 50 })
  policy_code: string; // Unique policy identifier

  @Column({ type: 'varchar', length: 200 })
  policy_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 3 })
  @Index()
  country_code: string; // ISO 3166-1 alpha-3 (UAE, USA, GBR, IND, etc.)

  @Column({ type: 'uuid', nullable: true })
  @Index()
  legal_entity_id: string; // Company/Legal Entity

  @Column({ type: 'uuid', nullable: true })
  payroll_group_id: string; // Linked to payroll group

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.DRAFT,
  })
  @Index()
  status: PolicyStatus;

  // ===== PAYMENT CONFIGURATION =====
  @Column({ type: 'simple-array' })
  allowed_payment_modes: string[]; // PaymentMode enum values

  @Column({ type: 'varchar', length: 50 })
  default_payment_mode: string; // Default PaymentMode

  @Column({
    type: 'enum',
    enum: DisbursementMethod,
    default: DisbursementMethod.SINGLE_PAYMENT,
  })
  disbursement_method: DisbursementMethod;

  @Column({ type: 'boolean', default: true })
  allow_split_salary: boolean; // Allow splitting salary across multiple accounts

  @Column({ type: 'int', default: 2 })
  max_split_accounts: number; // Max accounts for split payment

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100.0 })
  split_total_percentage: number; // Must equal 100%

  // ===== BANK ACCOUNT RULES =====
  @Column({ type: 'int', default: 2 })
  max_bank_accounts_per_employee: number;

  @Column({ type: 'simple-array' })
  allowed_account_types: string[]; // SAVINGS, CURRENT, SALARY

  @Column({ type: 'boolean', default: true })
  require_iban: boolean; // Mandatory for GCC/EU

  @Column({ type: 'boolean', default: false })
  require_swift_code: boolean;

  @Column({ type: 'boolean', default: false })
  require_branch_code: boolean; // For India (IFSC), UK (Sort Code)

  @Column({ type: 'boolean', default: true })
  require_bank_verification: boolean; // Penny drop or document verification

  @Column({ type: 'simple-array' })
  mandatory_fields: string[]; // account_number, account_holder_name, etc.

  // ===== BANK CHANGE POLICY =====
  @Column({
    type: 'enum',
    enum: BankChangeFrequency,
    default: BankChangeFrequency.ONCE_PER_MONTH,
  })
  bank_change_frequency: BankChangeFrequency;

  @Column({ type: 'int', default: 5 })
  bank_change_freeze_days: number; // Days before payroll processing when changes are frozen

  @Column({ type: 'boolean', default: false })
  allow_retroactive_bank_change: boolean; // Allow changes affecting past payroll

  @Column({
    type: 'enum',
    enum: ApprovalLevel,
    default: ApprovalLevel.HR,
  })
  bank_change_approval_level: ApprovalLevel;

  // ===== PAYROLL CUT-OFF & TIMING =====
  @Column({ type: 'int', default: 25 })
  payroll_cutoff_day: number; // Day of month (1-31)

  @Column({ type: 'int', default: 28 })
  salary_credit_day: number; // Target salary credit day

  @Column({ type: 'int', default: 26 })
  bank_file_generation_day: number; // When to generate bank files

  @Column({ type: 'time', nullable: true })
  bank_file_generation_time: string; // HH:MM:SS

  @Column({ type: 'int', default: 2 })
  bank_processing_lead_days: number; // Days needed for bank processing

  @Column({ type: 'boolean', default: false })
  allow_early_salary: boolean; // Advance salary payment

  @Column({ type: 'int', default: 0 })
  early_salary_max_days: number; // Max days before scheduled date

  // ===== WPS (WAGE PROTECTION SYSTEM) CONFIGURATION =====
  @Column({ type: 'boolean', default: false })
  wps_enabled: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  wps_provider: string; // Bank providing WPS (Emirates NBD, National Bank, etc.)

  @Column({ type: 'varchar', length: 50, nullable: true })
  wps_employer_id: string; // Ministry of Labor assigned ID

  @Column({ type: 'varchar', length: 50, nullable: true })
  wps_establishment_id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  wps_routing_code: string;

  @Column({ type: 'boolean', default: false })
  wps_mandatory_validation: boolean; // Block payroll if WPS validation fails

  @Column({ type: 'int', default: 3 })
  wps_submission_deadline_days: number; // Days from month end to submit

  // ===== SEPA (EU) CONFIGURATION =====
  @Column({ type: 'boolean', default: false })
  sepa_enabled: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sepa_creditor_identifier: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sepa_scheme: string; // CORE, B2B, COR1

  @Column({ type: 'varchar', length: 3, nullable: true })
  sepa_currency: string; // EUR

  @Column({ type: 'boolean', default: false })
  sepa_instant_payment: boolean; // SEPA Instant Credit Transfer

  // ===== ACH (US) CONFIGURATION =====
  @Column({ type: 'boolean', default: false })
  ach_enabled: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ach_company_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ach_company_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ach_originator_id: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  ach_batch_type: string; // PPD, CCD

  // ===== FAILED PAYMENT HANDLING =====
  @Column({
    type: 'enum',
    enum: FailedPaymentAction,
    default: FailedPaymentAction.RETRY_AUTO,
  })
  failed_payment_action: FailedPaymentAction;

  @Column({ type: 'int', default: 3 })
  failed_payment_retry_attempts: number;

  @Column({ type: 'int', default: 24 })
  failed_payment_retry_interval_hours: number;

  @Column({ type: 'boolean', default: true })
  notify_employee_on_failure: boolean;

  @Column({ type: 'boolean', default: true })
  notify_hr_on_failure: boolean;

  @Column({ type: 'simple-array', nullable: true })
  alternative_payment_modes: string[]; // Fallback payment methods

  // ===== MULTI-CURRENCY & FX =====
  @Column({ type: 'boolean', default: false })
  multi_currency_enabled: boolean;

  @Column({ type: 'varchar', length: 3 })
  base_currency: string; // USD, AED, GBP, INR, etc.

  @Column({ type: 'simple-array', nullable: true })
  supported_currencies: string[]; // Additional currencies

  @Column({ type: 'varchar', length: 50, nullable: true })
  fx_rate_source: string; // API provider for exchange rates

  @Column({ type: 'boolean', default: false })
  auto_fx_conversion: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  fx_markup_percentage: number; // Bank FX markup

  // ===== REGULATORY & COMPLIANCE =====
  @Column({ type: 'jsonb', nullable: true })
  regulatory_validations: {
    mandatory_checks: string[]; // KYC, AML, etc.
    blocking_validations: string[]; // Stop payroll if these fail
    warning_validations: string[]; // Alert but don't block
  };

  @Column({ type: 'boolean', default: false })
  require_tax_clearance: boolean; // Some countries require tax clearance

  @Column({ type: 'boolean', default: false })
  require_labor_card: boolean; // UAE/GCC specific

  @Column({ type: 'boolean', default: true })
  data_masking_enabled: boolean; // Mask sensitive bank data

  @Column({ type: 'simple-array', nullable: true })
  masked_fields: string[]; // Fields to mask (account_number, iban, etc.)

  // ===== EFFECTIVE DATING & VERSIONING =====
  @Column({ type: 'date' })
  effective_from: Date;

  @Column({ type: 'date', nullable: true })
  effective_to: Date;

  @Column({ type: 'boolean', default: true })
  is_current_version: boolean;

  @Column({ type: 'uuid', nullable: true })
  previous_version_id: string; // Link to previous policy version

  @Column({ type: 'int', default: 1 })
  version_number: number;

  // ===== APPROVAL WORKFLOW =====
  @Column({ type: 'boolean', default: false })
  requires_approval: boolean;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'text', nullable: true })
  approval_comments: string;

  // ===== CUSTOM FIELDS & EXTENSIONS =====
  @Column({ type: 'jsonb', nullable: true })
  custom_fields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  integration_config: {
    payroll_system: string;
    bank_api_endpoint: string;
    webhook_url: string;
    api_credentials: Record<string, any>;
  };

  // ===== AUDIT TRAIL =====
  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'uuid', nullable: true })
  deleted_by: string;

  // ===== RELATIONSHIPS =====
  @OneToMany(() => BankPolicySchedule, (schedule) => schedule.policy)
  schedules: BankPolicySchedule[];

  @OneToMany(() => BankPolicyAuditLog, (audit) => audit.policy)
  audit_logs: BankPolicyAuditLog[];

  @OneToMany(() => BankPolicyException, (exception) => exception.policy)
  exceptions: BankPolicyException[];
}

/**
 * BANK POLICY SCHEDULE
 * Detailed payment processing schedule with country-specific holidays
 */
@Entity('bank_policy_schedule')
@Index(['tenant_id', 'policy_id', 'processing_month'])
export class BankPolicySchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'uuid' })
  @Index()
  policy_id: string;

  @Column({ type: 'varchar', length: 7 })
  @Index()
  processing_month: string; // YYYY-MM

  @Column({ type: 'date' })
  payroll_cutoff_date: Date;

  @Column({ type: 'date' })
  bank_file_generation_date: Date;

  @Column({ type: 'date' })
  bank_file_submission_date: Date;

  @Column({ type: 'date' })
  expected_salary_credit_date: Date;

  @Column({ type: 'date' })
  actual_salary_credit_date: Date; // Updated after processing

  @Column({ type: 'boolean', default: false })
  is_holiday_adjusted: boolean; // If dates shifted due to holidays

  @Column({ type: 'simple-array', nullable: true })
  holiday_dates: string[]; // Public holidays affecting schedule

  @Column({ type: 'varchar', length: 50, default: 'SCHEDULED' })
  status: string; // SCHEDULED, PROCESSING, COMPLETED, FAILED

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ===== RELATIONSHIPS =====
  @ManyToOne(() => BankPolicyMaster, (policy) => policy.schedules)
  @JoinColumn({ name: 'policy_id' })
  policy: BankPolicyMaster;
}

/**
 * BANK POLICY EXCEPTION
 * Employee or group-level policy exceptions
 */
@Entity('bank_policy_exception')
@Index(['tenant_id', 'policy_id', 'employee_id'])
export class BankPolicyException {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'uuid' })
  @Index()
  policy_id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  employee_id: string; // Specific employee exception

  @Column({ type: 'uuid', nullable: true })
  employee_group_id: string; // Group-level exception

  @Column({ type: 'varchar', length: 200 })
  exception_type: string; // EARLY_SALARY, ADDITIONAL_ACCOUNT, BYPASS_VALIDATION

  @Column({ type: 'text' })
  exception_reason: string;

  @Column({ type: 'jsonb' })
  exception_config: {
    overridden_field: string;
    original_value: any;
    exception_value: any;
    conditions?: Record<string, any>;
  };

  @Column({ type: 'date' })
  effective_from: Date;

  @Column({ type: 'date', nullable: true })
  effective_to: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid' })
  approved_by: string;

  @Column({ type: 'timestamp' })
  approved_at: Date;

  @Column({ type: 'uuid' })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ===== RELATIONSHIPS =====
  @ManyToOne(() => BankPolicyMaster, (policy) => policy.exceptions)
  @JoinColumn({ name: 'policy_id' })
  policy: BankPolicyMaster;
}

/**
 * BANK POLICY AUDIT LOG
 * Complete change tracking for compliance
 */
@Entity('bank_policy_audit_log')
@Index(['tenant_id', 'policy_id', 'created_at'])
export class BankPolicyAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'uuid' })
  @Index()
  policy_id: string;

  @Column({ type: 'varchar', length: 50 })
  action: string; // CREATE, UPDATE, DELETE, APPROVE, SUSPEND, ACTIVATE

  @Column({ type: 'jsonb', nullable: true })
  changes: {
    field: string;
    old_value: any;
    new_value: any;
  }[];

  @Column({ type: 'text', nullable: true })
  change_reason: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  user_agent: string;

  @Column({ type: 'uuid' })
  performed_by: string;

  @CreateDateColumn()
  created_at: Date;

  // ===== RELATIONSHIPS =====
  @ManyToOne(() => BankPolicyMaster, (policy) => policy.audit_logs)
  @JoinColumn({ name: 'policy_id' })
  policy: BankPolicyMaster;
}

/**
 * COUNTRY POLICY TEMPLATE
 * Pre-configured policy templates for different countries
 */
@Entity('country_policy_template')
@Index(['country_code', 'template_code'])
@Unique(['country_code', 'template_code'])
export class CountryPolicyTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 3 })
  @Index()
  country_code: string;

  @Column({ type: 'varchar', length: 100 })
  country_name: string;

  @Column({ type: 'varchar', length: 50 })
  template_code: string; // UAE_WPS_STANDARD, USA_ACH_STANDARD, etc.

  @Column({ type: 'varchar', length: 200 })
  template_name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb' })
  default_configuration: Record<string, any>; // Default policy settings

  @Column({ type: 'simple-array' })
  mandatory_fields: string[];

  @Column({ type: 'simple-array' })
  regulatory_requirements: string[];

  @Column({ type: 'jsonb', nullable: true })
  validation_rules: {
    field: string;
    rule: string;
    error_message: string;
  }[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
