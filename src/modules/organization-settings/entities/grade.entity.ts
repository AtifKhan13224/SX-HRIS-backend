import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupCompany } from './group-company.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relationship
  @Column({ type: 'uuid', nullable: true })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'groupCompanyId' })
  groupCompany: GroupCompany;

  // Basic Information
  @Column({ unique: true })
  gradeCode: string;

  @Column()
  gradeName: string;

  @Column({ type: 'text', nullable: true })
  gradeDescription: string;

  @Column({ nullable: true })
  gradeAbbreviation: string;

  // Hierarchy & Classification
  @Column({ type: 'int', default: 1 })
  gradeLevel: number; // 1 = Entry, 2 = Junior, 3 = Mid, 4 = Senior, 5 = Lead, etc.

  @Column({ type: 'varchar', nullable: true })
  gradeCategory: string; // Executive, Management, Professional, Technical, Administrative, Operational

  @Column({ type: 'varchar', nullable: true })
  organizationLevel: string; // C-Level, VP, Director, Manager, IC (Individual Contributor)

  @Column({ type: 'int', nullable: true })
  sortOrder: number;

  @Column({ type: 'uuid', nullable: true })
  parentGradeId: string;

  @Column({ default: false })
  isLeadershipGrade: boolean;

  @Column({ default: false })
  isExecutiveGrade: boolean;

  @Column({ default: false })
  isManagementGrade: boolean;

  // Salary & Compensation
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMinimum: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMidpoint: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMaximum: number;

  @Column({ type: 'varchar', default: 'USD' })
  salaryCurrency: string; // USD, EUR, GBP, INR, AUD

  @Column({ type: 'varchar', default: 'Annual' })
  salaryPeriod: string; // Annual, Monthly, Hourly

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  spreadPercentage: number; // (Max - Min) / Min * 100

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  targetCompensation: number; // Total target cash compensation

  // Pay Range Analytics
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  marketPositioning: number; // 50th percentile = 100, 75th = higher

  @Column({ type: 'varchar', nullable: true })
  comparatorGroup: string; // Industry peer group

  @Column({ type: 'date', nullable: true })
  lastMarketReview: Date;

  @Column({ type: 'date', nullable: true })
  nextMarketReview: Date;

  // Bonus & Incentives
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  targetBonusPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maximumBonusPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minimumBonusAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maximumBonusAmount: number;

  @Column({ default: false })
  eligibleForLTI: boolean; // Long-Term Incentive

  @Column({ default: false })
  eligibleForSTI: boolean; // Short-Term Incentive

  @Column({ default: false })
  eligibleForStockOptions: boolean;

  @Column({ type: 'jsonb', nullable: true })
  incentiveStructure: Array<{
    component: string;
    percentage: number;
    eligibility: string;
  }>;

  // Benefits & Perquisites
  @Column({ type: 'jsonb', nullable: true })
  benefits: string[];

  @Column({ type: 'jsonb', nullable: true })
  perquisites: string[]; // Car allowance, housing, club membership

  @Column({ type: 'int', nullable: true })
  annualLeaveEntitlement: number;

  @Column({ type: 'int', nullable: true })
  sickLeaveEntitlement: number;

  @Column({ type: 'varchar', nullable: true })
  insuranceTier: string; // Basic, Enhanced, Premium, Executive

  @Column({ type: 'varchar', nullable: true })
  retirementPlan: string; // 401k, Pension, etc.

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  employerContributionRate: number;

  // Career Progression
  @Column({ type: 'int', nullable: true })
  minimumYearsInGrade: number;

  @Column({ type: 'int', nullable: true })
  typicalYearsInGrade: number;

  @Column({ type: 'uuid', nullable: true })
  nextGradeId: string;

  @Column({ type: 'uuid', nullable: true })
  previousGradeId: string;

  @Column({ type: 'jsonb', nullable: true })
  promotionCriteria: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  typicalPromotionIncrease: number; // Percentage increase on promotion

  // Competency & Requirements
  @Column({ type: 'jsonb', nullable: true })
  requiredCompetencies: Array<{
    competency: string;
    level: string;
    isMandatory: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  educationRequirements: string[];

  @Column({ type: 'jsonb', nullable: true })
  certificationRequirements: string[];

  @Column({ type: 'int', nullable: true })
  minimumExperience: number; // Years

  @Column({ type: 'int', nullable: true })
  preferredExperience: number; // Years

  @Column({ type: 'jsonb', nullable: true })
  technicalSkills: string[];

  @Column({ type: 'jsonb', nullable: true })
  softSkills: string[];

  // Organizational Impact
  @Column({ type: 'varchar', nullable: true })
  decisionAuthority: string; // Operational, Tactical, Strategic

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAuthority: number;

  @Column({ type: 'int', nullable: true })
  typicalReportees: number;

  @Column({ type: 'int', nullable: true })
  typicalTeamSize: number;

  @Column({ type: 'varchar', nullable: true })
  spanOfControl: string; // Individual, Team, Department, Division, Enterprise

  @Column({ type: 'varchar', nullable: true })
  impactScope: string; // Individual, Team, Function, Business Unit, Organization

  @Column({ type: 'varchar', nullable: true })
  problemComplexity: string; // Routine, Moderate, Complex, Highly Complex

  // Job Evaluation
  @Column({ type: 'int', nullable: true })
  hayPoints: number; // Hay Job Evaluation points

  @Column({ type: 'int', nullable: true })
  ipeBandNumber: number; // IPE grading

  @Column({ type: 'varchar', nullable: true })
  mergerGrade: string; // Mercer job grading

  @Column({ type: 'jsonb', nullable: true })
  jobEvaluationFactors: Array<{
    factor: string;
    weight: number;
    score: number;
  }>;

  // Workforce Planning
  @Column({ type: 'int', default: 0 })
  currentHeadcount: number;

  @Column({ type: 'int', nullable: true })
  budgetedHeadcount: number;

  @Column({ type: 'int', nullable: true })
  vacantPositions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalCompensationCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  averageActualSalary: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  compaRatio: number; // Actual salary / Midpoint * 100

  // Performance & Talent
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averagePerformanceRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  attritionRate: number;

  @Column({ type: 'int', nullable: true })
  successorCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promotionRate: number; // Percentage promoted annually

  @Column({ type: 'int', nullable: true })
  averageTimeInGrade: number; // Months

  // Geographic & Business Unit Coverage
  @Column({ type: 'jsonb', nullable: true })
  applicableRegions: string[];

  @Column({ type: 'jsonb', nullable: true })
  applicableCountries: string[];

  @Column({ type: 'jsonb', nullable: true })
  applicableBusinessUnits: string[];

  @Column({ type: 'varchar', nullable: true })
  geographicScope: string; // Global, Regional, Country, Location

  // Compliance & Approvals
  @Column({ type: 'varchar', nullable: true })
  approvalStatus: string; // Draft, Pending, Approved, Active, Deprecated

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  exemptStatus: string; // Exempt, Non-Exempt (FLSA classification)

  @Column({ default: true })
  isEligibleForOvertime: boolean;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  // Status
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isCritical: boolean;

  @Column({ default: false })
  isObsolete: boolean;

  @Column({ type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  // Audit Fields
  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
