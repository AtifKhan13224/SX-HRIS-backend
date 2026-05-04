import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ReportType {
  ATTENDANCE = 'attendance',
  LEAVE = 'leave',
  PAYROLL = 'payroll',
  PERFORMANCE = 'performance',
  EMPLOYEE = 'employee',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('reports')
@Index(['reportType', 'status'])
@Index(['generatedBy', 'createdAt'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'report_name' })
  reportName: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  reportType: ReportType;

  @Column({
    type: 'enum',
    enum: ReportFormat,
    default: ReportFormat.PDF,
  })
  format: ReportFormat;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any>;

  @Column({ nullable: true, name: 'file_path' })
  filePath: string;

  @Column({ nullable: true, name: 'file_url' })
  fileUrl: string;

  @Column({ type: 'bigint', nullable: true, name: 'file_size' })
  fileSize: number;

  @Column({ name: 'generated_by' })
  generatedBy: string;

  @Column({ name: 'generated_at', type: 'timestamp', nullable: true })
  generatedAt: Date;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage: string;

  @Column({ name: 'is_scheduled', default: false })
  isScheduled: boolean;

  @Column({ nullable: true, name: 'schedule_config', type: 'jsonb' })
  scheduleConfig: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('report_templates')
export class ReportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_name' })
  templateName: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  reportType: ReportType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true, name: 'default_filters' })
  defaultFilters: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'default_columns' })
  defaultColumns: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'chart_config' })
  chartConfig: Record<string, any>;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
