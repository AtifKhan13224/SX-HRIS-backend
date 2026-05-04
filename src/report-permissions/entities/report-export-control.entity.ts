import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('report_export_controls')
@Index(['tenantId', 'reportId', 'roleId'], { unique: true })
@Index(['tenantId', 'isActive'])
export class ReportExportControl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'report_id', type: 'uuid' })
  @Index()
  reportId: string;

  @Column({ name: 'role_id', type: 'uuid' })
  @Index()
  roleId: string;

  // Row limits
  @Column({ name: 'max_row_limit', type: 'integer', nullable: true })
  maxRowLimit: number;

  @Column({ name: 'warn_at_row_count', type: 'integer', nullable: true })
  warnAtRowCount: number;

  // Format restrictions
  @Column({ name: 'allowed_formats', type: 'simple-array' })
  allowedFormats: string[]; // EXCEL, PDF, CSV, JSON, XML

  @Column({ name: 'default_format', length: 20, nullable: true })
  defaultFormat: string;

  // File protection
  @Column({ name: 'watermarking_required', type: 'boolean', default: false })
  watermarkingRequired: boolean;

  @Column({ name: 'watermark_template', type: 'text', nullable: true })
  watermarkTemplate: string;

  @Column({ name: 'password_protection', type: 'boolean', default: false })
  passwordProtection: boolean;

  @Column({ name: 'password_complexity', type: 'jsonb', nullable: true })
  passwordComplexity: Record<string, any>;

  // File expiry
  @Column({ name: 'file_expiry_hours', type: 'integer', nullable: true })
  fileExpiryHours: number;

  @Column({ name: 'auto_delete_after_download', type: 'boolean', default: false })
  autoDeleteAfterDownload: boolean;

  @Column({ name: 'max_download_count', type: 'integer', nullable: true })
  maxDownloadCount: number;

  // Tracking and monitoring
  @Column({ name: 'download_tracking', type: 'boolean', default: true })
  downloadTracking: boolean;

  @Column({ name: 'prevent_screenshot', type: 'boolean', default: false })
  preventScreenshot: boolean;

  @Column({ name: 'alert_on_export', type: 'boolean', default: false })
  alertOnExport: boolean;

  @Column({ name: 'alert_recipients', type: 'simple-array', nullable: true })
  alertRecipients: string[];

  // Justification
  @Column({ name: 'requires_justification', type: 'boolean', default: false })
  requiresJustification: boolean;

  @Column({ name: 'justification_min_length', type: 'integer', nullable: true })
  justificationMinLength: number;

  @Column({ name: 'requires_manager_approval', type: 'boolean', default: false })
  requiresManagerApproval: boolean;

  // Rate limiting
  @Column({ name: 'max_exports_per_day', type: 'integer', nullable: true })
  maxExportsPerDay: number;

  @Column({ name: 'max_exports_per_week', type: 'integer', nullable: true })
  maxExportsPerWeek: number;

  @Column({ name: 'max_exports_per_month', type: 'integer', nullable: true })
  maxExportsPerMonth: number;

  // Data retention
  @Column({ name: 'export_retention_days', type: 'integer', nullable: true })
  exportRetentionDays: number;

  @Column({ name: 'archive_exports', type: 'boolean', default: true })
  archiveExports: boolean;

  // DLP (Data Loss Prevention)
  @Column({ name: 'block_external_email', type: 'boolean', default: false })
  blockExternalEmail: boolean;

  @Column({ name: 'block_cloud_storage', type: 'boolean', default: false })
  blockCloudStorage: boolean;

  @Column({ name: 'block_removable_media', type: 'boolean', default: false })
  blockRemovableMedia: boolean;

  @Column({ name: 'allowed_destinations', type: 'simple-array', nullable: true })
  allowedDestinations: string[];

  // Encryption
  @Column({ name: 'require_encryption', type: 'boolean', default: false })
  requireEncryption: boolean;

  @Column({ name: 'encryption_standard', length: 50, nullable: true })
  encryptionStandard: string; // AES-256, RSA-2048, etc.

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

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
