import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ActivityStatus, ScopeType } from './project-activity.entity';

/**
 * PROJECT ROLES ENTITY
 * Enterprise-grade role configuration with hierarchical support
 * Configuration-driven, multi-tenant, production-ready
 * 
 * Project Roles define responsibilities and functional roles within projects:
 * - Used in: Resource allocation, Rate cards, Timesheets, Budget planning
 * - Supports: Hierarchy, Scope control, Version control, Audit trail
 * 
 * Features:
 * - Multi-tenant isolation
 * - Hierarchical role structure (parent-child)
 * - Organizational scope control
 * - Effective dating for configuration changes
 * - Version control and audit trail
 * - Dependency validation
 * - Custom attribute extensibility
 */

export enum RoleCategory {
  DELIVERY = 'DELIVERY',
  MANAGEMENT = 'MANAGEMENT',
  SUPPORT = 'SUPPORT',
  CONSULTING = 'CONSULTING',
  ARCHITECTURE = 'ARCHITECTURE',
  ANALYSIS = 'ANALYSIS',
  QUALITY = 'QUALITY',
  OPERATIONS = 'OPERATIONS',
  ADMINISTRATION = 'ADMINISTRATION',
  SPECIALIZED = 'SPECIALIZED',
}

export enum SkillLevel {
  ENTRY = 'ENTRY',
  JUNIOR = 'JUNIOR',
  INTERMEDIATE = 'INTERMEDIATE',
  SENIOR = 'SENIOR',
  EXPERT = 'EXPERT',
  PRINCIPAL = 'PRINCIPAL',
  FELLOW = 'FELLOW',
}

export enum ResourceType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  CONTRACTOR = 'CONTRACTOR',
  VENDOR = 'VENDOR',
  PARTNER = 'PARTNER',
  FREELANCER = 'FREELANCER',
}

export enum BillingCategory {
  BILLABLE = 'BILLABLE',
  NON_BILLABLE = 'NON_BILLABLE',
  OVERHEAD = 'OVERHEAD',
  INVESTMENT = 'INVESTMENT',
  PRESALES = 'PRESALES',
}

export enum CostCategory {
  DIRECT = 'DIRECT',
  INDIRECT = 'INDIRECT',
  OVERHEAD = 'OVERHEAD',
  CAPITAL = 'CAPITAL',
  OPERATIONAL = 'OPERATIONAL',
}

