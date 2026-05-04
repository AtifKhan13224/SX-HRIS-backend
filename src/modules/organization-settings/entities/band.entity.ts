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

@Entity('bands')
export class Band {
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
  bandCode: string;

  @Column()
  bandName: string;

  @Column({ type: 'text', nullable: true })
  bandDescription: string;

  @Column({ nullable: true })
  bandAbbreviation: string;

  // Hierarchy & Classification
  @Column({ type: 'int', default: 1 })
  bandLevel: number; // 1 = Entry, 2 = Junior, 3 = Mid, 4 = Senior, etc.

  @Column({ type: 'varchar', nullable: true })
  bandType: string; // Leadership, Professional, Technical, Administrative, Support

  @Column({ type: 'varchar', nullable: true })
  careerTrack: string; // Management, Individual Contributor, Hybrid

  @Column({ type: 'int', nullable: true })
  sortOrder: number;

  @Column({ type: 'uuid', nullable: true })
  parentBandId: string;

  @Column({ default: false })
  isLeadershipBand: boolean;

  @Column({ default: false })
  isExecutiveBand: boolean;

  @Column({ default: false })
  isTechnicalBand: boolean;

  // Scope & Complexity
  @Column({ type: 'varchar', nullable: true })
  roleComplexity: string; // Basic, Moderate, Complex, Highly Complex, Strategic

  @Column({ type: 'varchar', nullable: true })
  decisionMakingLevel: string; // Operational, Tactical, Strategic, Enterprise

  @Column({ type: 'varchar', nullable: true })
  autonomyLevel: string; // Supervised, Guided, Independent, Empowered, Autonomous

  @Column({ type: 'varchar', nullable: true })
  impactRadius: string; // Individual, Team, Department, Division, Organization, Industry

