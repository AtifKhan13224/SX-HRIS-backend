import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ActivityStatus, ScopeType } from './project-activity.entity';

/**
 * PROJECT CONFIGURATION FRAMEWORK ENTITIES
 * Enterprise-grade project structure configuration
 * 
 * Purpose: Define how projects are structured, categorized, and governed
 * Scope: Configuration-only (not operational projects)
 * 
 * Features:
 * - Multi-tenant isolation
 * - Hierarchical structures
 * - Lifecycle management
 * - Governance rules
 * - Resource allocation models
 * - Billing/cost control
 * - Version control
 * - Comprehensive audit trail
 */

// ==============================================
// ENUMS
// ==============================================

export enum ProjectTypeCategory {
  CLIENT_DELIVERY = 'CLIENT_DELIVERY',
  INTERNAL_INITIATIVE = 'INTERNAL_INITIATIVE',
  RESEARCH_DEVELOPMENT = 'RESEARCH_DEVELOPMENT',
  IMPLEMENTATION = 'IMPLEMENTATION',
  SUPPORT = 'SUPPORT',
  CONSULTING = 'CONSULTING',
  TRANSFORMATION = 'TRANSFORMATION',
  INNOVATION = 'INNOVATION',
  COMPLIANCE = 'COMPLIANCE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum BillingModel {
  TIME_AND_MATERIAL = 'TIME_AND_MATERIAL',
  FIXED_PRICE = 'FIXED_PRICE',
  MILESTONE_BASED = 'MILESTONE_BASED',
  RETAINER = 'RETAINER',
  NON_BILLABLE = 'NON_BILLABLE',
  COST_PLUS = 'COST_PLUS',
  UNIT_PRICE = 'UNIT_PRICE',
  HYBRID = 'HYBRID',
}

export enum BudgetControlMode {
  STRICT = 'STRICT',
  ADVISORY = 'ADVISORY',
  DISABLED = 'DISABLED',
  SOFT_LIMIT = 'SOFT_LIMIT',
  HARD_LIMIT = 'HARD_LIMIT',
}

export enum StaffingRequirement {
  MANDATORY = 'MANDATORY',
  OPTIONAL = 'OPTIONAL',
  CONDITIONAL = 'CONDITIONAL',
  NOT_REQUIRED = 'NOT_REQUIRED',
}

export enum LifecycleStageType {
  INITIATION = 'INITIATION',
  PLANNING = 'PLANNING',
  EXECUTION = 'EXECUTION',
  MONITORING = 'MONITORING',
  CONTROL = 'CONTROL',
  CLOSURE = 'CLOSURE',
  CUSTOM = 'CUSTOM',
}

export enum GovernanceEnforcementLevel {
  SOFT = 'SOFT',
  HARD = 'HARD',
  INFORMATIONAL = 'INFORMATIONAL',
  BLOCKING = 'BLOCKING',
}

export enum ResourceAllocationModel {
  ROLE_BASED = 'ROLE_BASED',
  RESOURCE_POOL = 'RESOURCE_POOL',
  SKILL_BASED = 'SKILL_BASED',
  NAMED_RESOURCE = 'NAMED_RESOURCE',
  HYBRID = 'HYBRID',
}

export enum RevenueRecognitionMethod {
  PERCENTAGE_COMPLETION = 'PERCENTAGE_COMPLETION',
  MILESTONE_BASED = 'MILESTONE_BASED',
  COMPLETED_CONTRACT = 'COMPLETED_CONTRACT',
  TIME_BASED = 'TIME_BASED',
  COST_TO_COST = 'COST_TO_COST',
}

// ==============================================
// ENTITY 1: PROJECT TYPE
// ==============================================

