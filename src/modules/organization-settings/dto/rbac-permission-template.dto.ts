import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TemplatePermissionDto {
  @IsString()
  module: string;

  @IsOptional()
  @IsString()
  subModule?: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @IsOptional()
  @IsString()
  dataScope?: string;
}

export class CreatePermissionTemplateDto {
  @IsString()
  templateCode: string;

  @IsString()
  templateName: string;

  @IsOptional()
  @IsString()
  templateDescription?: string;

  @IsString()
  templateCategory: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplatePermissionDto)
  permissions: TemplatePermissionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isSystemTemplate?: boolean;

  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class UpdatePermissionTemplateDto {
  @IsOptional()
  @IsString()
  templateName?: string;

  @IsOptional()
  @IsString()
  templateDescription?: string;

  @IsOptional()
  @IsString()
  templateCategory?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplatePermissionDto)
  permissions?: TemplatePermissionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;
}

export class ApplyTemplateToRoleDto {
  @IsString()
  roleId: string;

  @IsString()
  templateId: string;

  @IsOptional()
  @IsBoolean()
  replaceExisting?: boolean; // true = replace all permissions, false = merge
}
