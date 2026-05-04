import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { CustomRole } from './custom-role.entity';

export enum RequestType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  MODIFY = 'MODIFY',
  DELETE = 'DELETE',
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  COMPOSITION_CHANGE = 'COMPOSITION_CHANGE'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  IMPLEMENTED = 'IMPLEMENTED'
}

export interface RoleSnapshot {
  before?: Partial<CustomRole>;
  after?: Partial<CustomRole>;
  permissionChanges?: PermissionChange[];
}

export interface PermissionChange {
  type: 'ADD' | 'REMOVE' | 'MODIFY';
  permissionId: string;
  oldScope?: any;
  newScope?: any;
}

export interface ImpactAssessment {
  usersAffected: number;
  permissionsAdded: number;
  permissionsRemoved: number;
  scopeChanges: string[];
  riskIncrease: number;
}

export interface ApprovalRecord {
  stageNumber: number;
  stageName: string;
  approverId: string;
  approverName: string;
  action: 'APPROVED' | 'REJECTED';
  comments: string;
  timestamp: Date;
}

export interface SoDViolation {
  policyId: string;
  policyName: string;
  conflictType: string;
  violatingPermissions: string[];
  violatingRoles?: string[];
  riskSeverity: string;
  enforcement: string;
  recommendation: string;
}

export interface SecurityReview {
  reviewedBy: string;
  reviewedAt: Date;
  riskAssessment: string;
  recommendations: string[];
  approved: boolean;
}

@Entity('role_change_requests')
@Index(['roleId'])
@Index(['status'])
@Index(['requestedBy'])
export class RoleChangeRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({
    name: 'request_type',
    type: 'enum',
    enum: RequestType
  })
  requestType: RequestType;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy: string;

  @Column({ name: 'requested_at', type: 'timestamp' })
  requestedAt: Date;

  // Change Details
  @Column({ name: 'change_snapshot', type: 'jsonb' })
  changeSnapshot: RoleSnapshot;

  @Column({ name: 'requested_changes', type: 'jsonb', nullable: true })
  requestedChanges: any;

  @Column({ type: 'text' })
  justification: string;

  @Column({ name: 'business_reason', type: 'text', nullable: true })
  businessReason: string;

  @Column({ name: 'impact_assessment', type: 'jsonb', nullable: true })
  impactAssessment: ImpactAssessment;

  // Approval Status
  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING
  })
  status: RequestStatus;

  @Column({ name: 'current_stage', type: 'int', default: 0 })
  currentStage: number;

  @Column({ name: 'approval_history', type: 'jsonb', default: [] })
  approvalHistory: ApprovalRecord[];

  // Risk Assessment
  @Column({ name: 'risk_score', type: 'int', default: 0 })
  riskScore: number;

  @Column({ name: 'sod_violations', type: 'jsonb', default: [] })
  sodViolations: SoDViolation[];

  @Column({ name: 'security_review', type: 'jsonb', nullable: true })
  securityReview: SecurityReview;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'workflow_id', type: 'uuid', nullable: true })
  workflowId: string;

  workflow?: any;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CustomRole)
  @JoinColumn({ name: 'role_id' })
  role: CustomRole;
}
