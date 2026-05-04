import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum WorkflowType {
  ROLE_ASSIGNMENT = 'ROLE_ASSIGNMENT',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  SCOPE_MODIFICATION = 'SCOPE_MODIFICATION',
  ROLE_MODIFICATION = 'ROLE_MODIFICATION',
  SOD_EXCEPTION = 'SOD_EXCEPTION',
  BREAK_GLASS_ACCESS = 'BREAK_GLASS_ACCESS',
  PRIVILEGE_ELEVATION = 'PRIVILEGE_ELEVATION'
}

export enum WorkflowStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  IN_REVIEW = 'IN_REVIEW'
}

export enum ApprovalLevel {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3',
  FINAL = 'FINAL'
}

@Entity('governance_workflows')
@Index(['requestId'], { unique: true })
@Index(['tenantId', 'workflowStatus'])
@Index(['workflowType', 'workflowStatus'])
@Index(['requestorId', 'workflowStatus'])
export class GovernanceWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  @Index()
  requestId: string;

  @Column({
    type: 'enum',
    enum: WorkflowType
  })
  workflowType: WorkflowType;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.PENDING
  })
  @Index()
  workflowStatus: WorkflowStatus;

  @Column({ length: 100 })
  @Index()
  requestorId: string;

  @Column({ length: 100, nullable: true })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  targetRoleId: string;

  @Column({ length: 100, nullable: true })
  targetUserId: string;

  @Column({ type: 'jsonb', nullable: true })
  requestPayload: Record<string, any>;

  @Column({ type: 'text' })
  justification: string;

  @Column({ type: 'text', nullable: true })
  businessReason: string;

  @Column({ default: false })
  requiresDualApproval: boolean;

  @Column({ type: 'int', default: 1 })
  requiredApprovals: number;

  @Column({ type: 'int', default: 0 })
  receivedApprovals: number;

  @Column({ type: 'jsonb', nullable: true })
  approvalChain: Array<{
    level: ApprovalLevel;
    approverId: string;
    approverName: string;
    approvalStatus: string;
    approvedAt: Date;
    comments: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  currentApprovers: string[];

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ length: 100, nullable: true })
  approvedBy: string;

  @Column({ length: 100, nullable: true })
  rejectedBy: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  isExpired: boolean;

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ type: 'int', default: 5 })
  priority: number;

  @Column({ type: 'jsonb', nullable: true })
  riskAssessment: {
    riskLevel: string;
    riskScore: number;
    riskFactors: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  complianceChecks: Array<{
    checkType: string;
    passed: boolean;
    details: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail: Array<{
    timestamp: Date;
    actor: string;
    action: string;
    details: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