  // Competency Framework
  @Column({ type: 'jsonb', nullable: true })
  coreCompetencies: Array<{
    competency: string;
    level: string;
    proficiency: string;
    isMandatory: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  leadershipCompetencies: Array<{
    competency: string;
    level: string;
    importance: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  technicalCompetencies: Array<{
    competency: string;
    level: string;
    domain: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  functionalCompetencies: Array<{
    competency: string;
    level: string;
    function: string;
  }>;

  // Career Progression
  @Column({ type: 'int', nullable: true })
  minYearsInBand: number;

  @Column({ type: 'int', nullable: true })
  typicalYearsInBand: number;

  @Column({ type: 'uuid', nullable: true })
  nextBandId: string;

  @Column({ type: 'uuid', nullable: true })
  previousBandId: string;

  @Column({ type: 'jsonb', nullable: true })
  lateralMoves: string[]; // Other band IDs for lateral career moves

  @Column({ type: 'jsonb', nullable: true })
  alternativeProgression: Array<{
    bandId: string;
    pathway: string;
    requirements: string[];
  }>;

  // Development & Growth
  @Column({ type: 'jsonb', nullable: true })
  developmentAreas: string[];

  @Column({ type: 'jsonb', nullable: true })
  trainingPrograms: Array<{
    program: string;
    provider: string;
    duration: string;
    isMandatory: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  learningPathways: Array<{
    pathway: string;
    courses: string[];
    estimatedHours: number;
  }>;

  @Column({ type: 'int', nullable: true })
  annualTrainingHours: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  developmentBudget: number;

  // Experience & Qualifications
  @Column({ type: 'int', nullable: true })
  minimumExperience: number; // Years

  @Column({ type: 'int', nullable: true })
  preferredExperience: number; // Years

  @Column({ type: 'jsonb', nullable: true })
  educationRequirements: Array<{
    degree: string;
    field: string;
    isMandatory: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  certifications: Array<{
    certification: string;
    issuingBody: string;
    isMandatory: boolean;
    validityPeriod: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  industryExperience: string[];

  // Responsibilities & Accountability
  @Column({ type: 'jsonb', nullable: true })
  keyResponsibilities: string[];

  @Column({ type: 'jsonb', nullable: true })
  accountabilities: string[];

  @Column({ type: 'varchar', nullable: true })
  managementResponsibility: string; // None, Individual Contributors, Team, Multi-Team, Department, Division

  @Column({ type: 'int', nullable: true })
  typicalDirectReports: number;

  @Column({ type: 'int', nullable: true })
  typicalTotalReports: number; // Including indirect reports

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetResponsibility: number;

  @Column({ type: 'varchar', nullable: true })
  approvalAuthority: string; // Financial approvals, hiring, etc.

  // Performance Expectations
  @Column({ type: 'jsonb', nullable: true })
  performanceIndicators: Array<{
    kpi: string;
    target: string;
    measurement: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  successMetrics: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  expectedPerformanceRating: number; // Target average rating

  @Column({ type: 'int', nullable: true })
  reviewFrequency: number; // Months

  // Compensation & Benefits (Band-level guidance)
  @Column({ type: 'jsonb', nullable: true })
  gradeRange: Array<string>; // Grade IDs applicable to this band

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minCompensation: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxCompensation: number;

  @Column({ type: 'varchar', default: 'USD' })
  compensationCurrency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bonusEligibility: number; // Percentage

  @Column({ default: false })
  eligibleForEquity: boolean;

  @Column({ type: 'jsonb', nullable: true })
  benefitsTier: string[]; // Benefits available at this band

  // Workforce Analytics
  @Column({ type: 'int', default: 0 })
  currentHeadcount: number;

  @Column({ type: 'int', nullable: true })
  targetHeadcount: number;

  @Column({ type: 'int', nullable: true })
  vacancies: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  turnoverRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promotionInRate: number; // % promoted into band

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promotionOutRate: number; // % promoted out of band

  @Column({ type: 'int', nullable: true })
  avgTenure: number; // Months

  // Diversity & Inclusion
  @Column({ type: 'jsonb', nullable: true })
  diversityMetrics: {
    genderBalance: { male: number; female: number; other: number };
    ageDistribution: Record<string, number>;
    diversityScore: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  inclusionInitiatives: string[];

  // Geographic & Business Coverage
  @Column({ type: 'jsonb', nullable: true })
  applicableLocations: string[];

  @Column({ type: 'jsonb', nullable: true })
  applicableRegions: string[];

  @Column({ type: 'jsonb', nullable: true })
  applicableBusinessUnits: string[];

  @Column({ type: 'varchar', nullable: true })
  geographicScope: string; // Global, Regional, Country, Location

  // Succession Planning
  @Column({ type: 'int', nullable: true })
  successorPipelineDepth: number; // Number of ready successors

  @Column({ type: 'int', nullable: true })
  criticalRoleCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  successionReadiness: number; // Percentage

  @Column({ type: 'jsonb', nullable: true })
  talentPipelinePrograms: string[];

  // Market Intelligence
  @Column({ type: 'varchar', nullable: true })
  marketDemand: string; // Low, Moderate, High, Very High

  @Column({ type: 'varchar', nullable: true })
  talentAvailability: string; // Abundant, Moderate, Scarce, Very Scarce

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  marketCompetitiveness: number; // Percentile

  @Column({ type: 'date', nullable: true })
  lastMarketAnalysis: Date;

  @Column({ type: 'jsonb', nullable: true })
  competitorBenchmark: Array<{
    company: string;
    similarRole: string;
    compensationRange: string;
  }>;

  // Compliance & Governance
  @Column({ type: 'jsonb', nullable: true })
  complianceRequirements: string[];

  @Column({ type: 'jsonb', nullable: true })
  mandatoryTraining: string[];

  @Column({ type: 'varchar', nullable: true })
  backgroundCheckLevel: string; // Basic, Standard, Enhanced, Comprehensive

  @Column({ type: 'jsonb', nullable: true })
  securityClearance: string[];

  @Column({ default: false })
  requiresRegulation: boolean; // Financial services, healthcare, etc.

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
  isStrategic: boolean;

  @Column({ type: 'varchar', nullable: true })
  approvalStatus: string; // Draft, Pending, Approved, Active

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  reviewDate: Date;

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
