import {
  IsString,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsOptional,
  IsDate,
  IsInt,
  IsNumber,
  IsObject,
  IsArray,
  MaxLength,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ActivityCategory,
  ActivityType,
  ActivityStatus,
  ScopeType,
} from '../entities/project-activity.entity';

/**
 * CREATE PROJECT ACTIVITY DTO
 * Validation for creating new activity configuration
 */
export class CreateProjectActivityDto {
  @ApiProperty({ example: 'ACT-001', description: 'Unique activity code' })
  @IsString()
  @MaxLength(50)
  activityCode: string;

  @ApiProperty({ example: 'Software Development', description: 'Activity name' })
  @IsString()
  @MaxLength(255)
  activityName: string;

  @ApiPropertyOptional({ description: 'Detailed description of the activity' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ActivityCategory })
  @IsEnum(ActivityCategory)
  activityCategory: ActivityCategory;

  @ApiProperty({ enum: ActivityType })
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isBillable?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isTimesheetRequired?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isResourceAllocationEnabled?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isBudgetTracked?: boolean;

  @ApiPropertyOptional({ description: 'Default project role UUID' })
  @IsOptional()
  @IsUUID()
  defaultProjectRoleId?: string;

  @ApiPropertyOptional({ description: 'Default rate card UUID' })
  @IsOptional()
  @IsUUID()
  defaultRateCardId?: string;

  @ApiPropertyOptional({ description: 'Default approval workflow UUID' })
  @IsOptional()
  @IsUUID()
  defaultApprovalWorkflowId?: string;

  @ApiProperty({ description: 'Effective start date', example: '2024-01-01' })
  @Type(() => Date)
  @IsDate()
  effectiveStartDate: Date;

  @ApiPropertyOptional({ description: 'Effective end date', example: '2024-12-31' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveEndDate?: Date;

  @ApiPropertyOptional({ description: 'Parent activity UUID for hierarchy' })
  @IsOptional()
  @IsUUID()
  parentActivityId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowSubActivities?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allowOvertime?: boolean;

  @ApiPropertyOptional({ description: 'Maximum hours per day', example: 8.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  maxHoursPerDay?: number;

  @ApiPropertyOptional({ description: 'Custom attributes as key-value pairs' })
  @IsOptional()
  @IsObject()
  customAttributes?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'External system reference ID' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalReferenceId?: string;

  @ApiPropertyOptional({ description: 'Organizational scopes' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityScopeMappingDto)
  scopes?: ActivityScopeMappingDto[];
}

/**
 * UPDATE PROJECT ACTIVITY DTO
 */
export class UpdateProjectActivityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  activityName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ActivityCategory })
  @IsOptional()
  @IsEnum(ActivityCategory)
  activityCategory?: ActivityCategory;

  @ApiPropertyOptional({ enum: ActivityType })
  @IsOptional()
  @IsEnum(ActivityType)
  activityType?: ActivityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBillable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isTimesheetRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isResourceAllocationEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBudgetTracked?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  defaultProjectRoleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  defaultRateCardId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  defaultApprovalWorkflowId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveStartDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveEndDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowSubActivities?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowOvertime?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  maxHoursPerDay?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customAttributes?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Change reason for audit trail' })
  @IsOptional()
  @IsString()
  changeReason?: string;
}

/**
 * ACTIVITY SCOPE MAPPING DTO
 */
export class ActivityScopeMappingDto {
  @ApiProperty({ enum: ScopeType })
  @IsEnum(ScopeType)
  scopeType: ScopeType;

  @ApiPropertyOptional({ description: 'UUID of the scope entity' })
  @IsOptional()
  @IsUUID()
  scopeEntityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  scopeEntityName?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  effectiveStartDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveEndDate?: Date;
}

/**
 * QUERY DTO FOR FILTERING ACTIVITIES
 */
export class ActivityQueryDto {
  @ApiPropertyOptional({ description: 'Search by activity code or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ActivityStatus })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional({ enum: ActivityCategory })
  @IsOptional()
  @IsEnum(ActivityCategory)
  category?: ActivityCategory;

  @ApiPropertyOptional({ enum: ActivityType })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiPropertyOptional({ description: 'Filter by billable flag' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isBillable?: boolean;

  @ApiPropertyOptional({ enum: ScopeType })
  @IsOptional()
  @IsEnum(ScopeType)
  scopeType?: ScopeType;

  @ApiPropertyOptional({ description: 'Scope entity UUID' })
  @IsOptional()
  @IsUUID()
  scopeEntityId?: string;

  @ApiPropertyOptional({ description: 'Filter by effective date', example: '2024-01-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveDate?: Date;

  @ApiPropertyOptional({ description: 'Include inactive records', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeInactive?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'activityCode' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * UPDATE ACTIVITY STATUS DTO
 */
export class UpdateActivityStatusDto {
  @ApiProperty({ enum: ActivityStatus })
  @IsEnum(ActivityStatus)
  status: ActivityStatus;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * BULK OPERATIONS DTO
 */
export class BulkActivityActionDto {
  @ApiProperty({ description: 'Array of activity UUIDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  activityIds: string[];

  @ApiProperty({ description: 'Action to perform', enum: ['ACTIVATE', 'DEACTIVATE', 'DELETE'] })
  @IsEnum(['ACTIVATE', 'DEACTIVATE', 'DELETE'])
  action: string;

  @ApiPropertyOptional({ description: 'Reason for bulk action' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * VALIDATE ACTIVITY DEPENDENCIES DTO
 */
export class ValidateActivityDependenciesDto {
  @ApiProperty({ description: 'Activity UUID to validate' })
  @IsUUID()
  activityId: string;

  @ApiPropertyOptional({ description: 'Check for blocking dependencies', default: true })
  @IsOptional()
  @IsBoolean()
  checkBlockingOnly?: boolean;
}

/**
 * ACTIVITY DEPENDENCY RESPONSE DTO
 */
export class ActivityDependencyResponseDto {
  @ApiProperty()
  dependentEntityType: string;

  @ApiProperty()
  dependentEntityId: string;

  @ApiProperty()
  dependentEntityName: string;

  @ApiProperty()
  isBlocking: boolean;

  @ApiProperty()
  dependencyType: string;
}

/**
 * ACTIVITY APPROVAL DTO
 */
export class ApproveActivityDto {
  @ApiProperty({ description: 'Activity UUID to approve' })
  @IsUUID()
  activityId: string;

  @ApiPropertyOptional({ description: 'Approval notes' })
  @IsOptional()
  @IsString()
  approvalNotes?: string;
}

/**
 * ACTIVITY VERSION RESPONSE DTO
 */
export class ActivityVersionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  versionNumber: number;

  @ApiProperty()
  changeType: string;

  @ApiProperty()
  changeDescription: string;

  @ApiProperty()
  effectiveFrom: Date;

  @ApiProperty()
  effectiveTo: Date;

  @ApiProperty()
  changedBy: string;

  @ApiProperty()
  createdAt: Date;
}

/**
 * PAGINATED RESPONSE DTO
 */
export class PaginatedActivityResponseDto {
  @ApiProperty({ type: [Object] })
  data: any[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}