@Entity('project_types')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'projectTypeCode'])
@Index(['defaultProjectCategory'])
@Index(['parentTypeId'])
@Index(['hierarchyPath'])
@Index(['tenantId', 'effectiveStartDate', 'effectiveEndDate'])
@Unique(['tenantId', 'projectTypeCode'])
@Unique(['tenantId', 'projectTypeCode', 'version'])
export class ProjectType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Identification
  @Column({ name: 'project_type_code', length: 50 })
  @Index()
  projectTypeCode: string;

  @Column({ name: 'project_type_name', length: 255 })
  projectTypeName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Category & Classification
  @Column({ name: 'default_project_category', type: 'enum', enum: ProjectTypeCategory })
  @Index()
  defaultProjectCategory: ProjectTypeCategory;

  @Column({ name: 'parent_type_id', type: 'uuid', nullable: true })
  @Index()
  parentTypeId: string;

  @Column({ name: 'hierarchy_path', type: 'text', nullable: true })
  @Index()
  hierarchyPath: string;

  @Column({ name: 'hierarchy_level', type: 'int', default: 0 })
  hierarchyLevel: number;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  // Default Billing Configuration
  @Column({ name: 'default_billing_model', type: 'enum', enum: BillingModel, default: BillingModel.TIME_AND_MATERIAL })
  defaultBillingModel: BillingModel;

  @Column({ name: 'default_currency', length: 3, default: 'USD' })
  defaultCurrency: string;

  // Default Budget Configuration
  @Column({ name: 'default_budget_control_mode', type: 'enum', enum: BudgetControlMode, default: BudgetControlMode.ADVISORY })
  defaultBudgetControlMode: BudgetControlMode;

  @Column({ name: 'requires_budget_approval', type: 'boolean', default: false })
  requiresBudgetApproval: boolean;

  @Column({ name: 'budget_approval_threshold', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetApprovalThreshold: number;

  // Time Tracking Configuration
  @Column({ name: 'requires_time_tracking', type: 'boolean', default: true })
  requiresTimeTracking: boolean;

  @Column({ name: 'time_tracking_granularity', length: 50, default: 'DAILY' })
  timeTrackingGranularity: string; // HOURLY, DAILY, WEEKLY

  @Column({ name: 'allows_overtime_tracking', type: 'boolean', default: true })
  allowsOvertimeTracking: boolean;

  // Staffing Configuration
  @Column({ name: 'default_staffing_requirement', type: 'enum', enum: StaffingRequirement, default: StaffingRequirement.MANDATORY })
  defaultStaffingRequirement: StaffingRequirement;

  @Column({ name: 'requires_resource_allocation', type: 'boolean', default: true })
  requiresResourceAllocation: boolean;

  @Column({ name: 'allows_external_resources', type: 'boolean', default: true })
  allowsExternalResources: boolean;

  @Column({ name: 'min_team_size', type: 'int', nullable: true })
  minTeamSize: number;

  @Column({ name: 'max_team_size', type: 'int', nullable: true })
  maxTeamSize: number;

  // Operational Flags
  @Column({ name: 'is_billable', type: 'boolean', default: true })
  isBillable: boolean;

  @Column({ name: 'is_capitalized', type: 'boolean', default: false })
  isCapitalized: boolean;

  @Column({ name: 'requires_client_assignment', type: 'boolean', default: false })
  requiresClientAssignment: boolean;

  @Column({ name: 'requires_contract_reference', type: 'boolean', default: false })
  requiresContractReference: boolean;

  @Column({ name: 'allows_subprojects', type: 'boolean', default: true })
  allowsSubprojects: boolean;

  @Column({ name: 'max_subproject_depth', type: 'int', default: 3 })
  maxSubprojectDepth: number;

  // Workflow & Approval
  @Column({ name: 'requires_approval_workflow', type: 'boolean', default: false })
  requiresApprovalWorkflow: boolean;

  @Column({ name: 'approval_workflow_template_id', type: 'uuid', nullable: true })
  approvalWorkflowTemplateId: string;

  @Column({ name: 'requires_executive_sponsor', type: 'boolean', default: false })
  requiresExecutiveSponsor: boolean;

  @Column({ name: 'requires_project_manager', type: 'boolean', default: true })
  requiresProjectManager: boolean;

  // Risk & Compliance
  @Column({ name: 'requires_risk_assessment', type: 'boolean', default: false })
  requiresRiskAssessment: boolean;

  @Column({ name: 'requires_compliance_check', type: 'boolean', default: false })
  requiresComplianceCheck: boolean;

  @Column({ name: 'regulatory_framework', length: 100, nullable: true })
  regulatoryFramework: string;

  // Integration Flags
  @Column({ name: 'enables_timesheets', type: 'boolean', default: true })
  enablesTimesheets: boolean;

  @Column({ name: 'enables_expenses', type: 'boolean', default: true })
  enablesExpenses: boolean;

  @Column({ name: 'enables_invoicing', type: 'boolean', default: true })
  enablesInvoicing: boolean;

  @Column({ name: 'enables_purchase_orders', type: 'boolean', default: false })
  enablesPurchaseOrders: boolean;

  @ Column({ name: 'enables_resource_planning', type: 'boolean', default: true })
  enablesResourcePlanning: boolean;

  // Default References
  @Column({ name: 'default_lifecycle_template_id', type: 'uuid', nullable: true })
  defaultLifecycleTemplateId: string;

  @Column({ name: 'default_structure_template_id', type: 'uuid', nullable: true })
  defaultStructureTemplateId: string;

  @Column({ name: 'default_governance_rule_set_id', type: 'uuid', nullable: true })
  defaultGovernanceRuleSetId: string;

  // Scope & Organizational Mapping
  @Column({ name: 'scope_type', length: 50, nullable: true })
  scopeType: string;

  @Column({ name: 'scope_entity_id', type: 'uuid', nullable: true })
  scopeEntityId: string;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string;

  @Column({ name: 'business_unit_id', type: 'uuid', nullable: true })
  businessUnitId: string;

  // Versioning & Governance
  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'effective_start_date', type: 'date' })
  @Index()
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'date', nullable: true })
  @Index()
  effectiveEndDate: Date;

  @Column({ name: 'status', length: 50, default: 'DRAFT' })
  @Index()
  status: string;

  // Custom Extensibility
  @Column({ name: 'custom_attributes', type: 'jsonb', nullable: true })
  customAttributes: Record<string, any>;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[];

  // Metadata
  @Column({ name: 'configuration_source', length: 100, nullable: true })
  configurationSource: string;

  @Column({ name: 'external_reference_id', length: 255, nullable: true })
  externalReferenceId: string;

  // Approval
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
  @ManyToOne(() => ProjectType, { nullable: true })
  @JoinColumn({ name: 'parent_type_id' })
  parentType: ProjectType;

  @OneToMany(() => ProjectType, (type) => type.parentType)
  childTypes: ProjectType[];

  @OneToMany(() => ProjectGovernanceRuleMapping, (mapping) => mapping.projectType)
  governanceRuleMappings: ProjectGovernanceRuleMapping[];

  @OneToMany(() => ProjectResourceAllocationSettings, (settings) => settings.projectType)
  resourceAllocationSettings: ProjectResourceAllocationSettings[];

  @OneToMany(() => ProjectBillingCostSettings, (settings) => settings.projectType)
  billingCostSettings: ProjectBillingCostSettings[];
}

