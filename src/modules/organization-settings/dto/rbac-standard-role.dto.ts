import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNumber,
  IsObject,
  IsUUID,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoleCategory, DataScopeLevel } from '../entities/rbac.enums';

export class CreateRBACStandardRoleDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Role code must be uppercase alphanumeric with underscores only',
  })
  roleCode: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  roleName: string;

  @IsOptional()
  @IsString()
  roleDescription?: string;

  @IsEnum(RoleCategory)
  roleCategory: RoleCategory;

  @IsOptional()
  @IsBoolean()
  isSystemOwned?: boolean;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isModifiable?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresDualApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresChangeJustification?: boolean;

  @IsOptional()
  @IsBoolean()
  hasRollbackCapability?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmergencyAccessRole?: boolean;

  @IsOptional()
  @IsEnum(DataScopeLevel)
  defaultDataScope?: DataScopeLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedCountries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedCountries?: string[];

  @IsOptional()
  @IsBoolean()
  canAccessSensitiveData?: boolean;

  @IsOptional()
  @IsBoolean()
  canExportData?: boolean;

  @IsOptional()
  @IsBoolean()
  canDownloadReports?: boolean;

  @IsOptional()
  @IsBoolean()
  canApproveTransactions?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  maskedFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hiddenFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readOnlyFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  editableFields?: string[];

  @IsOptional()
  @IsBoolean()
  honorsInCoreHR?: boolean;

  @IsOptional()
  @IsBoolean()
  honorsInPayroll?: boolean;

  @IsOptional()
  @IsBoolean()
  honorsInLeave?: boolean;

  @IsOptional()
  @IsBoolean()
  honorsInRecruitment?: boolean;

  @IsOptional()
  @IsBoolean()
  honorsInReports?: boolean;

  @IsOptional()
  @IsBoolean()
  honorsInAPIs?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceTags?: string[];

  @IsOptional()
  @IsBoolean()
  isGDPRCompliant?: boolean;

  @IsOptional()
  @IsBoolean()
  isSOXCompliant?: boolean;

  @IsOptional()
  @IsBoolean()
  isAuditableRole?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conflictingRoles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredRoles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mutuallyExclusiveWith?: string[];

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAssignmentDurationDays?: number;

  @IsOptional()
  @IsObject()
  customAttributes?: Record<string, any>;

  @IsOptional()
  @IsObject()
  businessRules?: Record<string, any>;

  @IsOptional()
  @IsString()
  securityNotes?: string;

  @IsOptional()
  @IsString()
  usageGuidelines?: string;
}

export class UpdateRBACStandardRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  roleName?: string;

  @IsOptional()
  @IsString()
  roleDescription?: string;

  @IsOptional()
  @IsEnum(RoleCategory)
  roleCategory?: RoleCategory;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isModifiable?: boolean;

  @IsOptional()
  @IsEnum(DataScopeLevel)
  defaultDataScope?: DataScopeLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedCountries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedCountries?: string[];

  @IsOptional()
  @IsBoolean()
  canAccessSensitiveData?: boolean;

  @IsOptional()
  @IsBoolean()
  canExportData?: boolean;

  @IsOptional()
  @IsBoolean()
  canDownloadReports?: boolean;

  @IsOptional()
  @IsBoolean()
  canApproveTransactions?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  maskedFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hiddenFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readOnlyFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  editableFields?: string[];

  @IsOptional()
  @IsBoolean()
  honorsInCoreHR?: boolean;

  @IsOptional()
  @IsBoolean()
  honorsInPayroll?: boolean;

  @IsOptional()
  @IsBoolean()
  honorsInLeave?: boolean;

  @IsOptional()
  @IsBoolean()
  honorsInRecruitment?: boolean;

  @IsOptional()
  @IsBoolean()
  honorsInReports?: boolean;

  @IsOptional()
  @IsBoolean()
  honorsInAPIs?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceTags?: string[];

  @IsOptional()
  @IsBoolean()
  isGDPRCompliant?: boolean;

  @IsOptional()
  @IsBoolean()
  isSOXCompliant?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conflictingRoles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredRoles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mutuallyExclusiveWith?: string[];

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAssignmentDurationDays?: number;

  @IsOptional()
  @IsObject()
  customAttributes?: Record<string, any>;

  @IsOptional()
  @IsObject()
  businessRules?: Record<string, any>;

  @IsOptional()
  @IsString()
  securityNotes?: string;

  @IsOptional()
  @IsString()
  usageGuidelines?: string;

  @IsOptional()
  @IsString()
  changeReason?: string;
}

export class AssignPermissionsToRoleDto {
  @IsUUID()
  roleId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionAssignmentDto)
  permissions: PermissionAssignmentDto[];

  @IsOptional()
  @IsString()
  changeReason?: string;

  @IsOptional()
  @IsUUID()
  approvedBy?: string;
}

export class PermissionAssignmentDto {
  @IsUUID()
  permissionId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isReadOnly?: boolean;

  @IsOptional()
  @IsEnum(DataScopeLevel)
  dataScope?: DataScopeLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopeFilters?: string[];

  @IsOptional()
  @IsObject()
  scopeConditions?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deniedFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  maskedFields?: string[];

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  approvalLevel?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsOptional()
  @IsBoolean()
  allowExport?: boolean;

  @IsOptional()
  @IsBoolean()
  allowBulkOperations?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRecordsPerOperation?: number;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RollbackRoleVersionDto {
  @IsUUID()
  roleId: string;

  @IsNumber()
  @Min(1)
  targetVersion: number;

  @IsString()
  @MinLength(10)
  rollbackReason: string;

  @IsOptional()
  @IsUUID()
  approvedBy?: string;
}

export class BulkRoleOperationDto {
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];

  @IsEnum(['ACTIVATE', 'DEACTIVATE', 'ARCHIVE', 'DELETE'])
  operation: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
