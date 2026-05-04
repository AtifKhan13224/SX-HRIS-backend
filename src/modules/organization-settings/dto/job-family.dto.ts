import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, IsEnum, IsDateString } from 'class-validator';

export class CreateJobFamilyDto {
  @IsString()
  familyCode: string;

  @IsString()
  familyName: string;

  @IsOptional()
  @IsString()
  familyDescription?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  parentFamilyId?: string;

  @IsOptional()
  @IsString()
  functionalAreaId?: string;

  @IsOptional()
  @IsString()
  careerStream?: string;

  @IsOptional()
  @IsString()
  jobTrack?: string;

  @IsOptional()
  @IsEnum(['Executive', 'Professional', 'Technical', 'Administrative', 'Operational'])
  classification?: string;

  @IsOptional()
  @IsEnum(['Exempt', 'Non-Exempt', 'Not Applicable'])
  flsaStatus?: string;

  @IsOptional()
  @IsObject()
  levelStructure?: {
    minLevel: number;
    maxLevel: number;
    levelNames: string[];
  };

  @IsOptional()
  @IsString()
  industryStandardName?: string;

  @IsOptional()
  @IsString()
  onetCode?: string;

  @IsOptional()
  @IsString()
  iscoCode?: string;

  @IsOptional()
  @IsString()
  socCode?: string;

  @IsOptional()
  @IsObject()
  skillsFramework?: {
    coreSkills: string[];
    technicalSkills: string[];
    leadershipSkills: string[];
    certifications: string[];
  };

  @IsOptional()
  @IsObject()
  careerProgression?: {
    entryLevel: string;
    midLevel: string;
    seniorLevel: string;
    executiveLevel: string;
    typicalYearsInLevel: number[];
  };

  @IsOptional()
  @IsNumber()
  compensationBandMin?: number;

  @IsOptional()
  @IsNumber()
  compensationBandMax?: number;

  @IsOptional()
  @IsString()
  compensationCurrency?: string;

  @IsOptional()
  @IsString()
  marketBenchmarkSource?: string;

  @IsOptional()
  @IsDateString()
  lastMarketReview?: string;

  @IsOptional()
  @IsDateString()
  nextMarketReview?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  criticalityRating?: string;

  @IsOptional()
  @IsNumber()
  talentPoolSize?: number;

  @IsOptional()
  @IsNumber()
  successionDepth?: number;

  @IsOptional()
  @IsNumber()
  turnoverRate?: number;

  @IsOptional()
  @IsNumber()
  timeToFillAvg?: number;

  @IsOptional()
  @IsNumber()
  costPerHireAvg?: number;

  @IsOptional()
  @IsNumber()
  headcountCurrent?: number;

  @IsOptional()
  @IsNumber()
  headcountBudgeted?: number;

  @IsOptional()
  @IsNumber()
  openPositions?: number;

  @IsOptional()
  @IsArray()
  geographicDistribution?: {
    region: string;
    country: string;
    headcount: number;
  }[];

  @IsOptional()
  @IsObject()
  successionPlanning?: {
    keyPositions: string[];
    readyNow: number;
    readyIn1Year: number;
    readyIn2Plus: number;
    noSuccessor: number;
  };

  @IsOptional()
  @IsObject()
  learningDevelopment?: {
    requiredTraining: string[];
    recommendedCourses: string[];
    certificationPrograms: string[];
    avgTrainingHoursPerYear: number;
  };

  @IsOptional()
  @IsObject()
  complianceRequirements?: {
    licenses: string[];
    certifications: string[];
    backgroundChecks: string[];
    regulatoryBodies: string[];
  };

  @IsOptional()
  @IsObject()
  diversityMetrics?: {
    genderDistribution: { male: number; female: number; other: number };
    ageDistribution: { under30: number; age30to50: number; over50: number };
    diversityGoals: string;
  };

  @IsOptional()
  @IsObject()
  performanceMetrics?: {
    avgPerformanceRating: number;
    topPerformersPercent: number;
    lowPerformersPercent: number;
    promotionRate: number;
  };

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Strategic'])
  strategicImportance?: string;

  @IsOptional()
  @IsEnum(['Declining', 'Stable', 'Growing', 'High Growth'])
  futureDemandTrend?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High'])
  automationRisk?: string;

  @IsOptional()
  @IsBoolean()
  globalMobility?: boolean;

  @IsOptional()
  @IsBoolean()
  remoteWorkEligible?: boolean;

  @IsOptional()
  @IsNumber()
  contingentWorkforcePercent?: number;

  @IsOptional()
  @IsString()
  familyLead?: string;

  @IsOptional()
  @IsString()
  familyLeadEmail?: string;

  @IsOptional()
  @IsString()
  hrBusinessPartner?: string;

