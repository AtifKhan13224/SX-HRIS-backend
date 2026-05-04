import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditEventType {
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REVOKED = 'ROLE_REVOKED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ACCESS_ATTEMPT = 'ACCESS_ATTEMPT',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_EXPORT = 'DATA_EXPORT',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  SOD_VIOLATION = 'SOD_VIOLATION',
  SOD_EXCEPTION_GRANTED = 'SOD_EXCEPTION_GRANTED',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  BREAK_GLASS_ACTIVATED = 'BREAK_GLASS_ACTIVATED',
  SCOPE_VIOLATION = 'SCOPE_VIOLATION',
  FIELD_ACCESSED = 'FIELD_ACCESSED',
  COMPLIANCE_EVENT = 'COMPLIANCE_EVENT'
}

export enum AuditSeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

@Entity('rbac_audit_logs')
@Index(['tenantId', 'eventType', 'createdAt'])
@Index(['userId', 'eventType', 'createdAt'])
@Index(['eventType', 'severity', 'createdAt'])
@Index(['complianceRelevant', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: true })
  @Index()
  tenantId: string;

  @Column({ length: 100 })
  @Index()
  userId: string;

  @Column({ length: 255, nullable: true })
  userName: string;

  @Column({
    type: 'enum',
    enum: AuditEventType
  })
  @Index()
  eventType: AuditEventType;

  @Column({
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.INFO
  })
  severity: AuditSeverity;

  @Column({ type: 'text' })
  eventDescription: string;

  @Column({ type: 'uuid', nullable: true })
  roleId: string;

  @Column({ length: 100, nullable: true })
  roleCode: string;

  @Column({ type: 'uuid', nullable: true })
  permissionId: string;

  @Column({ length: 150, nullable: true })
  permissionCode: string;

  @Column({ length: 100, nullable: true })
  entityType: string;

  @Column({ length: 100, nullable: true })
  entityId: string;

  @Column({ length: 100, nullable: true })
  fieldName: string;

  @Column({ type: 'text', nullable: true })
  oldValue: string;

  @Column({ type: 'text', nullable: true })
  newValue: string;

  @Column({ length: 100, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ length: 100, nullable: true })
  sessionId: string;

  @Column({ type: 'text', nullable: true })
  requestUrl: string;

  @Column({ length: 20, nullable: true })
  httpMethod: string;

  @Column({ type: 'int', nullable: true })
  httpStatusCode: number;

  @Column({ default: false })
  @Index()
  complianceRelevant: boolean;

  @Column({ type: 'simple-array', nullable: true })
  complianceFrameworks: string[];

  @Column({ default: false })
  isAnomaly: boolean;

  @Column({ type: 'float', nullable: true })
  riskScore: number;

  @Column({ type: 'jsonb', nullable: true })
  contextData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ length: 100, nullable: true })
  geolocation: string;

  @Column({ default: false })
  requiresReview: boolean;

  @Column({ length: 100, nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
