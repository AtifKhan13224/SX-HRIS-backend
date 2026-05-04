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

@Entity('designation_names')
export class DesignationName {
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
  designationCode: string;

  @Column()
  designationName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  shortName: string;

  @Column({ nullable: true })
  abbreviation: string;

  // Classification
  @Column({ type: 'varchar', nullable: true })
  designationType: string; // Executive, Management, Professional, Technical, Administrative, Operational

  @Column({ type: 'varchar', nullable: true })
  hierarchyLevel: string; // C-Level, VP, Director, Manager, Lead, Senior, Mid, Junior, Entry

  @Column({ type: 'int', default: 1 })
  levelNumber: number; // 1 = Entry, 10 = C-Level

  @Column({ type: 'int', nullable: true })
  sortOrder: number;

  @Column({ default: false })
  isExecutive: boolean;

  @Column({ default: false })
  isManagement: boolean;

  @Column({ default: false })
  isLeadership: boolean;

  @Column({ default: false })
  isTechnical: boolean;

  // Alternative Names & Translations
  @Column({ type: 'jsonb', nullable: true })
  alternativeNames: string[];

  @Column({ type: 'jsonb', nullable: true })
  translations: Record<string, string>; // { "es": "Gerente", "fr": "Directeur" }

  @Column({ type: 'jsonb', nullable: true })
  synonyms: string[];

  // Industry & Function
  @Column({ type: 'varchar', nullable: true })
  industry: string; // Technology, Finance, Healthcare, Manufacturing, etc.

  @Column({ type: 'varchar', nullable: true })
  functionalArea: string; // IT, Finance, HR, Operations, Sales, Marketing

  @Column({ type: 'jsonb', nullable: true })
  applicableDepartments: string[];

  @Column({ type: 'jsonb', nullable: true })
  applicableIndustries: string[];

  // Role Characteristics
  @Column({ type: 'varchar', nullable: true })
  roleType: string; // Individual Contributor, People Manager, Functional Manager, Project Manager

  @Column({ type: 'varchar', nullable: true })
  responsibility: string; // Individual, Team, Department, Division, Enterprise

  @Column({ type: 'varchar', nullable: true })
  seniority: string; // Entry, Junior, Mid, Senior, Principal, Distinguished, Fellow

  @Column({ default: false })
  hasDirectReports: boolean;

  @Column({ type: 'int', nullable: true })
  typicalReportees: number;

  // Standards & Classifications
  @Column({ nullable: true })
  onetCode: string; // O*NET SOC code

  @Column({ nullable: true })
  iscoCode: string; // ISCO-08 code

  @Column({ nullable: true })
  socCode: string; // Standard Occupational Classification

  @Column({ nullable: true })
  naceCode: string; // NACE code for industry

  @Column({ type: 'jsonb', nullable: true })
  occupationalFamily: string[];

  // Compensation Guidance
  @Column({ type: 'jsonb', nullable: true })
  gradeRange: string[]; // Grade IDs applicable

  @Column({ type: 'jsonb', nullable: true })
  bandRange: string[]; // Band IDs applicable

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  marketMinSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  marketMaxSalary: number;

  @Column({ type: 'varchar', default: 'USD' })
  salaryCurrency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  marketPercentile: number; // 25th, 50th, 75th

  // Usage & Popularity
  @Column({ type: 'int', default: 0 })
  activePositionsCount: number;

  @Column({ type: 'int', default: 0 })
  totalEmployeesCount: number;

  @Column({ type: 'int', default: 0 })
  vacantPositionsCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  turnoverRate: number;

  @Column({ type: 'int', default: 0 })
  usageFrequency: number; // How many times used across organization

  // Skills & Competencies
  @Column({ type: 'jsonb', nullable: true })
  commonSkills: string[];

  @Column({ type: 'jsonb', nullable: true })
  requiredCertifications: string[];

  @Column({ type: 'jsonb', nullable: true })
  educationRequirements: string[];

