import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNumber,
  IsObject,
  MinLength,
  MaxLength,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { PermissionAction } from '../entities/rbac-permission.entity';

export class CreateRBACPermissionDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Permission code must be uppercase alphanumeric with underscores',
  })
  permissionCode: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  permissionName: string;

  @IsOptional()
  @IsString()
  permissionDescription?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  module: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subModule?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  feature?: string;

  @IsEnum(PermissionAction)
  action: PermissionAction;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subCategory?: string;

  @IsOptional()
  @IsBoolean()
  isSystemPermission?: boolean;

  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  riskLevel?: number;

  @IsOptional()
  @IsBoolean()
  allowsDataExport?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsBulkOperation?: boolean;

  @IsOptional()
  @IsBoolean()
  accessesPII?: boolean;

  @IsOptional()
  @IsBoolean()
  accessesFinancialData?: boolean;

  @IsOptional()
  @IsObject()
  scopeConstraints?: {
    dataScope?: string[];
    fieldAccess?: string[];
    excludedFields?: string[];
    conditions?: Record<string, any>;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependsOnPermissions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conflictsWithPermissions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  impliesPermissions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceRequirements?: string[];

  @IsOptional()
  @IsBoolean()
  requiresAuditLog?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresMFA?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedCountries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockedCountries?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOperationsPerHour?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOperationsPerDay?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxBulkRecords?: number;

  @IsOptional()
  @IsObject()
  timeRestrictions?: {
    allowedHours?: string[];
    allowedDays?: string[];
    timezone?: string;
  };

  @IsOptional()
  @IsString()
  displayGroup?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsString()
  iconName?: string;

  @IsOptional()
  @IsString()
  badgeColor?: string;

  @IsOptional()
  @IsString()
  apiEndpoint?: string;

  @IsOptional()
  @IsString()
  httpMethod?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableModules?: string[];

  @IsOptional()
  @IsObject()
  customMetadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  usageNotes?: string;

  @IsOptional()
  @IsString()
  securityNotes?: string;
}

export class UpdateRBACPermissionDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  permissionName?: string;

  @IsOptional()
  @IsString()
  permissionDescription?: string;

  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  riskLevel?: number;

  @IsOptional()
  @IsBoolean()
  allowsDataExport?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsBulkOperation?: boolean;

  @IsOptional()
  @IsBoolean()
  accessesPII?: boolean;

  @IsOptional()
  @IsBoolean()
  accessesFinancialData?: boolean;

  @IsOptional()
  @IsObject()
  scopeConstraints?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependsOnPermissions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conflictsWithPermissions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceRequirements?: string[];

  @IsOptional()
  @IsBoolean()
  requiresMFA?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOperationsPerHour?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOperationsPerDay?: number;

  @IsOptional()
  @IsObject()
  timeRestrictions?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsObject()
  customMetadata?: Record<string, any>;
}

export class BulkPermissionOperationDto {
  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];

  @IsEnum(['ACTIVATE', 'DEACTIVATE', 'DELETE', 'UPDATE_RISK_LEVEL'])
  operation: string;

  @IsOptional()
  @IsObject()
  updateData?: Record<string, any>;

  @IsOptional()
  @IsString()
  reason?: string;
}