  @IsOptional()
  @IsString()
  talentAcquisitionLead?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  autoNumbering?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsBoolean()
  isStrategic?: boolean;
}

export class UpdateJobFamilyDto {
  @IsOptional()
  @IsString()
  familyCode?: string;

  @IsOptional()
  @IsString()
  familyName?: string;

  @IsOptional()
  @IsString()
  familyDescription?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  parentFamilyId?: string;

  @IsOptional()
  @IsString()
  functionalAreaId?: string;

  @IsOptional()
  @IsString()
  careerStream?: string;

  @IsOptional()
  @IsString()
  jobTrack?: string;

  @IsOptional()
  @IsEnum(['Executive', 'Professional', 'Technical', 'Administrative', 'Operational'])
  classification?: string;

  @IsOptional()
  @IsEnum(['Exempt', 'Non-Exempt', 'Not Applicable'])
  flsaStatus?: string;

  @IsOptional()
  @IsObject()
  levelStructure?: {
    minLevel: number;
    maxLevel: number;
    levelNames: string[];
  };

  @IsOptional()
  @IsString()
  industryStandardName?: string;

  @IsOptional()
  @IsString()
  onetCode?: string;

  @IsOptional()
  @IsString()
  iscoCode?: string;

  @IsOptional()
  @IsString()
  socCode?: string;

  @IsOptional()
  @IsObject()
  skillsFramework?: {
    coreSkills: string[];
    technicalSkills: string[];
    leadershipSkills: string[];
    certifications: string[];
  };

  @IsOptional()
  @IsObject()
  careerProgression?: {
    entryLevel: string;
    midLevel: string;
    seniorLevel: string;
    executiveLevel: string;
    typicalYearsInLevel: number[];
  };

  @IsOptional()
  @IsNumber()
  compensationBandMin?: number;

  @IsOptional()
  @IsNumber()
  compensationBandMax?: number;

  @IsOptional()
  @IsString()
  compensationCurrency?: string;

  @IsOptional()
  @IsString()
  marketBenchmarkSource?: string;

  @IsOptional()
  @IsDateString()
  lastMarketReview?: string;

  @IsOptional()
  @IsDateString()
  nextMarketReview?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  criticalityRating?: string;

  @IsOptional()
  @IsNumber()
  talentPoolSize?: number;

  @IsOptional()
  @IsNumber()
  successionDepth?: number;

  @IsOptional()
  @IsNumber()
  turnoverRate?: number;

  @IsOptional()
  @IsNumber()
  timeToFillAvg?: number;

  @IsOptional()
  @IsNumber()
  costPerHireAvg?: number;

  @IsOptional()
  @IsNumber()
  headcountCurrent?: number;

  @IsOptional()
  @IsNumber()
  headcountBudgeted?: number;

  @IsOptional()
  @IsNumber()
  openPositions?: number;

  @IsOptional()
  @IsArray()
  geographicDistribution?: {
    region: string;
    country: string;
    headcount: number;
  }[];

  @IsOptional()
  @IsObject()
  successionPlanning?: {
    keyPositions: string[];
    readyNow: number;
    readyIn1Year: number;
    readyIn2Plus: number;
    noSuccessor: number;
  };

  @IsOptional()
  @IsObject()
  learningDevelopment?: {
    requiredTraining: string[];
    recommendedCourses: string[];
    certificationPrograms: string[];
    avgTrainingHoursPerYear: number;
  };

  @IsOptional()
  @IsObject()
  complianceRequirements?: {
    licenses: string[];
    certifications: string[];
    backgroundChecks: string[];
    regulatoryBodies: string[];
  };

  @IsOptional()
  @IsObject()
  diversityMetrics?: {
    genderDistribution: { male: number; female: number; other: number };
    ageDistribution: { under30: number; age30to50: number; over50: number };
    diversityGoals: string;
  };

  @IsOptional()
  @IsObject()
  performanceMetrics?: {
    avgPerformanceRating: number;
    topPerformersPercent: number;
    lowPerformersPercent: number;
    promotionRate: number;
  };

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Strategic'])
  strategicImportance?: string;

  @IsOptional()
  @IsEnum(['Declining', 'Stable', 'Growing', 'High Growth'])
  futureDemandTrend?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High'])
  automationRisk?: string;

  @IsOptional()
  @IsBoolean()
  globalMobility?: boolean;

  @IsOptional()
  @IsBoolean()
  remoteWorkEligible?: boolean;

  @IsOptional()
  @IsNumber()
  contingentWorkforcePercent?: number;

  @IsOptional()
  @IsString()
  familyLead?: string;

  @IsOptional()
  @IsString()
  familyLeadEmail?: string;

  @IsOptional()
  @IsString()
  hrBusinessPartner?: string;

  @IsOptional()
  @IsString()
  talentAcquisitionLead?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  autoNumbering?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsBoolean()
  isStrategic?: boolean;
}