// ==============================================
// ENTITY 2: PROJECT CATEGORY
// ==============================================

@Entity('project_categories')
@Index(['tenantId', 'categoryCode'])
@Index(['parentCategoryId'])
@Index(['hierarchyPath'])
@Unique(['tenantId', 'categoryCode'])
export class ProjectCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Identification
  @Column({ name: 'category_code', length: 50 })
  @Index()
  categoryCode: string;

  @Column({ name: 'category_name', length: 255 })
  categoryName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Hierarchy
  @Column({ name: 'parent_category_id', type: 'uuid', nullable: true })
  @Index()
  parentCategoryId: string;

  @Column({ name: 'hierarchy_path', type: 'text', nullable: true })
  @Index()
  hierarchyPath: string;

  @Column({ name: 'hierarchy_level', type: 'int', default: 0 })
  hierarchyLevel: number;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  // Classification
  @Column({ name: 'category_type', length: 50, nullable: true })
  categoryType: string;

  @Column({ name: 'business_domain', length: 100, nullable: true })
  businessDomain: string;

  // Governance
  @Column({ name: 'requires_executive_approval', type: 'boolean', default: false })
  requiresExecutiveApproval: boolean;

  @Column({ name: 'reporting_frequency', length: 50, nullable: true })
  reportingFrequency: string;

  // Versioning
  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'effective_start_date', type: 'date' })
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'date', nullable: true })
  effectiveEndDate: Date;

  @Column({ name: 'status', length: 50, default: 'DRAFT' })
  status: string;

  // Custom
  @Column({ name: 'custom_attributes', type: 'jsonb', nullable: true })
  customAttributes: Record<string, any>;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[];

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

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
  @ManyToOne(() => ProjectCategory, { nullable: true })
  @JoinColumn({ name: 'parent_category_id' })
  parentCategory: ProjectCategory;

  @OneToMany(() => ProjectCategory, (category) => category.parentCategory)
  childCategories: ProjectCategory[];
}

// ==============================================
// ENTITY 3: PROJECT LIFECYCLE TEMPLATE
// ==============================================

