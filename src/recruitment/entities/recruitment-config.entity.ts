import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Recruitment Configuration Entity
 * Enterprise-grade configurable recruitment system settings
 * Zero hardcoded values - all settings stored in database
 */
@Entity('recruitment_configs')
@Index(['companyId', 'isActive'])
export class RecruitmentConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 200, name: 'config_name' })
  configName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Workflow Configuration (JSON)
  @Column({ type: 'jsonb', name: 'pipeline_stages', default: {} })
  pipelineStages: {
    stages: Array<{
      id: string;
      name: string;
      order: number;
      type: 'screening' | 'interview' | 'assessment' | 'offer' | 'custom';
      isRequired: boolean;
      duration: number; // days
      actions: string[];
      autoActions: any[];
    }>;
  };

  // Approval Workflows (JSON)
  @Column({ type: 'jsonb', name: 'approval_workflows', default: {} })
  approvalWorkflows: {
    requisition: Array<{
      level: number;
      roles: string[];
      required: boolean;
      parallelApproval: boolean;
      threshold?: any;
    }>;
    offer: Array<{
      level: number;
      role: string;
      required: boolean;
      conditions?: any;
    }>;
  };

  // Email Templates (JSON)
  @Column({ type: 'jsonb', name: 'email_templates', default: {} })
  emailTemplates: {
    applicationReceived: { subject: string; body: string; };
    interviewInvitation: { subject: string; body: string; };
    interviewReminder: { subject: string; body: string; };
    offerExtended: { subject: string; body: string; };
    offerAccepted: { subject: string; body: string; };
    rejection: { subject: string; body: string; };
    [key: string]: { subject: string; body: string; };
  };

  // Scoring Configuration (JSON)
  @Column({ type: 'jsonb', name: 'scoring_config', default: {} })
  scoringConfig: {
    weights: {
      skills: number;
      experience: number;
      education: number;
      culturalFit: number;
      interview: number;
      assessment: number;
    };
    passingScore: number;
    categories: Array<{
      name: string;
      weight: number;
      criteria: any[];
    }>;
  };

  // Interview Types Configuration (JSON)
  @Column({ type: 'jsonb', name: 'interview_types', default: [] })
  interviewTypes: Array<{
    id: string;
    name: string;
    duration: number;
    isPanelInterview: boolean;
    evaluationCriteria: string[];
    defaultInterviewers: string[];
  }>;

  // Assessment Configuration (JSON)
  @Column({ type: 'jsonb', name: 'assessment_config', default: {} })
  assessmentConfig: {
    types: Array<{
      id: string;
      name: string;
      provider?: string;
      passingScore: number;
      isRequired: boolean;
    }>;
    autoSchedule: boolean;
    retakePolicy: any;
  };

  // Job Posting Channels (JSON)
  @Column({ type: 'jsonb', name: 'posting_channels', default: [] })
  postingChannels: Array<{
    id: string;
    name: string;
    type: 'job_board' | 'social_media' | 'internal' | 'referral' | 'agency';
    isActive: boolean;
    credentials?: any;
    postingCost?: number;
    currency?: string;
  }>;

  // Compliance Settings (JSON)
  @Column({ type: 'jsonb', name: 'compliance_settings', default: {} })
  complianceSettings: {
    gdpr: {
      enabled: boolean;
      dataRetentionDays: number;
      consentRequired: boolean;
      autoDeleteAfterDays: number;
    };
    eeoc: {
      enabled: boolean;
      reportingEnabled: boolean;
      requireDemographics: boolean;
    };
    ofccp: {
      enabled: boolean;
      veteranStatus: boolean;
      disabilityStatus: boolean;
    };
    localLaws: Array<{
      country: string;
      region?: string;
      requirements: any[];
    }>;
  };

  // SLA Configuration (JSON)
  @Column({ type: 'jsonb', name: 'sla_config', default: {} })
  slaConfig: {
    responseTime: number; // hours
    timeToInterview: number; // days
    timeToOffer: number; // days
    timeToHire: number; // days
    escalationRules: Array<{
      stage: string;
      threshold: number;
      notifyRoles: string[];
    }>;
  };

  // Notification Settings (JSON)
  @Column({ type: 'jsonb', name: 'notification_settings', default: {} })
  notificationSettings: {
    channels: Array<'email' | 'sms' | 'push' | 'in_app'>;
    events: {
      newApplication: string[];
      stageChange: string[];
      interviewScheduled: string[];
      offerExtended: string[];
      [key: string]: string[];
    };
  };

  // AI Configuration (JSON)
  @Column({ type: 'jsonb', name: 'ai_config', default: {} })
  aiConfig: {
    resumeParsing: {
      enabled: boolean;
      provider?: string;
      autoScore: boolean;
    };
    candidateMatching: {
      enabled: boolean;
      threshold: number;
      algorithm?: string;
    };
    duplicateDetection: {
      enabled: boolean;
      matchFields: string[];
    };
  };

  // Integration Settings (JSON)
  @Column({ type: 'jsonb', name: 'integration_settings', default: {} })
  integrationSettings: {
    calendar: {
      provider?: 'google' | 'outlook' | 'office365';
      apiKey?: string;
      autoSync: boolean;
    };
    ats: {
      provider?: string;
      apiEndpoint?: string;
      syncEnabled: boolean;
    };
    backgroundCheck: {
      provider?: string;
      apiKey?: string;
      autoTrigger: boolean;
    };
  };

  // Currency and Localization
  @Column({ type: 'varchar', length: 3, name: 'default_currency', default: 'USD' })
  defaultCurrency: string;

  @Column({ type: 'varchar', length: 10, name: 'default_language', default: 'en' })
  defaultLanguage: string;

  @Column({ type: 'varchar', length: 50, name: 'default_timezone', default: 'UTC' })
  defaultTimezone: string;

  // Status
  @Column({ type: 'boolean', name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault: boolean;

  // Audit fields
  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'metadata' })
  metadata: Record<string, any>;
}
