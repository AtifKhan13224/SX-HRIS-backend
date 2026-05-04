import { IsString, IsEnum, IsOptional, IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CompositionType, InheritanceStrategy, OverrideRule } from '../entities/role-composition.entity';

export class CreateRoleCompositionDto {
  @IsUUID()
  roleId: string;

  @IsUUID()
  parentRoleId: string;

  @IsEnum(CompositionType)
  compositionType: CompositionType;

  @IsEnum(InheritanceStrategy)
  @IsOptional()
  inheritanceStrategy?: InheritanceStrategy = InheritanceStrategy.FULL;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OverrideRuleDto)
  overrideRules?: OverrideRuleDto[] = [];

  @IsOptional()
  @IsInt()
  priority?: number = 0;
}

export class OverrideRuleDto {
  @IsUUID()
  permissionId: string;

  @IsEnum(['ALLOW', 'DENY', 'INHERIT'])
  action: 'ALLOW' | 'DENY' | 'INHERIT';

  @IsString()
  reason: string;

  @IsInt()
  priority: number;
}

export class RoleInheritanceTreeDto {
  role: {
    id: string;
    roleCode: string;
    roleName: string;
  };
  parents: RoleInheritanceNodeDto[];
  children: RoleInheritanceNodeDto[];
  depth: number;
  totalPermissions: number;
  inheritedPermissions: number;
  directPermissions: number;
}

export class RoleInheritanceNodeDto {
  id: string;
  roleCode: string;
  roleName: string;
  compositionType: CompositionType;
  inheritanceStrategy: InheritanceStrategy;
  priority: number;
}
