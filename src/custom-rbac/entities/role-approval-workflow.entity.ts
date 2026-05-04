import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum ApproverType {
  USER = 'USER',
  ROLE = 'ROLE',
  MANAGER = 'MANAGER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  SECURITY_ADMIN = 'SECURITY_ADMIN',
  LEGAL = 'LEGAL'
}

export enum WorkflowTrigger {
  ROLE_CREATE = 'ROLE_CREATE',
  ROLE_MODIFY = 'ROLE_MODIFY',
  ROLE_DELETE = 'ROLE_DELETE',
  HIGH_RISK_PERMISSION = 'HIGH_RISK_PERMISSION',
  SOD_VIOLATION = 'SOD_VIOLATION'
}

export interface ApprovalStage {
  sequenceNumber: number;
  stageName: string;
  approverType: ApproverType;
  approvers: string[];
  requiresAll: boolean;
  mandatoryJustification: boolean;
  slaHours?: number;
  escalationPath?: string[];
}

@Entity('role_approval_workflows')
@Index(['tenantId'])
export class RoleApprovalWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Approval Stages
  @Column({ type: 'jsonb' })
  stages: ApprovalStage[];

  // Triggers
  @Column({ type: 'jsonb', default: [] })
  triggers: WorkflowTrigger[];

  // Applicability Rules
  @Column({ name: 'applies_to_risk_level', type: 'int', nullable: true })
  appliesToRiskLevel: number;

  @Column({ name: 'applies_to_sensitivity', type: 'varchar', nullable: true })
  appliesToSensitivity: string;

  @Column({ name: 'auto_approve_below_risk', type: 'int', nullable: true })
  autoApproveBelowRisk: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
