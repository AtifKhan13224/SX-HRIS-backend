import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

/**
 * Job Requisition Entity
 * Hiring request with configurable approval workflow
 * Enterprise-grade requisition management
 */
@Entity('job_requisitions')
@Index(['companyId', 'status'])
@Index(['departmentId', 'status'])
@Index(['requestedBy'])
export class JobRequisition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 100, name: 'requisition_number', unique: true })
  @Index()
  requisitionNumber: string;

  @Column({ type: 'varchar', length: 200, name: 'job_title' })
  jobTitle: string;

  @Column({ type: 'uuid', name: 'department_id' })
  @Index()
  departmentId: string;

  @Column({ type: 'uuid', name: 'division_id', nullable: true })
  divisionId: string;

  @Column({ type: 'uuid', name: 'business_unit_id', nullable: true })
  businessUnitId: string;

  @Column({ type: 'uuid', name: 'functional_area_id', nullable: true })
  functionalAreaId: string;

  @Column({ type: 'uuid', name: 'location_id' })
  locationId: string;

  @Column({ type: 'uuid', name: 'designation_id' })
  designationId: string;

  @Column({ type: 'varchar', length: 50, name: 'employment_type' })
  employmentType: string; // Full-Time, Part-Time, Contract, Temporary, Intern

  @Column({ type: 'varchar', length: 50, name: 'job_level' })
  jobLevel: string; // Entry, Mid, Senior, Lead, Manager, Director, VP, Executive

  @Column({ type: 'int', name: 'number_of_positions', default: 1 })
  numberOfPositions: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  responsibilities: string;

  @Column({ type: 'jsonb', name: 'required_qualifications', default: [] })
  requiredQualifications: Array<{
    type: 'education' | 'experience' | 'skill' | 'certification' | 'language';
    value: string;
    level?: string;
    isMandatory: boolean;
  }>;

  @Column({ type: 'jsonb', name: 'preferred_qualifications', default: [] })
  preferredQualifications: Array<{
    type: string;
    value: string;
    level?: string;
  }>;

  @Column({ type: 'jsonb', name: 'skills_required', default: [] })
  skillsRequired: Array<{
    skillId?: string;
    skillName: string;
    level: 'basic' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience?: number;
    isMandatory: boolean;
  }>;

  // Compensation
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'min_salary', nullable: true })
  minSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'max_salary', nullable: true })
  maxSalary: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, name: 'salary_frequency', nullable: true })
  salaryFrequency: string; // Annual, Monthly, Hourly

  @Column({ type: 'jsonb', name: 'additional_compensation', default: {} })
  additionalCompensation: {
    bonus?: { type: string; amount?: number; };
    equity?: { type: string; amount?: number; };
    benefits?: string[];
    [key: string]: any;
  };

  // Budget
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'approved_budget', nullable: true })
  approvedBudget: number;

  @Column({ type: 'varchar', length: 100, name: 'budget_code', nullable: true })
  budgetCode: string;

  @Column({ type: 'varchar', length: 100, name: 'cost_center', nullable: true })
  costCenter: string;

  // Justification
  @Column({ type: 'varchar', length: 50, name: 'position_type' })
  positionType: string; // New, Replacement, Backfill

  @Column({ type: 'uuid', name: 'replaced_employee_id', nullable: true })
  replacedEmployeeId: string;

  @Column({ type: 'text', name: 'business_justification' })
  businessJustification: string;

  @Column({ type: 'varchar', length: 50, name: 'urgency_level' })
  urgencyLevel: string; // Low, Medium, High, Critical

  // Timeline
  @Column({ type: 'date', name: 'target_start_date', nullable: true })
  targetStartDate: Date;

  @Column({ type: 'date', name: 'expected_close_date', nullable: true })
  expectedCloseDate: Date;

  // Approvals
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

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  @Index()
  status: string; // draft, pending_approval, approved, rejected, open, in_progress, filled, cancelled, on_hold

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  // Hiring Team
  @Column({ type: 'uuid', name: 'requested_by' })
  @Index()
  requestedBy: string;

  @Column({ type: 'uuid', name: 'hiring_manager_id' })
  hiringManagerId: string;

  @Column({ type: 'jsonb', name: 'recruiter_ids', default: [] })
  recruiterIds: string[];

  @Column({ type: 'jsonb', name: 'interview_panel', default: [] })
  interviewPanel: Array<{
    userId: string;
    userName?: string;
    role: string;
    interviewType?: string;
  }>;

  // Remote Work
  @Column({ type: 'varchar', length: 50, name: 'work_arrangement', default: 'office' })
  workArrangement: string; // office, remote, hybrid

  @Column({ type: 'int', name: 'remote_percentage', nullable: true })
  remotePercentage: number;

  @Column({ type: 'jsonb', name: 'remote_locations', default: [] })
  remoteLocations: string[];

  // Visa Sponsorship
  @Column({ type: 'boolean', name: 'visa_sponsorship_available', default: false })
  visaSponsorshipAvailable: boolean;

  @Column({ type: 'jsonb', name: 'visa_types_supported', default: [] })
  visaTypesSupported: string[];

  // Travel Requirements
  @Column({ type: 'int', name: 'travel_percentage', default: 0 })
  travelPercentage: number;

  @Column({ type: 'text', name: 'travel_description', nullable: true })
  travelDescription: string;

  // Diversity
  @Column({ type: 'boolean', name: 'is_diversity_role', default: false })
  isDiversityRole: boolean;

  @Column({ type: 'text', name: 'diversity_goals', nullable: true })
  diversityGoals: string;

  // Confidential
  @Column({ type: 'boolean', name: 'is_confidential', default: false })
  isConfidential: boolean;

  @Column({ type: 'text', name: 'confidentiality_reason', nullable: true })
  confidentialityReason: string;

  // Internal Posting
  @Column({ type: 'boolean', name: 'internal_only', default: false })
  internalOnly: boolean;

  @Column({ type: 'int', name: 'internal_posting_days', default: 0 })
  internalPostingDays: number;

  // Compliance
  @Column({ type: 'jsonb', name: 'compliance_checklist', default: {} })
  complianceChecklist: {
    eeoc: boolean;
    ofccp: boolean;
    localLaws: boolean;
    budgetApproved: boolean;
    headcountApproved: boolean;
    [key: string]: boolean;
  };

  // Analytics
  @Column({ type: 'date', name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ type: 'date', name: 'filled_at', nullable: true })
  filledAt: Date;

  @Column({ type: 'int', name: 'days_to_fill', nullable: true })
  daysToFill: number;

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
