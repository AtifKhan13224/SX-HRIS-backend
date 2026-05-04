import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Talent Pool Entity
 * Candidate segmentation and nurture campaigns
 * Enterprise-grade talent pool management
 */
@Entity('talent_pools')
@Index(['companyId', 'isActive'])
@Index(['poolType'])
export class TalentPool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 200, name: 'pool_name' })
  poolName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, name: 'pool_type' })
  @Index()
  poolType: string; // silver_medalists, passive_candidates, referrals, alumni, high_potential, diversity, executive, technical

  // Pool Configuration
  @Column({ type: 'jsonb', name: 'inclusion_criteria', default: {} })
  inclusionCriteria: {
    skills?: string[];
    experience?: { min?: number; max?: number; };
    education?: string[];
    locations?: string[];
    industries?: string[];
    companies?: string[];
    jobTitles?: string[];
    salaryRange?: { min?: number; max?: number; currency?: string; };
    availability?: string[];
    sources?: string[];
  };

  @Column({ type: 'boolean', name: 'auto_add_enabled', default: false })
  autoAddEnabled: boolean;

  @Column({ type: 'jsonb', name: 'auto_add_rules', default: [] })
  autoAddRules: Array<{
    condition: string;
    criteria: any;
    priority: number;
  }>;

  // Pool Members
  @Column({ type: 'jsonb', name: 'candidate_ids', default: [] })
  candidateIds: string[];

  @Column({ type: 'int', name: 'total_candidates', default: 0 })
  totalCandidates: number;

  @Column({ type: 'int', name: 'active_candidates', default: 0 })
  activeCandidates: number;

  @Column({ type: 'int', name: 'passive_candidates', default: 0 })
  passiveCandidates: number;

  // Segmentation
  @Column({ type: 'jsonb', default: [] })
  segments: Array<{
    id: string;
    name: string;
    criteria: any;
    candidateCount: number;
  }>;

  // Engagement
  @Column({ type: 'jsonb', name: 'engagement_config', default: {} })
  engagementConfig: {
    nurtureEnabled: boolean;
    touchpointFrequency?: string; // weekly, biweekly, monthly, quarterly
    communicationChannels?: Array<'email' | 'sms' | 'linkedin' | 'phone'>;
    contentTypes?: string[];
  };

  @Column({ type: 'jsonb', name: 'nurture_campaigns', default: [] })
  nurtureCampaigns: Array<{
    id: string;
    name: string;
    type: string;
    status: 'active' | 'paused' | 'completed';
    startDate?: Date;
    endDate?: Date;
    recipientCount?: number;
    openRate?: number;
    clickRate?: number;
  }>;

  // Engagement Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'engagement_rate', default: 0 })
  engagementRate: number;

  @Column({ type: 'int', name: 'emails_sent', default: 0 })
  emailsSent: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'email_open_rate', default: 0 })
  emailOpenRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'email_click_rate', default: 0 })
  emailClickRate: number;

  // Matching
  @Column({ type: 'jsonb', name: 'matching_criteria', default: {} })
  matchingCriteria: {
    skills?: { required: string[]; preferred: string[]; };
    experience?: { min?: number; max?: number; };
    education?: string[];
    locations?: string[];
    workAuthorization?: string[];
    availability?: string;
    salaryExpectation?: { min?: number; max?: number; };
  };

  @Column({ type: 'boolean', name: 'auto_matching_enabled', default: false })
  autoMatchingEnabled: boolean;

  @Column({ type: 'int', name: 'minimum_match_score', default: 70 })
  minimumMatchScore: number;

  // Job Alerts
  @Column({ type: 'boolean', name: 'job_alerts_enabled', default: true })
  jobAlertsEnabled: boolean;

  @Column({ type: 'varchar', length: 50, name: 'job_alert_frequency', nullable: true })
  jobAlertFrequency: string; // daily, weekly, monthly

  @Column({ type: 'jsonb', name: 'job_alert_preferences', default: {} })
  jobAlertPreferences: {
    categories?: string[];
    locations?: string[];
    jobTypes?: string[];
    experienceLevels?: string[];
  };

  // Sourcing
  @Column({ type: 'jsonb', name: 'source_breakdown', default: {} })
  sourceBreakdown: {
    [source: string]: number;
  };

  @Column({ type: 'jsonb', name: 'top_sources', default: [] })
  topSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;

  // Pipeline Activity
  @Column({ type: 'int', name: 'applications_generated', default: 0 })
  applicationsGenerated: number;

  @Column({ type: 'int', name: 'interviews_conducted', default: 0 })
  interviewsConducted: number;

  @Column({ type: 'int', name: 'offers_extended', default: 0 })
  offersExtended: number;

  @Column({ type: 'int', name: 'hires_made', default: 0 })
  hiresMade: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'conversion_rate', default: 0 })
  conversionRate: number;

  // Quality Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'average_candidate_rating', nullable: true })
  averageCandidateRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'average_hire_quality_score', nullable: true })
  averageHireQualityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'average_time_to_hire', nullable: true })
  averageTimeToHire: number;

  // Ownership
  @Column({ type: 'jsonb', name: 'owner_ids', default: [] })
  ownerIds: string[];

  @Column({ type: 'uuid', name: 'primary_owner_id' })
  primaryOwnerId: string;

  @Column({ type: 'varchar', length: 200, name: 'primary_owner_name', nullable: true })
  primaryOwnerName: string;

  @Column({ type: 'jsonb', name: 'team_access', default: [] })
  teamAccess: Array<{
    userId: string;
    userName: string;
    role: string;
    permissions: string[];
  }>;

  // Permissions
  @Column({ type: 'varchar', length: 50, default: 'private' })
  visibility: string; // private, team, company, public

  @Column({ type: 'boolean', name: 'requires_approval_to_join', default: false })
  requiresApprovalToJoin: boolean;

  // Tags & Categories
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'jsonb', default: [] })
  categories: string[];

  // Activity Tracking
  @Column({ type: 'timestamp', name: 'last_updated_at', nullable: true })
  lastUpdatedAt: Date;

  @Column({ type: 'timestamp', name: 'last_engagement_at', nullable: true })
  lastEngagementAt: Date;

  @Column({ type: 'timestamp', name: 'last_candidate_added_at', nullable: true })
  lastCandidateAddedAt: Date;

  // Expiration
  @Column({ type: 'boolean', name: 'auto_expire_enabled', default: false })
  autoExpireEnabled: boolean;

  @Column({ type: 'int', name: 'expire_after_days', nullable: true })
  expireAfterDays: number;

  @Column({ type: 'date', name: 'expires_at', nullable: true })
  expiresAt: Date;

  // Goals & Targets
  @Column({ type: 'jsonb', default: {} })
  goals: {
    targetCandidateCount?: number;
    targetHireCount?: number;
    targetEngagementRate?: number;
    targetConversionRate?: number;
  };

  // Status
  @Column({ type: 'boolean', name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'boolean', name: 'is_archived', default: false })
  isArchived: boolean;

  @Column({ type: 'timestamp', name: 'archived_at', nullable: true })
  archivedAt: Date;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

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