@Entity('project_roles')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'roleCode'])
@Index(['roleCategory'])
@Index(['skillLevel'])
@Index(['parentRoleId'])
@Index(['hierarchyPath'])
@Index(['tenantId', 'effectiveStartDate', 'effectiveEndDate'])
@Unique(['tenantId', 'roleCode'])
@Unique(['tenantId', 'roleCode', 'version'])
export class ProjectRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Role Identification
  @Column({ name: 'role_code', length: 50 })
  @Index()
  roleCode: string; // e.g., 'ROLE-001', 'DEV-SR'

  @Column({ name: 'role_name', length: 255 })
  roleName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Classification
  @Column({ name: 'role_category', type: 'enum', enum: RoleCategory })
  @Index()
  roleCategory: RoleCategory;

  @Column({ name: 'skill_level', type: 'enum', enum: SkillLevel, default: SkillLevel.INTERMEDIATE })
  @Index()
  skillLevel: SkillLevel;

  // Default Configurations
  @Column({ name: 'default_billing_category', type: 'enum', enum: BillingCategory, default: BillingCategory.BILLABLE })
  defaultBillingCategory: BillingCategory;

  @Column({ name: 'default_cost_category', type: 'enum', enum: CostCategory, default: CostCategory.DIRECT })
  defaultCostCategory: CostCategory;

  @Column({ name: 'default_resource_type', type: 'enum', enum: ResourceType, default: ResourceType.INTERNAL })
  defaultResourceType: ResourceType;

  // Default Activity Mapping
  @Column({ name: 'default_activity_id', type: 'uuid', nullable: true })
  defaultActivityId: string;

  // Hierarchy Support
  @Column({ name: 'parent_role_id', type: 'uuid', nullable: true })
  @Index()
  parentRoleId: string;

  @Column({ name: 'hierarchy_level', type: 'int', default: 0 })
  hierarchyLevel: number;

  @Column({ name: 'hierarchy_path', type: 'text', nullable: true })
  @Index()
  hierarchyPath: string; // Materialized path: /1/5/12

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  // Organizational Grouping
  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  @Index()
  departmentId: string;

  @Column({ name: 'practice_area', length: 100, nullable: true })
  @Index()
  practiceArea: string; // Cloud, Data, Mobile, etc.

  @Column({ name: 'competency_group', length: 100, nullable: true })
  competencyGroup: string; // Engineering, Consulting, etc.

  @Column({ name: 'delivery_unit', length: 100, nullable: true })
  deliveryUnit: string;

  // Business Rules
  @Column({ name: 'requires_certification', type: 'boolean', default: false })
  requiresCertification: boolean;

  @Column({ name: 'certification_type', length: 255, nullable: true })
  certificationType: string;

  @Column({ name: 'min_experience_years', type: 'decimal', precision: 4, scale: 1, nullable: true })
  minExperienceYears: number;

  @Column({ name: 'max_experience_years', type: 'decimal', precision: 4, scale: 1, nullable: true })
  maxExperienceYears: number;

  @Column({ name: 'allows_remote', type: 'boolean', default: true })
  allowsRemote: boolean;

  @Column({ name: 'requires_onsite', type: 'boolean', default: false })
  requiresOnsite: boolean;

  // Billing & Cost Defaults
  @Column({ name: 'standard_hourly_rate', type: 'decimal', precision: 12, scale: 2, nullable: true })
  standardHourlyRate: number;

  @Column({ name: 'standard_daily_rate', type: 'decimal', precision: 12, scale: 2, nullable: true })
  standardDailyRate: number;

  @Column({ name: 'cost_center', length: 50, nullable: true })
  costCenter: string;

  @Column({ name: 'profit_center', length: 50, nullable: true })
  profitCenter: string;

  // Capacity Planning
  @Column({ name: 'default_allocation_percentage', type: 'decimal', precision: 5, scale: 2, default: 100.00 })
  defaultAllocationPercentage: number;

  @Column({ name: 'max_concurrent_projects', type: 'int', default: 3 })
  maxConcurrentProjects: number;

  // Governance & Versioning
  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'effective_start_date', type: 'date' })
  @Index()
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'date', nullable: true })
  @Index()
  effectiveEndDate: Date;

  @Column({ name: 'status', type: 'enum', enum: ActivityStatus, default: ActivityStatus.DRAFT })
  @Index()
  status: ActivityStatus;

  // Custom Attributes (Extensibility)
  @Column({ name: 'custom_attributes', type: 'jsonb', nullable: true })
  customAttributes: Record<string, any>;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[];

  // Configuration Metadata
  @Column({ name: 'configuration_source', length: 100, nullable: true })
  configurationSource: string;

  @Column({ name: 'external_reference_id', length: 255, nullable: true })
  externalReferenceId: string;

  // Approval and Workflow
  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes: string;

  // Audit Fields
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'deactivated_by', type: 'uuid', nullable: true })
  deactivatedBy: string;

  @Column({ name: 'deactivated_at', type: 'timestamp', nullable: true })
  deactivatedAt: Date;

  @Column({ name: 'deactivation_reason', type: 'text', nullable: true })
  deactivationReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Soft Delete
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  @Index()
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
  deletedBy: string;

  // Relations
  @ManyToOne(() => ProjectRole, { nullable: true })
  @JoinColumn({ name: 'parent_role_id' })
  parentRole: ProjectRole;

  @OneToMany(() => ProjectRole, (role) => role.parentRole)
  childRoles: ProjectRole[];

  @OneToMany(() => ProjectRoleHierarchy, (hierarchy) => hierarchy.parentRole)
  hierarchyChildren: ProjectRoleHierarchy[];

  @OneToMany(() => ProjectRoleHierarchy, (hierarchy) => hierarchy.childRole)
  hierarchyParents: ProjectRoleHierarchy[];

  @OneToMany(() => ProjectRoleScopeMapping, (scope) => scope.projectRole)
  scopeMappings: ProjectRoleScopeMapping[];

  @OneToMany(() => ProjectRoleVersion, (version) => version.projectRole)
  versions: ProjectRoleVersion[];

  @OneToMany(() => ProjectRoleDependencyLink, (dep) => dep.sourceRole)
  dependencies: ProjectRoleDependencyLink[];

  @OneToMany(() => ProjectRoleAuditLog, (log) => log.projectRole)
  auditLogs: ProjectRoleAuditLog[];
}

/**
 * PROJECT ROLE HIERARCHY
 * Explicit hierarchy relationships between roles
 * Supports multiple hierarchy types (reports_to, leads, supervises)
 */
@Entity('project_role_hierarchy')
@Index(['tenantId', 'parentRoleId'])
@Index(['childRoleId'])
@Unique(['tenantId', 'parentRoleId', 'childRoleId'])
export class ProjectRoleHierarchy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'parent_role_id', type: 'uuid' })
  parentRoleId: string;

  @Column({ name: 'child_role_id', type: 'uuid' })
  childRoleId: string;

  @Column({ name: 'relationship_type', length: 50, default: 'REPORTS_TO' })
  relationshipType: string; // REPORTS_TO, LEADS, SUPERVISES

  @Column({ name: 'hierarchy_depth', type: 'int', default: 1 })
  hierarchyDepth: number;

  @Column({ name: 'effective_start_date', type: 'date' })
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'date', nullable: true })
  effectiveEndDate: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ProjectRole, (role) => role.hierarchyChildren)
  @JoinColumn({ name: 'parent_role_id' })
  parentRole: ProjectRole;

  @ManyToOne(() => ProjectRole, (role) => role.hierarchyParents)
  @JoinColumn({ name: 'child_role_id' })
  childRole: ProjectRole;
}

