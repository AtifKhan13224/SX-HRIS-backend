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
 * EMPLOYEE ID NUMBERING & IDENTITY MANAGEMENT
 * Enterprise-grade dual-identity architecture with token-based ID generation
 * Supports multi-level hierarchy, effective dating, and distributed collision-proof generation
 */

export enum PolicyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum PolicyLevel {
  GLOBAL = 'GLOBAL', // Default for entire tenant
  COUNTRY = 'COUNTRY', // Country-specific override
  LEGAL_ENTITY = 'LEGAL_ENTITY', // Company/legal entity level
  BUSINESS_UNIT = 'BUSINESS_UNIT', // Department/division level
  EMPLOYMENT_TYPE = 'EMPLOYMENT_TYPE', // Full-time, contract, intern, etc.
}

export enum SequenceResetFrequency {
  NEVER = 'NEVER',
  YEARLY = 'YEARLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

export enum IDGenerationTrigger {
  ON_HIRING = 'ON_HIRING',
  ON_APPROVAL = 'ON_APPROVAL',
  ON_ONBOARDING = 'ON_ONBOARDING',
  ON_FIRST_DAY = 'ON_FIRST_DAY',
  MANUAL = 'MANUAL',
}

export enum IDReservationStatus {
  RESERVED = 'RESERVED',
  ISSUED = 'ISSUED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  RELEASED = 'RELEASED',
}

export enum RehireIDStrategy {
  RETAIN_ORIGINAL = 'RETAIN_ORIGINAL', // Keep old ID
  GENERATE_NEW = 'GENERATE_NEW', // New ID with suffix
  SUFFIX_INCREMENTAL = 'SUFFIX_INCREMENTAL', // OLD_ID-R1, OLD_ID-R2
  SEQUENCE_CONTINUATION = 'SEQUENCE_CONTINUATION', // Continue global sequence
}

export enum EmployeeIDType {
  MASTER = 'MASTER', // Permanent employee ID
  TEMPORARY = 'TEMPORARY', // Onboarding stage ID
  CANDIDATE = 'CANDIDATE', // Recruitment/Applicant ID
}

export enum IDTransitionTrigger {
  ONBOARDING_COMPLETE = 'ONBOARDING_COMPLETE',
  FIRST_DAY = 'FIRST_DAY',
  PROBATION_START = 'PROBATION_START',
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  MANUAL = 'MANUAL',
}

/**
 * EMPLOYEE ID POLICY
 * Core configuration for ID generation patterns and rules
 */
@Entity('employee_id_policy')
@Index(['tenant_id', 'policy_level', 'level_value'])
@Unique(['tenant_id', 'policy_code'])
export class EmployeeIDPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'varchar', length: 50 })
  policy_code: string; // GLOBAL_001, UAE_EMP, ACME_STAFF

  @Column({ type: 'varchar', length: 200 })
  policy_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PolicyLevel,
    default: PolicyLevel.GLOBAL,
  })
  @Index()
  policy_level: PolicyLevel;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  level_value: string; // Country code, legal_entity_id, business_unit_id, employment_type

  @Column({ type: 'int', default: 0 })
  priority: number; // Higher priority overrides lower

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.DRAFT,
  })
  @Index()
  status: PolicyStatus;

  // ===== ID PATTERN CONFIGURATION =====
  @Column({ type: 'varchar', length: 500 })
  id_pattern: string; // {COUNTRY}-{YEAR}-{SEQUENCE:5} or {COMPANY}-{TYPE}-{MMYY}-{SEQ:6}

  @Column({ type: 'varchar', length: 20, nullable: true })
  prefix: string; // Static prefix (EMP, STF, CTR)

  @Column({ type: 'varchar', length: 20, nullable: true })
  suffix: string; // Static suffix

  @Column({ type: 'int', default: 1 })
  min_length: number; // Minimum total ID length

  @Column({ type: 'int', default: 20 })
  max_length: number; // Maximum total ID length

  @Column({ type: 'boolean', default: false })
  allow_alphabets: boolean;

  @Column({ type: 'boolean', default: true })
  allow_numbers: boolean;

  @Column({ type: 'boolean', default: true })
  allow_hyphens: boolean;

  @Column({ type: 'boolean', default: false })
  allow_underscores: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  validation_regex: string; // Custom regex for validation

  @Column({ type: 'varchar', length: 500, nullable: true })
  example_ids: string; // EMP-2026-00001, ACME-FT-0126-000001

  // ===== SEQUENCE CONFIGURATION =====
  @Column({ type: 'bigint', default: 1 })
  sequence_start: number; // Starting number

  @Column({ type: 'bigint', nullable: true })
  sequence_end: number; // Max number (for finite sequences)

  @Column({ type: 'int', default: 1 })
  sequence_increment: number; // Increment by (usually 1)

  @Column({ type: 'int', default: 5 })
  sequence_padding: number; // Zero padding (00001, 000001)

  @Column({
    type: 'enum',
    enum: SequenceResetFrequency,
    default: SequenceResetFrequency.NEVER,
  })
  sequence_reset_frequency: SequenceResetFrequency;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sequence_reset_on: string; // YYYY-MM-DD or 'YEAR_START', 'QUARTER_START'

  @Column({ type: 'boolean', default: false })
  use_global_sequence: boolean; // Share sequence across policies

  @Column({ type: 'varchar', length: 100, nullable: true })
  sequence_scope: string; // TENANT, COUNTRY, LEGAL_ENTITY, BUSINESS_UNIT

  // ===== AVAILABLE TOKENS =====
  @Column({ type: 'jsonb', nullable: true })
  available_tokens: {
    token: string; // COUNTRY, YEAR, MONTH, SEQUENCE, TYPE, etc.
    description: string;
    example: string;
    required: boolean;
  }[];

  // ===== ID GENERATION RULES =====
  @Column({
    type: 'enum',
    enum: IDGenerationTrigger,
    default: IDGenerationTrigger.ON_HIRING,
  })
  generation_trigger: IDGenerationTrigger;

  @Column({ type: 'boolean', default: false })
  auto_generate: boolean; // Automatic generation vs manual assignment

  @Column({ type: 'boolean', default: true })
  allow_manual_override: boolean; // HR can manually set ID

  @Column({ type: 'boolean', default: false })
  require_approval: boolean; // ID assignment needs approval

  @Column({ type: 'varchar', length: 50, nullable: true })
  approval_role: string; // WHO_CAN_APPROVE: HR_MANAGER, SYSTEM_ADMIN

  @Column({ type: 'boolean', default: true })
  validate_uniqueness: boolean; // Check for duplicates

  @Column({ type: 'boolean', default: false })
  case_sensitive: boolean; // EMP001 vs emp001

  // ===== ID RESERVATION =====
  @Column({ type: 'boolean', default: true })
  allow_reservation: boolean; // Reserve IDs before assignment

  @Column({ type: 'int', default: 24 })
  reservation_expiry_hours: number; // Hours before reservation expires

  @Column({ type: 'int', default: 10 })
  pre_reserve_count: number; // Number of IDs to pre-reserve

  @Column({ type: 'boolean', default: false })
  allow_bulk_reservation: boolean; // Reserve multiple IDs at once

  // ===== REHIRE & TRANSFER HANDLING =====
  @Column({
    type: 'enum',
    enum: RehireIDStrategy,
    default: RehireIDStrategy.GENERATE_NEW,
  })
  rehire_id_strategy: RehireIDStrategy;

  @Column({ type: 'boolean', default: false })
  retain_id_on_internal_transfer: boolean; // Keep ID when moving BU/departments

  @Column({ type: 'boolean', default: false })
  retain_id_on_legal_entity_transfer: boolean; // Keep ID when moving companies

  @Column({ type: 'boolean', default: false })
  retain_id_on_employment_type_change: boolean; // Contractor to FTE

  @Column({ type: 'varchar', length: 20, nullable: true })
  rehire_suffix_pattern: string; // -R{N}, _REHIRE_{N}

  // ===== ID TYPE & LIFECYCLE MANAGEMENT =====
  @Column({
    type: 'enum',
    enum: EmployeeIDType,
    default: EmployeeIDType.MASTER,
  })
  id_type: EmployeeIDType; // MASTER, TEMPORARY, CANDIDATE

  @Column({ type: 'boolean', default: false })
  is_temporary: boolean; // If true, ID is temporary and will transition

  @Column({ type: 'uuid', nullable: true })
  master_policy_id: string; // Reference to master policy for transition

  @Column({
    type: 'enum',
    enum: IDTransitionTrigger,
    nullable: true,
  })
  transition_trigger: IDTransitionTrigger; // When to transition from temp to master

  @Column({ type: 'boolean', default: false })
  auto_transition: boolean; // Auto-transition when trigger met

  @Column({ type: 'boolean', default: true })
  retain_temporary_in_history: boolean; // Keep temp ID in history

  @Column({ type: 'varchar', length: 50, nullable: true })
  temporary_id_prefix: string; // TEMP-, TMP-, ONBOARD-

  @Column({ type: 'varchar', length: 50, nullable: true })
  candidate_id_prefix: string; // CAND-, APP-, REC-

  @Column({ type: 'int', default: 90 })
  temporary_id_validity_days: number; // Days before temp ID expires

  @Column({ type: 'int', default: 180 })
  candidate_id_validity_days: number; // Days before candidate ID expires

  @Column({ type: 'boolean', default: true })
  notify_on_transition: boolean; // Notify when ID transitions

  @Column({ type: 'jsonb', nullable: true })
  transition_rules: {
    require_approval?: boolean;
    approval_role?: string;
    pre_conditions?: string[];
    post_actions?: string[];
  };

  // ===== COUNTRY COMPLIANCE =====
  @Column({ type: 'varchar', length: 3, nullable: true })
  @Index()
  country_code: string; // ISO 3166-1 alpha-3

  @Column({ type: 'jsonb', nullable: true })
  country_rules: {
    requires_national_id_mapping: boolean; // Map to govt ID
    requires_labor_card_mapping: boolean; // UAE/GCC
    requires_social_security_mapping: boolean; // SSN, NIN, etc.
    max_id_length: number;
    min_id_length: number;
    character_restrictions: string[];
    mandatory_tokens: string[];
  };

  // ===== IMMUTABILITY & CORRECTION =====
  @Column({ type: 'boolean', default: true })
  is_immutable: boolean; // ID cannot be changed once issued

  @Column({ type: 'boolean', default: false })
  allow_correction: boolean; // Allow correction within grace period

  @Column({ type: 'int', default: 48 })
  correction_grace_period_hours: number; // Hours to allow correction

  @Column({ type: 'boolean', default: true })
  require_correction_approval: boolean;

  @Column({ type: 'jsonb', nullable: true })
  correction_workflow: {
    approval_levels: string[];
    notification_emails: string[];
    reason_mandatory: boolean;
  };

  // ===== COLLISION PREVENTION =====
  @Column({ type: 'boolean', default: true })
  use_distributed_lock: boolean; // Redis/DB lock for sequence generation

  @Column({ type: 'varchar', length: 100, nullable: true })
  lock_key_pattern: string; // tenant:{tenant_id}:policy:{policy_id}:seq

  @Column({ type: 'int', default: 5000 })
  lock_timeout_ms: number; // Lock timeout in milliseconds

  @Column({ type: 'int', default: 3 })
  max_retry_attempts: number; // Retries on collision

  // ===== EFFECTIVE DATING & VERSIONING =====
  @Column({ type: 'date' })
  effective_from: Date;

  @Column({ type: 'date', nullable: true })
  effective_to: Date;

  @Column({ type: 'boolean', default: true })
  is_current_version: boolean;

  @Column({ type: 'uuid', nullable: true })
  previous_version_id: string;

  @Column({ type: 'int', default: 1 })
  version_number: number;

  // ===== CUSTOM FIELDS =====
  @Column({ type: 'jsonb', nullable: true })
  custom_fields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  integration_mapping: {
    external_system: string;
    id_field_name: string;
    sync_enabled: boolean;
  }[];

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
  @OneToMany(() => EmployeeIDSequence, (sequence) => sequence.policy)
  sequences: EmployeeIDSequence[];

  @OneToMany(() => EmployeeIDReservation, (reservation) => reservation.policy)
  reservations: EmployeeIDReservation[];

  @OneToMany(() => EmployeeIDAssignment, (assignment) => assignment.policy)
  assignments: EmployeeIDAssignment[];

  @OneToMany(() => EmployeeIDAuditLog, (audit) => audit.policy)
  audit_logs: EmployeeIDAuditLog[];
}

