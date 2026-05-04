import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SensitivityType {
  PII = 'PII',
  FINANCIAL = 'FINANCIAL',
  HEALTH = 'HEALTH',
  GOVERNMENT_ID = 'GOVERNMENT_ID',
  LEGAL = 'LEGAL',
  UNION = 'UNION',
  DISCIPLINARY = 'DISCIPLINARY',
  SECURITY_CLEARANCE = 'SECURITY_CLEARANCE',
}

export enum ComplianceFramework {
  GDPR = 'GDPR',
  SOX = 'SOX',
  ISO27001 = 'ISO27001',
  HIPAA = 'HIPAA',
  PCI_DSS = 'PCI_DSS',
  CCPA = 'CCPA',
  LOCAL_LABOR_LAW = 'LOCAL_LABOR_LAW',
  CUSTOM = 'CUSTOM',
}

@Entity('report_sensitivity_flags')
@Index(['tenantId', 'reportId'])
@Index(['sensitivityType'])
@Index(['complianceFramework'])
export class ReportSensitivityFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'report_id', type: 'uuid' })
  @Index()
  reportId: string;

  @Column({
    name: 'sensitivity_type',
    type: 'enum',
    enum: SensitivityType,
  })
  sensitivityType: SensitivityType;

  @Column({
    name: 'compliance_framework',
    type: 'enum',
    enum: ComplianceFramework,
  })
  complianceFramework: ComplianceFramework;

  @Column({ name: 'flag_description', type: 'text' })
  flagDescription: string;

  @Column({ name: 'regulatory_reference', type: 'text', nullable: true })
  regulatoryReference: string; // e.g., "GDPR Article 9", "SOX Section 404"

  // Data categories
  @Column({ name: 'data_categories', type: 'simple-array' })
  dataCategories: string[]; // e.g., ["salary", "bonus", "bank_account"]

  @Column({ name: 'affected_columns', type: 'simple-array', nullable: true })
  affectedColumns: string[];

  // Compliance requirements
  @Column({ name: 'requires_consent', type: 'boolean', default: false })
  requiresConsent: boolean;

  @Column({ name: 'requires_dpo_review', type: 'boolean', default: false })
  requiresDpoReview: boolean; // Data Protection Officer

  @Column({ name: 'requires_legal_review', type: 'boolean', default: false })
  requiresLegalReview: boolean;

  @Column({ name: 'requires_ethics_review', type: 'boolean', default: false })
  requiresEthicsReview: boolean;

  // Retention policies
  @Column({ name: 'retention_period_days', type: 'integer', nullable: true })
  retentionPeriodDays: number;

  @Column({ name: 'auto_delete_after_retention', type: 'boolean', default: false })
  autoDeleteAfterRetention: boolean;

  @Column({ name: 'legal_hold_exempt', type: 'boolean', default: false })
  legalHoldExempt: boolean;

  // Access restrictions
  @Column({ name: 'requires_special_clearance', type: 'boolean', default: false })
  requiresSpecialClearance: boolean;

  @Column({ name: 'clearance_level', length: 50, nullable: true })
  clearanceLevel: string;

  @Column({ name: 'restricted_jurisdictions', type: 'simple-array', nullable: true })
  restrictedJurisdictions: string[];

  @Column({ name: 'allowed_jurisdictions', type: 'simple-array', nullable: true })
  allowedJurisdictions: string[];

  // Notifications
  @Column({ name: 'notify_on_access', type: 'boolean', default: false })
  notifyOnAccess: boolean;

  @Column({ name: 'notification_recipients', type: 'simple-array', nullable: true })
  notificationRecipients: string[];

  @Column({ name: 'escalation_threshold', type: 'integer', nullable: true })
  escalationThreshold: number;

  // Cross-border transfer
  @Column({ name: 'allow_cross_border_transfer', type: 'boolean', default: false })
  allowCrossBorderTransfer: boolean;

  @Column({ name: 'approved_transfer_countries', type: 'simple-array', nullable: true })
  approvedTransferCountries: string[];

  @Column({ name: 'requires_transfer_agreement', type: 'boolean', default: false })
  requiresTransferAgreement: boolean;

  // Breach notification
  @Column({ name: 'breach_notification_required', type: 'boolean', default: false })
  breachNotificationRequired: boolean;

  @Column({ name: 'breach_notification_deadline_hours', type: 'integer', nullable: true })
  breachNotificationDeadlineHours: number;

  @Column({ name: 'breach_authorities', type: 'simple-array', nullable: true })
  breachAuthorities: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
