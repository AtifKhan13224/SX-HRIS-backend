import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ApprovalType {
  SINGLE = 'SINGLE',
  DUAL = 'DUAL',
  MULTI_LEVEL = 'MULTI_LEVEL',
  COMMITTEE = 'COMMITTEE',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  CANCELLED = 'CANCELLED',
}

@Entity('report_access_approvals')
@Index(['tenantId', 'reportId', 'requesterId'])
@Index(['status'])
@Index(['expiresAt'])
export class ReportAccessApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'report_id', type: 'uuid' })
  @Index()
  reportId: string;

  @Column({ name: 'requester_id', type: 'uuid' })
  @Index()
  requesterId: string;

  @Column({ name: 'requester_role_id', type: 'uuid' })
  requesterRoleId: string;

  @Column({
    name: 'approval_type',
    type: 'enum',
    enum: ApprovalType,
  })
  approvalType: ApprovalType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  // Request details
  @Column({ name: 'business_justification', type: 'text' })
  businessJustification: string;

  @Column({ name: 'requested_permissions', type: 'jsonb' })
  requestedPermissions: Record<string, boolean>;

  @Column({ name: 'requested_duration_days', type: 'integer', nullable: true })
  requestedDurationDays: number;

  @Column({ name: 'access_start_date', type: 'timestamp', nullable: true })
  accessStartDate: Date;

  @Column({ name: 'access_end_date', type: 'timestamp', nullable: true })
  accessEndDate: Date;

  // Primary approver
  @Column({ name: 'primary_approver_id', type: 'uuid', nullable: true })
  primaryApproverId: string;

  @Column({ name: 'primary_approval_date', type: 'timestamp', nullable: true })
  primaryApprovalDate: Date;

  @Column({ name: 'primary_approval_comments', type: 'text', nullable: true })
  primaryApprovalComments: string;

  // Secondary approver (for dual approval)
  @Column({ name: 'secondary_approver_id', type: 'uuid', nullable: true })
  secondaryApproverId: string;

  @Column({ name: 'secondary_approval_date', type: 'timestamp', nullable: true })
  secondaryApprovalDate: Date;

  @Column({ name: 'secondary_approval_comments', type: 'text', nullable: true })
  secondaryApprovalComments: string;

  // Multi-level approval chain
  @Column({ name: 'approval_chain', type: 'jsonb', nullable: true })
  approvalChain: Array<{
    approverId: string;
    level: number;
    status: string;
    approvalDate: Date;
    comments: string;
  }>;

  @Column({ name: 'current_approval_level', type: 'integer', default: 1 })
  currentApprovalLevel: number;

  // Final decision
  @Column({ name: 'final_approver_id', type: 'uuid', nullable: true })
  finalApproverId: string;

  @Column({ name: 'final_approval_date', type: 'timestamp', nullable: true })
  finalApprovalDate: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  // Revocation
  @Column({ name: 'revoked_by', type: 'uuid', nullable: true })
  revokedBy: string;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({ name: 'revocation_reason', type: 'text', nullable: true })
  revocationReason: string;

  // Expiry
  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ name: 'auto_expire', type: 'boolean', default: true })
  autoExpire: boolean;

  @Column({ name: 'expiry_notification_sent', type: 'boolean', default: false })
  expiryNotificationSent: boolean;

  // Audit
  @Column({ name: 'access_granted_at', type: 'timestamp', nullable: true })
  accessGrantedAt: Date;

  @Column({ name: 'first_access_at', type: 'timestamp', nullable: true })
  firstAccessAt: Date;

  @Column({ name: 'last_access_at', type: 'timestamp', nullable: true })
  lastAccessAt: Date;

  @Column({ name: 'access_count', type: 'integer', default: 0 })
  accessCount: number;

  @Column({ name: 'export_count', type: 'integer', default: 0 })
  exportCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
