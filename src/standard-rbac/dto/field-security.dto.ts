import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber, IsObject } from 'class-validator';
import { FieldSecurityAction, MaskingType } from '../entities/field-level-security.entity';

export class CreateFieldSecurityDto {
  @IsString()
  permissionId: string;

  @IsString()
  entityType: string;

  @IsString()
  fieldName: string;

  @IsOptional()
  @IsString()
  fieldDisplayName?: string;

  @IsEnum(FieldSecurityAction)
  securityAction: FieldSecurityAction;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsBoolean()
  isCountrySpecific: boolean;

  @IsBoolean()
  isConditional: boolean;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsEnum(MaskingType)
  maskingType?: MaskingType;

  @IsOptional()
  @IsString()
  maskingChar?: string;

  @IsOptional()
  @IsNumber()
  visibleChars?: number;

  @IsOptional()
  @IsObject()
  partialVisibilityConfig?: {
    showStart: number;
    showEnd: number;
    maskMiddle: boolean;
  };

  @IsBoolean()
  allowExport: boolean;

  @IsBoolean()
  allowPrint: boolean;

  @IsBoolean()
  requiresApprovalToView: boolean;

  @IsOptional()
  @IsString()
  approverRole?: string;

  @IsOptional()
  @IsNumber()
  viewDurationMinutes?: number;

  @IsBoolean()
  auditOnAccess: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsString()
  createdBy: string;
}

export class UpdateFieldSecurityDto {
  @IsOptional()
  @IsEnum(FieldSecurityAction)
  securityAction?: FieldSecurityAction;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isConditional?: boolean;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsEnum(MaskingType)
  maskingType?: MaskingType;

  @IsOptional()
  @IsString()
  maskingChar?: string;

  @IsOptional()
  @IsNumber()
  visibleChars?: number;

  @IsOptional()
  @IsObject()
  partialVisibilityConfig?: {
    showStart: number;
    showEnd: number;
    maskMiddle: boolean;
  };

  @IsOptional()
  @IsBoolean()
  allowExport?: boolean;

  @IsOptional()
  @IsBoolean()
  allowPrint?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresApprovalToView?: boolean;

  @IsOptional()
  @IsString()
  approverRole?: string;

  @IsOptional()
  @IsNumber()
  viewDurationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  auditOnAccess?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