@Entity('project_lifecycle_templates')
@Index(['tenantId', 'templateCode'])
@Unique(['tenantId', 'templateCode'])
export class ProjectLifecycleTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Identification
  @Column({ name: 'template_code', length: 50 })
  @Index()
  templateCode: string;

  @Column({ name: 'template_name', length: 255 })
  templateName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Configuration
  @Column({ name: 'total_stages', type: 'int', default: 5 })
  totalStages: number;

  @Column({ name: 'is_default_template', type: 'boolean', default: false })
  isDefaultTemplate: boolean;

  @Column({ name: 'allows_stage_skip', type: 'boolean', default: false })
  allowsStageSkip: boolean;

  @Column({ name: 'allows_stage_repeat', type: 'boolean', default: false })
  allowsStageRepeat: boolean;

  @Column({ name: 'requires_sequential_progression', type: 'boolean', default: true })
  requiresSequentialProgression: boolean;

  // Governance
  @Column({ name: 'requires_gate_reviews', type: 'boolean', default: false })
  requiresGateReviews: boolean;

  @Column({ name: 'mandatory_stage_count', type: 'int', default: 0 })
  mandatoryStageCount: number;

  // Versioning
  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'effective_start_date', type: 'date' })
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'date', nullable: true })
  effectiveEndDate: Date;

  @Column({ name: 'status', length: 50, default: 'DRAFT' })
  status: string;

  // Custom
  @Column({ name: 'custom_attributes', type: 'jsonb', nullable: true })
  customAttributes: Record<string, any>;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[];

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

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
  @OneToMany(() => ProjectLifecycleStage, (stage) => stage.lifecycleTemplate)
  stages: ProjectLifecycleStage[];
}

// ==============================================
// ENTITY 4: PROJECT LIFECYCLE STAGE
// ==============================================

@Entity('project_lifecycle_stages')
@Index(['tenantId', 'lifecycleTemplateId'])
@Index(['stageOrder'])
@Unique(['lifecycleTemplateId', 'stageCode'])
@Unique(['lifecycleTemplateId', 'stageOrder'])
export class ProjectLifecycleStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'lifecycle_template_id', type: 'uuid' })
  lifecycleTemplateId: string;

  // Identification
  @Column({ name: 'stage_code', length: 50 })
  stageCode: string;

  @Column({ name: 'stage_name', length: 255 })
  stageName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Stage Configuration
  @Column({ name: 'stage_type', type: 'enum', enum: LifecycleStageType })
  stageType: LifecycleStageType;

  @Column({ name: 'stage_order', type: 'int' })
  @Index()
  stageOrder: number;

  @Column({ name: 'is_mandatory', type: 'boolean', default: true })
  isMandatory: boolean;

  // Entry/Exit Conditions
  @Column({ name: 'entry_conditions', type: 'text', nullable: true })
  entryConditions: string;

  @Column({ name: 'exit_conditions', type: 'text', nullable: true })
  exitConditions: string;

  @Column({ name: 'required_deliverables', type: 'text', array: true, nullable: true })
  requiredDeliverables: string[];

  // Approval Configuration
  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ name: 'approval_roles', type: 'text', array: true, nullable: true })
  approvalRoles: string[];

  @Column({ name: 'approval_threshold', type: 'int', default: 1 })
  approvalThreshold: number;

  // Duration Estimates
  @Column({ name: 'estimated_duration_days', type: 'int', nullable: true })
  estimatedDurationDays: number;

  @Column({ name: 'min_duration_days', type: 'int', nullable: true })
  minDurationDays: number;

  @Column({ name: 'max_duration_days', type: 'int', nullable: true })
  maxDurationDays: number;

  // Allowed Actions
  @Column({ name: 'allowed_role_actions', type: 'jsonb', nullable: true })
  allowedRoleActions: Record<string, any>;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ProjectLifecycleTemplate, (template) => template.stages)
  @JoinColumn({ name: 'lifecycle_template_id' })
  lifecycleTemplate: ProjectLifecycleTemplate;
}

// ==============================================
// ENTITY 5: PROJECT GOVERNANCE RULE
// ==============================================