  @Column({ type: 'int', nullable: true })
  minimumExperience: number; // Years

  @Column({ type: 'int', nullable: true })
  typicalExperience: number; // Years

  // Career Path
  @Column({ type: 'uuid', nullable: true })
  previousDesignationId: string;

  @Column({ type: 'uuid', nullable: true })
  nextDesignationId: string;

  @Column({ type: 'jsonb', nullable: true })
  careerPathOptions: Array<{
    designationId: string;
    pathway: string; // Promotion, Lateral, Alternative
  }>;

  @Column({ type: 'jsonb', nullable: true })
  progressionTimeline: {
    minYears: number;
    typicalYears: number;
    maxYears: number;
  };

  // Market Intelligence
  @Column({ type: 'varchar', nullable: true })
  marketDemand: string; // Low, Moderate, High, Very High

  @Column({ type: 'varchar', nullable: true })
  talentAvailability: string; // Abundant, Moderate, Scarce, Critical

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  growthRate: number; // Industry growth rate for this role

  @Column({ type: 'date', nullable: true })
  lastMarketReview: Date;

  @Column({ type: 'jsonb', nullable: true })
  competitorTitles: Array<{
    company: string;
    title: string;
    similarity: number; // 0-100
  }>;

  // Geographic Coverage
  @Column({ type: 'jsonb', nullable: true })
  applicableRegions: string[];

  @Column({ type: 'jsonb', nullable: true })
  applicableCountries: string[];

  @Column({ type: 'varchar', nullable: true })
  geographicScope: string; // Global, Regional, Country, Location

  @Column({ type: 'jsonb', nullable: true })
  regionalVariations: Array<{
    region: string;
    localTitle: string;
    notes: string;
  }>;

  // Business Context
  @Column({ default: false })
  isCustomerFacing: boolean;

  @Column({ default: false })
  isRevenueDriving: boolean;

  @Column({ default: false })
  isCostCenter: boolean;

  @Column({ default: false })
  requiresTravel: boolean;

  @Column({ type: 'int', nullable: true })
  travelPercentage: number;

  @Column({ type: 'varchar', nullable: true })
  workArrangement: string; // On-site, Hybrid, Remote, Field

  // Compliance & Governance
  @Column({ type: 'jsonb', nullable: true })
  regulatoryRequirements: string[];

  @Column({ type: 'jsonb', nullable: true })
  complianceNeeds: string[];

  @Column({ type: 'varchar', nullable: true })
  backgroundCheckLevel: string; // None, Basic, Standard, Enhanced

  @Column({ type: 'jsonb', nullable: true })
  securityClearance: string[];

  @Column({ default: false })
  requiresLicensing: boolean;

  @Column({ type: 'jsonb', nullable: true })
  requiredLicenses: string[];

  // Branding & Communication
  @Column({ nullable: true })
  externalTitle: string; // Title shown to external parties

  @Column({ nullable: true })
  internalTitle: string; // Title used internally

  @Column({ nullable: true })
  jobPostingTitle: string; // Title for job postings

  @Column({ type: 'text', nullable: true })
  marketingDescription: string; // For recruitment

  @Column({ type: 'jsonb', nullable: true })
  keywords: string[]; // SEO and search keywords

  // Analytics & Insights
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  averageActualSalary: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averagePerformanceRating: number;

  @Column({ type: 'int', nullable: true })
  averageTenureMonths: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  promotionRate: number;

  @Column({ type: 'int', nullable: true })
  averageTimeToFill: number; // Days

  @Column({ type: 'int', nullable: true })
  successorPipelineDepth: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  // Status & Dates
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeprecated: boolean;

  @Column({ default: false })
  isStandard: boolean; // Standard vs. custom designation

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  // Approval
  @Column({ type: 'varchar', nullable: true })
  approvalStatus: string; // Draft, Pending, Approved, Active

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

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
