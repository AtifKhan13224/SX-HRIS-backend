import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ColumnVisibility {
  VISIBLE = 'VISIBLE',
  MASKED = 'MASKED',
  AGGREGATED_ONLY = 'AGGREGATED_ONLY',
  REDACTED = 'REDACTED',
}

export enum MaskingType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  HASH = 'HASH',
  REDACTED = 'REDACTED',
  AGGREGATED_ONLY = 'AGGREGATED_ONLY',
  TOKENIZED = 'TOKENIZED',
}

export enum DataClassification {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  PII = 'PII',
  FINANCIAL = 'FINANCIAL',
  HEALTH_DATA = 'HEALTH_DATA',
  GOVERNMENT_ID = 'GOVERNMENT_ID',
}

@Entity('report_column_security')
@Index(['tenantId', 'reportId', 'columnName', 'roleId'], { unique: true })
@Index(['tenantId', 'dataClassification'])
@Index(['isPii'])
export class ReportColumnSecurity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'report_id', type: 'uuid' })
  @Index()
  reportId: string;

  @Column({ name: 'column_name', length: 200 })
  columnName: string;

  @Column({ name: 'column_display_name', length: 200 })
  columnDisplayName: string;

  @Column({ name: 'role_id', type: 'uuid' })
  @Index()
  roleId: string;

  @Column({
    name: 'visibility',
    type: 'enum',
    enum: ColumnVisibility,
    default: ColumnVisibility.VISIBLE,
  })
  visibility: ColumnVisibility;

  @Column({
    name: 'masking_type',
    type: 'enum',
    enum: MaskingType,
    nullable: true,
  })
  maskingType: MaskingType;

  @Column({ name: 'masking_pattern', type: 'text', nullable: true })
  maskingPattern: string;

  // Data classification
  @Column({
    name: 'data_classification',
    type: 'enum',
    enum: DataClassification,
    default: DataClassification.INTERNAL,
  })
  dataClassification: DataClassification;

  @Column({ name: 'is_pii', type: 'boolean', default: false })
  isPii: boolean;

  @Column({ name: 'is_financial', type: 'boolean', default: false })
  isFinancial: boolean;

  @Column({ name: 'is_health_data', type: 'boolean', default: false })
  isHealthData: boolean;

  @Column({ name: 'is_government_id', type: 'boolean', default: false })
  isGovernmentId: boolean;

  // Aggregation rules
  @Column({ name: 'allow_aggregation', type: 'boolean', default: true })
  allowAggregation: boolean;

  @Column({ name: 'allowed_aggregations', type: 'simple-array', nullable: true })
  allowedAggregations: string[]; // SUM, AVG, COUNT, MIN, MAX, etc.

  @Column({ name: 'min_aggregation_count', type: 'integer', nullable: true })
  minAggregationCount: number;

  // Geographic restrictions
  @Column({ name: 'restricted_countries', type: 'simple-array', nullable: true })
  restrictedCountries: string[];

  @Column({ name: 'allowed_countries', type: 'simple-array', nullable: true })
  allowedCountries: string[];

  // Encryption
  @Column({ name: 'requires_encryption', type: 'boolean', default: false })
  requiresEncryption: boolean;

  @Column({ name: 'encryption_algorithm', length: 50, nullable: true })
  encryptionAlgorithm: string;

  // Audit
  @Column({ name: 'log_all_access', type: 'boolean', default: false })
  logAllAccess: boolean;

  @Column({ name: 'alert_on_access', type: 'boolean', default: false })
  alertOnAccess: boolean;

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