/**
 * EMPLOYEE ID SEQUENCE
 * Manages sequence counters with concurrency control
 */
@Entity('employee_id_sequence')
@Index(['tenant_id', 'policy_id', 'scope_key'])
@Unique(['tenant_id', 'policy_id', 'scope_key'])
export class EmployeeIDSequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'uuid' })
  @Index()
  policy_id: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  scope_key: string; // GLOBAL, UAE, ACME_UAE, BU_SALES, etc.

  @Column({ type: 'bigint', default: 1 })
  current_value: number; // Current sequence number

  @Column({ type: 'bigint', default: 1 })
  last_issued_value: number; // Last successfully issued number

  @Column({ type: 'bigint', default: 0 })
  reserved_count: number; // Number of reserved IDs

  @Column({ type: 'bigint', default: 0 })
  issued_count: number; // Total IDs issued

  @Column({ type: 'timestamp', nullable: true })
  last_reset_at: Date; // When sequence was last reset

  @Column({ type: 'varchar', length: 7, nullable: true })
  reset_period: string; // YYYY-MM for monthly, YYYY-Q1 for quarterly

  @Column({ type: 'boolean', default: false })
  is_exhausted: boolean; // Sequence reached max value

  @Column({ type: 'timestamp', nullable: true })
  exhausted_at: Date;

  // ===== CONCURRENCY CONTROL =====
  @Column({ type: 'uuid', nullable: true })
  locked_by: string; // Session/transaction ID holding lock

  @Column({ type: 'timestamp', nullable: true })
  locked_at: Date;

  @Column({ type: 'int', default: 0 })
  lock_version: number; // Optimistic locking version

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ===== RELATIONSHIPS =====
  @ManyToOne(() => EmployeeIDPolicy, (policy) => policy.sequences)
  @JoinColumn({ name: 'policy_id' })
  policy: EmployeeIDPolicy;
}

