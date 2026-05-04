import { IsString, IsEnum, IsOptional, IsBoolean, IsDate, IsArray, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { RoleCategory, SensitivityLevel } from '../entities/custom-role.entity';

export class CreateCustomRoleDto {
  @IsString()
  roleCode: string;

  @IsString()
  roleName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RoleCategory)
  category: RoleCategory;

  @IsEnum(SensitivityLevel)
  @IsOptional()
  sensitivityLevel?: SensitivityLevel = SensitivityLevel.LOW;

  @IsOptional()
  @IsString()
  businessCriticality?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsDate()
  @Type(() => Date)
  effectiveStartDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveEndDate?: Date;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean = false;

  @IsOptional()
  @IsUUID()
  approvalWorkflowId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];

  @IsUUID()
  ownerId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  riskScore?: number = 0;
}

export class UpdateCustomRoleDto {
  @IsOptional()
  @IsString()
  roleName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RoleCategory)
  category?: RoleCategory;

  @IsOptional()
  @IsEnum(SensitivityLevel)
  sensitivityLevel?: SensitivityLevel;

  @IsOptional()
  @IsString()
  businessCriticality?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveEndDate?: Date;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsUUID()
  approvalWorkflowId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}

export class CustomRoleResponseDto {
  id: string;
  tenantId: string;
  roleCode: string;
  roleName: string;
  description: string;
  category: RoleCategory;
  sensitivityLevel: SensitivityLevel;
  businessCriticality: string;
  isActive: boolean;
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  requiresApproval: boolean;
  approvalWorkflowId: string;
  riskScore: number;
  tags: string[];
  ownerId: string;
  createdBy: string;
  createdAt: Date;
  modifiedBy: string;
  modifiedAt: Date;
  version: number;
}

export class CustomRoleListQueryDto {
  @IsOptional()
  @IsEnum(RoleCategory)
  category?: RoleCategory;

  @IsOptional()
  @IsEnum(SensitivityLevel)
  sensitivityLevel?: SensitivityLevel;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
