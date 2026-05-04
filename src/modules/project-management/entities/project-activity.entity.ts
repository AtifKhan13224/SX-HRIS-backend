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

/**
 * PROJECT ACTIVITIES ENTITY
 * Enterprise-grade activity configuration for project management
 * Configuration-driven, multi-tenant, production-ready
 * 
 * Activities define primary work categories used across:
 * - Projects, Sub-Activities, Timesheets, Rate Cards
 * - Billing Rules, Resource Assignments
 * 
 * Features:
 * - Multi-tenant isolation
 * - Organizational scope control
 * - Effective dating for configuration changes
 * - Version control and audit trail
 * - Dependency validation
 * - Custom attribute extensibility
 */

export enum ActivityCategory {
  DELIVERY = 'DELIVERY',
  SUPPORT = 'SUPPORT',
  MAINTENANCE = 'MAINTENANCE',
  DEVELOPMENT = 'DEVELOPMENT',
  CONSULTING = 'CONSULTING',
  TRAINING = 'TRAINING',
  RESEARCH = 'RESEARCH',
  ADMINISTRATION = 'ADMINISTRATION',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  OTHER = 'OTHER',
}

export enum ActivityType {
  OPERATIONAL = 'OPERATIONAL',
  DELIVERY = 'DELIVERY',
  SUPPORT = 'SUPPORT',
  INTERNAL = 'INTERNAL',
}

export enum ActivityStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

export enum ScopeType {
  GLOBAL = 'GLOBAL',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
  BUSINESS_UNIT = 'BUSINESS_UNIT',
  DEPARTMENT = 'DEPARTMENT',
  COUNTRY = 'COUNTRY',
  PROJECT_TYPE = 'PROJECT_TYPE',
}

@Entity('project_activities')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'activityCode'])
@Index(['tenantId', 'effectiveStartDate', 'effectiveEndDate'])
@Unique(['tenantId', 'activityCode', 'version'])
export class ProjectActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Activity Identification
  @Column({ name: 'activity_code', length: 50 })
  @Index()
  activityCode: string; // Unique identifier (e.g., 'ACT-001', 'DEV')

  @Column({ name: 'activity_name', length: 255 })
  activityName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'activity_category', type: 'enum', enum: ActivityCategory })
  @Index()
  activityCategory: ActivityCategory;

  @Column({ name: 'activity_type', type: 'enum', enum: ActivityType })
  @Index()
  activityType: ActivityType;

  // Configuration Attributes
  @Column({ name: 'is_billable', type: 'boolean', default: true })
  @Index()
  isBillable: boolean;

  @Column({ name: 'is_timesheet_required', type: 'boolean', default: true })
  isTimesheetRequired: boolean;

  @Column({ name: 'is_resource_allocation_enabled', type: 'boolean', default: true })
  isResourceAllocationEnabled: boolean;

  @Column({ name: 'is_budget_tracked', type: 'boolean', default: false })
  isBudgetTracked: boolean;

  // Default Associations
  @Column({ name: 'default_project_role_id', type: 'uuid', nullable: true })
  defaultProjectRoleId: string;

  @Column({ name: 'default_rate_card_id', type: 'uuid', nullable: true })
  defaultRateCardId: string;

  @Column({ name: 'default_approval_workflow_id', type: 'uuid', nullable: true })
  defaultApprovalWorkflowId: string;

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

  // Hierarchy and Parent Reference
  @Column({ name: 'parent_activity_id', type: 'uuid', nullable: true })
  @Index()
  parentActivityId: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  // Business Rules
  @Column({ name: 'allow_sub_activities', type: 'boolean', default: true })
  allowSubActivities: boolean;

  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ name: 'allow_overtime', type: 'boolean', default: false })
  allowOvertime: boolean;

  @Column({ name: 'max_hours_per_day', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxHoursPerDay: number;

  // Custom Attributes (JSON field for extensibility)
  @Column({ name: 'custom_attributes', type: 'jsonb', nullable: true })
  customAttributes: Record<string, any>;

  // Configuration Metadata
  @Column({ name: 'configuration_source', length: 100, nullable: true })
  configurationSource: string; // e.g., 'SYSTEM', 'IMPORT', 'MANUAL'

  @Column({ name: 'external_reference_id', length: 255, nullable: true })
  externalReferenceId: string; // For integration with external systems

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[]; // For categorization and search

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
  @OneToMany(() => ActivityScopeMapping, (scope) => scope.activity)
  scopeMappings: ActivityScopeMapping[];

  @OneToMany(() => ActivityVersion, (version) => version.activity)
  versions: ActivityVersion[];

  @OneToMany(() => ActivityDependencyLink, (dep) => dep.sourceActivity)
  dependencies: ActivityDependencyLink[];

  @OneToMany(() => ActivityAuditLog, (log) => log.activity)
  auditLogs: ActivityAuditLog[];
}

/**
 * ACTIVITY SCOPE MAPPINGS
 * Defines organizational scope for activities
 * Supports multi-level scoping (Global, Legal Entity, Business Unit, etc.)
 */
@Entity('activity_scope_mappings')
@Index(['tenantId', 'activityId'])
@Index(['scopeType', 'scopeEntityId'])
export class ActivityScopeMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'activity_id', type: 'uuid' })
  activityId: string;

  @Column({ name: 'scope_type', type: 'enum', enum: ScopeType })
  @Index()
  scopeType: ScopeType;

  @Column({ name: 'scope_entity_id', type: 'uuid', nullable: true })
  @Index()
  scopeEntityId: string; // Foreign key to Legal Entity, Business Unit, etc.

  @Column({ name: 'scope_entity_name', length: 255, nullable: true })
  scopeEntityName: string; // Denormalized for performance

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

  @ManyToOne(() => ProjectActivity, (activity) => activity.scopeMappings)
  @JoinColumn({ name: 'activity_id' })
  activity: ProjectActivity;
}

