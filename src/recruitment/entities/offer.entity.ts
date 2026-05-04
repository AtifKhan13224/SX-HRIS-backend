import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Offer Entity
 * Job offer management with approval workflow and negotiation tracking
 * Enterprise-grade offer management
 */
@Entity('offers')
@Index(['companyId', 'status'])
@Index(['applicationId'])
@Index(['candidateId'])
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'uuid', name: 'application_id' })
  @Index()
  applicationId: string;

  @Column({ type: 'uuid', name: 'candidate_id' })
  @Index()
  candidateId: string;

  @Column({ type: 'uuid', name: 'requisition_id' })
  requisitionId: string;

  @Column({ type: 'varchar', length: 100, name: 'offer_number', unique: true })
  @Index()
  offerNumber: string;

  // Offer Version
  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'uuid', name: 'previous_offer_id', nullable: true })
  previousOfferId: string;

  @Column({ type: 'boolean', name: 'is_revised', default: false })
  isRevised: boolean;

  // Job Details
  @Column({ type: 'varchar', length: 200, name: 'job_title' })
  jobTitle: string;

  @Column({ type: 'uuid', name: 'department_id' })
  departmentId: string;

  @Column({ type: 'uuid', name: 'designation_id' })
  designationId: string;

  @Column({ type: 'uuid', name: 'location_id' })
  locationId: string;

  @Column({ type: 'varchar', length: 50, name: 'employment_type' })
  employmentType: string; // Full-Time, Part-Time, Contract, Temporary

  @Column({ type: 'uuid', name: 'reporting_manager_id' })
  reportingManagerId: string;

  @Column({ type: 'varchar', length: 200, name: 'reporting_manager_name', nullable: true })
  reportingManagerName: string;

  @Column({ type: 'date', name: 'proposed_start_date' })
  proposedStartDate: Date;

  // Compensation
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'base_salary' })
  baseSalary: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, name: 'salary_frequency' })
  salaryFrequency: string; // Annual, Monthly, Hourly

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'signing_bonus', nullable: true })
  signingBonus: number;

  @Column({ type: 'text', name: 'signing_bonus_terms', nullable: true })
  signingBonusTerms: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'relocation_bonus', nullable: true })
  relocationBonus: number;

  @Column({ type: 'text', name: 'relocation_terms', nullable: true })
  relocationTerms: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'annual_bonus_target', nullable: true })
  annualBonusTarget: number;

  @Column({ type: 'varchar', length: 50, name: 'annual_bonus_type', nullable: true })
  annualBonusType: string; // percentage, fixed

  @Column({ type: 'text', name: 'bonus_terms', nullable: true })
  bonusTerms: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'equity_value', nullable: true })
  equityValue: number;

  @Column({ type: 'varchar', length: 50, name: 'equity_type', nullable: true })
  equityType: string; // RSU, Stock Options, etc.

  @Column({ type: 'int', name: 'equity_shares', nullable: true })
  equityShares: number;

  @Column({ type: 'text', name: 'equity_vesting_schedule', nullable: true })
  equityVestingSchedule: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'commission_target', nullable: true })
  commissionTarget: number;

  @Column({ type: 'text', name: 'commission_structure', nullable: true })
  commissionStructure: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_compensation' })
  totalCompensation: number;

  // Benefits
  @Column({ type: 'jsonb', default: [] })
  benefits: Array<{
    category: string;
    benefit: string;
    description?: string;
    value?: number;
  }>;

  @Column({ type: 'text', name: 'benefits_summary', nullable: true })
  benefitsSummary: string;

  // Leave Entitlements
  @Column({ type: 'int', name: 'annual_leave_days', nullable: true })
  annualLeaveDays: number;

  @Column({ type: 'int', name: 'sick_leave_days', nullable: true })
  sickLeaveDays: number;

  @Column({ type: 'jsonb', name: 'other_leaves', default: {} })
  otherLeaves: Record<string, number>;

  // Work Arrangement
  @Column({ type: 'varchar', length: 50, name: 'work_arrangement', default: 'office' })
  workArrangement: string; // office, remote, hybrid

  @Column({ type: 'int', name: 'remote_days_per_week', nullable: true })
  remoteDaysPerWeek: number;

  @Column({ type: 'text', name: 'work_arrangement_details', nullable: true })
  workArrangementDetails: string;

  // Probation
  @Column({ type: 'int', name: 'probation_period_months', default: 3 })
  probationPeriodMonths: number;

  @Column({ type: 'text', name: 'probation_terms', nullable: true })
  probationTerms: string;

  // Notice Period
  @Column({ type: 'int', name: 'notice_period_days' })
  noticePeriodDays: number;

  // Contract Terms
  @Column({ type: 'date', name: 'contract_end_date', nullable: true })
  contractEndDate: string;

  @Column({ type: 'text', name: 'special_terms', nullable: true })
  specialTerms: string;

  @Column({ type: 'jsonb', name: 'contingencies', default: [] })
  contingencies: Array<{
    type: string;
    description: string;
    isCompleted: boolean;
    completedAt?: Date;
  }>;

  // Documents
  @Column({ type: 'varchar', length: 500, name: 'offer_letter_url', nullable: true })
  offerLetterUrl: string;

  @Column({ type: 'varchar', length: 255, name: 'offer_letter_filename', nullable: true })
  offerLetterFilename: string;

  @Column({ type: 'timestamp', name: 'offer_letter_generated_at', nullable: true })
  offerLetterGeneratedAt: Date;

  @Column({ type: 'jsonb', name: 'supporting_documents', default: [] })
  supportingDocuments: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'draft' })
  @Index()
  status: string; // draft, pending_approval, approved, sent, viewed, accepted, declined, expired, withdrawn, cancelled

  // Approval Workflow
  @Column({ type: 'jsonb', name: 'approval_chain', default: [] })
  approvalChain: Array<{
    level: number;
    approverId: string;
    approverName?: string;
    approverRole: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    approvedAt?: Date;
  }>;

  @Column({ type: 'boolean', name: 'is_approved', default: false })
  isApproved: boolean;

  @Column({ type: 'timestamp', name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  // Timeline
  @Column({ type: 'timestamp', name: 'sent_at', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', name: 'viewed_at', nullable: true })
  viewedAt: Date;

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ type: 'int', name: 'valid_for_days', default: 7 })
  validForDays: number;

  @Column({ type: 'timestamp', name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'timestamp', name: 'declined_at', nullable: true })
  declinedAt: Date;

  @Column({ type: 'text', name: 'decline_reason', nullable: true })
  declineReason: string;

  // Negotiation
  @Column({ type: 'boolean', name: 'is_negotiable', default: true })
  isNegotiable: boolean;

  @Column({ type: 'int', name: 'negotiation_rounds', default: 0 })
  negotiationRounds: number;

  @Column({ type: 'jsonb', name: 'negotiation_history', default: [] })
  negotiationHistory: Array<{
    round: number;
    initiatedBy: 'candidate' | 'company';
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      requestedBy: string;
    }>;
    status: 'pending' | 'accepted' | 'rejected';
    notes?: string;
    timestamp: Date;
  }>;

  @Column({ type: 'text', name: 'candidate_counter_offer', nullable: true })
  candidateCounterOffer: string;

  // Candidate Response
  @Column({ type: 'text', name: 'candidate_comments', nullable: true })
  candidateComments: string;

  @Column({ type: 'jsonb', name: 'candidate_concerns', default: [] })
  candidateConcerns: Array<{
    concern: string;
    category: string;
    isResolved: boolean;
      resolution?: string;
  }>;

  // Withdrawal
  @Column({ type: 'timestamp', name: 'withdrawn_at', nullable: true })
  withdrawnAt: Date;

  @Column({ type: 'uuid', name: 'withdrawn_by', nullable: true })
  withdrawnBy: string;

  @Column({ type: 'text', name: 'withdrawal_reason', nullable: true })
  withdrawalReason: string;

  // Notifications
  @Column({ type: 'int', name: 'reminder_sent_count', default: 0 })
  reminderSentCount: number;

  @Column({ type: 'timestamp', name: 'last_reminder_sent_at', nullable: true })
  lastReminderSentAt: Date;

  // Onboarding
  @Column({ type: 'boolean', name: 'onboarding_initiated', default: false })
  onboardingInitiated: boolean;

  @Column({ type: 'uuid', name: 'employee_id', nullable: true })
  employeeId: string;

  @Column({ type: 'date', name: 'actual_start_date', nullable: true })
  actualStartDate: Date;

  // Cost
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_cost_to_company' })
  totalCostToCompany: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'recruitment_cost', nullable: true })
  recruitmentCost: number;

  // Notes
  @Column({ type: 'text', name: 'internal_notes', nullable: true })
  internalNotes: string;

  @Column({ type: 'text', name: 'hr_notes', nullable: true })
  hrNotes: string;

  // Tags
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

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
