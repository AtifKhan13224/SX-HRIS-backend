import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { SystemRolePermission } from './system-role-permission.entity';
import { SystemRoleVersion } from './system-role-version.entity';

export enum SensitivityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RoleCategory {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  HR_ADMIN = 'HR_ADMIN',
  PAYROLL_ADMIN = 'PAYROLL_ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE_SELF_SERVICE = 'EMPLOYEE_SELF_SERVICE',
  AUDITOR = 'AUDITOR',
  RECRUITER = 'RECRUITER',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER'
}

@Entity('system_roles')
@Index(['roleCode'], { unique: true })
@Index(['tenantId', 'isActive'])
@Index(['sensitivityLevel', 'tenantId'])
@Index(['privilegedRole', 'tenantId'])
export class SystemRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  @Index()
  roleCode: string;

  @Column({ length: 255 })
  roleName: string;

  @Column({ type: 'text', nullable: true })
  roleDescription: string;

  @Column({
    type: 'enum',
    enum: RoleCategory
  })
  @Index()
  roleCategory: RoleCategory;

  @Column({
    type: 'enum',
    enum: SensitivityLevel,
    default: SensitivityLevel.LOW
  })
  sensitivityLevel: SensitivityLevel;

  @Column({ default: false })
  @Index()
  privilegedRole: boolean;

  @Column({ default: false })
  breakGlassRole: boolean;

  @Column({ default: true })
  systemLocked: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo: Date;

  @Column({ length: 100, nullable: true })
  @Index()
  tenantId: string;

  @Column({ default: false })
  multiTenantEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  allowedTenantIds: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  complianceTags: string[];

  @Column({ type: 'jsonb', nullable: true })
  regulatoryMapping: Record<string, any>; // GDPR, SOX, etc.

  @Column({ default: false })
  requiresDualApproval: boolean;

  @Column({ default: false })
  requiresJustification: boolean;

  @Column({ default: 0 })
  maxAssignments: number;

  @Column({ type: 'int', default: 0 })
  currentAssignments: number;

  @Column({ length: 255, nullable: true })
  parentRoleCode: string;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ default: true })
  allowCustomization: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customizationConstraints: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastModifiedAt: Date;

  @Column({ length: 100, nullable: true })
  lastModifiedBy: string;

  @Column({ type: 'text', nullable: true })
  modificationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100 })
  createdBy: string;

  @OneToMany(() => SystemRolePermission, permission => permission.systemRole)
  permissions: SystemRolePermission[];

  @OneToMany(() => SystemRoleVersion, version => version.systemRole)
  versions: SystemRoleVersion[];
}
