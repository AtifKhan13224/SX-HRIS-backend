import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum SnapshotType {
  STATUTORY_REPORT = 'STATUTORY_REPORT',
  AUDIT_EXTRACT = 'AUDIT_EXTRACT',
  UNION_REPORT = 'UNION_REPORT',
  REGULATORY_FILING = 'REGULATORY_FILING',
  M_AND_A_DATA_ROOM = 'M_AND_A_DATA_ROOM',
  LITIGATION_HOLD = 'LITIGATION_HOLD',
  GOVERNMENT_REQUEST = 'GOVERNMENT_REQUEST',
  COMPLIANCE_REVIEW = 'COMPLIANCE_REVIEW',
}

export enum SnapshotStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  FINALIZED = 'FINALIZED',
  SEALED = 'SEALED',
  EXPIRED = 'EXPIRED',
}

@Entity('report_compliance_snapshots')
@Index(['tenantId', 'reportId', 'snapshotType'])
@Index(['status'])
@Index(['sealedAt'])
export class ReportComplianceSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'report_id', type: 'uuid' })
  @Index()
  reportId: string;

  @Column({ name: 'snapshot_code', length: 100, unique: true })
  @Index()
  snapshotCode: string;

  @Column({ name: 'snapshot_name', length: 300 })
  snapshotName: string;

  @Column({
    name: 'snapshot_type',
    type: 'enum',
    enum: SnapshotType,
  })
  snapshotType: SnapshotType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SnapshotStatus,
    default: SnapshotStatus.DRAFT,
  })
  status: SnapshotStatus;

  // Data integrity
  @Column({ name: 'data_hash', type: 'text' })
  dataHash: string; // SHA-256 hash of the data

  @Column({ name: 'is_immutable', type: 'boolean', default: false })
  isImmutable: boolean;

  @Column({ name: 'tamper_detected', type: 'boolean', default: false })
  tamperDetected: boolean;

  @Column({ name: 'last_integrity_check', type: 'timestamp', nullable: true })
  lastIntegrityCheck: Date;

  // Data storage
  @Column({ name: 'data_location', type: 'text' })
  dataLocation: string; // S3, Azure Blob, etc.

  @Column({ name: 'data_size_bytes', type: 'bigint' })
  dataSizeBytes: number;

  @Column({ name: 'row_count', type: 'integer' })
  rowCount: number;

  @Column({ name: 'column_count', type: 'integer' })
  columnCount: number;

  @Column({ name: 'data_format', length: 50 })
  dataFormat: string; // PARQUET, AVRO, JSON, etc.

  // Time period
  @Column({ name: 'period_start', type: 'timestamp' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'timestamp' })
  periodEnd: Date;

  @Column({ name: 'as_of_date', type: 'timestamp' })
  asOfDate: Date;

  // Purpose and justification
  @Column({ name: 'purpose', type: 'text' })
  purpose: string;

  @Column({ name: 'regulatory_requirement', type: 'text', nullable: true })
  regulatoryRequirement: string;

  @Column({ name: 'legal_basis', type: 'text', nullable: true })
  legalBasis: string;

  @Column({ name: 'case_reference', length: 200, nullable: true })
  caseReference: string;

  // Retention
  @Column({ name: 'retention_years', type: 'integer' })
  retentionYears: number;

  @Column({ name: 'retention_expires_at', type: 'timestamp' })
  retentionExpiresAt: Date;

  @Column({ name: 'legal_hold', type: 'boolean', default: false })
  legalHold: boolean;

  @Column({ name: 'legal_hold_reason', type: 'text', nullable: true })
  legalHoldReason: string;

  // Access control
  @Column({ name: 'access_restricted', type: 'boolean', default: true })
  accessRestricted: boolean;

  @Column({ name: 'authorized_users', type: 'simple-array', nullable: true })
  authorizedUsers: string[];

  @Column({ name: 'authorized_roles', type: 'simple-array', nullable: true })
  authorizedRoles: string[];

  @Column({ name: 'requires_approval_to_access', type: 'boolean', default: true })
  requiresApprovalToAccess: boolean;

  // Approval chain
  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments: string;

  // Sealing (making immutable)
  @Column({ name: 'sealed_by', type: 'uuid', nullable: true })
  sealedBy: string;

  @Column({ name: 'sealed_at', type: 'timestamp', nullable: true })
  sealedAt: Date;

  @Column({ name: 'seal_signature', type: 'text', nullable: true })
  sealSignature: string; // Digital signature

  // Audit trail
  @Column({ name: 'access_count', type: 'integer', default: 0 })
  accessCount: number;

  @Column({ name: 'last_accessed_by', type: 'uuid', nullable: true })
  lastAccessedBy: string;

  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt: Date;

  @Column({ name: 'export_count', type: 'integer', default: 0 })
  exportCount: number;

  // External party access (auditors, government, etc.)
  @Column({ name: 'external_access_granted', type: 'boolean', default: false })
  externalAccessGranted: boolean;

  @Column({ name: 'external_party_name', length: 300, nullable: true })
  externalPartyName: string;

  @Column({ name: 'external_party_reference', length: 200, nullable: true })
  externalPartyReference: string;

  @Column({ name: 'external_access_expires', type: 'timestamp', nullable: true })
  externalAccessExpires: Date;

  // Compliance
  @Column({ name: 'compliance_framework', type: 'simple-array', nullable: true })
  complianceFramework: string[]; // GDPR, SOX, ISO27001, etc.

  @Column({ name: 'regulatory_body', length: 300, nullable: true })
  regulatoryBody: string;

  @Column({ name: 'submission_deadline', type: 'timestamp', nullable: true })
  submissionDeadline: Date;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ name: 'submission_confirmation', length: 500, nullable: true })
  submissionConfirmation: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
