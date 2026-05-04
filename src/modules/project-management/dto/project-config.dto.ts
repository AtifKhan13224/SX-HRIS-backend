import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  MaxLength,
  Min,
  Max,
  IsInt,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ProjectTypeCategory,
  BillingModel,
  BudgetControlMode,
  StaffingRequirement,
  LifecycleStageType,
  GovernanceEnforcementLevel,
  ResourceAllocationModel,
  RevenueRecognitionMethod,
} from '../entities/project-config.entity';

/**
 * PROJECT CONFIGURATION FRAMEWORK - DTOs
 * Data Transfer Objects for Project Configuration API
 */

// ==============================================
// PROJECT TYPE DTOs
// ==============================================

export class CreateProjectTypeDto {
  @ApiProperty({ description: ' Project type unique code', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  projectTypeCode: string;

  @ApiProperty({ description: 'Project type name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  projectTypeName: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Default project category', enum: ProjectTypeCategory })
  @IsEnum(ProjectTypeCategory)
  defaultProjectCategory: ProjectTypeCategory;

  @ApiPropertyOptional({ description: 'Parent project type ID for hierarchy', type: 'string', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  parentTypeId?: string;

  @ApiPropertyOptional({ description: 'Default billing model', enum: BillingModel })
  @IsEnum(BillingModel)
  @IsOptional()
  defaultBillingModel?: BillingModel;

  @ApiPropertyOptional({ description: 'Default currency', maxLength: 3 })
  @IsString()
  @MaxLength(3)
  @IsOptional()
  defaultCurrency?: string;

  @ApiPropertyOptional({ description: 'Default budget control mode', enum: BudgetControlMode })
  @IsEnum(BudgetControlMode)
  @IsOptional()
  defaultBudgetControlMode?: BudgetControlMode;

  @ApiPropertyOptional({ description: 'Requires budget approval' })
  @IsBoolean()
  @IsOptional()
  requiresBudgetApproval?: boolean;

  @ApiPropertyOptional({ description: 'Budget approval threshold' })
  @IsNumber()
  @IsOptional()
  budgetApprovalThreshold?: number;

  @ApiPropertyOptional({ description: 'Requires time tracking' })
  @IsBoolean()
  @IsOptional()
  requiresTimeTracking?: boolean;

  @ApiPropertyOptional({ description: 'Time tracking granularity: HOURLY, DAILY, WEEKLY' })
  @IsString()
  @IsOptional()
  timeTrackingGranularity?: string;

  @ApiPropertyOptional({ description: 'Allows overtime tracking' })
  @IsBoolean()
  @IsOptional()
  allowsOvertimeTracking?: boolean;

  @ApiPropertyOptional({ description: 'Default staffing requirement', enum: StaffingRequirement })
  @IsEnum(StaffingRequirement)
  @IsOptional()
  defaultStaffingRequirement?: StaffingRequirement;

  @ApiPropertyOptional({ description: 'Requires resource allocation' })
  @IsBoolean()
  @IsOptional()
  requiresResourceAllocation?: boolean;

  @ApiPropertyOptional({ description: 'Allows external resources' })
  @IsBoolean()
  @IsOptional()
  allowsExternalResources?: boolean;

  @ApiPropertyOptional({ description: 'Minimum team size' })
  @IsInt()
  @IsOptional()
  @Min(0)
  minTeamSize?: number;

  @ApiPropertyOptional({ description: 'Maximum team size' })
  @IsInt()
  @IsOptional()
  @Min(0)
  maxTeamSize?: number;

  @ApiPropertyOptional({ description: 'Is billable project' })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;

  @ApiPropertyOptional({ description: 'Is capitalized' })
  @IsBoolean()
  @IsOptional()
  isCapitalized?: boolean;

  @ApiPropertyOptional({ description: 'Requires client assignment' })
  @IsBoolean()
  @IsOptional()
  requiresClientAssignment?: boolean;

  @ApiPropertyOptional({ description: 'Requires contract reference' })
  @IsBoolean()
  @IsOptional()
  requiresContractReference?: boolean;

  @ApiPropertyOptional({ description: 'Allows subprojects' })
  @IsBoolean()
  @IsOptional()
  allowsSubprojects?: boolean;

  @ApiPropertyOptional({ description: 'Maximum subproject depth' })
  @IsInt()
  @IsOptional()
  @Min(0)
  maxSubprojectDepth?: number;

  @ApiPropertyOptional({ description: 'Requires approval workflow' })
  @IsBoolean()
  @IsOptional()
  requiresApprovalWorkflow?: boolean;

  @ApiPropertyOptional({ description: 'Approval workflow template ID' })
  @IsUUID()
  @IsOptional()
  approvalWorkflowTemplateId?: string;

  @ApiPropertyOptional({ description: 'Requires executive sponsor' })
  @IsBoolean()
  @IsOptional()
  requiresExecutiveSponsor?: boolean;

  @ApiPropertyOptional({ description: 'Requires project manager' })
  @IsBoolean()
  @IsOptional()
  requiresProjectManager?: boolean;

  @ApiPropertyOptional({ description: 'Requires risk assessment' })
  @IsBoolean()
  @IsOptional()
  requiresRiskAssessment?: boolean;

  @ApiPropertyOptional({ description: 'Requires compliance check' })
  @IsBoolean()
  @IsOptional()
  requiresComplianceCheck?: boolean;

  @ApiPropertyOptional({ description: 'Regulatory framework' })
  @IsString()
  @IsOptional()
  regulatoryFramework?: string;

  @ApiPropertyOptional({ description: 'Enables timesheets' })
  @IsBoolean()
  @IsOptional()
  enablesTimesheets?: boolean;

  @ApiPropertyOptional({ description: 'Enables expenses' })
  @IsBoolean()
  @IsOptional()
  enablesExpenses?: boolean;

  @ApiPropertyOptional({ description: 'Enables invoicing' })
  @IsBoolean()
  @IsOptional()
  enablesInvoicing?: boolean;

  @ApiPropertyOptional({ description: 'Enables purchase orders' })
  @IsBoolean()
  @IsOptional()
  enablesPurchaseOrders?: boolean;

  @ApiPropertyOptional({ description: 'Enables resource planning' })
  @IsBoolean()
  @IsOptional()
  enablesResourcePlanning?: boolean;

  @ApiPropertyOptional({ description: 'Default lifecycle template ID' })
  @IsUUID()
  @IsOptional()
  defaultLifecycleTemplateId?: string;

  @ApiPropertyOptional({ description: 'Default structure template ID' })
  @IsUUID()
  @IsOptional()
  defaultStructureTemplateId?: string;

  @ApiPropertyOptional({ description: 'Default governance rule set ID' })
  @IsUUID()
  @IsOptional()
  defaultGovernanceRuleSetId?: string;

  @ApiProperty({ description: 'Effective start date', type: 'string', format: 'date' })
  @IsDateString()
  effectiveStartDate: string;

  @ApiPropertyOptional({ description: 'Effective end date', type: 'string', format: 'date' })
  @IsDateString()
  @IsOptional()
  effectiveEndDate?: string;

  @ApiPropertyOptional({ description: 'Custom attributes (JSONB)', type: 'object' })
  @IsObject()
  @IsOptional()
  customAttributes?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateProjectTypeDto {
  @ApiPropertyOptional({ description: 'Project type name' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  projectTypeName?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Default project category', enum: ProjectTypeCategory })
  @IsEnum(ProjectTypeCategory)
  @IsOptional()
  defaultProjectCategory?: ProjectTypeCategory;

  @ApiPropertyOptional({ description: 'Parent project type ID' })
  @IsUUID()
  @IsOptional()
  parentTypeId?: string;

  @ApiPropertyOptional({ description: 'Default billing model', enum: BillingModel })
  @IsEnum(BillingModel)
  @IsOptional()
  defaultBillingModel?: BillingModel;

  @ApiPropertyOptional({ description: 'Default currency' })
  @IsString()
  @IsOptional()
  defaultCurrency?: string;

  @ApiPropertyOptional({ description: 'Default budget control mode', enum: BudgetControlMode })
  @IsEnum(BudgetControlMode)
  @IsOptional()
  defaultBudgetControlMode?: BudgetControlMode;

  @ApiPropertyOptional({ description: 'Requires budget approval' })
  @IsBoolean()
  @IsOptional()
  requiresBudgetApproval?: boolean;

  @ApiPropertyOptional({ description: 'Budget approval threshold' })
  @IsNumber()
  @IsOptional()
  budgetApprovalThreshold?: number;

  @ApiPropertyOptional({ description: 'Requires time tracking' })
  @IsBoolean()
  @IsOptional()
  requiresTimeTracking?: boolean;

  @ApiPropertyOptional({ description: 'Time tracking granularity' })
  @IsString()
  @IsOptional()
  timeTrackingGranularity?: string;

  @ApiPropertyOptional({ description: 'Allows overtime tracking' })
  @IsBoolean()
  @IsOptional()
  allowsOvertimeTracking?: boolean;

  @ApiPropertyOptional({ description: 'Default staffing requirement', enum: StaffingRequirement })
  @IsEnum(StaffingRequirement)
  @IsOptional()
  defaultStaffingRequirement?: StaffingRequirement;

  @ApiPropertyOptional({ description: 'Requires resource allocation' })
  @IsBoolean()
  @IsOptional()
  requiresResourceAllocation?: boolean;

  @ApiPropertyOptional({ description: 'Allows external resources' })
  @IsBoolean()
  @IsOptional()
  allowsExternalResources?: boolean;

  @ApiPropertyOptional({ description: 'Minimum team size' })
  @IsInt()
  @IsOptional()
  minTeamSize?: number;

  @ApiPropertyOptional({ description: 'Maximum team size' })
  @IsInt()
  @IsOptional()
  maxTeamSize?: number;

  @ApiPropertyOptional({ description: 'Is billable' })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;

  @ApiPropertyOptional({ description: 'Is capitalized' })
  @IsBoolean()
  @IsOptional()
  isCapitalized?: boolean;

  @ApiPropertyOptional({ description: 'Requires client assignment' })
  @IsBoolean()
  @IsOptional()
  requiresClientAssignment?: boolean;

  @ApiPropertyOptional({ description: 'Requires contract reference' })
  @IsBoolean()
  @IsOptional()
  requiresContractReference?: boolean;

  @ApiPropertyOptional({ description: 'Allows subprojects' })
  @IsBoolean()
  @IsOptional()
  allowsSubprojects?: boolean;

  @ApiPropertyOptional({ description: 'Maximum subproject depth' })
  @IsInt()
  @IsOptional()
  maxSubprojectDepth?: number;

  @ApiPropertyOptional({ description: 'Requires approval workflow' })
  @IsBoolean()
  @IsOptional()
  requiresApprovalWorkflow?: boolean;

  @ApiPropertyOptional({ description: 'Approval workflow template ID' })
  @IsUUID()
  @IsOptional()
  approvalWorkflowTemplateId?: string;

  @ApiPropertyOptional({ description: 'Requires executive sponsor' })
  @IsBoolean()
  @IsOptional()
  requiresExecutiveSponsor?: boolean;

  @ApiPropertyOptional({ description: 'Requires project manager' })
  @IsBoolean()
  @IsOptional()
  requiresProjectManager?: boolean;

  @ApiPropertyOptional({ description: 'Requires risk assessment' })
  @IsBoolean()
  @IsOptional()
  requiresRiskAssessment?: boolean;

  @ApiPropertyOptional({ description: 'Requires compliance check' })
  @IsBoolean()
  @IsOptional()
  requiresComplianceCheck?: boolean;

  @ApiPropertyOptional({ description: 'Regulatory framework' })
  @IsString()
  @IsOptional()
  regulatoryFramework?: string;

  @ApiPropertyOptional({ description: 'Enables timesheets' })
  @IsBoolean()
  @IsOptional()
  enablesTimesheets?: boolean;

  @ApiPropertyOptional({ description: 'Enables expenses' })
  @IsBoolean()
  @IsOptional()
  enablesExpenses?: boolean;

  @ApiPropertyOptional({ description: 'Enables invoicing' })
  @IsBoolean()
  @IsOptional()
  enablesInvoicing?: boolean;

  @ApiPropertyOptional({ description: 'Enables purchase orders' })
  @IsBoolean()
  @IsOptional()
  enablesPurchaseOrders?: boolean;

  @ApiPropertyOptional({ description: 'Enables resource planning' })
  @IsBoolean()
  @IsOptional()
  enablesResourcePlanning?: boolean;

  @ApiPropertyOptional({ description: 'Default lifecycle template ID' })
  @IsUUID()
  @IsOptional()
  defaultLifecycleTemplateId?: string;

  @ApiPropertyOptional({ description: 'Default structure template ID' })
  @IsUUID()
  @IsOptional()
  defaultStructureTemplateId?: string;

  @ApiPropertyOptional({ description: 'Default governance rule set ID' })
  @IsUUID()
  @IsOptional()
  defaultGovernanceRuleSetId?: string;

  @ApiPropertyOptional({ description: 'Effective end date' })
  @IsDateString()
  @IsOptional()
  effectiveEndDate?: string;

  @ApiPropertyOptional({ description: 'Custom attributes' })
  @IsObject()
  @IsOptional()
  customAttributes?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Change reason for audit' })
  @IsString()
  @IsNotEmpty()
  changeReason: string;
}

export class ProjectTypeQueryDto {
  @ApiPropertyOptional({ description: 'Search by code or name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category', enum: ProjectTypeCategory })
  @IsEnum(ProjectTypeCategory)
  @IsOptional()
  category?: ProjectTypeCategory;

  @ApiPropertyOptional({ description: 'Filter by billing model', enum: BillingModel })
  @IsEnum(BillingModel)
  @IsOptional()
  billingModel?: BillingModel;

  @ApiPropertyOptional({ description: 'Filter by status'  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by parent type ID' })
  @IsUUID()
  @IsOptional()
  parentTypeId?: string;

  @ApiPropertyOptional({ description: 'Include hierarchy descendants' })
  @IsBoolean()
  @IsOptional()
  includeDescendants?: boolean;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: 'projectTypeName' })
  @IsString()
  @IsOptional()
  sortBy?: string = 'projectTypeName';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class BulkProjectTypeActionDto {
  @ApiProperty({ description: 'Project type IDs', type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  typeIds: string[];

  @ApiProperty({ description: 'Action to perform', enum: ['activate', 'deactivate', 'delete'] })
  @IsString()
  @IsNotEmpty()
  action: 'activate' | 'deactivate' | 'delete';

  @ApiProperty({ description: 'Reason for action' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

// ==============================================
// PROJECT CATEGORY DTOs
// ==============================================

export class CreateProjectCategoryDto {
  @ApiProperty({ description: 'Category code' })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  categoryCode: string;

  @ApiProperty({ description: 'Category name' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  categoryName: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent category ID' })
  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @ApiPropertyOptional({ description: 'Category type' })
  @IsString()
  @IsOptional()
  categoryType?: string;

  @ApiPropertyOptional({ description: 'Business domain' })
  @IsString()
  @IsOptional()
  businessDomain?: string;

  @ApiPropertyOptional({ description: 'Requires executive approval' })
  @IsBoolean()
  @IsOptional()
  requiresExecutiveApproval?: boolean;

  @ApiPropertyOptional({ description: 'Reporting frequency' })
  @IsString()
  @IsOptional()
  reportingFrequency?: string;

  @ApiProperty({ description: 'Effective start date' })
  @IsDateString()
  effectiveStartDate: string;

  @ApiPropertyOptional({ description: 'Custom attributes' })
  @IsObject()
  @IsOptional()
  customAttributes?: Record<string, any>;
}

export class UpdateProjectCategoryDto {
  @ApiPropertyOptional({ description: 'Category name' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  categoryName?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent category ID' })
  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @ApiPropertyOptional({ description: 'Category type' })
  @IsString()
  @IsOptional()
  categoryType?: string;

  @ApiPropertyOptional({ description: 'Requires executive approval' })
  @IsBoolean()
  @IsOptional()
  requiresExecutiveApproval?: boolean;

  @ApiPropertyOptional({ description: 'Reporting frequency' })
  @IsString()
  @IsOptional()
  reportingFrequency?: string;

  @ApiProperty({ description: 'Change reason' })
  @IsString()
  @IsNotEmpty()
  changeReason: string;
}

// ==============================================
// LIFECYCLE TEMPLATE DTOs
// ==============================================

export class CreateLifecycleTemplateDto {
  @ApiProperty({ description: 'Template code' })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  templateCode: string;

  @ApiProperty({ description: 'Template name' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  templateName: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is default template' })
  @IsBoolean()
  @IsOptional()
  isDefaultTemplate?: boolean;

  @ApiPropertyOptional({ description: 'Allows stage skip' })
  @IsBoolean()
  @IsOptional()
  allowsStageSkip?: boolean;

  @ApiPropertyOptional({ description: 'Allows stage repeat' })
  @IsBoolean()
  @IsOptional()
  allowsStageRepeat?: boolean;

  @ApiPropertyOptional({ description: 'Requires sequential progression' })
  @IsBoolean()
  @IsOptional()
  requiresSequentialProgression?: boolean;

  @ApiPropertyOptional({ description: 'Requires gate reviews' })
  @IsBoolean()
  @IsOptional()
  requiresGateReviews?: boolean;

  @ApiProperty({ description: 'Effective start date' })
  @IsDateString()
  effectiveStartDate: string;
}

export class UpdateLifecycleTemplateDto {
  @ApiPropertyOptional({ description: 'Template name' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  templateName?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Allows stage skip' })
  @IsBoolean()
  @IsOptional()
  allowsStageSkip?: boolean;

  @ApiPropertyOptional({ description: 'Allows stage repeat' })
  @IsBoolean()
  @IsOptional()
  allowsStageRepeat?: boolean;

  @ApiPropertyOptional({ description: 'Requires gate reviews' })
  @IsBoolean()
  @IsOptional()
  requiresGateReviews?: boolean;

  @ApiProperty({ description: 'Change reason' })
  @IsString()
  @IsNotEmpty()
  changeReason: string;
}

export class CreateLifecycleStageDto {
  @ApiProperty({ description: 'Lifecycle template ID' })
  @IsUUID()
  @IsNotEmpty()
  lifecycleTemplateId: string;

  @ApiProperty({ description: 'Stage code' })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  stageCode: string;

  @ApiProperty({ description: 'Stage name' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  stageName: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Stage type', enum: LifecycleStageType })
  @IsEnum(LifecycleStageType)
  stageType: LifecycleStageType;

  @ApiProperty({ description: 'Stage order' })
  @IsInt()
  @Min(0)
  stageOrder: number;

  @ApiPropertyOptional({ description: 'Is mandatory' })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional({ description: 'Entry conditions' })
  @IsString()
  @IsOptional()
  entryConditions?: string;

  @ApiPropertyOptional({ description: 'Exit conditions' })
  @IsString()
  @IsOptional()
  exitConditions?: string;

  @ApiPropertyOptional({ description: 'Required deliverables', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredDeliverables?: string[];

  @ApiPropertyOptional({ description: 'Requires approval' })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Approval roles', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  approvalRoles?: string[];

  @ApiPropertyOptional({ description: 'Approval threshold' })
  @IsInt()
  @IsOptional()
  approvalThreshold?: number;

  @ApiPropertyOptional({ description: 'Estimated duration (days)' })
  @IsInt()
  @IsOptional()
  estimatedDurationDays?: number;
}

// ==============================================
// GOVERNANCE RULE DTOs
// ==============================================

export class CreateGovernanceRuleDto {
  @ApiProperty({ description: 'Rule code' })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  ruleCode: string;

  @ApiProperty({ description: 'Rule name' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  ruleName: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Rule category' })
  @IsString()
  @IsOptional()
  ruleCategory?: string;

  @ApiProperty({ description: 'Enforcement level', enum: GovernanceEnforcementLevel })
  @IsEnum(GovernanceEnforcementLevel)
  enforcementLevel: GovernanceEnforcementLevel;

  @ApiPropertyOptional({ description: 'Applies when condition' })
  @IsString()
  @IsOptional()
  appliesWhenCondition?: string;

  @ApiPropertyOptional({ description: 'Validation logic' })
  @IsString()
  @IsOptional()
  validationLogic?: string;

  @ApiPropertyOptional({ description: 'Requires approval workflow' })
  @IsBoolean()
  @IsOptional()
  requiresApprovalWorkflow?: boolean;

  @ApiPropertyOptional({ description: 'Threshold value' })
  @IsNumber()
  @IsOptional()
  thresholdValue?: number;

  @ApiPropertyOptional({ description: 'Threshold unit' })
  @IsString()
  @IsOptional()
  thresholdUnit?: string;

  @ApiPropertyOptional({ description: 'On violation action' })
  @IsString()
  @IsOptional()
  onViolationAction?: string;

  @ApiPropertyOptional({ description: 'Notification recipients', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notificationRecipients?: string[];

  @ApiProperty({ description: 'Effective start date' })
  @IsDateString()
  effectiveStartDate: string;
}

export class UpdateGovernanceRuleDto {
  @ApiPropertyOptional({ description: 'Rule name' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  ruleName?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Enforcement level', enum: GovernanceEnforcementLevel })
  @IsEnum(GovernanceEnforcementLevel)
  @IsOptional()
  enforcementLevel?: GovernanceEnforcementLevel;

  @ApiPropertyOptional({ description: 'Applies when condition' })
  @IsString()
  @IsOptional()
  appliesWhenCondition?: string;

  @ApiPropertyOptional({ description: 'Validation logic' })
  @IsString()
  @IsOptional()
  validationLogic?: string;

  @ApiPropertyOptional({ description: 'Threshold value' })
  @IsNumber()
  @IsOptional()
  thresholdValue?: number;

  @ApiPropertyOptional({ description: 'On violation action' })
  @IsString()
  @IsOptional()
  onViolationAction?: string;

  @ApiProperty({ description: 'Change reason' })
  @IsString()
  @IsNotEmpty()
  changeReason: string;
}

export class ApplyGovernanceRuleDto {
  @ApiProperty({ description: 'Project type ID' })
  @IsUUID()
  @IsNotEmpty()
  projectTypeId: string;

  @ApiProperty({ description: 'Governance rule ID' })
  @IsUUID()
  @IsNotEmpty()
  governanceRuleId: string;

  @ApiPropertyOptional({ description: 'Is mandatory' })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional({ description: 'Override allowed' })
  @IsBoolean()
  @IsOptional()
  overrideAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Custom threshold' })
  @IsNumber()
  @IsOptional()
  customThreshold?: number;

  @ApiProperty({ description: 'Effective start date' })
  @IsDateString()
  effectiveStartDate: string;
}

// ==============================================
// STRUCTURE TEMPLATE DTOs
// ==============================================

export class CreateStructureTemplateDto {
  @ApiProperty({ description: 'Template code' })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  templateCode: string;

  @ApiProperty({ description: 'Template name' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  templateName: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Max hierarchy depth' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  maxHierarchyDepth?: number;

  @ApiPropertyOptional({ description: 'Supports phases' })
  @IsBoolean()
  @IsOptional()
  supportsPhases?: boolean;

  @ApiPropertyOptional({ description: 'Supports milestones' })
  @IsBoolean()
  @IsOptional()
  supportsMilestones?: boolean;

  @ApiPropertyOptional({ description: 'Supports tasks' })
  @IsBoolean()
  @IsOptional()
  supportsTasks?: boolean;

  @ApiPropertyOptional({ description: 'Supports subtasks' })
  @IsBoolean()
  @IsOptional()
  supportsSubtasks?: boolean;

  @ApiPropertyOptional({ description: 'Mandatory levels', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mandatoryLevels?: string[];

  @ApiPropertyOptional({ description: 'Optional levels', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  optionalLevels?: string[];

  @ApiPropertyOptional({ description: 'Requires WBS codes' })
  @IsBoolean()
  @IsOptional()
  requiresWbsCodes?: boolean;

  @ApiPropertyOptional({ description: 'WBS code format' })
  @IsString()
  @IsOptional()
  wbsCodeFormat?: string;

  @ApiProperty({ description: 'Effective start date' })
  @IsDateString()
  effectiveStartDate: string;
}

export class CreateStructureLevelDto {
  @ApiProperty({ description: 'Structure template ID' })
  @IsUUID()
  @IsNotEmpty()
  structureTemplateId: string;

  @ApiProperty({ description: 'Level code' })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  levelCode: string;

  @ApiProperty({ description: 'Level name' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  levelName: string;

  @ApiProperty({ description: 'Level order' })
  @IsInt()
  @Min(0)
  levelOrder: number;

  @ApiProperty({ description: 'Level depth' })
  @IsInt()
  @Min(0)
  levelDepth: number;

  @ApiPropertyOptional({ description: 'Is mandatory' })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional({ description: 'Parent level code' })
  @IsString()
  @IsOptional()
  parentLevelCode?: string;

  @ApiPropertyOptional({ description: 'Min items' })
  @IsInt()
  @IsOptional()
  minItems?: number;

  @ApiPropertyOptional({ description: 'Max items' })
  @IsInt()
  @IsOptional()
  maxItems?: number;
}

// ==============================================
// RESOURCE ALLOCATION SETTINGS DTOs
// ==============================================

export class CreateResourceAllocationSettingsDto {
  @ApiProperty({ description: 'Project type ID' })
  @IsUUID()
  @IsNotEmpty()
  projectTypeId: string;

  @ApiProperty({ description: 'Allocation model', enum: ResourceAllocationModel })
  @IsEnum(ResourceAllocationModel)
  allocationModel: ResourceAllocationModel;

  @ApiPropertyOptional({ description: 'Min resource count' })
  @IsInt()
  @IsOptional()
  minResourceCount?: number;

  @ApiPropertyOptional({ description: 'Max resource count' })
  @IsInt()
  @IsOptional()
  maxResourceCount?: number;

  @ApiPropertyOptional({ description: 'Requires named resources' })
  @IsBoolean()
  @IsOptional()
  requiresNamedResources?: boolean;

  @ApiPropertyOptional({ description: 'Default resource pool ID' })
  @IsUUID()
  @IsOptional()
  defaultResourcePoolId?: string;

  @ApiPropertyOptional({ description: 'Allows external resources' })
  @IsBoolean()
  @IsOptional()
  allowsExternalResources?: boolean;

  @ApiPropertyOptional({ description: 'Max external resource percentage' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  maxExternalResourcePercentage?: number;

  @ApiPropertyOptional({ description: 'Requires skill matching' })
  @IsBoolean()
  @IsOptional()
  requiresSkillMatching?: boolean;

  @ApiPropertyOptional({ description: 'Min skill level' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(10)
  minSkillLevel?: number;

  @ApiPropertyOptional({ description: 'Default allocation percentage' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  defaultAllocationPercentage?: number;
}

// ==============================================
// BILLING COST SETTINGS DTOs
// ==============================================

export class CreateBillingCostSettingsDto {
  @ApiProperty({ description: 'Project type ID' })
  @IsUUID()
  @IsNotEmpty()
  projectTypeId: string;

  @ApiProperty({ description: 'Billing model', enum: BillingModel })
  @IsEnum(BillingModel)
  billingModel: BillingModel;

  @ApiPropertyOptional({ description: 'Billing currency' })
  @IsString()
  @MaxLength(3)
  @IsOptional()
  billingCurrency?: string;

  @ApiPropertyOptional({ description: 'Billing frequency' })
  @IsString()
  @IsOptional()
  billingFrequency?: string;

  @ApiProperty({ description: 'Revenue recognition method', enum: RevenueRecognitionMethod })
  @IsEnum(RevenueRecognitionMethod)
  revenueRecognitionMethod: RevenueRecognitionMethod;

  @ApiPropertyOptional({ description: 'Cost tracking enabled' })
  @IsBoolean()
  @IsOptional()
  costTrackingEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Cost allocation method' })
  @IsString()
  @IsOptional()
  costAllocationMethod?: string;

  @ApiPropertyOptional({ description: 'Overhead percentage' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  overheadPercentage?: number;

  @ApiPropertyOptional({ description: 'Margin tracking enabled' })
  @IsBoolean()
  @IsOptional()
  marginTrackingEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Target margin percentage' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  targetMarginPercentage?: number;

  @ApiProperty({ description: 'Budget control mode', enum: BudgetControlMode })
  @IsEnum(BudgetControlMode)
  budgetControlMode: BudgetControlMode;

  @ApiPropertyOptional({ description: 'Budget variance threshold' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  budgetVarianceThreshold?: number;
}

// ==============================================
// COMMON DTOs
// ==============================================

export class UpdateStatusDto {
  @ApiProperty({ description: 'New status' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ description: 'Change reason' })
  @IsString()
  @IsNotEmpty()
  changeReason: string;
}

export class ApproveConfigurationDto {
  @ApiProperty({ description: 'Configuration ID' })
  @IsUUID()
  @IsNotEmpty()
  configurationId: string;

  @ApiProperty({ description: 'Configuration type' })
  @IsString()
  @IsNotEmpty()
  configurationType: string;

  @ApiPropertyOptional({ description: 'Approval notes' })
  @IsString()
  @IsOptional()
  approvalNotes?: string;
}