/**
 * EMPLOYEE ID RESERVATION
 * Pre-reserved IDs with expiry tracking
 */
@Entity('employee_id_reservation')
@Index(['tenant_id', 'policy_id', 'status'])
@Index(['reserved_for', 'status'])
@Index(['expires_at'])
export class EmployeeIDReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'uuid' })
  @Index()
  policy_id: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  reserved_id: string; // The actual employee ID reserved

  @Column({
    type: 'enum',
    enum: IDReservationStatus,
    default: IDReservationStatus.RESERVED,
  })
  @Index()
  status: IDReservationStatus;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  reserved_for: string; // Employee UUID (pre-hire candidate, etc.)

  @Column({ type: 'varchar', length: 200, nullable: true })
  reserved_for_context: string; // Candidate name, requisition ID, etc.

  @Column({ type: 'uuid' })
  reserved_by: string; // User who reserved

  @Column({ type: 'timestamp' })
  reserved_at: Date;

  @Column({ type: 'timestamp' })
  @Index()
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  issued_at: Date; // When ID was actually assigned

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cancellation_reason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ===== RELATIONSHIPS =====
  @ManyToOne(() => EmployeeIDPolicy, (policy) => policy.reservations)
  @JoinColumn({ name: 'policy_id' })
  policy: EmployeeIDPolicy;
}

