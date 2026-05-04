import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ExportFormat {
  EXCEL = 'EXCEL',
  PDF = 'PDF',
  CSV = 'CSV',
  JSON = 'JSON',
  XML = 'XML',
}

@Entity('report_permissions')
@Index(['tenantId', 'reportId', 'roleId'], { unique: true })
@Index(['tenantId', 'isActive'])
@Index(['validFrom', 'validUntil'])
export class ReportPermission {
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

  // Six-level permission model
  @Column({ name: 'can_view', type: 'boolean', default: false })
  canView: boolean;

  @Column({ name: 'can_run', type: 'boolean', default: false })
  canRun: boolean;

  @Column({ name: 'can_export', type: 'boolean', default: false })
  canExport: boolean;

  @Column({ name: 'can_schedule', type: 'boolean', default: false })
  canSchedule: boolean;

  @Column({ name: 'can_share', type: 'boolean', default: false })
  canShare: boolean;

  @Column({ name: 'can_api_extract', type: 'boolean', default: false })
  canApiExtract: boolean;

  // Export restrictions
  @Column({
    name: 'export_formats',
    type: 'simple-array',
    nullable: true,
  })
  exportFormats: ExportFormat[];

  @Column({ name: 'max_export_rows', type: 'integer', nullable: true })
  maxExportRows: number;

  // Approval requirements
  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ name: 'requires_dual_approval', type: 'boolean', default: false })
  requiresDualApproval: boolean;

  @Column({ name: 'approver_role_id', type: 'uuid', nullable: true })
  approverRoleId: string;

  @Column({ name: 'secondary_approver_role_id', type: 'uuid', nullable: true })
  secondaryApproverRoleId: string;

  // Time-bound access
  @Column({ name: 'valid_from', type: 'timestamp', nullable: true })
  validFrom: Date;

  @Column({ name: 'valid_until', type: 'timestamp', nullable: true })
  validUntil: Date;

  // Additional controls
  @Column({ name: 'requires_justification', type: 'boolean', default: false })
  requiresJustification: boolean;

  @Column({ name: 'max_concurrent_users', type: 'integer', nullable: true })
  maxConcurrentUsers: number;

  @Column({ name: 'rate_limit_per_hour', type: 'integer', nullable: true })
  rateLimitPerHour: number;

  @Column({ name: 'ip_whitelist', type: 'simple-array', nullable: true })
  ipWhitelist: string[];

  @Column({ name: 'allowed_time_ranges', type: 'jsonb', nullable: true })
  allowedTimeRanges: Record<string, any>[];

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
