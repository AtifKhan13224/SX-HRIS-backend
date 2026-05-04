import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ReportType {
  STANDARD = 'STANDARD',
  CUSTOM = 'CUSTOM',
  REGULATORY = 'REGULATORY',
  AD_HOC = 'AD_HOC'
}

export enum ModuleSource {
  CORE_HR = 'CORE_HR',
  PAYROLL = 'PAYROLL',
  LEAVE = 'LEAVE',
  RECRUITMENT = 'RECRUITMENT',
  PERFORMANCE = 'PERFORMANCE',
  FINANCE = 'FINANCE',
  COMPLIANCE = 'COMPLIANCE',
  EXECUTIVE = 'EXECUTIVE'
}

export enum SensitivityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  RESTRICTED = 'RESTRICTED'
}

@Entity('report_registry')
@Index(['reportCode', 'tenantId'], { unique: true })
@Index(['tenantId', 'moduleSource', 'isActive'])
@Index(['sensitivityLevel', 'tenantId'])
export class ReportRegistry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  reportCode: string;

  @Column({ length: 255 })
  reportName: string;

  @Column({
    type: 'enum',
    enum: ReportType
  })
  reportType: ReportType;

  @Column({
    type: 'enum',
    enum: ModuleSource
  })
  moduleSource: ModuleSource;

  @Column({
    type: 'enum',
    enum: SensitivityLevel
  })
  sensitivityLevel: SensitivityLevel;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 100 })
  @Index()
  tenantId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100 })
  createdBy: string;
}
