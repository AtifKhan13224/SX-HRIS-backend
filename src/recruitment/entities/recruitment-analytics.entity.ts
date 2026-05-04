import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Recruitment Analytics Entity
 * Comprehensive recruitment metrics and KPIs
 * Enterprise-grade analytics and reporting
 */
@Entity('recruitment_analytics')
@Index(['companyId', 'periodType', 'periodStart'])
@Index(['requisitionId'])
@Index(['departmentId'])
export class RecruitmentAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  // Period
  @Column({ type: 'varchar', length: 50, name: 'period_type' })
  periodType: string; // daily, weekly, monthly, quarterly, yearly

  @Column({ type: 'date', name: 'period_start' })
  periodStart: Date;

  @Column({ type: 'date', name: 'period_end' })
  periodEnd: Date;

  // Scope
  @Column({ type: 'uuid', name: 'requisition_id', nullable: true })
  @Index()
  requisitionId: string;

  @Column({ type: 'uuid', name: 'department_id', nullable: true })
  @Index()
  departmentId: string;

  @Column({ type: 'uuid', name: 'location_id', nullable: true })
  locationId: string;

  @Column({ type: 'uuid', name: 'recruiter_id', nullable: true })
  recruiterId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  scope: string; // company, department, location, requisition, recruiter

  // Requisition Metrics
  @Column({ type: 'int', name: 'requisitions_created', default: 0 })
  requisitionsCreated: number;

  @Column({ type: 'int', name: 'requisitions_approved', default: 0 })
  requisitionsApproved: number;

  @Column({ type: 'int', name: 'requisitions_rejected', default: 0 })
  requisitionsRejected: number;

  @Column({ type: 'int', name: 'requisitions_open', default: 0 })
  requisitionsOpen: number;

  @Column({ type: 'int', name: 'requisitions_filled', default: 0 })
  requisitionsFilled: number;

  @Column({ type: 'int', name: 'requisitions_cancelled', default: 0 })
  requisitionsCancelled: number;

  // Job Posting Metrics
  @Column({ type: 'int', name: 'postings_published', default: 0 })
  postingsPublished: number;

  @Column({ type: 'int', name: 'postings_active', default: 0 })
  postingsActive: number;

  @Column({ type: 'int', name: 'total_posting_views', default: 0 })
  totalPostingViews: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'average_views_per_posting', default: 0 })
  averageViewsPerPosting: number;

  // Application Metrics
  @Column({ type: 'int', name: 'applications_received', default: 0 })
  applicationsReceived: number;

  @Column({ type: 'int', name: 'applications_qualified', default: 0 })
  applicationsQualified: number;

  @Column({ type: 'int', name: 'applications_screened', default: 0 })
  applicationsScreened: number;

  @Column({ type: 'int', name: 'applications_rejected', default: 0 })
  applicationsRejected: number;

  @Column({ type: 'int', name: 'applications_withdrawn', default: 0 })
  applicationsWithdrawn: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'application_to_view_rate', default: 0 })
  applicationToViewRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'qualification_rate', default: 0 })
  qualificationRate: number;

  // Candidate Metrics
  @Column({ type: 'int', name: 'new_candidates', default: 0 })
  newCandidates: number;

  @Column({ type: 'int', name: 'total_candidates', default: 0 })
  totalCandidates: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'average_candidate_quality_score', nullable: true })
  averageCandidateQualityScore: number;

  // Interview Metrics
  @Column({ type: 'int', name: 'interviews_scheduled', default: 0 })
  interviewsScheduled: number;

  @Column({ type: 'int', name: 'interviews_completed', default: 0 })
  interviewsCompleted: number;

  @Column({ type: 'int', name: 'interviews_no_show', default: 0 })
  interviewsNoShow: number;

  @Column({ type: 'int', name: 'interviews_cancelled', default: 0 })
  interviewsCancelled: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'interview_show_rate', default: 0 })
  interviewShowRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'average_interviews_per_hire', nullable: true })
  averageInterviewsPerHire: number;

  // Assessment Metrics
  @Column({ type: 'int', name: 'assessments_sent', default: 0 })
  assessmentsSent: number;

  @Column({ type: 'int', name: 'assessments_completed', default: 0 })
  assessmentsCompleted: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'assessment_completion_rate', default: 0 })
  assessmentCompletionRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'average_assessment_score', nullable: true })
  averageAssessmentScore: number;

  // Offer Metrics
  @Column({ type: 'int', name: 'offers_extended', default: 0 })
  offersExtended: number;

  @Column({ type: 'int', name: 'offers_accepted', default: 0 })
  offersAccepted: number;

  @Column({ type: 'int', name: 'offers_declined', default: 0 })
  offersDeclined: number;

  @Column({ type: 'int', name: 'offers_withdrawn', default: 0 })
  offersWithdrawn: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'offer_acceptance_rate', default: 0 })
  offerAcceptanceRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'offer_decline_rate', default: 0 })
  offerDeclineRate: number;

  // Hiring Metrics
  @Column({ type: 'int', name: 'hires_made', default: 0 })
  hiresMade: number;

  @Column({ type: 'int', name: 'start_dates_scheduled', default: 0 })
  startDatesScheduled: number;

  @Column({ type: 'int', name: 'no_shows_on_start', default: 0 })
  noShowsOnStart: number;

  // Time Metrics (in days)
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'average_time_to_fill', nullable: true })
  averageTimeToFill: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'average_time_to_hire', nullable: true })
  averageTimeToHire: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'average_time_to_interview', nullable: true })
  averageTimeToInterview: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'average_time_to_offer', nullable: true })
  averageTimeToOffer: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'average_time_in_stage', nullable: true })
  averageTimeInStage: number;

  // Pipeline Metrics
  @Column({ type: 'jsonb', name: 'pipeline_conversion_rates', default: {} })
  pipelineConversionRates: {
    applicationToScreening?: number;
    screeningToInterview?: number;
    interviewToOffer?: number;
    offerToHire?: number;
    [stage: string]: number;
  };

  @Column({ type: 'jsonb', name: 'stage_bottlenecks', default: [] })
  stageBottlenecks: Array<{
    stageName: string;
    averageDays: number;
    applicationsStuck: number;
  }>;

  // Source Effectiveness
  @Column({ type: 'jsonb', name: 'source_metrics', default: {} })
  sourceMetrics: {
    [source: string]: {
      applications: number;
      interviews: number;
      offers: number;
      hires: number;
      conversionRate: number;
      averageTimeToHire: number;
      cost: number;
      costPerHire: number;
    };
  };

  @Column({ type: 'jsonb', name: 'top_performing_sources', default: [] })
  topPerformingSources: Array<{
    source: string;
    hires: number;
    conversionRate: number;
    costPerHire: number;
  }>;

  // Cost Metrics
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_recruitment_cost', default: 0 })
  totalRecruitmentCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'cost_per_hire', nullable: true })
  costPerHire: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'posting_costs', default: 0 })
  postingCosts: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'assessment_costs', default: 0 })
  assessmentCosts: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'background_check_costs', default: 0 })
  backgroundCheckCosts: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'agency_fees', default: 0 })
  agencyFees: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'referral_bonuses', default: 0 })
  referralBonuses: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Quality Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'hire_quality_score', nullable: true })
  hireQualityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'new_hire_retention_90_days', nullable: true })
  newHireRetention90Days: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'new_hire_performance_rating', nullable: true })
  newHirePerformanceRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'hiring_manager_satisfaction', nullable: true })
  hiringManagerSatisfaction: number;

  // Diversity Metrics
  @Column({ type: 'jsonb', name: 'diversity_metrics', default: {} })
  diversityMetrics: {
    applications?: {
      total: number;
      byGender?: Record<string, number>;
      byEthnicity?: Record<string, number>;
      byVeteranStatus?: Record<string, number>;
    };
    hires?: {
      total: number;
      byGender?: Record<string, number>;
      byEthnicity?: Record<string, number>;
      byVeteranStatus?: Record<string, number>;
    };
    diversityHirePercentage?: number;
  };

  // Referral Metrics
  @Column({ type: 'int', name: 'referral_applications', default: 0 })
  referralApplications: number;

  @Column({ type: 'int', name: 'referral_hires', default: 0 })
  referralHires: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'referral_hire_rate', default: 0 })
  referralHireRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'referral_bonuses_paid', default: 0 })
  referralBonusesPaid: number;

  // Candidate Experience
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'candidate_satisfaction_score', nullable: true })
  candidateSatisfactionScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'application_abandonment_rate', nullable: true })
  applicationAbandonmentRate: number;

  @Column({ type: 'int', name: 'candidate_complaints', default: 0 })
  candidateComplaints: number;

  // Recruiter Performance
  @Column({ type: 'jsonb', name: 'recruiter_metrics', default: {} })
  recruiterMetrics: {
    [recruiterId: string]: {
      recruiterName: string;
      requisitionsHandled: number;
      applicationsProcessed: number;
      interviewsScheduled: number;
      hiresMade: number;
      averageTimeToFill: number;
      costPerHire: number;
    };
  };

  // SLA Compliance
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'sla_compliance_rate', default: 0 })
  slaComplianceRate: number;

  @Column({ type: 'int', name: 'sla_breaches', default: 0 })
  slaBreaches: number;

  @Column({ type: 'jsonb', name: 'sla_breaches_by_stage', default: {} })
  slaBreachesByStage: Record<string, number>;

  // Funnel Analysis
  @Column({ type: 'jsonb', name: 'recruitment_funnel', default: {} })
  recruitmentFunnel: {
    views?: number;
    applications?: number;
    screenings?: number;
    interviews?: number;
    offers?: number;
    hires?: number;
  };

  // Benchmarks
  @Column({ type: 'jsonb', default: {} })
  benchmarks: {
    industryAverage?: any;
    companyPrevious?: any;
    goals?: any;
  };

  // Trends
  @Column({ type: 'jsonb', default: {} })
  trends: {
    applicationTrend?: string; // increasing, decreasing, stable
    timeToHireTrend?: string;
    costTrend?: string;
    qualityTrend?: string;
  };

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

  // Auto-generated
  @Column({ type: 'boolean', name: 'is_auto_generated', default: false })
  isAutoGenerated: boolean;

  @Column({ type: 'timestamp', name: 'generated_at', nullable: true })
  generatedAt: Date;

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
