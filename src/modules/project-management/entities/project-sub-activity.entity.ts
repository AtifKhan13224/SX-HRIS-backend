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
import { ProjectActivity, ActivityStatus, ScopeType } from './project-activity.entity';

/**
 * PROJECT SUB-ACTIVITIES ENTITY
 * Granular work breakdown structure for project activities
 * Configuration-driven, multi-tenant, production-ready
 * 
 * Sub-Activities define detailed work items under parent activities:
 * - Parent-Child relationship with ProjectActivity
 * - Used in: Tasks, Timesheets, Resource Assignments
 * - Independent billing and rate configurations
 * 
 * Features:
 * - Multi-tenant isolation
 * - Parent activity reference with cascade rules
 * - Work type configuration (Hourly/Daily/Milestone)
 * - Scope inheritance from parent or explicit definition
 * - Version control and audit trail
 * - Dependency validation
 * - Custom attribute extensibility
 */

export enum SubActivityWorkType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  MILESTONE = 'MILESTONE',
}

export enum SubActivityDurationType {
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  WEEKS = 'WEEKS',
  FIXED_BID = 'FIXED_BID',
}

@Entity('project_sub_activities')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'subActivityCode'])
@Index(['parentActivityId'])
@Index(['tenantId', 'effectiveStartDate', 'effectiveEndDate'])
@Unique(['tenantId', 'subActivityCode'])
@Unique(['tenantId', 'subActivityCode', 'version'])
export class ProjectSubActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Parent Activity Reference (REQUIRED)
  @Column({ name: 'parent_activity_id', type: 'uuid' })
  @Index()
  parentActivityId: string;

  // Sub-Activity Identification
  @Column({ name: 'sub_activity_code', length: 50 })
  @Index()
  subActivityCode: string; // Unique identifier (e.g., 'SUB-001', 'DEV-CODING')

  @Column({ name: 'sub_activity_name', length: 255 })
  subActivityName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Work Type Configuration
  @Column({ name: 'work_type', type: 'enum', enum: SubActivityWorkType, default: SubActivityWorkType.HOURLY })
  @Index()
  workType: SubActivityWorkType;

  @Column({ name: 'default_duration_type', type: 'enum', enum: SubActivityDurationType, default: SubActivityDurationType.HOURS })
  defaultDurationType: SubActivityDurationType;

  @Column({ name: 'estimated_hours', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedHours: number;

  @Column({ name: 'estimated_days', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedDays: number;

  // Financial Configuration
  @Column({ name: 'is_billable', type: 'boolean', default: true })
  @Index()
  isBillable: boolean;

  @Column({ name: 'is_timesheet_required', type: 'boolean', default: true })
  isTimesheetRequired: boolean;

  @Column({ name: 'cost_allocation_category', length: 100, nullable: true })
  costAllocationCategory: string; // DIRECT, INDIRECT, OVERHEAD

  @Column({ name: 'billing_rate_override', type: 'decimal', precision: 12, scale: 2, nullable: true })
  billingRateOverride: number;

  // Resource and Skill Requirements
  @Column({ name: 'required_skill_level', length: 50, nullable: true })
  requiredSkillLevel: string; // JUNIOR, SENIOR, EXPERT

  @Column({ name: 'requires_certification', type: 'boolean', default: false })
  requiresCertification: boolean;

  @Column({ name: 'certification_type', length: 100, nullable: true })
  certificationType: string;

  @Column({ name: 'min_resource_count', type: 'int', default: 1 })
  minResourceCount: number;

  @Column({ name: 'max_resource_count', type: 'int', nullable: true })
  maxResourceCount: number;

  // Task Configuration
  @Column({ name: 'is_task_template', type: 'boolean', default: false })
  isTaskTemplate: boolean;

  @Column({ name: 'allows_parallel_execution', type: 'boolean', default: true })
  allowsParallelExecution: boolean;

  @Column({ name: 'requires_sequential_completion', type: 'boolean', default: false })
  requiresSequentialCompletion: boolean;

  // Business Rules
  @Column({ name: 'allow_overtime', type: 'boolean', default: false })
  allowOvertime: boolean;

  @Column({ name: 'max_hours_per_day', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxHoursPerDay: number;

  @Column({ name: 'requires_manager_approval', type: 'boolean', default: false })
  requiresManagerApproval: boolean;

  @Column({ name: 'requires_client_approval', type: 'boolean', default: false })
  requiresClientApproval: boolean;

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

  // Hierarchy and Ordering
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'hierarchy_level', type: 'int', default: 1 })
  hierarchyLevel: number;

  // Custom Attributes (JSON field for extensibility)
  @Column({ name: 'custom_attributes', type: 'jsonb', nullable: true })
  customAttributes: Record<string, any>;

  // Configuration Metadata
  @Column({ name: 'configuration_source', length: 100, nullable: true })
  configurationSource: string; // SYSTEM, IMPORT, MANUAL

  @Column({ name: 'external_reference_id', length: 255, nullable: true })
  externalReferenceId: string;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[];

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
  @ManyToOne(() => ProjectActivity, { nullable: false })
  @JoinColumn({ name: 'parent_activity_id' })
  parentActivity: ProjectActivity;

  @OneToMany(() => SubActivityScopeMapping, (scope) => scope.subActivity)
  scopeMappings: SubActivityScopeMapping[];

  @OneToMany(() => SubActivityVersion, (version) => version.subActivity)
  versions: SubActivityVersion[];

  @OneToMany(() => SubActivityDependencyLink, (dep) => dep.sourceSubActivity)
  dependencies: SubActivityDependencyLink[];

  @OneToMany(() => SubActivityAuditLog, (log) => log.subActivity)
  auditLogs: SubActivityAuditLog[];
}

/**
 * SUB-ACTIVITY SCOPE MAPPINGS
 * Defines organizational scope for sub-activities
 * Can inherit from parent activity or define explicit scope
 */
@Entity('sub_activity_scope_mappings')
@Index(['tenantId', 'subActivityId'])
@Index(['scopeType', 'scopeEntityId'])
export class SubActivityScopeMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'sub_activity_id', type: 'uuid' })
  subActivityId: string;

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

  @Column({ name: 'inherits_from_parent', type: 'boolean', default: true })
  inheritsFromParent: boolean;

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

  @ManyToOne(() => ProjectSubActivity, (subActivity) => subActivity.scopeMappings)
  @JoinColumn({ name: 'sub_activity_id' })
  subActivity: ProjectSubActivity;
}

