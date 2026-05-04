import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { CustomRole } from './custom-role.entity';
import { Permission } from './permission.entity';

export enum ScopeType {
  STATIC = 'STATIC',
  DYNAMIC = 'DYNAMIC',
  CONDITIONAL = 'CONDITIONAL',
  UNRESTRICTED = 'UNRESTRICTED'
}

export interface DataScope {
  scopeType: ScopeType;
  scopeDefinition: ScopeDefinition;
}

export interface ScopeDefinition {
  // Organization Scope
  organizationUnits?: string[];
  legalEntities?: string[];
  countries?: string[];
  businessUnits?: string[];
  departments?: string[];
  locations?: string[];
  costCenters?: string[];
  
  // Employee Scope
  employeeGroups?: string[];
  employeeTypes?: string[];
  
  // Hierarchy Scope
  hierarchyType?: 'REPORTING' | 'FUNCTIONAL' | 'MATRIX';
  hierarchyLevels?: number;
  includeIndirect?: boolean;
  
  // Dynamic Scope Expression
  dynamicExpression?: string;
}

export enum ConditionType {
  EMPLOYEE_STATUS = 'EMPLOYEE_STATUS',
  LIFECYCLE_STAGE = 'LIFECYCLE_STAGE',
  TIME_BASED = 'TIME_BASED',
  LOCATION_BASED = 'LOCATION_BASED',
  ASSIGNMENT_BASED = 'ASSIGNMENT_BASED',
  EMERGENCY_MODE = 'EMERGENCY_MODE',
  CUSTOM = 'CUSTOM'
}

export interface Condition {
  field: string;
  operator: string;
  value: any;
  expression?: string;
}

export interface ConditionalRule {
  id: string;
  name: string;
  description: string;
  conditionType: ConditionType;
  conditions: Condition[];
  operator: 'AND' | 'OR';
  effect: 'GRANT' | 'DENY' | 'ELEVATE' | 'RESTRICT';
  isActive: boolean;
}

export enum FieldVisibility {
  HIDDEN = 'HIDDEN',
  MASKED = 'MASKED',
  FULL = 'FULL'
}

export enum FieldEditability {
  READ_ONLY = 'READ_ONLY',
  EDITABLE = 'EDITABLE',
  CONDITIONAL = 'CONDITIONAL'
}

export enum MaskingStrategy {
  NONE = 'NONE',
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
  HASH = 'HASH',
  REDACTED = 'REDACTED'
}

export interface FieldAccessRule {
  id: string;
  fieldPath: string;
  visibility: FieldVisibility;
  editability: FieldEditability;
  conditions?: Condition[];
  maskingStrategy?: MaskingStrategy;
  countryOverrides?: CountryFieldOverride[];
}

export interface CountryFieldOverride {
  country: string;
  visibility: FieldVisibility;
  editability: FieldEditability;
  reason: string;
}

export interface TimeBoundAccess {
  startDate: Date;
  endDate: Date;
  reason: string;
  autoRevoke: boolean;
  notifyBeforeExpiry: number;
}

@Entity('role_permissions')
@Index(['roleId'])
@Index(['permissionId'])
@Index(['roleId', 'permissionId'], { unique: true })
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'permission_id', type: 'uuid' })
  permissionId: string;

  // Context & Scope
  @Column({ name: 'data_scope', type: 'jsonb', nullable: true })
  dataScope: DataScope;

  @Column({ name: 'conditional_rules', type: 'jsonb', default: [] })
  conditionalRules: ConditionalRule[];

  // Field-Level Security
  @Column({ name: 'field_access_rules', type: 'jsonb', default: [] })
  fieldAccessRules: FieldAccessRule[];

  // Temporal
  @Column({ name: 'effective_start_date', type: 'timestamp' })
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'timestamp', nullable: true })
  effectiveEndDate: Date;

  @Column({ name: 'time_bound_access', type: 'jsonb', nullable: true })
  timeBoundAccess: TimeBoundAccess;

  // Governance
  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CustomRole, role => role.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: CustomRole;

  @ManyToOne(() => Permission, permission => permission.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
