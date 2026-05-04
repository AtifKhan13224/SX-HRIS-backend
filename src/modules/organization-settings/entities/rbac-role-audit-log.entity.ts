import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RBACStandardRole } from './rbac-standard-role.entity';

export enum AuditActionType {
  ROLE_CREATED = 'ROLE_CREATED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  ROLE_DELETED = 'ROLE_DELETED',
  ROLE_ACTIVATED = 'ROLE_ACTIVATED',
  ROLE_DEACTIVATED = 'ROLE_DEACTIVATED',
  ROLE_ARCHIVED = 'ROLE_ARCHIVED',
  PERMISSION_ADDED = 'PERMISSION_ADDED',
  PERMISSION_REMOVED = 'PERMISSION_REMOVED',
  PERMISSION_MODIFIED = 'PERMISSION_MODIFIED',
  SCOPE_CHANGED = 'SCOPE_CHANGED',
  APPROVAL_REQUESTED = 'APPROVAL_REQUESTED',
  APPROVAL_GRANTED = 'APPROVAL_GRANTED',
  APPROVAL_DENIED = 'APPROVAL_DENIED',
  ROLLBACK_EXECUTED = 'ROLLBACK_EXECUTED',
  EMERGENCY_ACCESS = 'EMERGENCY_ACCESS',
  SOD_VIOLATION_DETECTED = 'SOD_VIOLATION_DETECTED',
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
}

@Entity('rbac_role_audit_logs')
@Index(['roleId', 'createdAt'])
@Index(['actionType'])
@Index(['performedBy'])
@Index(['tenantId'])
@Index(['complianceRelevant'])
export class RBACRoleAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Audit Context
  @Column({ type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RBACStandardRole, (role) => role.auditLogs)
  @JoinColumn({ name: 'roleId' })
  role: RBACStandardRole;

  @Column({
    type: 'enum',
    enum: AuditActionType,
  })
  actionType: AuditActionType;

  @Column({ type: 'text' })
  actionDescription: string;

  // Actor Information
  @Column({ type: 'uuid', nullable: true })
  performedBy: string; // User ID

  @Column({ type: 'varchar', length: 255, nullable: true })
  performedByName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  performedByEmail: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  performedByRole: string;

  // Change Details
  @Column({ type: 'simple-json', nullable: true })
  changesBefore: Record<string, any>; // State before change

  @Column({ type: 'simple-json', nullable: true })
  changesAfter: Record<string, any>; // State after change

  @Column({ type: 'simple-json', nullable: true })
  changeDiff: Record<string, any>; // Computed difference

  @Column({ type: 'simple-array', nullable: true })
  affectedPermissions: string[]; // Permission IDs affected

  @Column({ type: 'simple-array', nullable: true })
  affectedFields: string[]; // Which fields were changed

  // Context & Environment
  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sessionId: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  geolocation: string;

  // Justification & Approval
  @Column({ type: 'text', nullable: true })
  justification: string; // Why the change was made

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedByName: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approvalStatus: string; // PENDING, APPROVED, REJECTED

  // Compliance & Security
  @Column({ type: 'boolean', default: false })
  complianceRelevant: boolean; // Relevant for compliance audits

  @Column({ type: 'simple-array', nullable: true })
  complianceFlags: string[]; // e.g., ['GDPR', 'SOX']

  @Column({ type: 'boolean', default: false })
  isSecurityEvent: boolean;

  @Column({ type: 'boolean', default: false })
  isSuspiciousActivity: boolean;

  @Column({ type: 'integer', default: 0 })
  riskScore: number; // 0-100

  @Column({ type: 'varchar', length: 50, nullable: true })
  riskLevel: string; // LOW, MEDIUM, HIGH, CRITICAL

  // Versioning & Rollback
  @Column({ type: 'integer', default: 1 })
  roleVersionBefore: number;

  @Column({ type: 'integer', default: 1 })
  roleVersionAfter: number;

  @Column({ type: 'boolean', default: false })
  canRollback: boolean;

  @Column({ type: 'uuid', nullable: true })
  rollbackToSnapshotId: string;

  // Segregation of Duties (SoD)
  @Column({ type: 'boolean', default: false })
  sodViolationDetected: boolean;

  @Column({ type: 'simple-json', nullable: true })
  sodViolationDetails: {
    conflictingRoles?: string[];
    violationType?: string;
    severity?: string;
    recommendation?: string;
  };

  // Data Classification
  @Column({ type: 'boolean', default: false })
  involvesPII: boolean; // Personally Identifiable Information

  @Column({ type: 'boolean', default: false })
  involvesFinancialData: boolean;

  @Column({ type: 'boolean', default: false })
  involvesSensitiveData: boolean;

  // External Audit Support
  @Column({ type: 'varchar', length: 100, nullable: true })
  auditReferenceId: string; // External audit system reference

  @Column({ type: 'boolean', default: false })
  exportedToAuditSystem: boolean;

  @Column({ type: 'timestamp', nullable: true })
  exportedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  regulatoryMetadata: Record<string, any>;

  // Retention & Archival
  @Column({ type: 'integer', default: 2555 })
  retentionDays: number; // How long to keep (default 7 years)

  @Column({ type: 'timestamp', nullable: true })
  archiveAfter: Date;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  // Performance Tracking
  @Column({ type: 'bigint', nullable: true })
  executionTimeMs: number; // How long the action took

  @Column({ type: 'boolean', default: true })
  wasSuccessful: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'simple-json', nullable: true })
  errorDetails: Record<string, any>;

  // Additional Metadata
  @Column({ type: 'simple-json', nullable: true })
  additionalContext: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // Timestamp
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone: string;
}
