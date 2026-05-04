import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsDateString, IsEnum } from 'class-validator';

export enum CapabilityType {
  TECHNICAL = 'Technical',
  LEADERSHIP = 'Leadership',
  FUNCTIONAL = 'Functional',
  DIGITAL = 'Digital',
  STRATEGIC = 'Strategic',
}

export enum CapabilityCategory {
  CORE = 'Core',
  SUPPORT = 'Support',
  STRATEGIC = 'Strategic',
  EMERGING = 'Emerging',
}

export enum CapabilityLevel {
  FOUNDATIONAL = 'Foundational',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert',
  MASTER = 'Master',
}

export enum StrategicImportance {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum MarketAvailability {
  ABUNDANT = 'Abundant',
  ADEQUATE = 'Adequate',
  SCARCE = 'Scarce',
  CRITICAL = 'Critical',
}

export enum FutureRelevance {
  GROWING = 'Growing',
  STABLE = 'Stable',
  DECLINING = 'Declining',
  OBSOLETE = 'Obsolete',
}

export enum LifecycleStage {
  EMERGING = 'Emerging',
  GROWING = 'Growing',
  MATURE = 'Mature',
  DECLINING = 'Declining',
  RETIRED = 'Retired',
}

export class CreateCapabilityDto {
  @IsString()
  capabilityName: string;

  @IsString()
  capabilityCode: string;

  @IsString()
  @IsOptional()
  capabilityDescription?: string;

  @IsEnum(CapabilityType)
  @IsOptional()
  capabilityType?: CapabilityType;

  @IsEnum(CapabilityCategory)
  @IsOptional()
  capabilityCategory?: CapabilityCategory;

  @IsEnum(CapabilityLevel)
  @IsOptional()
  capabilityLevel?: CapabilityLevel;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  subdomain?: string;

  @IsString()
  @IsOptional()
  parentCapabilityId?: string;

  @IsString()
  @IsOptional()
  maturityModel?: string;

  @IsNumber()
  @IsOptional()
  currentMaturityLevel?: number;

  @IsNumber()
  @IsOptional()
  targetMaturityLevel?: number;

  @IsOptional()
  proficiencyLevels?: any[];

  @IsEnum(StrategicImportance)
  @IsOptional()
  strategicImportance?: StrategicImportance;

  @IsString()
  @IsOptional()
  businessImpact?: string;

  @IsBoolean()
  @IsOptional()
  competitiveAdvantage?: boolean;

  @IsBoolean()
  @IsOptional()
  marketDifferentiator?: boolean;

  @IsNumber()
  @IsOptional()
  revenueImpact?: number;

  @IsNumber()
  @IsOptional()
  costSavingsPotential?: number;

  @IsArray()
  @IsOptional()
  requiredSkills?: string[];

  @IsString()
  @IsOptional()
  competencyFramework?: string;

  @IsOptional()
  certificationRequirements?: any[];

  @IsArray()
  @IsOptional()
  trainingPrograms?: string[];

  @IsNumber()
  @IsOptional()
  currentHeadcount?: number;

  @IsNumber()
  @IsOptional()
  requiredHeadcount?: number;

  @IsNumber()
  @IsOptional()
  attritionRate?: number;

  @IsNumber()
  @IsOptional()
  averageTenure?: number;

  @IsEnum(MarketAvailability)
  @IsOptional()
  marketAvailability?: MarketAvailability;

  @IsString()
  @IsOptional()
  sourcingDifficulty?: string;

  @IsNumber()
  @IsOptional()
  timeToHireAvg?: number;

  @IsNumber()
  @IsOptional()
  costPerHireAvg?: number;

  @IsString()
  @IsOptional()
  developmentPriority?: string;

  @IsNumber()
  @IsOptional()
  investmentRequired?: number;

  @IsNumber()
  @IsOptional()
  roiExpected?: number;

  @IsNumber()
  @IsOptional()
  paybackPeriodMonths?: number;

  @IsString()
  @IsOptional()
  riskLevel?: string;

  @IsBoolean()
  @IsOptional()
  singlePointOfFailure?: boolean;

  @IsBoolean()
  @IsOptional()
  successionPlanExists?: boolean;

  @IsArray()
  @IsOptional()
  complianceRequirements?: string[];

  @IsArray()
  @IsOptional()
  regulatoryConstraints?: string[];

  @IsArray()
  @IsOptional()
  toolsRequired?: string[];

  @IsArray()
  @IsOptional()
  technologies?: string[];

  @IsArray()
  @IsOptional()
  platforms?: string[];

  @IsString()
  @IsOptional()
  automationPotential?: string;

  @IsNumber()
  @IsOptional()
  aiAugmentationScore?: number;

  @IsEnum(FutureRelevance)
  @IsOptional()
  futureRelevance?: FutureRelevance;

  @IsNumber()
  @IsOptional()
  innovationIndex?: number;

  @IsArray()
  @IsOptional()
  emergingTrends?: string[];

  @IsString()
  @IsOptional()
  obsolescenceRisk?: string;

  @IsString()
  @IsOptional()
  transformationRoadmap?: string;

  @IsOptional()
  kpis?: any[];

  @IsOptional()
  benchmarks?: any[];

  @IsNumber()
  @IsOptional()
  performanceScore?: number;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsString()
  @IsOptional()
  ownerDepartment?: string;

  @IsString()
  @IsOptional()
  capabilityOwner?: string;

