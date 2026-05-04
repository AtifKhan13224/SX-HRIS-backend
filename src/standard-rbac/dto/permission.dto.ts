import { IsString, IsEnum, IsBoolean, IsOptional, IsArray, IsNumber, IsObject } from 'class-validator';
import { PermissionModule, PermissionAction, PermissionTag } from '../entities/permission-registry.entity';

export class CreatePermissionDto {
  @IsString()
  permissionCode: string;

  @IsString()
  permissionName: string;

  @IsOptional()
  @IsString()
  permissionDescription?: string;

  @IsEnum(PermissionModule)
  module: PermissionModule;

  @IsOptional()
  @IsString()
  subModule?: string;

  @IsOptional()
  @IsString()
  feature?: string;

  @IsEnum(PermissionAction)
  action: PermissionAction;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionTags?: string[];

  @IsBoolean()
  isSensitive: boolean;

  @IsBoolean()
  isFinancial: boolean;

  @IsBoolean()
  isPII: boolean;

  @IsBoolean()
  requiresCompliance: boolean;

  @IsBoolean()
  requiresSoD: boolean;

  @IsNumber()
  riskScore: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @IsBoolean()
  requiresDataScope: boolean;

  @IsBoolean()
  requiresFieldSecurity: boolean;

  @IsBoolean()
  allowDelegation: boolean;

  @IsOptional()
  @IsNumber()
  maxDelegationLevel?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  apiEndpoints?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  complianceMapping?: Record<string, any>;

  @IsString()
  createdBy: string;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  permissionName?: string;

  @IsOptional()
  @IsString()
  permissionDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionTags?: string[];

  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFinancial?: boolean;

  @IsOptional()
  @IsBoolean()
  isPII?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresCompliance?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresSoD?: boolean;

  @IsOptional()
  @IsNumber()
  riskScore?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  apiEndpoints?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  complianceMapping?: Record<string, any>;
}

export class AssignPermissionToRoleDto {
  @IsString()
  roleId: string;

  @IsString()
  permissionId: string;

  @IsEnum(['ALLOW', 'DENY', 'CONDITIONAL'])
  grantType: string;

  @IsOptional()
  @IsBoolean()
  isConditional?: boolean;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  requiresDataScope?: boolean;

  @IsOptional()
  @IsString()
  dataScopeConfigId?: string;

  @IsOptional()
  @IsBoolean()
  requiresFieldSecurity?: boolean;

  @IsOptional()
  @IsObject()
  fieldRestrictions?: Record<string, any>;

  @IsString()
  createdBy: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
