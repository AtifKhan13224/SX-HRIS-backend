import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum PicklistType {
  STANDARD = 'standard',
  CUSTOM = 'custom',
  SYSTEM = 'system',
}

export enum PicklistStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  DEPRECATED = 'deprecated',
}

export enum PicklistValueStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum DependencyType {
  PARENT_CHILD = 'parent-child',
  CASCADING = 'cascading',
  CONDITIONAL = 'conditional',
}

// ================== PICKLIST VALUE DTOs ==================

export class PicklistValueTranslationDto {
  @ApiProperty({ example: 'en' })
  @IsString()
  locale: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ example: 'The United States of America' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePicklistValueDto {
  @ApiProperty({ example: 'US' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ example: 'United States of America' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'NA' })
  @IsOptional()
  @IsString()
  parentValue?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ enum: PicklistValueStatus, default: PicklistValueStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PicklistValueStatus)
  status?: PicklistValueStatus;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  effectiveStartDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  effectiveEndDate?: string;

  @ApiPropertyOptional({ example: { icon: '🇺🇸', color: '#3B82F6' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ type: [PicklistValueTranslationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PicklistValueTranslationDto)
  translations?: PicklistValueTranslationDto[];
}

export class UpdatePicklistValueDto extends PartialType(CreatePicklistValueDto) {}

export class ReorderPicklistValuesDto {
  @ApiProperty({ example: ['US', 'UK', 'CA', 'AU'], description: 'Array of value IDs in desired order' })
  @IsArray()
  @IsString({ each: true })
  orderedValues: string[];
}

// ================== PICKLIST DTOs ==================

export class CreatePicklistDto {
  @ApiProperty({ example: 'country' })
  @IsString()
  @IsNotEmpty()
  internalName: string;

  @ApiProperty({ example: 'Country' })
  @IsString()
  @IsNotEmpty()
  displayLabel: string;

  @ApiPropertyOptional({ example: 'List of countries' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PicklistType, default: PicklistType.CUSTOM })
  @IsEnum(PicklistType)
  type: PicklistType;

  @ApiPropertyOptional({ enum: PicklistStatus, default: PicklistStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PicklistStatus)
  status?: PicklistStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isHierarchical?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allowMultiSelect?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSearchable?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isSortable?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isVersioned?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  supportExternalSync?: boolean;

  @ApiPropertyOptional({ example: 'https://api.example.com/countries' })
  @IsOptional()
  @IsString()
  externalSyncUrl?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  maxValues?: number;

  @ApiPropertyOptional({ example: { category: 'location', region: 'global' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: ['Admin', 'HR Manager'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  editPermissions?: string[];

  @ApiPropertyOptional({ example: ['All Users'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  viewPermissions?: string[];

  @ApiPropertyOptional({ type: [CreatePicklistValueDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePicklistValueDto)
  values?: CreatePicklistValueDto[];
}

export class UpdatePicklistDto extends PartialType(CreatePicklistDto) {
  @ApiPropertyOptional({ example: 'Updated via API' })
  @IsOptional()
  @IsString()
  changeDescription?: string;
}

export class PicklistFilterDto {
  @ApiPropertyOptional({ example: 'country' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PicklistType })
  @IsOptional()
  @IsEnum(PicklistType)
  type?: PicklistType;

  @ApiPropertyOptional({ enum: PicklistStatus })
  @IsOptional()
  @IsEnum(PicklistStatus)
  status?: PicklistStatus;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isHierarchical?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  hasParent?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'displayLabel' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'ASC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

// ================== DEPENDENCY DTOs ==================

export class PicklistDependencyMappingDto {
  @ApiProperty({ example: 'US' })
  @IsString()
  parentValue: string;

  @ApiProperty({ example: ['CA', 'NY', 'TX'], description: 'Array of child values for this parent' })
  @IsArray()
  @IsString({ each: true })
  childValues: string[];
}

export class CreatePicklistDependencyDto {
  @ApiProperty({ example: 'country' })
  @IsString()
  @IsNotEmpty()
  parentPicklistName: string;

  @ApiProperty({ example: 'state' })
  @IsString()
  @IsNotEmpty()
  childPicklistName: string;

  @ApiProperty({ enum: DependencyType, default: DependencyType.PARENT_CHILD })
  @IsEnum(DependencyType)
  dependencyType: DependencyType;

  @ApiPropertyOptional({ type: [PicklistDependencyMappingDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PicklistDependencyMappingDto)
  mappings?: PicklistDependencyMappingDto[];

  @ApiPropertyOptional({ example: { cascadeDelete: false, strictValidation: true } })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;
}

// ================== VERSION DTOs ==================

export class CreatePicklistVersionDto {
  @ApiProperty({ example: 'country' })
  @IsString()
  @IsNotEmpty()
  picklistName: string;

  @ApiProperty({ example: 'Added new countries for EU expansion' })
  @IsString()
  @IsNotEmpty()
  changeDescription: string;

  @ApiPropertyOptional({ example: '2.1.0' })
  @IsOptional()
  @IsString()
  version?: string;
}

// ================== EXPORT/IMPORT DTOs ==================

export class ExportPicklistDto {
  @ApiProperty({ example: 'country' })
  @IsString()
  @IsNotEmpty()
  picklistName: string;

  @ApiProperty({ enum: ['json', 'csv', 'excel'], default: 'json' })
  @IsString()
  format: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeValues?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  includeHistory?: boolean;
}

export class ImportPicklistDto {
  @ApiProperty({ example: 'json' })
  @IsString()
  format: string;

  @ApiProperty()
  @IsNotEmpty()
  data: any;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  overwriteExisting?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  validateBeforeImport?: boolean;
}

// ================== BULK OPERATION DTOs ==================

export class BulkPicklistOperationDto {
  @ApiProperty({ enum: ['activate', 'deactivate', 'delete', 'export'] })
  @IsString()
  @IsNotEmpty()
  operation: string;

  @ApiProperty({ example: ['country', 'state', 'city'] })
  @IsArray()
  @IsString({ each: true })
  picklistNames: string[];

  @ApiPropertyOptional({ example: { cascade: true } })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;
}

// ================== ANALYTICS DTOs ==================

export class PicklistAnalyticsQueryDto {
  @ApiProperty({ example: 'country' })
  @IsString()
  @IsNotEmpty()
  picklistName: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'monthly'], default: 'daily' })
  @IsOptional()
  @IsString()
  granularity?: string;
}

// ================== VALIDATION DTOs ==================

export class ValidatePicklistDto {
  @ApiProperty({ example: 'country' })
  @IsString()
  @IsNotEmpty()
  picklistName: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ example: { field: 'employee.country', recordId: '12345' } })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class ValidatePicklistValuesDto {
  @ApiProperty({ example: 'country' })
  @IsString()
  @IsNotEmpty()
  picklistName: string;

  @ApiProperty({ example: ['US', 'UK', 'CA'] })
  @IsArray()
  @IsString({ each: true })
  values: string[];
}