  @IsArray()
  @IsOptional()
  stakeholders?: string[];

  @IsDateString()
  @IsOptional()
  lastReviewedDate?: Date;

  @IsDateString()
  @IsOptional()
  nextReviewDate?: Date;

  @IsString()
  @IsOptional()
  reviewFrequency?: string;

  @IsEnum(LifecycleStage)
  @IsOptional()
  lifecycleStage?: LifecycleStage;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isCore?: boolean;

  @IsBoolean()
  @IsOptional()
  isStrategic?: boolean;

  @IsBoolean()
  @IsOptional()
  isFutureCritical?: boolean;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
}

export class UpdateCapabilityDto {
  @IsString()
  @IsOptional()
  capabilityName?: string;

  @IsString()
  @IsOptional()
  capabilityCode?: string;

  @IsString()
  @IsOptional()
  capabilityDescription?: string;

  @IsEnum(CapabilityType)
  @IsOptional()
  capabilityType?: CapabilityType;

  @IsEnum(CapabilityCategory)
  @IsOptional()
  capabilityCategory?: CapabilityCategory;

  @IsEnum(CapabilityLevel)
  @IsOptional()
  capabilityLevel?: CapabilityLevel;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  subdomain?: string;

  @IsString()
  @IsOptional()
  parentCapabilityId?: string;

  @IsString()
  @IsOptional()
  maturityModel?: string;

  @IsNumber()
  @IsOptional()
  currentMaturityLevel?: number;

  @IsNumber()
  @IsOptional()
  targetMaturityLevel?: number;

  @IsOptional()
  proficiencyLevels?: any[];

  @IsEnum(StrategicImportance)
  @IsOptional()
  strategicImportance?: StrategicImportance;

  @IsString()
  @IsOptional()
  businessImpact?: string;

  @IsBoolean()
  @IsOptional()
  competitiveAdvantage?: boolean;

  @IsBoolean()
  @IsOptional()
  marketDifferentiator?: boolean;

  @IsNumber()
  @IsOptional()
  revenueImpact?: number;

  @IsNumber()
  @IsOptional()
  costSavingsPotential?: number;

  @IsArray()
  @IsOptional()
  requiredSkills?: string[];

  @IsString()
  @IsOptional()
  competencyFramework?: string;

  @IsOptional()
  certificationRequirements?: any[];

  @IsArray()
  @IsOptional()
  trainingPrograms?: string[];

  @IsNumber()
  @IsOptional()
  currentHeadcount?: number;

  @IsNumber()
  @IsOptional()
  requiredHeadcount?: number;

  @IsNumber()
  @IsOptional()
  attritionRate?: number;

  @IsNumber()
  @IsOptional()
  averageTenure?: number;

  @IsEnum(MarketAvailability)
  @IsOptional()
  marketAvailability?: MarketAvailability;

  @IsString()
  @IsOptional()
  sourcingDifficulty?: string;

  @IsNumber()
  @IsOptional()
  timeToHireAvg?: number;

  @IsNumber()
  @IsOptional()
  costPerHireAvg?: number;

  @IsString()
  @IsOptional()
  developmentPriority?: string;

  @IsNumber()
  @IsOptional()
  investmentRequired?: number;

  @IsNumber()
  @IsOptional()
  roiExpected?: number;

  @IsNumber()
  @IsOptional()
  paybackPeriodMonths?: number;

  @IsString()
  @IsOptional()
  riskLevel?: string;

  @IsBoolean()
  @IsOptional()
  singlePointOfFailure?: boolean;

  @IsBoolean()
  @IsOptional()
  successionPlanExists?: boolean;

  @IsArray()
  @IsOptional()
  complianceRequirements?: string[];

  @IsArray()
  @IsOptional()
  regulatoryConstraints?: string[];

  @IsArray()
  @IsOptional()
  toolsRequired?: string[];

  @IsArray()
  @IsOptional()
  technologies?: string[];

  @IsArray()
  @IsOptional()
  platforms?: string[];

  @IsString()
  @IsOptional()
  automationPotential?: string;

  @IsNumber()
  @IsOptional()
  aiAugmentationScore?: number;

  @IsEnum(FutureRelevance)
  @IsOptional()
  futureRelevance?: FutureRelevance;

  @IsNumber()
  @IsOptional()
  innovationIndex?: number;

  @IsArray()
  @IsOptional()
  emergingTrends?: string[];

  @IsString()
  @IsOptional()
  obsolescenceRisk?: string;

  @IsString()
  @IsOptional()
  transformationRoadmap?: string;

  @IsOptional()
  kpis?: any[];

  @IsOptional()
  benchmarks?: any[];

  @IsNumber()
  @IsOptional()
  performanceScore?: number;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsString()
  @IsOptional()
  ownerDepartment?: string;

  @IsString()
  @IsOptional()
  capabilityOwner?: string;

  @IsArray()
  @IsOptional()
  stakeholders?: string[];

  @IsDateString()
  @IsOptional()
  lastReviewedDate?: Date;

  @IsDateString()
  @IsOptional()
  nextReviewDate?: Date;

  @IsString()
  @IsOptional()
  reviewFrequency?: string;

  @IsEnum(LifecycleStage)
  @IsOptional()
  lifecycleStage?: LifecycleStage;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isCore?: boolean;

  @IsBoolean()
  @IsOptional()
  isStrategic?: boolean;

  @IsBoolean()
  @IsOptional()
  isFutureCritical?: boolean;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
}
