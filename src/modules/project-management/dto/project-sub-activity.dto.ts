import {
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  IsObject,
  IsInt,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubActivityWorkType, SubActivityDurationType } from '../entities/project-sub-activity.entity';
import { ActivityStatus, ScopeType } from '../entities/project-activity.entity';

/**
 * CREATE SUB-ACTIVITY DTO
 * Validation for creating new sub-activity configuration
 */
export class CreateProjectSubActivityDto {
  @ApiProperty({ description: 'Parent activity ID (required)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  parentActivityId: string;

  @ApiProperty({ description: 'Unique sub-activity code', example: 'SUB-001', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  subActivityCode: string;

  @ApiProperty({ description: 'Sub-activity display name', example: 'Development - Coding', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  subActivityName: string;

  @ApiPropertyOptional({ description: 'Detailed description', example: 'Coding tasks for development activity' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Work tracking type', enum: SubActivityWorkType, example: SubActivityWorkType.HOURLY })
  @IsEnum(SubActivityWorkType)
  @IsNotEmpty()
  workType: SubActivityWorkType;

  @ApiProperty({ description: 'Default duration type', enum: SubActivityDurationType, example: SubActivityDurationType.HOURS })
  @IsEnum(SubActivityDurationType)
  @IsNotEmpty()
  defaultDurationType: SubActivityDurationType;

  @ApiPropertyOptional({ description: 'Estimated hours', example: 80.5 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedHours?: number;

  @ApiPropertyOptional({ description: 'Estimated days', example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedDays?: number;

  @ApiPropertyOptional({ description: 'Is this sub-activity billable?', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;

  @ApiPropertyOptional({ description: 'Is timesheet entry required?', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isTimesheetRequired?: boolean;

  @ApiPropertyOptional({ description: 'Cost allocation category', example: 'DIRECT' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  costAllocationCategory?: string;

  @ApiPropertyOptional({ description: 'Billing rate override (overrides parent activity rate)', example: 150.00 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  billingRateOverride?: number;

  @ApiPropertyOptional({ description: 'Required skill level', example: 'SENIOR' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  requiredSkillLevel?: string;

  @ApiPropertyOptional({ description: 'Requires certification?', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  requiresCertification?: boolean;

  @ApiPropertyOptional({ description: 'Certification type if required', example: 'PMP' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  certificationType?: string;

  @ApiPropertyOptional({ description: 'Minimum resource count', example: 1, default: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  minResourceCount?: number;

  @ApiPropertyOptional({ description: 'Maximum resource count', example: 5 })
  @IsInt()
  @IsOptional()
  @Min(1)
  maxResourceCount?: number;

  @ApiPropertyOptional({ description: 'Can be used as task template?', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isTaskTemplate?: boolean;

  @ApiPropertyOptional({ description: 'Allows parallel execution?', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  allowsParallelExecution?: boolean;

  @ApiPropertyOptional({ description: 'Requires sequential completion?', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  requiresSequentialCompletion?: boolean;

  @ApiPropertyOptional({ description: 'Allow overtime?', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  allowOvertime?: boolean;

  @ApiPropertyOptional({ description: 'Maximum hours per day', example: 8.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(24)
  maxHoursPerDay?: number;

  @ApiPropertyOptional({ description: 'Requires manager approval?', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  requiresManagerApproval?: boolean;

  @ApiPropertyOptional({ description: 'Requires client approval?', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  requiresClientApproval?: boolean;

  @ApiPropertyOptional({ description: 'Default project role ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  @IsOptional()
  defaultProjectRoleId?: string;

  @ApiPropertyOptional({ description: 'Default rate card ID', example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsUUID()
  @IsOptional()
  defaultRateCardId?: string;

  @ApiPropertyOptional({ description: 'Default approval workflow ID', example: '123e4567-e89b-12d3-a456-426614174003' })
  @IsUUID()
  @IsOptional()
  defaultApprovalWorkflowId?: string;

  @ApiProperty({ description: 'Effective start date (YYYY-MM-DD)', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  effectiveStartDate: string;

  @ApiPropertyOptional({ description: 'Effective end date (YYYY-MM-DD)', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  effectiveEndDate?: string;

  @ApiPropertyOptional({ description: 'Display order for sorting', example: 0, default: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Custom attributes (key-value pairs)', example: { key1: 'value1' } })
  @IsObject()
  @IsOptional()
  customAttributes?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags for categorization', example: ['backend', 'critical'] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Configuration source', example: 'MANUAL' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  configurationSource?: string;

  @ApiPropertyOptional({ description: 'External reference ID', example: 'EXT-123' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  externalReferenceId?: string;

  @ApiPropertyOptional({ description: 'Scope mappings', type: [Object] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SubActivityScopeMappingDto)
  scopes?: SubActivityScopeMappingDto[];
}

/**
 * UPDATE SUB-ACTIVITY DTO
 * Validation for updating existing sub-activity configuration
 */
export class UpdateProjectSubActivityDto {
  @ApiPropertyOptional({ description: 'Parent activity ID (can be changed if needed)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  parentActivityId?: string;

  @ApiPropertyOptional({ description: 'Sub-activity code', example: 'SUB-001', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  subActivityCode?: string;

  @ApiPropertyOptional({ description: 'Sub-activity name', example: 'Development - Coding', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  subActivityName?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Work type', enum: SubActivityWorkType })
  @IsEnum(SubActivityWorkType)
  @IsOptional()
  workType?: SubActivityWorkType;

  @ApiPropertyOptional({ description: 'Default duration type', enum: SubActivityDurationType })
  @IsEnum(SubActivityDurationType)
  @IsOptional()
  defaultDurationType?: SubActivityDurationType;

  @ApiPropertyOptional({ description: 'Estimated hours' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedHours?: number;

  @ApiPropertyOptional({ description: 'Estimated days' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedDays?: number;

  @ApiPropertyOptional({ description: 'Is billable?' })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;

  @ApiPropertyOptional({ description: 'Is timesheet required?' })
  @IsBoolean()
  @IsOptional()
  isTimesheetRequired?: boolean;

  @ApiPropertyOptional({ description: 'Cost allocation category' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  costAllocationCategory?: string;

  @ApiPropertyOptional({ description: 'Billing rate override' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  billingRateOverride?: number;

  @ApiPropertyOptional({ description: 'Required skill level' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  requiredSkillLevel?: string;

  @ApiPropertyOptional({ description: 'Requires certification?' })
  @IsBoolean()
  @IsOptional()
  requiresCertification?: boolean;

  @ApiPropertyOptional({ description: 'Certification type' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  certificationType?: string;

  @ApiPropertyOptional({ description: 'Minimum resource count' })
  @IsInt()
  @IsOptional()
  @Min(1)
  minResourceCount?: number;

  @ApiPropertyOptional({ description: 'Maximum resource count' })
  @IsInt()
  @IsOptional()
  @Min(1)
  maxResourceCount?: number;

  @ApiPropertyOptional({ description: 'Is task template?' })
  @IsBoolean()
  @IsOptional()
  isTaskTemplate?: boolean;

  @ApiPropertyOptional({ description: 'Allows parallel execution?' })
  @IsBoolean()
  @IsOptional()
  allowsParallelExecution?: boolean;

  @ApiPropertyOptional({ description: 'Requires sequential completion?' })
  @IsBoolean()
  @IsOptional()
  requiresSequentialCompletion?: boolean;

  @ApiPropertyOptional({ description: 'Allow overtime?' })
  @IsBoolean()
  @IsOptional()
  allowOvertime?: boolean;

  @ApiPropertyOptional({ description: 'Maximum hours per day' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(24)
  maxHoursPerDay?: number;

  @ApiPropertyOptional({ description: 'Requires manager approval?' })
  @IsBoolean()
  @IsOptional()
  requiresManagerApproval?: boolean;

  @ApiPropertyOptional({ description: 'Requires client approval?' })
  @IsBoolean()
  @IsOptional()
  requiresClientApproval?: boolean;

  @ApiPropertyOptional({ description: 'Default project role ID' })
  @IsUUID()
  @IsOptional()
  defaultProjectRoleId?: string;

  @ApiPropertyOptional({ description: 'Default rate card ID' })
  @IsUUID()
  @IsOptional()
  defaultRateCardId?: string;

  @ApiPropertyOptional({ description: 'Default approval workflow ID' })
  @IsUUID()
  @IsOptional()
  defaultApprovalWorkflowId?: string;

  @ApiPropertyOptional({ description: 'Effective start date' })
  @IsDateString()
  @IsOptional()
  effectiveStartDate?: string;

  @ApiPropertyOptional({ description: 'Effective end date' })
  @IsDateString()
  @IsOptional()
  effectiveEndDate?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsInt()
  @IsOptional()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Custom attributes' })
  @IsObject()
  @IsOptional()
  customAttributes?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Change reason for audit trail', example: 'Updated billing rates' })
  @IsString()
  @IsOptional()
  changeReason?: string;
}

/**
 * SUB-ACTIVITY QUERY DTO
 * Filtering and pagination for sub-activity queries
 */
export class SubActivityQueryDto {
  @ApiPropertyOptional({ description: 'Search by code or name', example: 'coding' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by parent activity ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  parentActivityId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ActivityStatus, example: ActivityStatus.ACTIVE })
  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;

  @ApiPropertyOptional({ description: 'Filter by work type', enum: SubActivityWorkType, example: SubActivityWorkType.HOURLY })
  @IsEnum(SubActivityWorkType)
  @IsOptional()
  workType?: SubActivityWorkType;

  @ApiPropertyOptional({ description: 'Filter by billable flag', example: true })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isBillable?: boolean;

  @ApiPropertyOptional({ description: 'Filter by scope type', enum: ScopeType })
  @IsEnum(ScopeType)
  @IsOptional()
  scopeType?: ScopeType;

  @ApiPropertyOptional({ description: 'Filter by effective date (YYYY-MM-DD)', example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Include inactive sub-activities', example: false, default: false })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeInactive?: boolean;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 20, default: 20 })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort by field', example: 'subActivityName', default: 'subActivityName' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], example: 'ASC', default: 'ASC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * BULK SUB-ACTIVITY ACTION DTO
 * For bulk operations (activate, deactivate, delete)
 */
export class BulkSubActivityActionDto {
  @ApiProperty({ description: 'Array of sub-activity IDs', example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  subActivityIds: string[];

  @ApiProperty({ description: 'Action to perform', enum: ['ACTIVATE', 'DEACTIVATE', 'DELETE'], example: 'ACTIVATE' })
  @IsEnum(['ACTIVATE', 'DEACTIVATE', 'DELETE'])
  action: 'ACTIVATE' | 'DEACTIVATE' | 'DELETE';

  @ApiPropertyOptional({ description: 'Reason for bulk action', example: 'End of fiscal year cleanup' })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * SUB-ACTIVITY SCOPE MAPPING DTO
 * For defining organizational scope
 */
export class SubActivityScopeMappingDto {
  @ApiProperty({ description: 'Scope type', enum: ScopeType, example: ScopeType.BUSINESS_UNIT })
  @IsEnum(ScopeType)
  scopeType: ScopeType;

  @ApiPropertyOptional({ description: 'Scope entity ID (UUID of Legal Entity, Business Unit, etc.)' })
  @IsUUID()
  @IsOptional()
  scopeEntityId?: string;

  @ApiPropertyOptional({ description: 'Scope entity name (denormalized)' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  scopeEntityName?: string;

  @ApiPropertyOptional({ description: 'Is this the primary scope?', example: true, default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Inherit scope from parent activity?', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  inheritsFromParent?: boolean;

  @ApiProperty({ description: 'Effective start date', example: '2024-01-01' })
  @IsDateString()
  effectiveStartDate: string;

  @ApiPropertyOptional({ description: 'Effective end date', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  effectiveEndDate?: string;
}

/**
 * SUB-ACTIVITY APPROVAL DTO
 * For approval workflow
 */
export class SubActivityApprovalDto {
  @ApiProperty({ description: 'Sub-activity ID to approve/reject', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  subActivityId: string;

  @ApiProperty({ description: 'Approval decision', enum: ['APPROVE', 'REJECT'], example: 'APPROVE' })
  @IsEnum(['APPROVE', 'REJECT'])
  decision: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({ description: 'Approval notes', example: 'Approved with minor adjustments' })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * PARENT ACTIVITY FILTER DTO
 * For getting sub-activities by parent activity with filters
 */
export class ParentActivitySubActivitiesDto {
  @ApiProperty({ description: 'Parent activity ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  parentActivityId: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ActivityStatus })
  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;

  @ApiPropertyOptional({ description: 'Include version history', example: false, default: false })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeVersions?: boolean;

  @ApiPropertyOptional({ description: 'Include audit logs', example: false, default: false })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeAuditLogs?: boolean;
}
