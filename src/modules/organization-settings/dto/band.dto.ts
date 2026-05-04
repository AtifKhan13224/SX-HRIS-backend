import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateBandDto {
  @IsString()
  bandCode: string;

  @IsString()
  bandName: string;

  @IsOptional()
  @IsString()
  bandDescription?: string;

  @IsOptional()
  @IsString()
  bandAbbreviation?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  bandLevel?: number;

  @IsOptional()
  @IsString()
  bandType?: string;

  @IsOptional()
  @IsString()
  careerTrack?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  parentBandId?: string;

  @IsOptional()
  @IsBoolean()
  isLeadershipBand?: boolean;

  @IsOptional()
  @IsBoolean()
  isExecutiveBand?: boolean;

  @IsOptional()
  @IsBoolean()
  isTechnicalBand?: boolean;

  @IsOptional()
  @IsString()
  roleComplexity?: string;

  @IsOptional()
  @IsString()
  decisionMakingLevel?: string;

  @IsOptional()
  @IsString()
  autonomyLevel?: string;

  @IsOptional()
  @IsString()
  impactRadius?: string;

  @IsOptional()
  @IsArray()
  coreCompetencies?: Array<{
    competency: string;
    level: string;
    proficiency: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  leadershipCompetencies?: Array<{
    competency: string;
    level: string;
    importance: string;
  }>;

  @IsOptional()
  @IsArray()
  technicalCompetencies?: Array<{
    competency: string;
    level: string;
    domain: string;
  }>;

  @IsOptional()
  @IsArray()
  functionalCompetencies?: Array<{
    competency: string;
    level: string;
    function: string;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minYearsInBand?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalYearsInBand?: number;

  @IsOptional()
  @IsString()
  nextBandId?: string;

  @IsOptional()
  @IsString()
  previousBandId?: string;

  @IsOptional()
  @IsArray()
  lateralMoves?: string[];

  @IsOptional()
  @IsArray()
  alternativeProgression?: Array<{
    bandId: string;
    pathway: string;
    requirements: string[];
  }>;

  @IsOptional()
  @IsArray()
  developmentAreas?: string[];

  @IsOptional()
  @IsArray()
  trainingPrograms?: Array<{
    program: string;
    provider: string;
    duration: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  learningPathways?: Array<{
    pathway: string;
    courses: string[];
    estimatedHours: number;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualTrainingHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  developmentBudget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preferredExperience?: number;

  @IsOptional()
  @IsArray()
  educationRequirements?: Array<{
    degree: string;
    field: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  certifications?: Array<{
    certification: string;
    issuingBody: string;
    isMandatory: boolean;
    validityPeriod: string;
  }>;

  @IsOptional()
  @IsArray()
  industryExperience?: string[];

  @IsOptional()
  @IsArray()
  keyResponsibilities?: string[];

  @IsOptional()
  @IsArray()
  accountabilities?: string[];

  @IsOptional()
  @IsString()
  managementResponsibility?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalDirectReports?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalTotalReports?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetResponsibility?: number;

  @IsOptional()
  @IsString()
  approvalAuthority?: string;

  @IsOptional()
  @IsArray()
  performanceIndicators?: Array<{
    kpi: string;
    target: string;
    measurement: string;
  }>;

  @IsOptional()
  @IsArray()
  successMetrics?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  expectedPerformanceRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  reviewFrequency?: number;

  @IsOptional()
  @IsArray()
  gradeRange?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minCompensation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCompensation?: number;

  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  compensationCurrency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bonusEligibility?: number;

  @IsOptional()
  @IsBoolean()
  eligibleForEquity?: boolean;

  @IsOptional()
  @IsArray()
  benefitsTier?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentHeadcount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetHeadcount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vacancies?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  turnoverRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionInRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionOutRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avgTenure?: number;

  @IsOptional()
  @IsObject()
  diversityMetrics?: {
    genderBalance: { male: number; female: number; other: number };
    ageDistribution: Record<string, number>;
    diversityScore: number;
  };

  @IsOptional()
  @IsArray()
  inclusionInitiatives?: string[];

  @IsOptional()
  @IsArray()
  applicableLocations?: string[];

  @IsOptional()
  @IsArray()
  applicableRegions?: string[];

  @IsOptional()
  @IsArray()
  applicableBusinessUnits?: string[];

  @IsOptional()
  @IsString()
  geographicScope?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  successorPipelineDepth?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  criticalRoleCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  successionReadiness?: number;

  @IsOptional()
  @IsArray()
  talentPipelinePrograms?: string[];

  @IsOptional()
  @IsString()
  marketDemand?: string;

  @IsOptional()
  @IsString()
  talentAvailability?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketCompetitiveness?: number;

  @IsOptional()
  @IsDateString()
  lastMarketAnalysis?: Date;

  @IsOptional()
  @IsArray()
  competitorBenchmark?: Array<{
    company: string;
    similarRole: string;
    compensationRange: string;
  }>;

  @IsOptional()
  @IsArray()
  complianceRequirements?: string[];

  @IsOptional()
  @IsArray()
  mandatoryTraining?: string[];

  @IsOptional()
  @IsString()
  backgroundCheckLevel?: string;

  @IsOptional()
  @IsArray()
  securityClearance?: string[];

  @IsOptional()
  @IsBoolean()
  requiresRegulation?: boolean;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsBoolean()
  isStrategic?: boolean;

  @IsOptional()
  @IsString()
  approvalStatus?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsDateString()
  approvedDate?: Date;

  @IsOptional()
  @IsDateString()
  effectiveDate?: Date;

  @IsOptional()
  @IsDateString()
  reviewDate?: Date;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: Date;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class UpdateBandDto {
  @IsOptional()
  @IsString()
  bandCode?: string;

  @IsOptional()
  @IsString()
  bandName?: string;

  @IsOptional()
  @IsString()
  bandDescription?: string;

  @IsOptional()
  @IsString()
  bandAbbreviation?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  bandLevel?: number;

  @IsOptional()
  @IsString()
  bandType?: string;

  @IsOptional()
  @IsString()
  careerTrack?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  parentBandId?: string;

  @IsOptional()
  @IsBoolean()
  isLeadershipBand?: boolean;

  @IsOptional()
  @IsBoolean()
  isExecutiveBand?: boolean;

  @IsOptional()
  @IsBoolean()
  isTechnicalBand?: boolean;

  @IsOptional()
  @IsString()
  roleComplexity?: string;

  @IsOptional()
  @IsString()
  decisionMakingLevel?: string;

  @IsOptional()
  @IsString()
  autonomyLevel?: string;

  @IsOptional()
  @IsString()
  impactRadius?: string;

  @IsOptional()
  @IsArray()
  coreCompetencies?: Array<{
    competency: string;
    level: string;
    proficiency: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  leadershipCompetencies?: Array<{
    competency: string;
    level: string;
    importance: string;
  }>;

  @IsOptional()
  @IsArray()
  technicalCompetencies?: Array<{
    competency: string;
    level: string;
    domain: string;
  }>;

  @IsOptional()
  @IsArray()
  functionalCompetencies?: Array<{
    competency: string;
    level: string;
    function: string;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minYearsInBand?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalYearsInBand?: number;

  @IsOptional()
  @IsString()
  nextBandId?: string;

  @IsOptional()
  @IsString()
  previousBandId?: string;

  @IsOptional()
  @IsArray()
  lateralMoves?: string[];

  @IsOptional()
  @IsArray()
  alternativeProgression?: Array<{
    bandId: string;
    pathway: string;
    requirements: string[];
  }>;

  @IsOptional()
  @IsArray()
  developmentAreas?: string[];

  @IsOptional()
  @IsArray()
  trainingPrograms?: Array<{
    program: string;
    provider: string;
    duration: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  learningPathways?: Array<{
    pathway: string;
    courses: string[];
    estimatedHours: number;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualTrainingHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  developmentBudget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preferredExperience?: number;

  @IsOptional()
  @IsArray()
  educationRequirements?: Array<{
    degree: string;
    field: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  certifications?: Array<{
    certification: string;
    issuingBody: string;
    isMandatory: boolean;
    validityPeriod: string;
  }>;

  @IsOptional()
  @IsArray()
  industryExperience?: string[];

  @IsOptional()
  @IsArray()
  keyResponsibilities?: string[];

  @IsOptional()
  @IsArray()
  accountabilities?: string[];

  @IsOptional()
  @IsString()
  managementResponsibility?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalDirectReports?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalTotalReports?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetResponsibility?: number;

  @IsOptional()
  @IsString()
  approvalAuthority?: string;

  @IsOptional()
  @IsArray()
  performanceIndicators?: Array<{
    kpi: string;
    target: string;
    measurement: string;
  }>;

  @IsOptional()
  @IsArray()
  successMetrics?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  expectedPerformanceRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  reviewFrequency?: number;

  @IsOptional()
  @IsArray()
  gradeRange?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minCompensation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCompensation?: number;

  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  compensationCurrency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bonusEligibility?: number;

  @IsOptional()
  @IsBoolean()
  eligibleForEquity?: boolean;

  @IsOptional()
  @IsArray()
  benefitsTier?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentHeadcount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetHeadcount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vacancies?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  turnoverRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionInRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionOutRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avgTenure?: number;

  @IsOptional()
  @IsObject()
  diversityMetrics?: {
    genderBalance: { male: number; female: number; other: number };
    ageDistribution: Record<string, number>;
    diversityScore: number;
  };

  @IsOptional()
  @IsArray()
  inclusionInitiatives?: string[];

  @IsOptional()
  @IsArray()
  applicableLocations?: string[];

  @IsOptional()
  @IsArray()
  applicableRegions?: string[];

  @IsOptional()
  @IsArray()
  applicableBusinessUnits?: string[];

  @IsOptional()
  @IsString()
  geographicScope?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  successorPipelineDepth?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  criticalRoleCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  successionReadiness?: number;

  @IsOptional()
  @IsArray()
  talentPipelinePrograms?: string[];

  @IsOptional()
  @IsString()
  marketDemand?: string;

  @IsOptional()
  @IsString()
  talentAvailability?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketCompetitiveness?: number;

  @IsOptional()
  @IsDateString()
  lastMarketAnalysis?: Date;

  @IsOptional()
  @IsArray()
  competitorBenchmark?: Array<{
    company: string;
    similarRole: string;
    compensationRange: string;
  }>;

  @IsOptional()
  @IsArray()
  complianceRequirements?: string[];

  @IsOptional()
  @IsArray()
  mandatoryTraining?: string[];

  @IsOptional()
  @IsString()
  backgroundCheckLevel?: string;

  @IsOptional()
  @IsArray()
  securityClearance?: string[];

  @IsOptional()
  @IsBoolean()
  requiresRegulation?: boolean;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsBoolean()
  isStrategic?: boolean;

  @IsOptional()
  @IsString()
  approvalStatus?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsDateString()
  approvedDate?: Date;

  @IsOptional()
  @IsDateString()
  effectiveDate?: Date;

  @IsOptional()
  @IsDateString()
  reviewDate?: Date;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: Date;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