@Entity('project_governance_rules')
@Index(['tenantId', 'ruleCode'])
@Index(['ruleCategory'])
@Unique(['tenantId', 'ruleCode'])
export class ProjectGovernanceRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Identification
  @Column({ name: 'rule_code', length: 50 })
  @Index()
  ruleCode: string;

  @Column({ name: 'rule_name', length: 255 })
  ruleName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Rule Configuration
  @Column({ name: 'rule_category', length: 100, nullable: true })
  @Index()
  ruleCategory: string;

  @Column({ name: 'enforcement_level', type: 'enum', enum: GovernanceEnforcementLevel, default: GovernanceEnforcementLevel.SOFT })
  enforcementLevel: GovernanceEnforcementLevel;

  // Conditions
  @Column({ name: 'applies_when_condition', type: 'text', nullable: true })
  appliesWhenCondition: string;

  @Column({ name: 'validation_logic', type: 'text', nullable: true })
  validationLogic: string;

  // Workflow
  @Column({ name: 'requires_approval_workflow', type: 'boolean', default: false })
  requiresApprovalWorkflow: boolean;

  @Column({ name: 'approval_workflow_template_id', type: 'uuid', nullable: true })
  approvalWorkflowTemplateId: string;

  @Column({ name: 'escalation_path', type: 'text', array: true, nullable: true })
  escalationPath: string[];

  // Thresholds
  @Column({ name: 'threshold_value', type: 'decimal', precision: 15, scale: 2, nullable: true })
  thresholdValue: number;

  @Column({ name: 'threshold_unit', length: 50, nullable: true })
  thresholdUnit: string;

  // Actions
  @Column({ name: 'on_violation_action', length: 100, nullable: true })
  onViolationAction: string;

  @Column({ name: 'notification_recipients', type: 'text', array: true, nullable: true })
  notificationRecipients: string[];

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'effective_start_date', type: 'date' })
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'date', nullable: true })
  effectiveEndDate: Date;

  // Custom
  @Column({ name: 'custom_attributes', type: 'jsonb', nullable: true })
  customAttributes: Record<string, any>;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

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
  @OneToMany(() => ProjectGovernanceRuleMapping, (mapping) => mapping.governanceRule)
  projectTypeMappings: ProjectGovernanceRuleMapping[];
}

// ==============================================
// ENTITY 6: PROJECT GOVERNANCE RULE MAPPING
// ==============================================

@Entity('project_governance_rule_mappings')
@Index(['tenantId', 'projectTypeId'])
@Index(['tenantId', 'governanceRuleId'])
@Unique(['projectTypeId', 'governanceRuleId'])
export class ProjectGovernanceRuleMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'project_type_id', type: 'uuid' })
  projectTypeId: string;

  @Column({ name: 'governance_rule_id', type: 'uuid' })
  governanceRuleId: string;

  // Configuration
  @Column({ name: 'is_mandatory', type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ name: 'override_allowed', type: 'boolean', default: false })
  overrideAllowed: boolean;

  @Column({ name: 'custom_threshold', type: 'decimal', precision: 15, scale: 2, nullable: true })
  customThreshold: number;

  // Effective Dating
  @Column({ name: 'effective_start_date', type: 'date' })
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'date', nullable: true })
  effectiveEndDate: Date;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ProjectType, (type) => type.governanceRuleMappings)
  @JoinColumn({ name: 'project_type_id' })
  projectType: ProjectType;

  @ManyToOne(() => ProjectGovernanceRule, (rule) => rule.projectTypeMappings)
  @JoinColumn({ name: 'governance_rule_id' })
  governanceRule: ProjectGovernanceRule;
}

// ==============================================
// ENTITY 7: PROJECT STRUCTURE TEMPLATE
// ==============================================

@Entity('project_structure_templates')
@Index(['tenantId', 'templateCode'])
@Unique(['tenantId', 'templateCode'])
export class ProjectStructureTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Identification
  @Column({ name: 'template_code', length: 50 })
  @Index()
  templateCode: string;

  @Column({ name: 'template_name', length: 255 })
  templateName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Hierarchy Configuration
  @Column({ name: 'max_hierarchy_depth', type: 'int', default: 5 })
  maxHierarchyDepth: number;

  @Column({ name: 'supports_phases', type: 'boolean', default: true })
  supportsPhases: boolean;

  @Column({ name: 'supports_milestones', type: 'boolean', default: true })
  supportsMilestones: boolean;

  @Column({ name: 'supports_tasks', type: 'boolean', default: true })
  supportsTasks: boolean;

  @Column({ name: 'supports_subtasks', type: 'boolean', default: false })
  supportsSubtasks: boolean;

  // Level Configuration
  @Column({ name: 'mandatory_levels', type: 'text', array: true, nullable: true })
  mandatoryLevels: string[];

  @Column({ name: 'optional_levels', type: 'text', array: true, nullable: true })
  optionalLevels: string[];

  // Dependency Configuration
  @Column({ name: 'allows_cross_phase_dependencies', type: 'boolean', default: true })
  allowsCrossPhaseDependencies: boolean;

  @Column({ name: 'allows_circular_dependencies', type: 'boolean', default: false })
  allowsCircularDependencies: boolean;

  // WBS Configuration
  @Column({ name: 'requires_wbs_codes', type: 'boolean', default: false })
  requiresWbsCodes: boolean;

  @Column({ name: 'wbs_code_format', length: 100, nullable: true })
  wbsCodeFormat: string;

  // Template Configuration
  @Column({ name: 'is_default_template', type: 'boolean', default: false })
  isDefaultTemplate: boolean;

  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'effective_start_date', type: 'date' })
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'date', nullable: true })
  effectiveEndDate: Date;

  @Column({ name: 'status', length: 50, default: 'DRAFT' })
  status: string;

  // Custom
  @Column({ name: 'custom_attributes', type: 'jsonb', nullable: true })
  customAttributes: Record<string, any>;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[];

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

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
  @OneToMany(() => ProjectStructureLevel, (level) => level.structureTemplate)
  levels: ProjectStructureLevel[];
}

