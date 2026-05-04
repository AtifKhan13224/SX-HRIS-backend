import { IsString, IsEnum, IsBoolean, IsOptional, IsArray, IsNumber, IsDateString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { SensitivityLevel, RoleCategory } from '../entities/system-role.entity';

export class CreateSystemRoleDto {
  @IsString()
  roleCode: string;

  @IsString()
  roleName: string;

  @IsOptional()
  @IsString()
  roleDescription?: string;

  @IsEnum(RoleCategory)
  roleCategory: RoleCategory;

  @IsEnum(SensitivityLevel)
  sensitivityLevel: SensitivityLevel;

  @IsBoolean()
  privilegedRole: boolean;

  @IsBoolean()
  breakGlassRole: boolean;

  @IsBoolean()
  systemLocked: boolean;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsBoolean()
  multiTenantEnabled: boolean;

  @IsOptional()
  @IsString()
  allowedTenantIds?: string;

  @IsNumber()
  displayOrder: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceTags?: string[];

  @IsOptional()
  @IsObject()
  regulatoryMapping?: Record<string, any>;

  @IsBoolean()
  requiresDualApproval: boolean;

  @IsBoolean()
  requiresJustification: boolean;

  @IsOptional()
  @IsNumber()
  maxAssignments?: number;

  @IsOptional()
  @IsString()
  parentRoleCode?: string;

  @IsBoolean()
  isTemplate: boolean;

  @IsBoolean()
  allowCustomization: boolean;

  @IsOptional()
  @IsObject()
  customizationConstraints?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsString()
  createdBy: string;
}

export class UpdateSystemRoleDto {
  @IsOptional()
  @IsString()
  roleName?: string;

  @IsOptional()
  @IsString()
  roleDescription?: string;

  @IsOptional()
  @IsEnum(SensitivityLevel)
  sensitivityLevel?: SensitivityLevel;

  @IsOptional()
  @IsBoolean()
  privilegedRole?: boolean;

  @IsOptional()
  @IsBoolean()
  breakGlassRole?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceTags?: string[];

  @IsOptional()
  @IsObject()
  regulatoryMapping?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  requiresDualApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresJustification?: boolean;

  @IsOptional()
  @IsNumber()
  maxAssignments?: number;

  @IsOptional()
  @IsBoolean()
  allowCustomization?: boolean;

  @IsOptional()
  @IsObject()
  customizationConstraints?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsString()
  modifiedBy: string;

  @IsString()
  modificationReason: string;
}

export class AssignSystemRoleDto {
  @IsString()
  roleId: string;

  @IsString()
  userId: string;

  @IsString()
  assignedBy: string;

  @IsString()
  justification: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RevokeSystemRoleDto {
  @IsString()
  roleId: string;

  @IsString()
  userId: string;

  @IsString()
  revokedBy: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
