import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GroupCompany } from './group-company.entity';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_company_id' })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  // Basic Information
  @Column({ unique: true, length: 20 })
  regionCode: string;

  @Column({ length: 200 })
  regionName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  regionType: string; // Geographic, Administrative, Economic, Business, Custom

  // Geographic Coverage
  @Column({ type: 'simple-array', nullable: true })
  countries: string[];

  @Column({ type: 'int', default: 0 })
  countryCount: number;

  @Column({ type: 'simple-array', nullable: true })
  continents: string[];

  @Column({ type: 'simple-array', nullable: true })
  subregions: string[];

  @Column({ type: 'jsonb', nullable: true })
  geographicBounds: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  timezones: string[];

  // Organizational Structure
  @Column({ type: 'uuid', nullable: true })
  parentRegionId: string;

  @Column({ type: 'simple-array', nullable: true })
  childRegionIds: string[];

  @Column({ type: 'int', nullable: true })
  hierarchyLevel: number;

  @Column({ length: 500, nullable: true })
  hierarchyPath: string;

  // Business Operations
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isOperational: boolean;

  @Column({ type: 'boolean', default: false })
  hasOffices: boolean;

  @Column({ type: 'boolean', default: false })
  hasEmployees: boolean;

  @Column({ type: 'int', default: 0 })
  officeCount: number;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ type: 'simple-array', nullable: true })
  businessUnits: string[];

  @Column({ type: 'simple-array', nullable: true })
  divisions: string[];

  // Regional Leadership
  @Column({ type: 'uuid', nullable: true })
  regionalManagerId: string;

  @Column({ length: 200, nullable: true })
  regionalManagerName: string;

  @Column({ type: 'uuid', nullable: true })
  regionalDirectorId: string;

  @Column({ length: 200, nullable: true })
  regionalDirectorName: string;

  @Column({ type: 'uuid', nullable: true })
  regionalHeadId: string;

  @Column({ length: 200, nullable: true })
  regionalHeadName: string;

  @Column({ type: 'jsonb', nullable: true })
  leadershipTeam: Record<string, any>;

  // Economic & Market Information
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  totalGdpUsd: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  averageGdpPerCapitaUsd: number;

  @Column({ type: 'bigint', nullable: true })
  totalPopulation: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageCostOfLivingIndex: number;

  @Column({ type: 'simple-array', nullable: true })
  majorIndustries: string[];

  @Column({ length: 100, nullable: true })
  economicClassification: string;

  @Column({ length: 100, nullable: true })
  marketMaturity: string; // Emerging, Developing, Developed, Advanced

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageUnemploymentRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageInflationRate: number;

  @Column({ type: 'jsonb', nullable: true })
  marketCharacteristics: Record<string, any>;

  // Currency & Financial
  @Column({ type: 'simple-array', nullable: true })
  primaryCurrencies: string[];

  @Column({ length: 10, nullable: true })
  defaultCurrency: string;

  @Column({ type: 'jsonb', nullable: true })
  currencyExchangeRates: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  financialMetrics: Record<string, any>;

  // Languages
  @Column({ type: 'simple-array', nullable: true })
  primaryLanguages: string[];

  @Column({ type: 'simple-array', nullable: true })
  businessLanguages: string[];

  @Column({ length: 10, nullable: true })
  defaultLanguage: string;

  @Column({ type: 'jsonb', nullable: true })
  languageDistribution: Record<string, any>;

  // Regulatory & Compliance
  @Column({ type: 'simple-array', nullable: true })
  regulatoryFrameworks: string[];

  @Column({ type: 'simple-array', nullable: true })
  tradeAgreements: string[];

  @Column({ type: 'simple-array', nullable: true })
  economicBlocs: string[];

  @Column({ type: 'jsonb', nullable: true })
  complianceRequirements: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  dataProtectionRegulations: string[];

  @Column({ type: 'boolean', default: false })
  hasUnifiedDataProtection: boolean;

  @Column({ type: 'jsonb', nullable: true })
  regulatoryBodies: Record<string, any>;

  // Labor & Employment
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageMinimumWage: number;

  @Column({ length: 10, nullable: true })
  minimumWageCurrency: string;

  @Column({ type: 'int', nullable: true })
  averageWorkWeekHours: number;

  @Column({ type: 'int', nullable: true })
  averageAnnualLeave: number;

  @Column({ type: 'jsonb', nullable: true })
  laborLawSummary: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  employmentRegulations: Record<string, any>;

  // Compensation & Benefits
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  averageSalaryUsd: number;

  @Column({ type: 'jsonb', nullable: true })
  salaryRangesByLevel: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageSocialSecurityRate: number;

  @Column({ type: 'jsonb', nullable: true })
  benefitsStandards: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  compensationBenchmarks: Record<string, any>;

  // Talent & Workforce
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  talentAvailabilityScore: number;

  @Column({ type: 'jsonb', nullable: true })
  skillsAvailability: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  educationInstitutions: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageLiteracyRate: number;

  @Column({ type: 'jsonb', nullable: true })
  workforceStatistics: Record<string, any>;

  // Technology & Infrastructure
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  internetPenetrationRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  mobilePenetrationRate: number;

  @Column({ length: 100, nullable: true })
  technologyReadiness: string; // Low, Medium, High, Advanced

  @Column({ type: 'jsonb', nullable: true })
  infrastructureQuality: Record<string, any>;

  // Risk Assessment
  @Column({ length: 100, nullable: true })
  overallRiskLevel: string; // Low, Medium, High, Critical

  @Column({ length: 100, nullable: true })
  politicalStability: string;

  @Column({ length: 100, nullable: true })
  economicStability: string;

  @Column({ length: 100, nullable: true })
  securityRating: string;

  @Column({ type: 'jsonb', nullable: true })
  riskAssessment: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  travelAdvisories: string[];

  // Business Strategy
  @Column({ length: 100, nullable: true })
  strategicPriority: string; // Critical, High, Medium, Low

  @Column({ length: 100, nullable: true })
  growthPotential: string; // High Growth, Steady, Declining

  @Column({ type: 'jsonb', nullable: true })
  strategicObjectives: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  investmentPriority: Record<string, any>;

  @Column({ type: 'date', nullable: true })
  targetExpansionDate: Date;

  // Performance Metrics
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ length: 10, nullable: true })
  revenueCurrency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  operatingCost: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  profitMargin: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  revenueGrowthRate: number;

  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics: Record<string, any>;

  // Contact & Administrative
  @Column({ length: 200, nullable: true })
  regionalOfficeLocation: string;

  @Column({ type: 'text', nullable: true })
  regionalOfficeAddress: string;

  @Column({ length: 50, nullable: true })
  regionalPhoneNumber: string;

  @Column({ length: 100, nullable: true })
  regionalEmail: string;

  @Column({ length: 200, nullable: true })
  regionalWebsite: string;

  // Dates & Timeline
  @Column({ type: 'date', nullable: true })
  establishedDate: Date;

  @Column({ type: 'date', nullable: true })
  operationalStartDate: Date;

  @Column({ type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 100, nullable: true })
  sourceSystem: string;

  @Column({ length: 100, nullable: true })
  externalId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;
}
