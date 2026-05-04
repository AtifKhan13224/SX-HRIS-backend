import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  VersionColumn,
} from 'typeorm';
import { RBACRolePermission } from './rbac-role-permission.entity';
import { RBACRoleAuditLog } from './rbac-role-audit-log.entity';
import { RoleCategory, DataScopeLevel } from './rbac.enums';

@Entity('rbac_standard_roles')
@Index(['roleCode'], { unique: true })
@Index(['tenantId', 'isActive'])
@Index(['roleCategory'])
@Index(['isSystemOwned'])
export class RBACStandardRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Core Role Identification
  @Column({ type: 'varchar', length: 100, unique: true })
  roleCode: string;

  @Column({ type: 'varchar', length: 255 })
  roleName: string;

  @Column({ type: 'text', nullable: true })
  roleDescription: string;

  @Column({
    type: 'enum',
    enum: RoleCategory,
  })
  roleCategory: RoleCategory;

  // System & Tenant Control
  @Column({ type: 'boolean', default: true })
  isSystemOwned: boolean; // Cannot be deleted if true

  @Column({ type: 'uuid', nullable: true })
  tenantId: string; // null = global system role

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  // Security & Governance
  @Column({ type: 'boolean', default: false })
  isModifiable: boolean; // Can permissions be changed?

  @Column({ type: 'boolean', default: false })
  requiresDualApproval: boolean; // Changes need 2 approvers

  @Column({ type: 'boolean', default: false })
  requiresChangeJustification: boolean;

  @Column({ type: 'boolean', default: true })
  hasRollbackCapability: boolean;

  @Column({ type: 'boolean', default: false })
  isEmergencyAccessRole: boolean; // Break-glass role

  @Column({ type: 'integer', default: 1 })
  roleVersion: number;

  @VersionColumn()
  entityVersion: number; // Optimistic locking

  // Data Access Scope
  @Column({
    type: 'enum',
    enum: DataScopeLevel,
    default: DataScopeLevel.OWN_DATA_ONLY,
  })
  defaultDataScope: DataScopeLevel;

  @Column({ type: 'simple-array', nullable: true })
  allowedCountries: string[]; // ISO country codes

  @Column({ type: 'simple-array', nullable: true })
  restrictedCountries: string[]; // Blocked countries

  // Sensitive Data Controls
  @Column({ type: 'boolean', default: false })
  canAccessSensitiveData: boolean;

  @Column({ type: 'boolean', default: false })
  canExportData: boolean;

  @Column({ type: 'boolean', default: false })
  canDownloadReports: boolean;

  @Column({ type: 'boolean', default: false })
  canApproveTransactions: boolean;

  @Column({ type: 'simple-json', nullable: true })
  maskedFields: string[]; // Fields to mask (e.g., ['ssn', 'salary'])

  // Field-Level Security
  @Column({ type: 'simple-json', nullable: true })
  hiddenFields: string[]; // Completely hidden fields

  @Column({ type: 'simple-json', nullable: true })
  readOnlyFields: string[]; // Visible but not editable

  @Column({ type: 'simple-json', nullable: true })
  editableFields: string[]; // Fully editable fields

  // Module Integration Flags
  @Column({ type: 'boolean', default: true })
  honorsInCoreHR: boolean;

  @Column({ type: 'boolean', default: true })
  honorsInPayroll: boolean;

  @Column({ type: 'boolean', default: true })
  honorsInLeave: boolean;

  @Column({ type: 'boolean', default: true })
  honorsInRecruitment: boolean;

  @Column({ type: 'boolean', default: true })
  honorsInReports: boolean;

  @Column({ type: 'boolean', default: false })
  honorsInAPIs: boolean;

  // Compliance & Regulatory
  @Column({ type: 'simple-array', nullable: true })
  complianceTags: string[]; // e.g., ['GDPR', 'SOX', 'HIPAA']

  @Column({ type: 'boolean', default: false })
  isGDPRCompliant: boolean;

  @Column({ type: 'boolean', default: false })
  isSOXCompliant: boolean;

  @Column({ type: 'boolean', default: false })
  isAuditableRole: boolean;

  // Segregation of Duties (SoD)
  @Column({ type: 'simple-json', nullable: true })
  conflictingRoles: string[]; // Role codes that conflict with this role

  @Column({ type: 'simple-json', nullable: true })
  requiredRoles: string[]; // Prerequisite roles

  @Column({ type: 'simple-json', nullable: true })
  mutuallyExclusiveWith: string[]; // Cannot be assigned together

  // Time-Based Controls
  @Column({ type: 'timestamp', nullable: true })
  effectiveFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  effectiveTo: Date;

  @Column({ type: 'integer', nullable: true })
  maxAssignmentDurationDays: number; // Auto-expire after X days

  // Metadata & Custom Attributes
  @Column({ type: 'simple-json', nullable: true })
  customAttributes: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  businessRules: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  securityNotes: string;

  @Column({ type: 'text', nullable: true })
  usageGuidelines: string;

  // Relationships
  @OneToMany(() => RBACRolePermission, (permission) => permission.role, {
    cascade: true,
  })
  permissions: RBACRolePermission[];

  @OneToMany(() => RBACRoleAuditLog, (audit) => audit.role)
  auditLogs: RBACRoleAuditLog[];

  // Audit Fields
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approvalStatus: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  lastChangeReason: string;
}
