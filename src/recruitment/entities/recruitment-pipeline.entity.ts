import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Recruitment Pipeline Entity
 * Configurable hiring stages with workflow automation
 * Enterprise-grade pipeline configuration
 */
@Entity('recruitment_pipelines')
@Index(['companyId', 'isActive'])
@Index(['requisitionId'])
export class RecruitmentPipeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 200, name: 'pipeline_name' })
  pipelineName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', name: 'requisition_id', nullable: true })
  @Index()
  requisitionId: string;

  @Column({ type: 'varchar', length: 50, name: 'pipeline_type', default: 'standard' })
  pipelineType: string; // standard, executive, technical, sales, custom

  // Stages Configuration (JSON)
  @Column({ type: 'jsonb', default: [] })
  stages: Array<{
    id: string;
    name: string;
    order: number;
    type: 'screening' | 'phone_screen' | 'interview' | 'assessment' | 'offer' | 'background_check' | 'reference_check' | 'custom';
    description?: string;
    duration: number; // expected days
    isRequired: boolean;
    isActive: boolean;
    color?: string;
    icon?: string;
    requiredActions: Array<{
      action: string;
      isRequired: boolean;
      performedBy: string[];
    }>;
    autoActions: Array<{
      trigger: string;
      action: string;
      delay?: number;
      conditions?: any;
    }>;
    approvals: Array<{
      approverRole: string;
      isRequired: boolean;
    }>;
    scoringCriteria?: any[];
  }>;

  // Workflow Rules (JSON)
  @Column({ type: 'jsonb', name: 'workflow_rules', default: {} })
  workflowRules: {
    autoAdvance: {
      enabled: boolean;
      conditions: any[];
    };
    autoReject: {
      enabled: boolean;
      conditions: any[];
    };
    escalation: {
      enabled: boolean;
      rules: Array<{
        stage: string;
        threshold: number;
        notifyRoles: string[];
      }>;
    };
    notifications: {
      enabled: boolean;
      events: string[];
    };
  };

  // SLA Configuration (JSON)
  @Column({ type: 'jsonb', name: 'sla_config', default: {} })
  slaConfig: {
    totalDuration: number; // expected total days
    stageThresholds: Record<string, number>;
    escalationEnabled: boolean;
    warningThreshold: number; // percentage
  };

  // Stage Transitions (JSON)
  @Column({ type: 'jsonb', name: 'allowed_transitions', default: {} })
  allowedTransitions: {
    [stageId: string]: {
      forward: string[];
      backward: string[];
      requiresApproval: boolean;
      requiresReason: boolean;
    };
  };

  // Default Settings (JSON)
  @Column({ type: 'jsonb', name: 'default_settings', default: {} })
  defaultSettings: {
    autoAssignRecruiter: boolean;
    autoScheduleScreening: boolean;
    sendCandidateNotifications: boolean;
    requireEvaluationBeforeAdvance: boolean;
    allowCandidateWithdrawal: boolean;
    allowHiringManagerOverride: boolean;
  };

  // Email Templates per Stage (JSON)
  @Column({ type: 'jsonb', name: 'stage_email_templates', default: {} })
  stageEmailTemplates: {
    [stageId: string]: {
      onEntry: { subject: string; body: string; };
      onExit: { subject: string; body: string; };
      reminder: { subject: string; body: string; };
    };
  };

  // Analytics
  @Column({ type: 'int', name: 'applications_count', default: 0 })
  applicationsCount: number;

  @Column({ type: 'int', name: 'active_applications', default: 0 })
  activeApplications: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'average_time_to_hire', nullable: true })
  averageTimeToHire: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'conversion_rate', nullable: true })
  conversionRate: number;

  @Column({ type: 'jsonb', name: 'stage_metrics', default: {} })
  stageMetrics: {
    [stageId: string]: {
      applicationsCount: number;
      averageDuration: number;
      conversionRate: number;
      dropOffRate: number;
    };
  };

  // Status
  @Column({ type: 'boolean', name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', name: 'is_template', default: false })
  isTemplate: boolean;

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