/**
 * EMPLOYEE ID ASSIGNMENT
 * Historical record of ID assignments (immutable)
 */
@Entity('employee_id_assignment')
@Index(['tenant_id', 'employee_id'])
@Index(['employee_number'])
@Unique(['tenant_id', 'employee_number'])
export class EmployeeIDAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'uuid' })
  @Index()
  employee_id: string; // System UUID (immutable primary key)

  @Column({ type: 'varchar', length: 50 })
  @Index()
  employee_number: string; // Human-readable ID (e.g., EMP-2026-00001)

  @Column({ type: 'uuid' })
  @Index()
  policy_id: string; // Which policy generated this ID

  @Column({ type: 'varchar', length: 500, nullable: true })
  generation_context: string; // Pattern used, tokens resolved, etc.

  @Column({ type: 'date' })
  assigned_date: Date; // When ID was assigned

  @Column({ type: 'date' })
  effective_from: Date; // When ID became effective

  @Column({ type: 'date', nullable: true })
  effective_to: Date; // When ID stopped being effective (rehire, termination)

  @Column({ type: 'boolean', default: true })
  is_current: boolean; // Current active ID for this employee

  @Column({ type: 'boolean', default: false })
  is_primary: boolean; // Primary ID if employee has multiple

  @Column({ type: 'varchar', length: 50, nullable: true })
  assignment_type: string; // INITIAL, REHIRE, TRANSFER, CORRECTION, MANUAL

  @Column({ type: 'uuid', nullable: true })
  previous_assignment_id: string; // Link to previous ID (for rehires)

  @Column({ type: 'int', default: 1 })
  assignment_sequence: number; // 1st assignment, 2nd (rehire), etc.

  // ===== APPROVAL & ISSUANCE =====
  @Column({ type: 'uuid' })
  assigned_by: string; // User who assigned the ID

  @Column({ type: 'timestamp' })
  assigned_at: Date;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  approval_comments: string;

  // ===== CORRECTION TRACKING =====
  @Column({ type: 'boolean', default: false })
  is_corrected: boolean; // This ID was corrected

  @Column({ type: 'uuid', nullable: true })
  corrected_to_assignment_id: string; // Link to corrected ID

  @Column({ type: 'timestamp', nullable: true })
  corrected_at: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  correction_reason: string;

  // ===== ID TYPE & LIFECYCLE =====
  @Column({
    type: 'enum',
    enum: EmployeeIDType,
    default: EmployeeIDType.MASTER,
  })
  id_type: EmployeeIDType; // MASTER, TEMPORARY, CANDIDATE

  @Column({ type: 'boolean', default: false })
  is_temporary: boolean; // True for temporary/candidate IDs

  @Column({ type: 'date', nullable: true })
  temporary_expires_at: Date; // Expiry date for temp/candidate IDs

  @Column({ type: 'uuid', nullable: true })
  transitioned_from_id: string; // Link to temp/candidate ID that became this master ID

  @Column({ type: 'uuid', nullable: true })
  transitioned_to_id: string; // Link to master ID (if this is temp/candidate)

  @Column({ type: 'timestamp', nullable: true })
  transitioned_at: Date; // When transition occurred

  @Column({
    type: 'enum',
    enum: IDTransitionTrigger,
    nullable: true,
  })
  transition_trigger_used: IDTransitionTrigger; // What triggered the transition

  @Column({ type: 'varchar', length: 500, nullable: true })
  transition_notes: string; // Additional transition context

  // ===== METADATA =====
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    country_code?: string;
    legal_entity_id?: string;
    business_unit_id?: string;
    employment_type?: string;
    department?: string;
    location?: string;
    hire_date?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  external_system_ids: {
    system_name: string;
    external_id: string;
    synced_at: Date;
  }[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ===== RELATIONSHIPS =====
  @ManyToOne(() => EmployeeIDPolicy, (policy) => policy.assignments)
  @JoinColumn({ name: 'policy_id' })
  policy: EmployeeIDPolicy;
}

