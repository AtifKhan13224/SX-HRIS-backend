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

export class CreateLevelWithinBandDto {
  @IsString()
  levelCode: string;

  @IsString()
  levelName: string;

  @IsOptional()
  @IsString()
  levelDescription?: string;

  @IsOptional()
  @IsString()
  levelAbbreviation?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  bandId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  levelNumber?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  levelTitle?: string;

  @IsOptional()
  @IsString()
  previousLevelId?: string;

  @IsOptional()
  @IsString()
  nextLevelId?: string;

  @IsOptional()
  @IsBoolean()
  isEntryLevel?: boolean;

  @IsOptional()
  @IsBoolean()
  isMidLevel?: boolean;

  @IsOptional()
  @IsBoolean()
  isSeniorLevel?: boolean;

  @IsOptional()
  @IsBoolean()
  isLeadershipLevel?: boolean;

  @IsOptional()
  @IsArray()
  requiredCompetencies?: Array<{
    competency: string;
    level: string;
    proficiency: string;
    criticality: string;
    assessmentMethod: string;
  }>;

  @IsOptional()
  @IsArray()
  technicalSkills?: Array<{
    skill: string;
    level: string;
    domain: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  softSkills?: Array<{
    skill: string;
    level: string;
    importance: string;
  }>;

  @IsOptional()
  @IsArray()
  leadershipCapabilities?: Array<{
    capability: string;
    level: string;
    context: string;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumExperience?: number;

  @IsOptional()
  @IsArray()
  educationRequirements?: Array<{
    degree: string;
    field: string[];
    institution: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  certifications?: Array<{
    certification: string;
    issuingBody: string;
    validityPeriod: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  professionalMemberships?: string[];

  @IsOptional()
  @IsString()
  roleComplexity?: string;

  @IsOptional()
  @IsString()
  problemSolving?: string;

  @IsOptional()
  @IsString()
  decisionAuthority?: string;

  @IsOptional()
  @IsString()
  autonomyLevel?: string;

  @IsOptional()
  @IsString()
  innovationExpectation?: string;

  @IsOptional()
  @IsArray()
  keyResponsibilities?: string[];

  @IsOptional()
  @IsArray()
  accountabilities?: string[];

  @IsOptional()
  @IsString()
  impactScope?: string;

  @IsOptional()
  @IsString()
  timeHorizon?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalDirectReports?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalIndirectReports?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetAuthority?: number;

  @IsOptional()
  @IsArray()
  approvalLimits?: Array<{
    category: string;
    limit: number;
    currency: string;
  }>;

  @IsOptional()
  @IsArray()
  performanceExpectations?: Array<{
    area: string;
    expectation: string;
    measurement: string;
  }>;

  @IsOptional()
  @IsArray()
  kpis?: Array<{
    kpi: string;
    target: string;
    frequency: string;
    weight: number;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  targetPerformanceRating?: number;

  @IsOptional()
  @IsArray()
  deliverables?: string[];

  @IsOptional()
  @IsArray()
  qualityStandards?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minTimeInLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalTimeInLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxTimeInLevel?: number;

  @IsOptional()
  @IsArray()
  promotionCriteria?: Array<{
    criterion: string;
    weight: number;
    assessmentMethod: string;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionReadinessThreshold?: number;

  @IsOptional()
  @IsArray()
  lateralMoves?: Array<{
    levelId: string;
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
    deliveryMode: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  onboardingProgram?: Array<{
    phase: string;
    duration: string;
    activities: string[];
    milestones: string[];
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualTrainingHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  developmentBudgetPerEmployee?: number;

  @IsOptional()
  @IsObject()
  mentorshipRequirements?: {
    required: boolean;
    frequency: string;
    duration: string;
  };

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMinimum?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMidpoint?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMaximum?: number;

  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  salaryCurrency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  targetBonusPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxBonusPercentage?: number;

  @IsOptional()
  @IsBoolean()
  eligibleForEquity?: boolean;

  @IsOptional()
  @IsObject()
  equityRange?: {
    minimum: number;
    maximum: number;
    vestingPeriod: string;
  };

  @IsOptional()
  @IsArray()
  benefitsPackage?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualLeaveEntitlement?: number;

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
  openPositions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avgSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compaRatio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  avgPerformanceRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  turnoverRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avgTenureMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeToFillDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  successorCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  highPotentialCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  successionCoverage?: number;

  @IsOptional()
  @IsArray()
  talentPoolPrograms?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketPercentile?: number;

  @IsOptional()
  @IsString()
  talentAvailability?: string;

  @IsOptional()
  @IsDateString()
  lastMarketReview?: Date;

  @IsOptional()
  @IsArray()
  marketBenchmark?: Array<{
    source: string;
    percentile: number;
    salary: number;
    bonus: number;
    totalComp: number;
  }>;

  @IsOptional()
  @IsArray()
  complianceRequirements?: string[];

  @IsOptional()
  @IsArray()
  mandatoryTraining?: Array<{
    training: string;
    frequency: string;
    validityPeriod: string;
  }>;

  @IsOptional()
  @IsString()
  backgroundCheckLevel?: string;

  @IsOptional()
  @IsArray()
  securityClearance?: string[];

  @IsOptional()
  @IsString()
  riskLevel?: string;

  @IsOptional()
  @IsArray()
  applicableLocations?: string[];

  @IsOptional()
  @IsArray()
  applicableRegions?: string[];

  @IsOptional()
  @IsArray()
  applicableDepartments?: string[];

  @IsOptional()
  @IsString()
  geographicScope?: string;

  @IsOptional()
  @IsObject()
  diversityMetrics?: {
    genderBalance: Record<string, number>;
    ageDistribution: Record<string, number>;
    diversityScore: number;
  };

  @IsOptional()
  @IsArray()
  inclusionInitiatives?: string[];

  @IsOptional()
  @IsString()
  workArrangement?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(7)
  onsiteDaysPerWeek?: number;

  @IsOptional()
  @IsString()
  travelRequirement?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  travelPercentage?: number;

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
  isHighDemand?: boolean;

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
  lastReviewDate?: Date;

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

export class UpdateLevelWithinBandDto {
  @IsOptional()
  @IsString()
  levelCode?: string;

  @IsOptional()
  @IsString()
  levelName?: string;

  @IsOptional()
  @IsString()
  levelDescription?: string;

  @IsOptional()
  @IsString()
  levelAbbreviation?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  bandId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  levelNumber?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  levelTitle?: string;

  @IsOptional()
  @IsString()
  previousLevelId?: string;

  @IsOptional()
  @IsString()
  nextLevelId?: string;

  @IsOptional()
  @IsBoolean()
  isEntryLevel?: boolean;

  @IsOptional()
  @IsBoolean()
  isMidLevel?: boolean;

  @IsOptional()
  @IsBoolean()
  isSeniorLevel?: boolean;

  @IsOptional()
  @IsBoolean()
  isLeadershipLevel?: boolean;

  @IsOptional()
  @IsArray()
  requiredCompetencies?: Array<{
    competency: string;
    level: string;
    proficiency: string;
    criticality: string;
    assessmentMethod: string;
  }>;

  @IsOptional()
  @IsArray()
  technicalSkills?: Array<{
    skill: string;
    level: string;
    domain: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  softSkills?: Array<{
    skill: string;
    level: string;
    importance: string;
  }>;

  @IsOptional()
  @IsArray()
  leadershipCapabilities?: Array<{
    capability: string;
    level: string;
    context: string;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumExperience?: number;

  @IsOptional()
  @IsArray()
  educationRequirements?: Array<{
    degree: string;
    field: string[];
    institution: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  certifications?: Array<{
    certification: string;
    issuingBody: string;
    validityPeriod: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  professionalMemberships?: string[];

  @IsOptional()
  @IsString()
  roleComplexity?: string;

  @IsOptional()
  @IsString()
  problemSolving?: string;

  @IsOptional()
  @IsString()
  decisionAuthority?: string;

  @IsOptional()
  @IsString()
  autonomyLevel?: string;

  @IsOptional()
  @IsString()
  innovationExpectation?: string;

  @IsOptional()
  @IsArray()
  keyResponsibilities?: string[];

  @IsOptional()
  @IsArray()
  accountabilities?: string[];

  @IsOptional()
  @IsString()
  impactScope?: string;

  @IsOptional()
  @IsString()
  timeHorizon?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalDirectReports?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalIndirectReports?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetAuthority?: number;

  @IsOptional()
  @IsArray()
  approvalLimits?: Array<{
    category: string;
    limit: number;
    currency: string;
  }>;

  @IsOptional()
  @IsArray()
  performanceExpectations?: Array<{
    area: string;
    expectation: string;
    measurement: string;
  }>;

  @IsOptional()
  @IsArray()
  kpis?: Array<{
    kpi: string;
    target: string;
    frequency: string;
    weight: number;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  targetPerformanceRating?: number;

  @IsOptional()
  @IsArray()
  deliverables?: string[];

  @IsOptional()
  @IsArray()
  qualityStandards?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minTimeInLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalTimeInLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxTimeInLevel?: number;

  @IsOptional()
  @IsArray()
  promotionCriteria?: Array<{
    criterion: string;
    weight: number;
    assessmentMethod: string;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionReadinessThreshold?: number;

  @IsOptional()
  @IsArray()
  lateralMoves?: Array<{
    levelId: string;
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
    deliveryMode: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  onboardingProgram?: Array<{
    phase: string;
    duration: string;
    activities: string[];
    milestones: string[];
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualTrainingHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  developmentBudgetPerEmployee?: number;

  @IsOptional()
  @IsObject()
  mentorshipRequirements?: {
    required: boolean;
    frequency: string;
    duration: string;
  };

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMinimum?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMidpoint?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMaximum?: number;

  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  salaryCurrency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  targetBonusPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxBonusPercentage?: number;

  @IsOptional()
  @IsBoolean()
  eligibleForEquity?: boolean;

  @IsOptional()
  @IsObject()
  equityRange?: {
    minimum: number;
    maximum: number;
    vestingPeriod: string;
  };

  @IsOptional()
  @IsArray()
  benefitsPackage?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualLeaveEntitlement?: number;

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
  openPositions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avgSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compaRatio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  avgPerformanceRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  turnoverRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avgTenureMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeToFillDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  successorCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  highPotentialCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  successionCoverage?: number;

  @IsOptional()
  @IsArray()
  talentPoolPrograms?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketPercentile?: number;

  @IsOptional()
  @IsString()
  talentAvailability?: string;

  @IsOptional()
  @IsDateString()
  lastMarketReview?: Date;

  @IsOptional()
  @IsArray()
  marketBenchmark?: Array<{
    source: string;
    percentile: number;
    salary: number;
    bonus: number;
    totalComp: number;
  }>;

  @IsOptional()
  @IsArray()
  complianceRequirements?: string[];

  @IsOptional()
  @IsArray()
  mandatoryTraining?: Array<{
    training: string;
    frequency: string;
    validityPeriod: string;
  }>;

  @IsOptional()
  @IsString()
  backgroundCheckLevel?: string;

  @IsOptional()
  @IsArray()
  securityClearance?: string[];

  @IsOptional()
  @IsString()
  riskLevel?: string;

  @IsOptional()
  @IsArray()
  applicableLocations?: string[];

  @IsOptional()
  @IsArray()
  applicableRegions?: string[];

  @IsOptional()
  @IsArray()
  applicableDepartments?: string[];

  @IsOptional()
  @IsString()
  geographicScope?: string;

  @IsOptional()
  @IsObject()
  diversityMetrics?: {
    genderBalance: Record<string, number>;
    ageDistribution: Record<string, number>;
    diversityScore: number;
  };

  @IsOptional()
  @IsArray()
  inclusionInitiatives?: string[];

  @IsOptional()
  @IsString()
  workArrangement?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(7)
  onsiteDaysPerWeek?: number;

  @IsOptional()
  @IsString()
  travelRequirement?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  travelPercentage?: number;

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
  isHighDemand?: boolean;

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
  lastReviewDate?: Date;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: Date;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