// ==============================================
// ENTITY 8: PROJECT STRUCTURE LEVEL
// ==============================================

@Entity('project_structure_levels')
@Index(['tenantId', 'structureTemplateId'])
@Index(['levelOrder'])
@Unique(['structureTemplateId', 'levelCode'])
@Unique(['structureTemplateId', 'levelOrder'])
export class ProjectStructureLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'structure_template_id', type: 'uuid' })
  structureTemplateId: string;

  // Identification
  @Column({ name: 'level_code', length: 50 })
  levelCode: string;

  @Column({ name: 'level_name', length: 255 })
  levelName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // Level Configuration
  @Column({ name: 'level_order', type: 'int' })
  @Index()
  levelOrder: number;

  @Column({ name: 'level_depth', type: 'int' })
  levelDepth: number;

  @Column({ name: 'is_mandatory', type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ name: 'parent_level_code', length: 50, nullable: true })
  parentLevelCode: string;

  // Item Constraints
  @Column({ name: 'min_items', type: 'int', nullable: true })
  minItems: number;

  @Column({ name: 'max_items', type: 'int', nullable: true })
  maxItems: number;

  // Capabilities
  @Column({ name: 'allows_activities', type: 'boolean', default: true })
  allowsActivities: boolean;

  @Column({ name: 'allows_resources', type: 'boolean', default: true })
  allowsResources: boolean;

  @Column({ name: 'allows_budget', type: 'boolean', default: true })
  allowsBudget: boolean;

  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval: boolean;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ProjectStructureTemplate, (template) => template.levels)
  @JoinColumn({ name: 'structure_template_id' })
  structureTemplate: ProjectStructureTemplate;
}

// ==============================================
// ENTITY 9: PROJECT RESOURCE ALLOCATION SETTINGS
// ==============================================

@Entity('project_resource_allocation_settings')
@Index(['tenantId', 'projectTypeId'])
@Unique(['projectTypeId'])
export class ProjectResourceAllocationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'project_type_id', type: 'uuid' })
  projectTypeId: string;

  // Allocation Model
  @Column({ name: 'allocation_model', type: 'enum', enum: ResourceAllocationModel, default: ResourceAllocationModel.ROLE_BASED })
  allocationModel: ResourceAllocationModel;

  // Resource Constraints
  @Column({ name: 'min_resource_count', type: 'int', nullable: true })
  minResourceCount: number;

  @Column({ name: 'max_resource_count', type: 'int', nullable: true })
  maxResourceCount: number;

  @Column({ name: 'requires_named_resources', type: 'boolean', default: false })
  requiresNamedResources: boolean;

  // Resource Pool Configuration
  @Column({ name: 'default_resource_pool_id', type: 'uuid', nullable: true })
  defaultResourcePoolId: string;

  @Column({ name: 'allows_cross_pool_allocation', type: 'boolean', default: true })
  allowsCrossPoolAllocation: boolean;

  // External Resources
  @Column({ name: 'allows_external_resources', type: 'boolean', default: true })
  allowsExternalResources: boolean;

  @Column({ name: 'max_external_resource_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxExternalResourcePercentage: number;

  @Column({ name: 'requires_external_approval', type: 'boolean', default: false })
  requiresExternalApproval: boolean;

  // Skill Matching
  @Column({ name: 'requires_skill_matching', type: 'boolean', default: false })
  requiresSkillMatching: boolean;

  @Column({ name: 'min_skill_level', type: 'int', nullable: true })
  minSkillLevel: number;

  @Column({ name: 'preferred_skill_tags', type: 'jsonb', nullable: true })
  preferredSkillTags: string[];

  // Allocation Percentage
  @Column({ name: 'default_allocation_percentage', type: 'decimal', precision: 5, scale: 2, default: 100.00 })
  defaultAllocationPercentage: number;

  @Column({ name: 'min_allocation_percentage', type: 'decimal', precision: 5, scale: 2, default: 10.00 })
  minAllocationPercentage: number;

  @Column({ name: 'max_allocation_percentage', type: 'decimal', precision: 5, scale: 2, default: 100.00 })
  maxAllocationPercentage: number;

  // Overallocation Rules
  @Column({ name: 'allows_overallocation', type: 'boolean', default: false })
  allowsOverallocation: boolean;

  @Column({ name: 'max_concurrent_projects', type: 'int', default: 3 })
  maxConcurrentProjects: number;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => ProjectType, (type) => type.resourceAllocationSettings)
  @JoinColumn({ name: 'project_type_id' })
  projectType: ProjectType;
}

