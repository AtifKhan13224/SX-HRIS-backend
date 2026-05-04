import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, Min, Max, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRegionDto {
  @IsString()
  groupCompanyId: string;

  @IsString()
  regionCode: string;

  @IsString()
  regionName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  regionType?: string;

  // Geographic Coverage
  @IsArray()
  @IsOptional()
  countries?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  countryCount?: number;

  @IsArray()
  @IsOptional()
  continents?: string[];

  @IsArray()
  @IsOptional()
  subregions?: string[];

  @IsObject()
  @IsOptional()
  geographicBounds?: Record<string, any>;

  @IsArray()
  @IsOptional()
  timezones?: string[];

  // Organizational Structure
  @IsString()
  @IsOptional()
  parentRegionId?: string;

  @IsArray()
  @IsOptional()
  childRegionIds?: string[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  hierarchyLevel?: number;

  @IsString()
  @IsOptional()
  hierarchyPath?: string;

  // Business Operations
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isOperational?: boolean;

  @IsBoolean()
  @IsOptional()
  hasOffices?: boolean;

  @IsBoolean()
  @IsOptional()
  hasEmployees?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  officeCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  employeeCount?: number;

  @IsArray()
  @IsOptional()
  businessUnits?: string[];

  @IsArray()
  @IsOptional()
  divisions?: string[];

  // Regional Leadership
  @IsString()
  @IsOptional()
  regionalManagerId?: string;

  @IsString()
  @IsOptional()
  regionalManagerName?: string;

  @IsString()
  @IsOptional()
  regionalDirectorId?: string;

  @IsString()
  @IsOptional()
  regionalDirectorName?: string;

  @IsString()
  @IsOptional()
  regionalHeadId?: string;

  @IsString()
  @IsOptional()
  regionalHeadName?: string;

  @IsObject()
  @IsOptional()
  leadershipTeam?: Record<string, any>;

  // Economic & Market Information
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalGdpUsd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageGdpPerCapitaUsd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalPopulation?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageCostOfLivingIndex?: number;

  @IsArray()
  @IsOptional()
  majorIndustries?: string[];

  @IsString()
  @IsOptional()
  economicClassification?: string;

  @IsString()
  @IsOptional()
  marketMaturity?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  averageUnemploymentRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(-50)
  @Max(100)
  averageInflationRate?: number;

  @IsObject()
  @IsOptional()
  marketCharacteristics?: Record<string, any>;

  // Currency & Financial
  @IsArray()
  @IsOptional()
  primaryCurrencies?: string[];

  @IsString()
  @IsOptional()
  defaultCurrency?: string;

  @IsObject()
  @IsOptional()
  currencyExchangeRates?: Record<string, any>;

  @IsObject()
  @IsOptional()
  financialMetrics?: Record<string, any>;

  // Languages
  @IsArray()
  @IsOptional()
  primaryLanguages?: string[];

  @IsArray()
  @IsOptional()
  businessLanguages?: string[];

  @IsString()
  @IsOptional()
  defaultLanguage?: string;

  @IsObject()
  @IsOptional()
  languageDistribution?: Record<string, any>;

  // Regulatory & Compliance
  @IsArray()
  @IsOptional()
  regulatoryFrameworks?: string[];

  @IsArray()
  @IsOptional()
  tradeAgreements?: string[];

  @IsArray()
  @IsOptional()
  economicBlocs?: string[];

  @IsObject()
  @IsOptional()
  complianceRequirements?: Record<string, any>;

  @IsArray()
  @IsOptional()
  dataProtectionRegulations?: string[];

  @IsBoolean()
  @IsOptional()
  hasUnifiedDataProtection?: boolean;

  @IsObject()
  @IsOptional()
  regulatoryBodies?: Record<string, any>;

  // Labor & Employment
  @IsNumber()
  @IsOptional()
  @Min(0)
  averageMinimumWage?: number;

  @IsString()
  @IsOptional()
  minimumWageCurrency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(168)
  averageWorkWeekHours?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(365)
  averageAnnualLeave?: number;

  @IsObject()
  @IsOptional()
  laborLawSummary?: Record<string, any>;

  @IsObject()
  @IsOptional()
  employmentRegulations?: Record<string, any>;

  // Compensation & Benefits
  @IsNumber()
  @IsOptional()
  @Min(0)
  averageSalaryUsd?: number;

  @IsObject()
  @IsOptional()
  salaryRangesByLevel?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  averageSocialSecurityRate?: number;

  @IsObject()
  @IsOptional()
  benefitsStandards?: Record<string, any>;

  @IsObject()
  @IsOptional()
  compensationBenchmarks?: Record<string, any>;

  // Talent & Workforce
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  talentAvailabilityScore?: number;

  @IsObject()
  @IsOptional()
  skillsAvailability?: Record<string, any>;

  @IsArray()
  @IsOptional()
  educationInstitutions?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  averageLiteracyRate?: number;

  @IsObject()
  @IsOptional()
  workforceStatistics?: Record<string, any>;

  // Technology & Infrastructure
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  internetPenetrationRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  mobilePenetrationRate?: number;

  @IsString()
  @IsOptional()
  technologyReadiness?: string;

  @IsObject()
  @IsOptional()
  infrastructureQuality?: Record<string, any>;

  // Risk Assessment
  @IsString()
  @IsOptional()
  overallRiskLevel?: string;

  @IsString()
  @IsOptional()
  politicalStability?: string;

  @IsString()
  @IsOptional()
  economicStability?: string;

  @IsString()
  @IsOptional()
  securityRating?: string;

  @IsObject()
  @IsOptional()
  riskAssessment?: Record<string, any>;

  @IsArray()
  @IsOptional()
  travelAdvisories?: string[];

  // Business Strategy
  @IsString()
  @IsOptional()
  strategicPriority?: string;

  @IsString()
  @IsOptional()
  growthPotential?: string;

  @IsObject()
  @IsOptional()
  strategicObjectives?: Record<string, any>;

  @IsObject()
  @IsOptional()
  investmentPriority?: Record<string, any>;

  @IsDateString()
  @IsOptional()
  targetExpansionDate?: string;

  // Performance Metrics
  @IsNumber()
  @IsOptional()
  @Min(0)
  annualRevenue?: number;

  @IsString()
  @IsOptional()
  revenueCurrency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  operatingCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(-100)
  @Max(100)
  profitMargin?: number;

  @IsNumber()
  @IsOptional()
  @Min(-100)
  @Max(1000)
  revenueGrowthRate?: number;

  @IsObject()
  @IsOptional()
  performanceMetrics?: Record<string, any>;

  // Contact & Administrative
  @IsString()
  @IsOptional()
  regionalOfficeLocation?: string;

  @IsString()
  @IsOptional()
  regionalOfficeAddress?: string;

  @IsString()
  @IsOptional()
  regionalPhoneNumber?: string;

  @IsString()
  @IsOptional()
  regionalEmail?: string;

  @IsString()
  @IsOptional()
  regionalWebsite?: string;

  // Dates & Timeline
  @IsDateString()
  @IsOptional()
  establishedDate?: string;

  @IsDateString()
  @IsOptional()
  operationalStartDate?: string;

  @IsDateString()
  @IsOptional()
  lastReviewDate?: string;

  @IsDateString()
  @IsOptional()
  nextReviewDate?: string;

  // Metadata
  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  sourceSystem?: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}

export class UpdateRegionDto extends PartialType(CreateRegionDto) {}
