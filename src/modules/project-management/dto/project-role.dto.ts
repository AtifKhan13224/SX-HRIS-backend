import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  MaxLength,
  Min,
  Max,
  IsInt,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RoleCategory,
  SkillLevel,
  ResourceType,
  BillingCategory,
  CostCategory,
} from '../entities/project-role.entity';
import { ActivityStatus, ScopeType } from '../entities/project-activity.entity';

/**
 * CREATE PROJECT ROLE DTO
 * Validates input for creating new project roles
 */
export class CreateProjectRoleDto {
  @ApiProperty({
    description: 'Unique role code within tenant',
    example: 'ROLE-001',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  roleCode: string;

  @ApiProperty({
    description: 'Display name for the role',
    example: 'Senior Software Developer',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  roleName: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the role',
    example: 'Responsible for designing and developing software solutions...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Role category classification',
    enum: RoleCategory,
    example: RoleCategory.DELIVERY,
  })
  @IsEnum(RoleCategory)
  roleCategory: RoleCategory;

  @ApiProperty({
    description: 'Skill level classification',
    enum: SkillLevel,
    example: SkillLevel.SENIOR,
  })
  @IsEnum(SkillLevel)
  skillLevel: SkillLevel;

  @ApiPropertyOptional({
    description: 'Default billing category for this role',
    enum: BillingCategory,
    default: BillingCategory.BILLABLE,
  })
  @IsOptional()
  @IsEnum(BillingCategory)
  defaultBillingCategory?: BillingCategory;

  @ApiPropertyOptional({
    description: 'Default cost category for this role',
    enum: CostCategory,
    default: CostCategory.DIRECT,
  })
  @IsOptional()
  @IsEnum(CostCategory)
  defaultCostCategory?: CostCategory;

  @ApiPropertyOptional({
    description: 'Default resource type for this role',
    enum: ResourceType,
    default: ResourceType.INTERNAL,
  })
  @IsOptional()
  @IsEnum(ResourceType)
  defaultResourceType?: ResourceType;

  @ApiPropertyOptional({
    description: 'UUID of default activity for this role',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  defaultActivityId?: string;

  @ApiPropertyOptional({
    description: 'UUID of parent role for hierarchical structure',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  parentRoleId?: string;

  @ApiPropertyOptional({
    description: 'Display order for sorting roles',
    example: 10,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'UUID of department this role belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Practice area (Cloud, Data, Mobile, etc.)',
    example: 'Cloud Engineering',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  practiceArea?: string;

  @ApiPropertyOptional({
    description: 'Competency group (Engineering, Consulting, etc.)',
    example: 'Software Engineering',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  competencyGroup?: string;

  @ApiPropertyOptional({
    description: 'Delivery unit identifier',
    example: 'DU-APAC-01',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deliveryUnit?: string;

  @ApiPropertyOptional({
    description: 'Whether certification is required for this role',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresCertification?: boolean;

  @ApiPropertyOptional({
    description: 'Type of certification required',
    example: 'AWS Certified Solutions Architect',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  certificationType?: string;

  @ApiPropertyOptional({
    description: 'Minimum years of experience required',
    example: 5.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minExperienceYears?: number;

  @ApiPropertyOptional({
    description: 'Maximum years of experience for this role',
    example: 10.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxExperienceYears?: number;

  @ApiPropertyOptional({
    description: 'Whether remote work is allowed',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  allowsRemote?: boolean;

  @ApiPropertyOptional({
    description: 'Whether onsite presence is required',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresOnsite?: boolean;

  @ApiPropertyOptional({
    description: 'Standard hourly billing rate',
    example: 150.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standardHourlyRate?: number;

  @ApiPropertyOptional({
    description: 'Standard daily billing rate',
    example: 1200.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standardDailyRate?: number;

  @ApiPropertyOptional({
    description: 'Cost center code',
    example: 'CC-ENG-001',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  costCenter?: string;

  @ApiPropertyOptional({
    description: 'Profit center code',
    example: 'PC-DELIVERY-01',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  profitCenter?: string;

  @ApiPropertyOptional({
    description: 'Default allocation percentage (0-100)',
    example: 100.00,
    default: 100.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultAllocationPercentage?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of concurrent projects',
    example: 3,
    default: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxConcurrentProjects?: number;

  @ApiProperty({
    description: 'Effective start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsDateString()
  effectiveStartDate: string;

  @ApiPropertyOptional({
    description: 'Effective end date (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  effectiveEndDate?: string;

  @ApiPropertyOptional({
    description: 'Initial status of the role',
    enum: ActivityStatus,
    default: ActivityStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional({
    description: 'Custom attributes as key-value pairs',
    example: { skillTags: ['Java', 'Spring'], seniorityCode: 'L5' },
  })
  @IsOptional()
  @IsObject()
  customAttributes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Array of tags for categorization',
    example: ['backend', 'Java', 'senior'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Source of configuration',
    example: 'SAP_IMPORT',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  configurationSource?: string;

  @ApiPropertyOptional({
    description: 'External system reference ID',
    example: 'EXT-ROLE-12345',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalReferenceId?: string;
}

/**
 * UPDATE PROJECT ROLE DTO
 * Validates partial updates to existing project roles
 */
export class UpdateProjectRoleDto {
  @ApiPropertyOptional({
    description: 'Display name for the role',
    example: 'Senior Software Developer',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  roleName?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the role',
    example: 'Responsible for designing and developing software solutions...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Role category classification',
    enum: RoleCategory,
  })
  @IsOptional()
  @IsEnum(RoleCategory)
  roleCategory?: RoleCategory;

  @ApiPropertyOptional({
    description: 'Skill level classification',
    enum: SkillLevel,
  })
  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;

  @ApiPropertyOptional({
    description: 'Default billing category for this role',
    enum: BillingCategory,
  })
  @IsOptional()
  @IsEnum(BillingCategory)
  defaultBillingCategory?: BillingCategory;

  @ApiPropertyOptional({
    description: 'Default cost category for this role',
    enum: CostCategory,
  })
  @IsOptional()
  @IsEnum(CostCategory)
  defaultCostCategory?: CostCategory;

  @ApiPropertyOptional({
    description: 'Default resource type for this role',
    enum: ResourceType,
  })
  @IsOptional()
  @IsEnum(ResourceType)
  defaultResourceType?: ResourceType;

  @ApiPropertyOptional({
    description: 'UUID of default activity for this role',
  })
  @IsOptional()
  @IsUUID()
  defaultActivityId?: string;

  @ApiPropertyOptional({
    description: 'UUID of parent role for hierarchical structure',
  })
  @IsOptional()
  @IsUUID()
  parentRoleId?: string;

  @ApiPropertyOptional({
    description: 'Display order for sorting roles',
  })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'UUID of department this role belongs to',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Practice area (Cloud, Data, Mobile, etc.)',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  practiceArea?: string;

  @ApiPropertyOptional({
    description: 'Competency group (Engineering, Consulting, etc.)',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  competencyGroup?: string;

  @ApiPropertyOptional({
    description: 'Delivery unit identifier',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deliveryUnit?: string;

  @ApiPropertyOptional({
    description: 'Whether certification is required for this role',
  })
  @IsOptional()
  @IsBoolean()
  requiresCertification?: boolean;

  @ApiPropertyOptional({
    description: 'Type of certification required',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  certificationType?: string;

  @ApiPropertyOptional({
    description: 'Minimum years of experience required',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minExperienceYears?: number;

  @ApiPropertyOptional({
    description: 'Maximum years of experience for this role',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxExperienceYears?: number;

  @ApiPropertyOptional({
    description: 'Whether remote work is allowed',
  })
  @IsOptional()
  @IsBoolean()
  allowsRemote?: boolean;

  @ApiPropertyOptional({
    description: 'Whether onsite presence is required',
  })
  @IsOptional()
  @IsBoolean()
  requiresOnsite?: boolean;

  @ApiPropertyOptional({
    description: 'Standard hourly billing rate',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standardHourlyRate?: number;

  @ApiPropertyOptional({
    description: 'Standard daily billing rate',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standardDailyRate?: number;

  @ApiPropertyOptional({
    description: 'Cost center code',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  costCenter?: string;

  @ApiPropertyOptional({
    description: 'Profit center code',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  profitCenter?: string;

  @ApiPropertyOptional({
    description: 'Default allocation percentage (0-100)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultAllocationPercentage?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of concurrent projects',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxConcurrentProjects?: number;

  @ApiPropertyOptional({
    description: 'Effective start date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  effectiveStartDate?: string;

  @ApiPropertyOptional({
    description: 'Effective end date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  effectiveEndDate?: string;

  @ApiPropertyOptional({
    description: 'Status of the role',
    enum: ActivityStatus,
  })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional({
    description: 'Custom attributes as key-value pairs',
  })
  @IsOptional()
  @IsObject()
  customAttributes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Array of tags for categorization',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Reason for the change (for audit trail)',
    example: 'Updated hourly rate based on market research',
  })
  @IsOptional()
  @IsString()
  changeReason?: string;
}

/**
 * PROJECT ROLE QUERY DTO
 * Filters and pagination for querying project roles
 */
export class ProjectRoleQueryDto {
  @ApiPropertyOptional({
    description: 'Search by role code or name',
    example: 'developer',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by role category',
    enum: RoleCategory,
  })
  @IsOptional()
  @IsEnum(RoleCategory)
  roleCategory?: RoleCategory;

  @ApiPropertyOptional({
    description: 'Filter by skill level',
    enum: SkillLevel,
  })
  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ActivityStatus,
  })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional({
    description: 'Filter by parent role ID',
  })
  @IsOptional()
  @IsUUID()
  parentRoleId?: string;

  @ApiPropertyOptional({
    description: 'Filter by department ID',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by practice area',
    example: 'Cloud Engineering',
  })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiPropertyOptional({
    description: 'Filter by scope type',
    enum: ScopeType,
  })
  @IsOptional()
  @IsEnum(ScopeType)
  scopeType?: ScopeType;

  @ApiPropertyOptional({
    description: 'Filter by effective date (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Include inactive roles',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeInactive?: boolean;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 50,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'role_code',
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

/**
 * BULK PROJECT ROLE ACTION DTO
 * Validates bulk operations on multiple project roles
 */
export class BulkProjectRoleActionDto {
  @ApiProperty({
    description: 'Array of role IDs to perform action on',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];

  @ApiProperty({
    description: 'Action to perform',
    enum: ['ACTIVATE', 'DEACTIVATE', 'DELETE', 'APPROVE', 'DEPRECATE'],
    example: 'ACTIVATE',
  })
  @IsEnum(['ACTIVATE', 'DEACTIVATE', 'DELETE', 'APPROVE', 'DEPRECATE'])
  action: 'ACTIVATE' | 'DEACTIVATE' | 'DELETE' | 'APPROVE' | 'DEPRECATE';

  @ApiPropertyOptional({
    description: 'Reason for bulk action',
    example: 'Quarterly review - activating approved roles',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * PROJECT ROLE SCOPE MAPPING DTO
 * Validates scope assignment to roles
 */
export class ProjectRoleScopeMappingDto {
  @ApiProperty({
    description: 'Scope type',
    enum: ScopeType,
    example: ScopeType.DEPARTMENT,
  })
  @IsEnum(ScopeType)
  scopeType: ScopeType;

  @ApiPropertyOptional({
    description: 'UUID of the scoped entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  scopeEntityId?: string;

  @ApiPropertyOptional({
    description: 'Name of the scoped entity',
    example: 'Engineering Department',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  scopeEntityName?: string;

  @ApiPropertyOptional({
    description: 'Is this the primary scope mapping?',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({
    description: 'Effective start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsDateString()
  effectiveStartDate: string;

  @ApiPropertyOptional({
    description: 'Effective end date (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  effectiveEndDate?: string;
}

/**
 * PROJECT ROLE APPROVAL DTO
 * Validates approval workflow
 */
export class ProjectRoleApprovalDto {
  @ApiProperty({
    description: 'ID of role to approve/reject',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  roleId: string;

  @ApiProperty({
    description: 'Approval decision',
    enum: ['APPROVED', 'REJECTED'],
    example: 'APPROVED',
  })
  @IsEnum(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({
    description: 'Approval notes or rejection reason',
    example: 'Approved - meets all role criteria',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * PROJECT ROLE HIERARCHY DTO
 * Validates explicit hierarchy relationships
 */
export class ProjectRoleHierarchyDto {
  @ApiProperty({
    description: 'UUID of parent role',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  parentRoleId: string;

  @ApiProperty({
    description: 'UUID of child role',
    example: '456e7890-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  childRoleId: string;

  @ApiPropertyOptional({
    description: 'Type of hierarchical relationship',
    enum: ['REPORTS_TO', 'LEADS', 'SUPERVISES'],
    default: 'REPORTS_TO',
  })
  @IsOptional()
  @IsEnum(['REPORTS_TO', 'LEADS', 'SUPERVISES'])
  relationshipType?: 'REPORTS_TO' | 'LEADS' | 'SUPERVISES';

  @ApiProperty({
    description: 'Effective start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsDateString()
  effectiveStartDate: string;

  @ApiPropertyOptional({
    description: 'Effective end date (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  effectiveEndDate?: string;
}

/**
 * PROJECT ROLE STATUS UPDATE DTO
 * Validates status changes
 */
export class UpdateProjectRoleStatusDto {
  @ApiProperty({
    description: 'New status',
    enum: ActivityStatus,
    example: ActivityStatus.ACTIVE,
  })
  @IsEnum(ActivityStatus)
  status: ActivityStatus;

  @ApiPropertyOptional({
    description: 'Reason for status change',
    example: 'Approved after review',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
