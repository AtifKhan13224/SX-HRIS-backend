import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { RBACRolePermission } from './rbac-role-permission.entity';

export enum PermissionAction {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  DOWNLOAD = 'DOWNLOAD',
  PRINT = 'PRINT',
  SHARE = 'SHARE',
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE',
  BULK_UPDATE = 'BULK_UPDATE',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
}

@Entity('rbac_permissions')
@Index(['permissionCode'], { unique: true })
@Index(['module', 'subModule'])
@Index(['isActive'])
export class RBACPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Permission Hierarchy
  @Column({ type: 'varchar', length: 100, unique: true })
  permissionCode: string; // e.g., 'EMPLOYEE_PROFILE_PERSONAL_DATA_VIEW'

  @Column({ type: 'varchar', length: 255 })
  permissionName: string;

  @Column({ type: 'text', nullable: true })
  permissionDescription: string;

  // Hierarchical Structure
  @Column({ type: 'varchar', length: 100 })
  module: string; // e.g., 'EMPLOYEE_MANAGEMENT'

  @Column({ type: 'varchar', length: 100, nullable: true })
  subModule: string; // e.g., 'PROFILE'

  @Column({ type: 'varchar', length: 100, nullable: true })
  feature: string; // e.g., 'PERSONAL_DATA'

  @Column({
    type: 'enum',
    enum: PermissionAction,
  })
  action: PermissionAction;

  // Categorization
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string; // HR, FINANCE, PAYROLL, ADMIN, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  subCategory: string;

  // Security Classification
  @Column({ type: 'boolean', default: false })
  isSystemPermission: boolean; // Core system permission

  @Column({ type: 'boolean', default: false })
  isSensitive: boolean; // Requires extra audit

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean; // Action needs approval workflow

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  riskLevel: number; // 0-10, higher = more risk

  // Data Access Control
  @Column({ type: 'boolean', default: false })
  allowsDataExport: boolean;

  @Column({ type: 'boolean', default: false })
  allowsBulkOperation: boolean;

  @Column({ type: 'boolean', default: false })
  accessesPII: boolean; // Personally Identifiable Information

  @Column({ type: 'boolean', default: false })
  accessesFinancialData: boolean;

  // Field-Level Constraints
  @Column({ type: 'simple-json', nullable: true })
  scopeConstraints: {
    dataScope?: string[]; // Allowed data scopes
    fieldAccess?: string[]; // Specific fields accessible
    excludedFields?: string[]; // Fields not accessible
    conditions?: Record<string, any>; // Dynamic conditions
  };

  // Dependency Management
  @Column({ type: 'simple-array', nullable: true })
  dependsOnPermissions: string[]; // Prerequisite permission codes

  @Column({ type: 'simple-array', nullable: true })
  conflictsWithPermissions: string[]; // Mutually exclusive permissions

  @Column({ type: 'simple-array', nullable: true })
  impliesPermissions: string[]; // Automatically grants these permissions

  // Compliance & Regulatory
  @Column({ type: 'simple-array', nullable: true })
  complianceRequirements: string[]; // e.g., ['GDPR', 'SOX']

  @Column({ type: 'boolean', default: true })
  requiresAuditLog: boolean;

  @Column({ type: 'boolean', default: false })
  requiresMFA: boolean; // Multi-factor authentication

  @Column({ type: 'simple-array', nullable: true })
  allowedCountries: string[]; // Geographic restrictions

  @Column({ type: 'simple-array', nullable: true })
  blockedCountries: string[];

  // Rate Limiting & Throttling
  @Column({ type: 'integer', nullable: true })
  maxOperationsPerHour: number;

  @Column({ type: 'integer', nullable: true })
  maxOperationsPerDay: number;

  @Column({ type: 'integer', nullable: true })
  maxBulkRecords: number; // Max records in bulk operation

  // Time-Based Controls
  @Column({ type: 'simple-json', nullable: true })
  timeRestrictions: {
    allowedHours?: string[]; // e.g., ['09:00-17:00']
    allowedDays?: string[]; // e.g., ['MON', 'TUE', 'WED']
    timezone?: string;
  };

  // UI & Display
  @Column({ type: 'varchar', length: 100, nullable: true })
  displayGroup: string; // For UI grouping

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  iconName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  badgeColor: string;

  // API & Integration
  @Column({ type: 'varchar', length: 255, nullable: true })
  apiEndpoint: string; // Associated API endpoint

  @Column({ type: 'varchar', length: 10, nullable: true })
  httpMethod: string; // GET, POST, PUT, DELETE

  @Column({ type: 'simple-array', nullable: true })
  applicableModules: string[]; // Which system modules honor this

  // Metadata
  @Column({ type: 'simple-json', nullable: true })
  customMetadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  usageNotes: string;

  @Column({ type: 'text', nullable: true })
  securityNotes: string;

  // Relationships
  @OneToMany(() => RBACRolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RBACRolePermission[];

  // Audit Fields
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}
