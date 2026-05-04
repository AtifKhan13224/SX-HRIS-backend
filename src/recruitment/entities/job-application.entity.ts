import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Job Application Entity
 * Candidate applications with pipeline stage tracking
 * Enterprise-grade application management
 */
@Entity('job_applications')
@Index(['companyId', 'status'])
@Index(['candidateId'])
@Index(['postingId'])
@Index(['requisitionId'])
@Index(['currentStageId'])
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 100, name: 'application_number', unique: true })
  @Index()
  applicationNumber: string;

  @Column({ type: 'uuid', name: 'candidate_id' })
  @Index()
  candidateId: string;

  @Column({ type: 'uuid', name: 'posting_id' })
  @Index()
  postingId: string;

  @Column({ type: 'uuid', name: 'requisition_id' })
  @Index()
  requisitionId: string;

  @Column({ type: 'uuid', name: 'pipeline_id' })
  pipelineId: string;

  @Column({ type: 'uuid', name: 'current_stage_id' })
  @Index()
  currentStageId: string;

  @Column({ type: 'varchar', length: 100, name: 'current_stage_name' })
  currentStageName: string;

  // Application Source
  @Column({ type: 'varchar', length: 100 })
  source: string; // Career Site, LinkedIn, Indeed, Referral, etc.

  @Column({ type: 'varchar', length: 100, name: 'source_detail', nullable: true })
  sourceDetail: string;

  @Column({ type: 'varchar', length: 500, name: 'source_url', nullable: true })
  sourceUrl: string;

  @Column({ type: 'jsonb', name: 'utm_params', default: {} })
  utmParams: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };

  // Referral
  @Column({ type: 'boolean', name: 'is_referral', default: false })
  isReferral: boolean;

  @Column({ type: 'uuid', name: 'referrer_id', nullable: true })
  referrerId: string;

  @Column({ type: 'varchar', length: 200, name: 'referrer_name', nullable: true })
  referrerName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'referral_bonus_amount', nullable: true })
  referralBonusAmount: number;

  @Column({ type: 'varchar', length: 50, name: 'referral_bonus_status', nullable: true })
  referralBonusStatus: string;

  // Application Type
  @Column({ type: 'varchar', length: 50, name: 'application_type', default: 'external' })
  applicationType: string; // external, internal, rehire

  @Column({ type: 'boolean', name: 'is_internal_candidate', default: false })
  isInternalCandidate: boolean;

  @Column({ type: 'uuid', name: 'employee_id', nullable: true })
  employeeId: string;

  // Cover Letter
  @Column({ type: 'text', name: 'cover_letter', nullable: true })
  coverLetter: string;

  // Custom Questions Responses
  @Column({ type: 'jsonb', name: 'application_responses', default: [] })
  applicationResponses: Array<{
    questionId: string;
    question: string;
    answer: any;
    answerType: string;
  }>;

  // Screening Questions Responses
  @Column({ type: 'jsonb', name: 'screening_responses', default: [] })
  screeningResponses: Array<{
    questionId: string;
    question: string;
    answer: any;
    expectedAnswer?: any;
    isCorrect?: boolean;
    isKnockout: boolean;
  }>;

  @Column({ type: 'boolean', name: 'passed_screening', default: true })
  passedScreening: boolean;

  @Column({ type: 'text', name: 'screening_failure_reason', nullable: true })
  screeningFailureReason: string;

  // Documents
  @Column({ type: 'jsonb', default: [] })
  documents: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    uploadedAt: Date;
    isRequired: boolean;
  }>;

  @Column({ type: 'boolean', name: 'all_documents_submitted', default: false })
  allDocumentsSubmitted: boolean;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'new' })
  @Index()
  status: string; // new, screening, interviewing, assessment, offer, hired, rejected, withdrawn, on_hold

  @Column({ type: 'varchar', length: 50, name: 'disposition', nullable: true })
  disposition: string; // qualified, not_qualified, overqualified, underqualified, no_show, etc.

  @Column({ type: 'text', name: 'disposition_reason', nullable: true })
  dispositionReason: string;

  // Ratings & Scores
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'overall_score', nullable: true })
  overallScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'resume_match_score', nullable: true })
  resumeMatchScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'screening_score', nullable: true })
  screeningScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'interview_score', nullable: true })
  interviewScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'assessment_score', nullable: true })
  assessmentScore: number;

  @Column({ type: 'jsonb', name: 'score_breakdown', default: {} })
  scoreBreakdown: {
    skills?: number;
    experience?: number;
    education?: number;
    culturalFit?: number;
    [key: string]: number;
  };

  // Hiring Team
  @Column({ type: 'uuid', name: 'assigned_recruiter_id', nullable: true })
  assignedRecruiterId: string;

  @Column({ type: 'uuid', name: 'hiring_manager_id' })
  hiringManagerId: string;

  @Column({ type: 'jsonb', name: 'team_ratings', default: [] })
  teamRatings: Array<{
    userId: string;
    userName: string;
    role: string;
    rating: number;
    recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
    comments?: string;
    submittedAt: Date;
  }>;

  // Salary
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'expected_salary', nullable: true })
  expectedSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'current_salary', nullable: true })
  currentSalary: number;

  @Column({ type: 'varchar', length: 3, name: 'salary_currency', default: 'USD' })
  salaryCurrency: string;

  @Column({ type: 'boolean', name: 'salary_negotiable', default: true })
  salaryNegotiable: boolean;

  // Availability
  @Column({ type: 'date', name: 'available_from', nullable: true })
  availableFrom: Date;

  @Column({ type: 'int', name: 'notice_period_days', nullable: true })
  noticePeriodDays: number;

  // Timeline
  @Column({ type: 'timestamp', name: 'submitted_at' })
  submittedAt: Date;

  @Column({ type: 'timestamp', name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'timestamp', name: 'shortlisted_at', nullable: true })
  shortlistedAt: Date;

  @Column({ type: 'timestamp', name: 'rejected_at', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'timestamp', name: 'withdrawn_at', nullable: true })
  withdrawnAt: Date;

  @Column({ type: 'timestamp', name: 'hired_at', nullable: true })
  hiredAt: Date;

  @Column({ type: 'int', name: 'days_in_pipeline', default: 0 })
  daysInPipeline: number;

  @Column({ type: 'int', name: 'days_in_current_stage', default: 0 })
  daysInCurrentStage: number;

  // Stage History
  @Column({ type: 'jsonb', name: 'stage_history', default: [] })
  stageHistory: Array<{
    stageId: string;
    stageName: string;
    enteredAt: Date;
    exitedAt?: Date;
    daysInStage?: number;
    movedBy?: string;
    notes?: string;
  }>;

  // Interview Summary
  @Column({ type: 'int', name: 'interviews_scheduled', default: 0 })
  interviewsScheduled: number;

  @Column({ type: 'int', name: 'interviews_completed', default: 0 })
  interviewsCompleted: number;

  @Column({ type: 'int', name: 'interviews_no_show', default: 0 })
  interviewsNoShow: number;

  @Column({ type: 'timestamp', name: 'next_interview_at', nullable: true })
  nextInterviewAt: Date;

  // Assessment Summary
  @Column({ type: 'int', name: 'assessments_assigned', default: 0 })
  assessmentsAssigned: number;

  @Column({ type: 'int', name: 'assessments_completed', default: 0 })
  assessmentsCompleted: number;

  // Offer Summary
  @Column({ type: 'boolean', name: 'has_offer', default: false })
  hasOffer: boolean;

  @Column({ type: 'uuid', name: 'offer_id', nullable: true })
  offerId: string;

  @Column({ type: 'varchar', length: 50, name: 'offer_status', nullable: true })
  offerStatus: string;

  // Background Check
  @Column({ type: 'boolean', name: 'background_check_required', default: false })
  backgroundCheckRequired: boolean;

  @Column({ type: 'varchar', length: 50, name: 'background_check_status', nullable: true })
  backgroundCheckStatus: string;

  @Column({ type: 'timestamp', name: 'background_check_completed_at', nullable: true })
  backgroundCheckCompletedAt: Date;

  // Reference Check
  @Column({ type: 'boolean', name: 'reference_check_required', default: false })
  referenceCheckRequired: boolean;

  @Column({ type: 'int', name: 'references_completed', default: 0 })
  referencesCompleted: number;

  @Column({ type: 'int', name: 'references_required', default: 0 })
  referencesRequired: number;

  // Flags
  @Column({ type: 'boolean', name: 'is_flagged', default: false })
  isFlagged: boolean;

  @Column({ type: 'text', name: 'flag_reason', nullable: true })
  flagReason: string;

  @Column({ type: 'boolean', name: 'is_priority', default: false })
  isPriority: boolean;

  @Column({ type: 'boolean', name: 'is_on_hold', default: false })
  isOnHold: boolean;

  @Column({ type: 'text', name: 'on_hold_reason', nullable: true })
  onHoldReason: string;

  // Communication
  @Column({ type: 'int', name: 'emails_sent', default: 0 })
  emailsSent: number;

  @Column({ type: 'timestamp', name: 'last_email_sent_at', nullable: true })
  lastEmailSentAt: Date;

  @Column({ type: 'timestamp', name: 'last_contacted_at', nullable: true })
  lastContactedAt: Date;

  // Compliance
  @Column({ type: 'boolean', name: 'eeoc_data_collected', default: false })
  eeocDataCollected: boolean;

  @Column({ type: 'boolean', name: 'gdpr_consent', default: false })
  gdprConsent: boolean;

  // Notes & Comments
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', default: [] })
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    comment: string;
    isPrivate: boolean;
    createdAt: Date;
  }>;

  // Tags
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  // Analytics
  @Column({ type: 'varchar', length: 50, name: 'device_type', nullable: true })
  deviceType: string;

  @Column({ type: 'varchar', length: 100, name: 'browser', nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 100, name: 'ip_address', nullable: true })
  ipAddress: string;

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
