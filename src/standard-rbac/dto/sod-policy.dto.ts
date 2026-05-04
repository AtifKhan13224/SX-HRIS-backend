import { IsString, IsEnum, IsBoolean, IsOptional, IsArray, IsNumber, IsObject } from 'class-validator';
import { ConflictSeverity, ConflictAction } from '../entities/sod-policy.entity';

export class CreateSoDPolicyDto {
  @IsString()
  policyCode: string;

  @IsString()
  policyName: string;

  @IsOptional()
  @IsString()
  policyDescription?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsString()
  conflictingRole1: string;

  @IsString()
  conflictingRole2: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conflictingPermissions?: string[];

  @IsEnum(ConflictSeverity)
  conflictSeverity: ConflictSeverity;

  @IsEnum(ConflictAction)
  conflictAction: ConflictAction;

  @IsOptional()
  @IsString()
  businessJustification?: string;

  @IsOptional()
  @IsString()
  mitigatingControls?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regulatoryFrameworks?: string[];

  @IsOptional()
  @IsObject()
  complianceMapping?: Record<string, any>;

  @IsBoolean()
  requiresException: boolean;

  @IsOptional()
  @IsString()
  exceptionApproverRole?: string;

  @IsOptional()
  @IsNumber()
  exceptionValidityDays?: number;

  @IsBoolean()
  requiresPeriodicReview: boolean;

  @IsOptional()
  @IsNumber()
  reviewFrequencyDays?: number;

  @IsOptional()
  @IsObject()
  riskMetrics?: {
    riskScore: number;
    impactLevel: string;
    likelihood: string;
    residualRisk: number;
  };

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsString()
  createdBy: string;
}

export class UpdateSoDPolicyDto {
  @IsOptional()
  @IsString()
  policyName?: string;

  @IsOptional()
  @IsString()
  policyDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isEnforced?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conflictingPermissions?: string[];

  @IsOptional()
  @IsEnum(ConflictSeverity)
  conflictSeverity?: ConflictSeverity;

  @IsOptional()
  @IsEnum(ConflictAction)
  conflictAction?: ConflictAction;

  @IsOptional()
  @IsString()
  businessJustification?: string;

  @IsOptional()
  @IsString()
  mitigatingControls?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regulatoryFrameworks?: string[];

  @IsOptional()
  @IsObject()
  complianceMapping?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  requiresException?: boolean;

  @IsOptional()
  @IsString()
  exceptionApproverRole?: string;

  @IsOptional()
  @IsNumber()
  exceptionValidityDays?: number;

  @IsOptional()
  @IsObject()
  riskMetrics?: {
    riskScore: number;
    impactLevel: string;
    likelihood: string;
    residualRisk: number;
  };

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CheckSoDViolationDto {
  @IsString()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  roleIds: string[];

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class RequestSoDExceptionDto {
  @IsString()
  policyId: string;

  @IsString()
  userId: string;

  @IsString()
  requestorId: string;

  @IsString()
  justification: string;

  @IsString()
  businessReason: string;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
