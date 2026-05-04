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
import { Band } from './band.entity';

@Entity('level_within_bands')
export class LevelWithinBand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relationships
  @Column({ type: 'uuid', nullable: true })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'groupCompanyId' })
  groupCompany: GroupCompany;

  @Column({ type: 'uuid', nullable: true })
  bandId: string;

  @ManyToOne(() => Band)
  @JoinColumn({ name: 'bandId' })
  band: Band;

  // Basic Information
  @Column({ unique: true })
  levelCode: string;

  @Column()
  levelName: string;

  @Column({ type: 'text', nullable: true })
  levelDescription: string;

  @Column({ nullable: true })
  levelAbbreviation: string;

  // Hierarchy & Position
  @Column({ type: 'int', default: 1 })
  levelNumber: number; // 1 = Entry, 2 = Junior, 3 = Mid, 4 = Senior, 5 = Lead, etc.

  @Column({ type: 'int', nullable: true })
  sortOrder: number;

  @Column({ type: 'varchar', nullable: true })
  levelTitle: string; // Associate, Senior Associate, Manager, Senior Manager, etc.

  @Column({ type: 'uuid', nullable: true })
  previousLevelId: string;

  @Column({ type: 'uuid', nullable: true })
  nextLevelId: string;

  @Column({ default: false })
  isEntryLevel: boolean;

  @Column({ default: false })
  isMidLevel: boolean;

  @Column({ default: false })
  isSeniorLevel: boolean;

  @Column({ default: false })
  isLeadershipLevel: boolean;

  // Competency Requirements
  @Column({ type: 'jsonb', nullable: true })
  requiredCompetencies: Array<{
    competency: string;
    level: string;
    proficiency: string;
    criticality: string;
    assessmentMethod: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  technicalSkills: Array<{
    skill: string;
    level: string;
    domain: string;
    isMandatory: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  softSkills: Array<{
    skill: string;
    level: string;
    importance: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  leadershipCapabilities: Array<{
    capability: string;
    level: string;
    context: string;
  }>;

  // Experience & Qualifications
  @Column({ type: 'int', nullable: true })
  minimumExperience: number; // Years

  @Column({ type: 'int', nullable: true })
  typicalExperience: number; // Years

  @Column({ type: 'int', nullable: true })
  maximumExperience: number; // Years

  @Column({ type: 'jsonb', nullable: true })
  educationRequirements: Array<{
    degree: string;
    field: string[];
    institution: string;
    isMandatory: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  certifications: Array<{
    certification: string;
    issuingBody: string;
    validityPeriod: string;
    isMandatory: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  professionalMemberships: string[];

  // Role Characteristics
  @Column({ type: 'varchar', nullable: true })
  roleComplexity: string; // Basic, Intermediate, Complex, Highly Complex

  @Column({ type: 'varchar', nullable: true })
  problemSolving: string; // Routine, Guided, Independent, Strategic

  @Column({ type: 'varchar', nullable: true })
  decisionAuthority: string; // Limited, Moderate, Significant, Full

  @Column({ type: 'varchar', nullable: true })
  autonomyLevel: string; // Supervised, Guided, Independent, Fully Autonomous

  @Column({ type: 'varchar', nullable: true })
  innovationExpectation: string; // Follow, Contribute, Lead, Pioneer

  // Responsibilities & Scope
  @Column({ type: 'jsonb', nullable: true })
  keyResponsibilities: string[];

  @Column({ type: 'jsonb', nullable: true })
  accountabilities: string[];

  @Column({ type: 'varchar', nullable: true })
  impactScope: string; // Individual, Team, Function, Business Unit, Enterprise

  @Column({ type: 'varchar', nullable: true })
  timeHorizon: string; // Immediate, Short-term, Medium-term, Long-term, Strategic

  @Column({ type: 'int', nullable: true })
  typicalDirectReports: number;

  @Column({ type: 'int', nullable: true })
  typicalIndirectReports: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAuthority: number;

  @Column({ type: 'jsonb', nullable: true })
  approvalLimits: Array<{
    category: string;
    limit: number;
    currency: string;
  }>;

  // Performance Standards
  @Column({ type: 'jsonb', nullable: true })
  performanceExpectations: Array<{
    area: string;
    expectation: string;
    measurement: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  kpis: Array<{
    kpi: string;
    target: string;
    frequency: string;
    weight: number;
  }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  targetPerformanceRating: number;

  @Column({ type: 'jsonb', nullable: true })
  deliverables: string[];

  @Column({ type: 'jsonb', nullable: true })
  qualityStandards: string[];

  // Career Progression
  @Column({ type: 'int', nullable: true })
  minTimeInLevel: number; // Months

  @Column({ type: 'int', nullable: true })
  typicalTimeInLevel: number; // Months

  @Column({ type: 'int', nullable: true })
  maxTimeInLevel: number; // Months

  @Column({ type: 'jsonb', nullable: true })
  promotionCriteria: Array<{
    criterion: string;
    weight: number;
    assessmentMethod: string;
  }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promotionReadinessThreshold: number; // Percentage

  @Column({ type: 'jsonb', nullable: true })
  lateralMoves: Array<{
    levelId: string;
    pathway: string;
    requirements: string[];
  }>;

  // Development & Learning
  @Column({ type: 'jsonb', nullable: true })
  developmentAreas: string[];

  @Column({ type: 'jsonb', nullable: true })
  trainingPrograms: Array<{
    program: string;
    provider: string;
    duration: string;
    deliveryMode: string;
    isMandatory: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  onboardingProgram: Array<{
    phase: string;
    duration: string;
    activities: string[];
    milestones: string[];
  }>;

  @Column({ type: 'int', nullable: true })
  annualTrainingHours: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  developmentBudgetPerEmployee: number;

  @Column({ type: 'jsonb', nullable: true })
  mentorshipRequirements: {
    required: boolean;
    frequency: string;
    duration: string;
  };

  // Compensation Guidelines
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMinimum: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMidpoint: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMaximum: number;

  @Column({ type: 'varchar', default: 'USD' })
  salaryCurrency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  targetBonusPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxBonusPercentage: number;

  @Column({ default: false })
  eligibleForEquity: boolean;

  @Column({ type: 'jsonb', nullable: true })
  equityRange: {
    minimum: number;
    maximum: number;
    vestingPeriod: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  benefitsPackage: string[];

  @Column({ type: 'int', nullable: true })
  annualLeaveEntitlement: number;

  // Workforce Analytics
  @Column({ type: 'int', default: 0 })
  currentHeadcount: number;

  @Column({ type: 'int', nullable: true })
  targetHeadcount: number;

  @Column({ type: 'int', nullable: true })
  openPositions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  avgSalary: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  compaRatio: number; // Actual avg salary / Midpoint * 100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  avgPerformanceRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  turnoverRate: number;

  @Column({ type: 'int', nullable: true })
  avgTenureMonths: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promotionRate: number; // % promoted annually

  @Column({ type: 'int', nullable: true })
  timeToFillDays: number;

  // Succession & Talent
  @Column({ type: 'int', nullable: true })
  successorCount: number;

  @Column({ type: 'int', nullable: true })
  highPotentialCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  successionCoverage: number; // Percentage

  @Column({ type: 'jsonb', nullable: true })
  talentPoolPrograms: string[];

  // Market Intelligence
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  marketPercentile: number; // 25th, 50th, 75th

  @Column({ type: 'varchar', nullable: true })
  talentAvailability: string; // Abundant, Moderate, Scarce

  @Column({ type: 'date', nullable: true })
  lastMarketReview: Date;

  @Column({ type: 'jsonb', nullable: true })
  marketBenchmark: Array<{
    source: string;
    percentile: number;
    salary: number;
    bonus: number;
    totalComp: number;
  }>;

  // Risk & Compliance
  @Column({ type: 'jsonb', nullable: true })
  complianceRequirements: string[];

  @Column({ type: 'jsonb', nullable: true })
  mandatoryTraining: Array<{
    training: string;
    frequency: string;
    validityPeriod: string;
  }>;

  @Column({ type: 'varchar', nullable: true })
  backgroundCheckLevel: string;

  @Column({ type: 'jsonb', nullable: true })
  securityClearance: string[];

  @Column({ type: 'varchar', nullable: true })
  riskLevel: string; // Low, Medium, High, Critical

  // Geographic & Business Coverage
  @Column({ type: 'jsonb', nullable: true })
  applicableLocations: string[];

  @Column({ type: 'jsonb', nullable: true })
  applicableRegions: string[];

  @Column({ type: 'jsonb', nullable: true })
  applicableDepartments: string[];

  @Column({ type: 'varchar', nullable: true })
  geographicScope: string; // Local, Regional, National, Global

  // Diversity & Inclusion
  @Column({ type: 'jsonb', nullable: true })
  diversityMetrics: {
    genderBalance: Record<string, number>;
    ageDistribution: Record<string, number>;
    diversityScore: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  inclusionInitiatives: string[];

  // Work Arrangement
  @Column({ type: 'varchar', nullable: true })
  workArrangement: string; // On-site, Hybrid, Remote

  @Column({ type: 'int', nullable: true })
  onsiteDaysPerWeek: number;

  @Column({ type: 'varchar', nullable: true })
  travelRequirement: string; // None, Minimal, Moderate, Extensive

  @Column({ type: 'int', nullable: true })
  travelPercentage: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  // Status & Approval
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isCritical: boolean;

  @Column({ default: false })
  isHighDemand: boolean;

  @Column({ type: 'varchar', nullable: true })
  approvalStatus: string; // Draft, Pending, Approved, Active

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

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
