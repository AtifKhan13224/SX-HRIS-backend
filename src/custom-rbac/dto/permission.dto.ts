import { IsString, IsEnum, IsOptional, IsArray, IsInt, Min, Max, IsBoolean, IsUUID } from 'class-validator';
import { PermissionAction, DataType } from '../entities/permission.entity';

export class CreatePermissionDto {
  @IsString()
  module: string;

  @IsOptional()
  @IsString()
  subModule?: string;

  @IsString()
  feature: string;

  @IsArray()
  @IsEnum(PermissionAction, { each: true })
  actions: PermissionAction[];

  @IsEnum(DataType)
  @IsOptional()
  dataType?: DataType = DataType.STANDARD;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sensitivityTags?: string[] = [];

  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  riskLevel?: number = 0;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  subModule?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(PermissionAction, { each: true })
  actions?: PermissionAction[];

  @IsOptional()
  @IsEnum(DataType)
  dataType?: DataType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sensitivityTags?: string[];

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  riskLevel?: number;
}

export class PermissionMatrixQueryDto {
  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  subModule?: string;

  @IsOptional()
  @IsEnum(DataType)
  dataType?: DataType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];
}

export class PermissionMatrixResponseDto {
  permissions: PermissionDto[];
  roles: RolePermissionMatrixDto[];
  matrix: Record<string, Record<string, boolean>>;
}

export class PermissionDto {
  id: string;
  module: string;
  subModule: string;
  feature: string;
  actions: PermissionAction[];
  dataType: DataType;
  sensitivityTags: string[];
  displayName: string;
  description: string;
  riskLevel: number;
}

export class RolePermissionMatrixDto {
  roleId: string;
  roleCode: string;
  roleName: string;
  permissionIds: string[];
}
