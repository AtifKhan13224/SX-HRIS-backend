import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Application Pipeline Stage Entity
 * Tracks application progress through pipeline stages
 * Enterprise-grade stage tracking
 */
@Entity('application_pipeline_stages')
@Index(['applicationId'])
@Index(['stageId'])
@Index(['status'])
export class ApplicationPipelineStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'application_id' })
  @Index()
  applicationId: string;

  @Column({ type: 'uuid', name: 'pipeline_id' })
  pipelineId: string;

  @Column({ type: 'uuid', name: 'stage_id' })
  @Index()
  stageId: string;

  @Column({ type: 'varchar', length: 100, name: 'stage_name' })
  stageName: string;

  @Column({ type: 'int', name: 'stage_order' })
  stageOrder: number;

  @Column({ type: 'varchar', length: 50, name: 'stage_type' })
  stageType: string;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'not_started' })
  @Index()
  status: string; // not_started, in_progress, completed, skipped, failed

  @Column({ type: 'boolean', name: 'is_current_stage', default: false })
  isCurrentStage: boolean;

  // Timeline
  @Column({ type: 'timestamp', name: 'entered_at', nullable: true })
  enteredAt: Date;

  @Column({ type: 'timestamp', name: 'exited_at', nullable: true })
  exitedAt: Date;

  @Column({ type: 'int', name: 'days_in_stage', default: 0 })
  daysInStage: number;

  @Column({ type: 'int', name: 'expected_duration', default: 0 })
  expectedDuration: number;

  @Column({ type: 'boolean', name: 'is_overdue', default: false })
  isOverdue: boolean;

  // Actions
  @Column({ type: 'jsonb', name: 'required_actions', default: [] })
  requiredActions: Array<{
    action: string;
    isRequired: boolean;
    isCompleted: boolean;
    completedBy?: string;
    completedAt?: Date;
  }>;

  @Column({ type: 'boolean', name: 'all_actions_completed', default: false })
  allActionsCompleted: boolean;

  // Scoring
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'jsonb', name: 'score_details', default: {} })
  scoreDetails: {
    criteria: string;
    score: number;
    maxScore: number;
    evaluator?: string;
  }[];

  // Decision
  @Column({ type: 'varchar', length: 50, nullable: true })
  decision: string; // pass, fail, maybe, pending

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Approvals
  @Column({ type: 'jsonb', name: 'approvals', default: [] })
  approvals: Array<{
    approverId: string;
    approverName: string;
    approverRole: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    approvedAt?: Date;
  }>;

  @Column({ type: 'boolean', name: 'approval_required', default: false })
  approvalRequired: boolean;

  @Column({ type: 'boolean', name: 'is_approved', default: false })
  isApproved: boolean;

  // Movement
  @Column({ type: 'uuid', name: 'moved_by', nullable: true })
  movedBy: string;

  @Column({ type: 'text', name: 'move_reason', nullable: true })
  moveReason: string;

  @Column({ type: 'varchar', length: 50, name: 'move_direction', nullable: true })
  moveDirection: string; // forward, backward, skip

  // Notifications
  @Column({ type: 'boolean', name: 'candidate_notified', default: false })
  candidateNotified: boolean;

  @Column({ type: 'timestamp', name: 'candidate_notified_at', nullable: true })
  candidateNotifiedAt: Date;

  @Column({ type: 'boolean', name: 'team_notified', default: false })
  teamNotified: boolean;

  // Auto Actions
  @Column({ type: 'jsonb', name: 'auto_actions_executed', default: [] })
  autoActionsExecuted: Array<{
    action: string;
    executedAt: Date;
    success: boolean;
    result?: any;
  }>;

  // Audit
  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