/**
 * EMPLOYEE ID AUDIT LOG
 * Complete audit trail for compliance
 */
@Entity('employee_id_audit_log')
@Index(['tenant_id', 'employee_id', 'created_at'])
@Index(['action'])
export class EmployeeIDAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  policy_id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  employee_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employee_number: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  action: string; // POLICY_CREATE, ID_GENERATE, ID_RESERVE, ID_ASSIGN, ID_CORRECT, ID_CANCEL, SEQUENCE_RESET

  @Column({ type: 'jsonb', nullable: true })
  changes: {
    field: string;
    old_value: any;
    new_value: any;
  }[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  user_agent: string;

  @Column({ type: 'uuid' })
  performed_by: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  performed_by_name: string;

  @CreateDateColumn()
  created_at: Date;

  // ===== RELATIONSHIPS =====
  @ManyToOne(() => EmployeeIDPolicy, (policy) => policy.audit_logs, { nullable: true })
  @JoinColumn({ name: 'policy_id' })
  policy: EmployeeIDPolicy;
}

/**
 * TOKEN DEFINITION
 * Available tokens for ID pattern construction
 */
@Entity('employee_id_token')
@Index(['token_code'])
export class EmployeeIDToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  token_code: string; // COUNTRY, YEAR, MONTH, SEQUENCE, TYPE, COMPANY, etc.

  @Column({ type: 'varchar', length: 200 })
  token_name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  category: string; // DATE, GEOGRAPHY, ORGANIZATION, SEQUENCE, STATIC

  @Column({ type: 'varchar', length: 500 })
  resolution_logic: string; // How to resolve this token

  @Column({ type: 'varchar', length: 100 })
  example_output: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_system_token: boolean; // Cannot be deleted

  @Column({ type: 'int', nullable: true })
  min_length: number;

  @Column({ type: 'int', nullable: true })
  max_length: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  format_options: string; // UPPERCASE, LOWERCASE, NUMERIC_ONLY, etc.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