/**
 * PROJECT ROLE SCOPE MAPPINGS
 * Defines organizational scope for project roles
 */
@Entity('project_role_scope_mappings')
@Index(['tenantId', 'projectRoleId'])
@Index(['scopeType', 'scopeEntityId'])
export class ProjectRoleScopeMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'project_role_id', type: 'uuid' })
  projectRoleId: string;

  @Column({ name: 'scope_type', type: 'enum', enum: ScopeType })
  @Index()
  scopeType: ScopeType;

  @Column({ name: 'scope_entity_id', type: 'uuid', nullable: true })
  @Index()
  scopeEntityId: string;

  @Column({ name: 'scope_entity_name', length: 255, nullable: true })
  scopeEntityName: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'effective_start_date', type: 'date' })
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'date', nullable: true })
  effectiveEndDate: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ProjectRole, (role) => role.scopeMappings)
  @JoinColumn({ name: 'project_role_id' })
  projectRole: ProjectRole;
}

/**
 * PROJECT ROLE VERSIONS
 * Tracks configuration changes over time
 */
@Entity('project_role_versions')
@Index(['tenantId', 'projectRoleId', 'versionNumber'])
export class ProjectRoleVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'project_role_id', type: 'uuid' })
  projectRoleId: string;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ name: 'change_type', length: 50 })
  changeType: string; // CREATE, UPDATE, STATUS_CHANGE, HIERARCHY_CHANGE

  @Column({ name: 'change_description', type: 'text', nullable: true })
  changeDescription: string;

  @Column({ name: 'configuration_snapshot', type: 'jsonb' })
  configurationSnapshot: Record<string, any>;

  @Column({ name: 'changed_fields', type: 'jsonb', nullable: true })
  changedFields: Record<string, any>;

  @Column({ name: 'effective_from', type: 'timestamp' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'timestamp', nullable: true })
  effectiveTo: Date;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason: string;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ProjectRole, (role) => role.versions)
  @JoinColumn({ name: 'project_role_id' })
  projectRole: ProjectRole;
}

/**
 * PROJECT ROLE DEPENDENCY LINKS
 * Manages relationships between roles and dependent entities
 */
@Entity('project_role_dependency_links')
@Index(['tenantId', 'sourceRoleId'])
@Index(['dependentEntityType', 'dependentEntityId'])
export class ProjectRoleDependencyLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'source_role_id', type: 'uuid' })
  sourceRoleId: string;

  @Column({ name: 'dependent_entity_type', length: 100 })
  dependentEntityType: string; // PROJECT, RATE_CARD, RESOURCE_ASSIGNMENT, BUDGET, TIMESHEET

  @Column({ name: 'dependent_entity_id', type: 'uuid' })
  dependentEntityId: string;

  @Column({ name: 'dependent_entity_name', length: 255, nullable: true })
  dependentEntityName: string;

  @Column({ name: 'dependency_type', length: 50 })
  dependencyType: string; // REQUIRED, OPTIONAL, RECOMMENDED

  @Column({ name: 'is_blocking', type: 'boolean', default: true })
  isBlocking: boolean;

  @Column({ name: 'link_metadata', type: 'jsonb', nullable: true })
  linkMetadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ProjectRole, (role) => role.dependencies)
  @JoinColumn({ name: 'source_role_id' })
  sourceRole: ProjectRole;
}

/**
 * PROJECT ROLE AUDIT LOGS
 * Comprehensive audit trail for compliance
 */
@Entity('project_role_audit_logs')
@Index(['tenantId', 'projectRoleId', 'createdAt'])
@Index(['actionType'])
@Index(['performedBy'])
export class ProjectRoleAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'project_role_id', type: 'uuid' })
  projectRoleId: string;

  @Column({ name: 'role_code', length: 50 })
  roleCode: string;

  @Column({ name: 'action_type', length: 50 })
  actionType: string; // CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE, APPROVE, HIERARCHY_CHANGE

  @Column({ name: 'action_description', type: 'text' })
  actionDescription: string;

  @Column({ name: 'before_state', type: 'jsonb', nullable: true })
  beforeState: Record<string, any>;

  @Column({ name: 'after_state', type: 'jsonb', nullable: true })
  afterState: Record<string, any>;

  @Column({ name: 'changed_fields', type: 'jsonb', nullable: true })
  changedFields: string[];

  @Column({ name: 'performed_by', type: 'uuid' })
  performedBy: string;

  @Column({ name: 'performed_by_name', length: 255 })
  performedByName: string;

  @Column({ name: 'performed_by_role', length: 100, nullable: true })
  performedByRole: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason: string;

  @Column({ name: 'approval_status', length: 50, nullable: true })
  approvalStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ProjectRole, (role) => role.auditLogs)
  @JoinColumn({ name: 'project_role_id' })
  projectRole: ProjectRole;
}