/**
 * ACTIVITY VERSIONS
 * Tracks configuration changes over time
 * Enables temporal queries and change history
 */
@Entity('activity_versions')
@Index(['tenantId', 'activityId', 'versionNumber'])
export class ActivityVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'activity_id', type: 'uuid' })
  activityId: string;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ name: 'change_type', length: 50 })
  changeType: string; // CREATE, UPDATE, STATUS_CHANGE, SCOPE_CHANGE

  @Column({ name: 'change_description', type: 'text', nullable: true })
  changeDescription: string;

  @Column({ name: 'configuration_snapshot', type: 'jsonb' })
  configurationSnapshot: Record<string, any>; // Complete state at this version

  @Column({ name: 'changed_fields', type: 'jsonb', nullable: true })
  changedFields: Record<string, any>; // Delta of what changed

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

  @ManyToOne(() => ProjectActivity, (activity) => activity.versions)
  @JoinColumn({ name: 'activity_id' })
  activity: ProjectActivity;
}

/**
 * ACTIVITY DEPENDENCY LINKS
 * Manages relationships between activities and other entities
 * Prevents deletion of activities that are referenced elsewhere
 */
@Entity('activity_dependency_links')
@Index(['tenantId', 'sourceActivityId'])
@Index(['dependentEntityType', 'dependentEntityId'])
export class ActivityDependencyLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'source_activity_id', type: 'uuid' })
  sourceActivityId: string;

  @Column({ name: 'dependent_entity_type', length: 100 })
  dependentEntityType: string; // PROJECT, SUB_ACTIVITY, TIMESHEET, RATE_CARD, etc.

  @Column({ name: 'dependent_entity_id', type: 'uuid' })
  dependentEntityId: string;

  @Column({ name: 'dependent_entity_name', length: 255, nullable: true })
  dependentEntityName: string;

  @Column({ name: 'dependency_type', length: 50 })
  dependencyType: string; // REQUIRED, OPTIONAL, RECOMMENDED

  @Column({ name: 'is_blocking', type: 'boolean', default: true })
  isBlocking: boolean; // Prevents deletion if true

  @Column({ name: 'link_metadata', type: 'jsonb', nullable: true })
  linkMetadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ProjectActivity, (activity) => activity.dependencies)
  @JoinColumn({ name: 'source_activity_id' })
  sourceActivity: ProjectActivity;
}

/**
 * ACTIVITY AUDIT LOGS
 * Comprehensive audit trail for compliance
 * Tracks all changes with user context
 */
@Entity('activity_audit_logs')
@Index(['tenantId', 'activityId', 'createdAt'])
@Index(['actionType'])
@Index(['performedBy'])
export class ActivityAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'activity_id', type: 'uuid' })
  activityId: string;

  @Column({ name: 'activity_code', length: 50 })
  activityCode: string;

  @Column({ name: 'action_type', length: 50 })
  actionType: string; // CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE, APPROVE

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

  @Column({ name: 'session_id', length: 255, nullable: true })
  sessionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ProjectActivity, (activity) => activity.auditLogs)
  @JoinColumn({ name: 'activity_id' })
  activity: ProjectActivity;
}
