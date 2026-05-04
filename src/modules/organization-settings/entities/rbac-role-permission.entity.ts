import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RBACStandardRole } from './rbac-standard-role.entity';
import { RBACPermission } from './rbac-permission.entity';
import { DataScopeLevel } from './rbac.enums';

@Entity('rbac_role_permissions')
@Index(['roleId', 'permissionId'], { unique: true })
@Index(['isActive'])
@Index(['dataScope'])
export class RBACRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relationships
  @Column({ type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RBACStandardRole, (role) => role.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: RBACStandardRole;

  @Column({ type: 'uuid' })
  permissionId: string;

  @ManyToOne(() => RBACPermission, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permissionId' })
  permission: RBACPermission;

  // Permission State
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isReadOnly: boolean; // Permission cannot be modified

  @Column({ type: 'boolean', default: false })
  isConditional: boolean; // Has conditional rules

  // Data Scope Override
  @Column({
    type: 'enum',
    enum: DataScopeLevel,
    nullable: true,
  })
  dataScope: DataScopeLevel; // Overrides role's default scope

  @Column({ type: 'simple-array', nullable: true })
  scopeFilters: string[]; // Additional scope filters

  @Column({ type: 'simple-json', nullable: true })
  scopeConditions: {
    departments?: string[];
    divisions?: string[];
    businessUnits?: string[];
    locations?: string[];
    countries?: string[];
    employeeTypes?: string[];
    customConditions?: Record<string, any>;
  };

  // Field-Level Permissions (Override)
  @Column({ type: 'simple-array', nullable: true })
  allowedFields: string[]; // Specific fields accessible

  @Column({ type: 'simple-array', nullable: true })
  deniedFields: string[]; // Explicitly denied fields

  @Column({ type: 'simple-array', nullable: true })
  maskedFields: string[]; // Fields to mask

  @Column({ type: 'simple-array', nullable: true })
  readOnlyFields: string[]; // Fields that are read-only

  // Approval Controls
  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ type: 'integer', nullable: true })
  approvalLevel: number; // How many approvals needed

  @Column({ type: 'simple-array', nullable: true })
  approverRoles: string[]; // Role codes that can approve

  // Time-Based Controls
  @Column({ type: 'timestamp', nullable: true })
  validFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  validTo: Date;

  @Column({ type: 'simple-json', nullable: true })
  timeConstraints: {
    allowedDaysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    allowedHoursStart?: string; // '09:00'
    allowedHoursEnd?: string; // '17:00'
    timezone?: string;
    excludeHolidays?: boolean;
  };

  // Constraints & Limits
  @Column({ type: 'integer', nullable: true })
  maxRecordsPerOperation: number;

  @Column({ type: 'integer', nullable: true })
  maxOperationsPerHour: number;

  @Column({ type: 'integer', nullable: true })
  maxOperationsPerDay: number;

  @Column({ type: 'boolean', default: false })
  allowExport: boolean;

  @Column({ type: 'boolean', default: false })
  allowImport: boolean;

  @Column({ type: 'boolean', default: false })
  allowBulkOperations: boolean;

  // Conditional Logic
  @Column({ type: 'simple-json', nullable: true })
  conditions: {
    expression?: string; // Dynamic condition expression
    parameters?: Record<string, any>;
    evaluationRules?: Record<string, any>;
  };

  // Compliance & Audit
  @Column({ type: 'boolean', default: true })
  isAudited: boolean;

  @Column({ type: 'simple-array', nullable: true })
  complianceTags: string[];

  @Column({ type: 'text', nullable: true })
  justificationRequired: string; // If set, user must provide justification

  @Column({ type: 'boolean', default: false })
  requiresMFA: boolean; // Multi-factor authentication required

  // Change Management
  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'text', nullable: true })
  changeReason: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Risk Assessment
  @Column({ type: 'integer', default: 0 })
  riskScore: number; // 0-100

  @Column({ type: 'varchar', length: 50, nullable: true })
  riskCategory: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ type: 'text', nullable: true })
  riskNotes: string;

  // Metadata
  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Audit Fields
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt: Date; // Track last time permission was used

  @Column({ type: 'integer', default: 0 })
  usageCount: number; // How many times used
}