// ==============================================
// ENTITY 10: PROJECT BILLING COST SETTINGS
// ==============================================

@Entity('project_billing_cost_settings')
@Index(['tenantId', 'projectTypeId'])
@Unique(['projectTypeId'])
export class ProjectBillingCostSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'project_type_id', type: 'uuid' })
  projectTypeId: string;

  // Billing Model
  @Column({ name: 'billing_model', type: 'enum', enum: BillingModel, default: BillingModel.TIME_AND_MATERIAL })
  billingModel: BillingModel;

  @Column({ name: 'billing_currency', length: 3, default: 'USD' })
  billingCurrency: string;

  @Column({ name: 'billing_frequency', length: 50, default: 'MONTHLY' })
  billingFrequency: string;

  // Revenue Recognition
  @Column({ name: 'revenue_recognition_method', type: 'enum', enum: RevenueRecognitionMethod, default: RevenueRecognitionMethod.PERCENTAGE_COMPLETION })
  revenueRecognitionMethod: RevenueRecognitionMethod;

  @Column({ name: 'revenue_recognition_trigger', length: 100, nullable: true })
  revenueRecognitionTrigger: string;

  // Cost Tracking
  @Column({ name: 'cost_tracking_enabled', type: 'boolean', default: true })
  costTrackingEnabled: boolean;

  @Column({ name: 'cost_allocation_method', length: 50, default: 'DIRECT' })
  costAllocationMethod: string;

  @Column({ name: 'overhead_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  overheadPercentage: number;

  // Margin Tracking
  @Column({ name: 'margin_tracking_enabled', type: 'boolean', default: true })
  marginTrackingEnabled: boolean;

  @Column({ name: 'target_margin_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  targetMarginPercentage: number;

  @Column({ name: 'min_margin_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  minMarginPercentage: number;

  // Budget Control
  @Column({ name: 'budget_control_mode', type: 'enum', enum: BudgetControlMode, default: BudgetControlMode.ADVISORY })
  budgetControlMode: BudgetControlMode;

  @Column({ name: 'budget_variance_threshold', type: 'decimal', precision: 5, scale: 2, nullable: true })
  budgetVarianceThreshold: number;

  @Column({ name: 'alerts_on_budget_deviation', type: 'boolean', default: true })
  alertsOnBudgetDeviation: boolean;

  // Progress Billing
  @Column({ name: 'allows_progress_billing', type: 'boolean', default: true })
  allowsProgressBilling: boolean;

  @Column({ name: 'requires_milestone_approval', type: 'boolean', default: false })
  requiresMilestoneApproval: boolean;

  @Column({ name: 'invoice_payment_terms', type: 'int', default: 30 })
  invoicePaymentTerms: number;

  // Rate Card
  @Column({ name: 'default_rate_card_id', type: 'uuid', nullable: true })
  defaultRateCardId: string;

  @Column({ name: 'allows_rate_override', type: 'boolean', default: false })
  allowsRateOverride: boolean;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => ProjectType, (type) => type.billingCostSettings)
  @JoinColumn({ name: 'project_type_id' })
  projectType: ProjectType;
}

// ==============================================
// ENTITY 11: PROJECT CONFIGURATION SCOPE MAPPING
// ==============================================

@Entity('project_configuration_scope_mappings')
@Index(['tenantId', 'configurationType', 'configurationId'])
@Index(['scopeType', 'scopeEntityId'])
@Unique(['configurationType', 'configurationId', 'scopeType', 'scopeEntityId'])
export class ProjectConfigurationScopeMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Polymorphic Configuration Reference
  @Column({ name: 'configuration_type', length: 50 })
  configurationType: string;

  @Column({ name: 'configuration_id', type: 'uuid' })
  configurationId: string;

  // Scope
  @Column({ name: 'scope_type', length: 50 })
  scopeType: string;

  @Column({ name: 'scope_entity_id', type: 'uuid' })
  scopeEntityId: string;

  @Column({ name: 'scope_entity_name', length: 255, nullable: true })
  scopeEntityName: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  // Effective Dating
  @Column({ name: 'effective_start_date', type: 'date' })
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'date', nullable: true })
  effectiveEndDate: Date;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// ==============================================
// ENTITY 12: PROJECT CONFIGURATION VERSION
// ==============================================

@Entity('project_configuration_versions')
@Index(['tenantId', 'configurationType', 'configurationId'])
@Index(['versionNumber'])
@Unique(['configurationType', 'configurationId', 'versionNumber'])
export class ProjectConfigurationVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Polymorphic Configuration Reference
  @Column({ name: 'configuration_type', length: 50 })
  configurationType: string;

  @Column({ name: 'configuration_id', type: 'uuid' })
  configurationId: string;

  // Version Information
  @Column({ name: 'version_number', type: 'int' })
  @Index()
  versionNumber: number;

  @Column({ name: 'change_type', length: 50 })
  changeType: string;

  @Column({ name: 'change_description', type: 'text', nullable: true })
  changeDescription: string;

  // Snapshot
  @Column({ name: 'configuration_snapshot', type: 'jsonb' })
  configurationSnapshot: Record<string, any>;

  @Column({ name: 'changed_fields', type: 'jsonb', nullable: true })
  changedFields: Record<string, any>;

  // Effective Dating
  @Column({ name: 'effective_from', type: 'timestamp' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'timestamp', nullable: true })
  effectiveTo: Date;

  // Change Metadata
  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason: string;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy: string;

  // Approval
  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// ==============================================
// ENTITY 13: PROJECT CONFIGURATION DEPENDENCY
// ==============================================

@Entity('project_configuration_dependencies')
@Index(['tenantId', 'sourceConfigType', 'sourceConfigId'])
@Index(['dependentEntityType', 'dependentEntityId'])
export class ProjectConfigurationDependency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Source Configuration
  @Column({ name: 'source_config_type', length: 50 })
  sourceConfigType: string;

  @Column({ name: 'source_config_id', type: 'uuid' })
  sourceConfigId: string;

  // Dependent Entity
  @Column({ name: 'dependent_entity_type', length: 100 })
  dependentEntityType: string;

  @Column({ name: 'dependent_entity_id', type: 'uuid' })
  dependentEntityId: string;

  @Column({ name: 'dependent_entity_name', length: 255, nullable: true })
  dependentEntityName: string;

  // Dependency Configuration
  @Column({ name: 'dependency_type', length: 50, default: 'REQUIRED' })
  dependencyType: string;

  @Column({ name: 'is_blocking', type: 'boolean', default: true })
  isBlocking: boolean;

  @Column({ name: 'dependency_metadata', type: 'jsonb', nullable: true })
  dependencyMetadata: Record<string, any>;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// ==============================================
// ENTITY 14: PROJECT CONFIGURATION AUDIT LOG
// ==============================================

@Entity('project_configuration_audit_logs')
@Index(['tenantId', 'configurationType', 'configurationId'])
@Index(['actionType'])
@Index(['performedBy'])
@Index(['performedAt'])
export class ProjectConfigurationAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Configuration Reference
  @Column({ name: 'configuration_type', length: 50 })
  configurationType: string;

  @Column({ name: 'configuration_id', type: 'uuid' })
  configurationId: string;

  @Column({ name: 'configuration_code', length: 50, nullable: true })
  configurationCode: string;

  // Action Details
  @Column({ name: 'action_type', length: 50 })
  @Index()
  actionType: string;

  @Column({ name: 'action_description', type: 'text', nullable: true })
  actionDescription: string;

  // State Tracking
  @Column({ name: 'before_state', type: 'jsonb', nullable: true })
  beforeState: Record<string, any>;

  @Column({ name: 'after_state', type: 'jsonb', nullable: true })
  afterState: Record<string, any>;

  @Column({ name: 'changed_fields', type: 'text', array: true, nullable: true })
  changedFields: string[];

  // Actor Information
  @Column({ name: 'performed_by', type: 'uuid' })
  @Index()
  performedBy: string;

  @Column({ name: 'performed_by_name', length: 255, nullable: true })
  performedByName: string;

  @Column({ name: 'performed_by_role', length: 100, nullable: true })
  performedByRole: string;

  @Column({ name: 'performed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  performedAt: Date;

  // Request Context
  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', length: 500, nullable: true })
  userAgent: string;

  // Additional Context
  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason: string;

  @Column({ name: 'approval_status', length: 50, nullable: true })
  approvalStatus: string;
}