/**
 * SUB-ACTIVITY VERSIONS
 * Tracks configuration changes over time
 * Enables temporal queries and change history
 */
@Entity('sub_activity_versions')
@Index(['tenantId', 'subActivityId', 'versionNumber'])
export class SubActivityVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'sub_activity_id', type: 'uuid' })
  subActivityId: string;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ name: 'change_type', length: 50 })
  changeType: string; // CREATE, UPDATE, STATUS_CHANGE, SCOPE_CHANGE, PARENT_CHANGE

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

  @ManyToOne(() => ProjectSubActivity, (subActivity) => subActivity.versions)
  @JoinColumn({ name: 'sub_activity_id' })
  subActivity: ProjectSubActivity;
}

/**
 * SUB-ACTIVITY DEPENDENCY LINKS
 * Manages relationships between sub-activities and other entities
 * Prevents deletion of sub-activities that are referenced elsewhere
 */
@Entity('sub_activity_dependency_links')
@Index(['tenantId', 'sourceSubActivityId'])
@Index(['dependentEntityType', 'dependentEntityId'])
@Index(['parentActivityId'])
export class SubActivityDependencyLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'source_sub_activity_id', type: 'uuid' })
  sourceSubActivityId: string;

  @Column({ name: 'dependent_entity_type', length: 100 })
  dependentEntityType: string; // PROJECT, TASK, TIMESHEET, RATE_CARD, ASSIGNMENT

  @Column({ name: 'dependent_entity_id', type: 'uuid' })
  dependentEntityId: string;

  @Column({ name: 'dependent_entity_name', length: 255, nullable: true })
  dependentEntityName: string;

  @Column({ name: 'dependency_type', length: 50 })
  dependencyType: string; // REQUIRED, OPTIONAL, RECOMMENDED

  @Column({ name: 'is_blocking', type: 'boolean', default: true })
  isBlocking: boolean;

  @Column({ name: 'parent_activity_id', type: 'uuid', nullable: true })
  parentActivityId: string;

  @Column({ name: 'link_metadata', type: 'jsonb', nullable: true })
  linkMetadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ProjectSubActivity, (subActivity) => subActivity.dependencies)
  @JoinColumn({ name: 'source_sub_activity_id' })
  sourceSubActivity: ProjectSubActivity;

  @ManyToOne(() => ProjectActivity)
  @JoinColumn({ name: 'parent_activity_id' })
  parentActivity: ProjectActivity;
}

/**
 * SUB-ACTIVITY AUDIT LOGS
 * Comprehensive audit trail for compliance
 * Tracks all changes with user context and parent activity reference
 */
@Entity('sub_activity_audit_logs')
@Index(['tenantId', 'subActivityId', 'createdAt'])
@Index(['parentActivityId'])
@Index(['actionType'])
@Index(['performedBy'])
export class SubActivityAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'sub_activity_id', type: 'uuid' })
  subActivityId: string;

  @Column({ name: 'sub_activity_code', length: 50 })
  subActivityCode: string;

  @Column({ name: 'parent_activity_id', type: 'uuid', nullable: true })
  parentActivityId: string;

  @Column({ name: 'action_type', length: 50 })
  actionType: string; // CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE, APPROVE, PARENT_CHANGE

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
  approvalStatus: string; // PENDING, APPROVED, REJECTED

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ProjectSubActivity, (subActivity) => subActivity.auditLogs)
  @JoinColumn({ name: 'sub_activity_id' })
  subActivity: ProjectSubActivity;

  @ManyToOne(() => ProjectActivity)
  @JoinColumn({ name: 'parent_activity_id' })
  parentActivity: ProjectActivity;
}
