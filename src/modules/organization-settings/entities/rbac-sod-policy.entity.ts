import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ViolationSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ViolationAction {
  WARN = 'WARN',
  BLOCK = 'BLOCK',
  REQUIRE_APPROVAL = 'REQUIRE_APPROVAL',
  LOG_ONLY = 'LOG_ONLY',
}

/**
 * Segregation of Duties (SoD) Policy Entity
 * Defines rules to prevent conflicting role and permission assignments
 */
@Entity('rbac_sod_policies')
@Index(['policyCode'], { unique: true })
@Index(['isActive'])
@Index(['severity'])
export class RBACSODPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Policy Identification
  @Column({ type: 'varchar', length: 100, unique: true })
  policyCode: string;

  @Column({ type: 'varchar', length: 255 })
  policyName: string;

  @Column({ type: 'text' })
  policyDescription: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Conflict Definition
  @Column({ type: 'simple-array' })
  conflictingRoles: string[]; // Role codes that cannot coexist

  @Column({ type: 'simple-array', nullable: true })
  conflictingPermissions: string[]; // Permission codes that conflict

  @Column({ type: 'varchar', length: 50 })
  conflictType: string; // ROLE_ROLE, ROLE_PERMISSION, PERMISSION_PERMISSION

  // Severity & Action
  @Column({
    type: 'enum',
    enum: ViolationSeverity,
    default: ViolationSeverity.MEDIUM,
  })
  severity: ViolationSeverity;

  @Column({
    type: 'enum',
    enum: ViolationAction,
    default: ViolationAction.WARN,
  })
  violationAction: ViolationAction;

  // Business Context
  @Column({ type: 'text' })
  businessRationale: string; // Why this conflict exists

  @Column({ type: 'text', nullable: true })
  riskDescription: string; // What risk it mitigates

  @Column({ type: 'text', nullable: true })
  exampleScenario: string;

  // Compliance
  @Column({ type: 'simple-array', nullable: true })
  complianceFrameworks: string[]; // e.g., ['SOX', 'GDPR']

  @Column({ type: 'simple-array', nullable: true })
  regulatoryReferences: string[]; // Reference to regulations

  // Conditions & Exceptions
  @Column({ type: 'simple-json', nullable: true })
  conditions: {
    scope?: string[]; // Where the policy applies
    exceptions?: string[]; // Exception scenarios
    timeConstraints?: Record<string, any>;
    organizationConstraints?: Record<string, any>;
  };

  @Column({ type: 'boolean', default: false })
  allowExceptions: boolean;

  @Column({ type: 'simple-array', nullable: true })
  exceptionApprovers: string[]; // Who can approve exceptions

  // Detection & Enforcement
  @Column({ type: 'boolean', default: true })
  checkOnRoleAssignment: boolean;

  @Column({ type: 'boolean', default: true })
  checkOnPermissionChange: boolean;

  @Column({ type: 'boolean', default: false })
  performPeriodicScan: boolean;

  @Column({ type: 'integer', nullable: true })
  scanIntervalHours: number;

  // Remediation
  @Column({ type: 'text', nullable: true })
  remediationSteps: string; // How to fix the violation

  @Column({ type: 'text', nullable: true })
  alternativeApproach: string;

  @Column({ type: 'boolean', default: false })
  autoRemediate: boolean;

  @Column({ type: 'simple-json', nullable: true })
  remediationConfig: Record<string, any>;

  // Notification & Alerting
  @Column({ type: 'boolean', default: true })
  sendAlertOnViolation: boolean;

  @Column({ type: 'simple-array', nullable: true })
  alertRecipients: string[]; // User IDs or roles to notify

  @Column({ type: 'varchar', length: 50, nullable: true })
  alertSeverity: string;

  // Metadata
  @Column({ type: 'uuid', nullable: true })
  tenantId: string; // null = global policy

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  @Column({ type: 'simple-json', nullable: true })
  customAttributes: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Audit Fields
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date;

  @Column({ type: 'integer', default: 0 })
  violationCount: number; // Total violations detected

  @Column({ type: 'timestamp', nullable: true })
  lastViolationAt: Date;
}
