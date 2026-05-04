import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  VIEW = 'VIEW',
  RUN = 'RUN',
  EXPORT = 'EXPORT',
  SCHEDULE = 'SCHEDULE',
  SHARE = 'SHARE',
  API_EXTRACT = 'API_EXTRACT',
  MODIFY = 'MODIFY',
  DELETE = 'DELETE',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  APPROVAL_REQUESTED = 'APPROVAL_REQUESTED',
  APPROVAL_GRANTED = 'APPROVAL_GRANTED',
  APPROVAL_REJECTED = 'APPROVAL_REJECTED',
}

export enum AuditResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  DENIED = 'DENIED',
  ERROR = 'ERROR',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('report_audit_logs')
@Index(['tenantId', 'reportId', 'userId'])
@Index(['action', 'result'])
@Index(['timestamp'])
@Index(['riskLevel'])
export class ReportAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'report_id', type: 'uuid' })
  @Index()
  reportId: string;

  @Column({ name: 'report_name', length: 200 })
  reportName: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'user_email', length: 200 })
  userEmail: string;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string;

  @Column({ name: 'action', type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ name: 'result', type: 'enum', enum: AuditResult })
  result: AuditResult;

  @Column({ name: 'risk_level', type: 'enum', enum: RiskLevel, default: RiskLevel.LOW })
  riskLevel: RiskLevel;

  // Request details
  @Column({ name: 'ip_address', length: 50 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'session_id', length: 200, nullable: true })
  sessionId: string;

  @Column({ name: 'request_id', length: 200, nullable: true })
  requestId: string;

  // Export details
  @Column({ name: 'export_format', length: 20, nullable: true })
  exportFormat: string;

  @Column({ name: 'export_row_count', type: 'integer', nullable: true })
  exportRowCount: number;

  @Column({ name: 'export_file_size', type: 'bigint', nullable: true })
  exportFileSize: number;

  @Column({ name: 'export_filename', length: 500, nullable: true })
  exportFilename: string;

  // Query details
  @Column({ name: 'filters_applied', type: 'jsonb', nullable: true })
  filtersApplied: Record<string, any>;

  @Column({ name: 'data_scopes_enforced', type: 'jsonb', nullable: true })
  dataScopesEnforced: Record<string, any>[];

  @Column({ name: 'columns_accessed', type: 'simple-array', nullable: true })
  columnsAccessed: string[];

  @Column({ name: 'masked_columns', type: 'simple-array', nullable: true })
  maskedColumns: string[];

  @Column({ name: 'execution_time_ms', type: 'integer', nullable: true })
  executionTimeMs: number;

  @Column({ name: 'result_row_count', type: 'integer', nullable: true })
  resultRowCount: number;

  // Denial details
  @Column({ name: 'denial_reason', type: 'text', nullable: true })
  denialReason: string;

  @Column({ name: 'missing_permissions', type: 'simple-array', nullable: true })
  missingPermissions: string[];

  // Justification
  @Column({ name: 'business_justification', type: 'text', nullable: true })
  businessJustification: string;

  // Anomaly detection
  @Column({ name: 'is_anomaly', type: 'boolean', default: false })
  isAnomaly: boolean;

  @Column({ name: 'anomaly_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  anomalyScore: number;

  @Column({ name: 'anomaly_reasons', type: 'simple-array', nullable: true })
  anomalyReasons: string[];

  @Column({ name: 'is_after_hours', type: 'boolean', default: false })
  isAfterHours: boolean;

  @Column({ name: 'is_unusual_location', type: 'boolean', default: false })
  isUnusualLocation: boolean;

  @Column({ name: 'is_high_frequency', type: 'boolean', default: false })
  isHighFrequency: boolean;

  // Geolocation
  @Column({ name: 'country_code', length: 10, nullable: true })
  countryCode: string;

  @Column({ name: 'region', length: 100, nullable: true })
  region: string;

  @Column({ name: 'city', length: 100, nullable: true })
  city: string;

  // Error details
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'error_stack', type: 'text', nullable: true })
  errorStack: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'timestamp', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
