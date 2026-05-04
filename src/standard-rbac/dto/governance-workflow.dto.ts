import { IsString, IsEnum, IsBoolean, IsOptional, IsArray, IsNumber, IsObject, IsDateString } from 'class-validator';
import { WorkflowType, WorkflowStatus, ApprovalLevel } from '../entities/governance-workflow.entity';

export class CreateGovernanceWorkflowDto {
  @IsString()
  requestId: string;

  @IsEnum(WorkflowType)
  workflowType: WorkflowType;

  @IsString()
  requestorId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  targetRoleId?: string;

  @IsOptional()
  @IsString()
  targetUserId?: string;

  @IsObject()
  requestPayload: Record<string, any>;

  @IsString()
  justification: string;

  @IsOptional()
  @IsString()
  businessReason?: string;

  @IsBoolean()
  requiresDualApproval: boolean;

  @IsNumber()
  requiredApprovals: number;

  @IsArray()
  @IsString({ each: true })
  currentApprovers: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsBoolean()
  isUrgent: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsObject()
  riskAssessment?: {
    riskLevel: string;
    riskScore: number;
    riskFactors: string[];
  };

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ApproveWorkflowDto {
  @IsString()
  workflowId: string;

  @IsString()
  approverId: string;

  @IsString()
  approverName: string;

  @IsEnum(ApprovalLevel)
  approvalLevel: ApprovalLevel;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RejectWorkflowDto {
  @IsString()
  workflowId: string;

  @IsString()
  rejectedBy: string;

  @IsString()
  rejectionReason: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class QueryWorkflowDto {
  @IsOptional()
  @IsEnum(WorkflowType)
  workflowType?: WorkflowType;

  @IsOptional()
  @IsEnum(WorkflowStatus)
  workflowStatus?: WorkflowStatus;

  @IsOptional()
  @IsString()
  requestorId?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  approverId?: string;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsNumber()
  minPriority?: number;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
