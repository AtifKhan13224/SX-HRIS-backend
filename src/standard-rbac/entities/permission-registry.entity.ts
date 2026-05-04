import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { FieldLevelSecurity } from './field-level-security.entity';

export enum PermissionModule {
  CORE_HR = 'CORE_HR',
  PAYROLL = 'PAYROLL',
  LEAVE = 'LEAVE',
  RECRUITMENT = 'RECRUITMENT',
  PERFORMANCE = 'PERFORMANCE',
  ATTENDANCE = 'ATTENDANCE',
  LIFECYCLE = 'LIFECYCLE',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
  ANALYTICS = 'ANALYTICS',
  API = 'API',
  COMPLIANCE = 'COMPLIANCE'
}

export enum PermissionAction {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  OVERRIDE = 'OVERRIDE',
  EXPORT = 'EXPORT',
  MASS_UPDATE = 'MASS_UPDATE',
  IMPORT = 'IMPORT',
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE',
  AUDIT = 'AUDIT',
  CONFIGURE = 'CONFIGURE'
}

export enum PermissionTag {
  SENSITIVE = 'SENSITIVE',
  FINANCIAL = 'FINANCIAL',
  PII = 'PII',
  COMPLIANCE = 'COMPLIANCE',
  EXECUTIVE = 'EXECUTIVE',
  RESTRICTED = 'RESTRICTED',
  REGULATORY = 'REGULATORY',
  CONFIDENTIAL = 'CONFIDENTIAL'
}

@Entity('permission_registry')
@Index(['permissionCode'], { unique: true })
@Index(['module', 'subModule', 'isActive'])
@Index(['requiresSoD', 'isActive'])
export class PermissionRegistry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150, unique: true })
  @Index()
  permissionCode: string;

  @Column({ length: 255 })
  permissionName: string;

  @Column({ type: 'text', nullable: true })
  permissionDescription: string;

  @Column({
    type: 'enum',
    enum: PermissionModule
  })
  @Index()
  module: PermissionModule;

  @Column({ length: 100, nullable: true })
  subModule: string;

  @Column({ length: 100, nullable: true })
  feature: string;

  @Column({
    type: 'enum',
    enum: PermissionAction
  })
  action: PermissionAction;

  @Column({ type: 'simple-array', nullable: true })
  permissionTags: string[];

  @Column({ default: false })
  isSensitive: boolean;

  @Column({ default: false })
  isFinancial: boolean;

  @Column({ default: false })
  isPII: boolean;

  @Column({ default: false })
  requiresCompliance: boolean;

  @Column({ default: false })
  requiresSoD: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  riskScore: number;

  @Column({ type: 'jsonb', nullable: true })
  dependencies: string[];

  @Column({ type: 'jsonb', nullable: true })
  exclusions: string[];

  @Column({ type: 'jsonb', nullable: true })
  prerequisites: string[];

  @Column({ default: false })
  requiresDataScope: boolean;

  @Column({ default: false })
  requiresFieldSecurity: boolean;

  @Column({ default: false })
  allowDelegation: boolean;

  @Column({ default: 0 })
  maxDelegationLevel: number;

  @Column({ type: 'jsonb', nullable: true })
  apiEndpoints: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  complianceMapping: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100 })
  createdBy: string;

  @OneToMany(() => FieldLevelSecurity, fls => fls.permission)
  fieldSecurityRules: FieldLevelSecurity[];
}
