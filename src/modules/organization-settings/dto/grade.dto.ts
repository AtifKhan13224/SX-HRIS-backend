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

export class CreateGradeDto {
  @IsString()
  gradeCode: string;

  @IsString()
  gradeName: string;

  @IsOptional()
  @IsString()
  gradeDescription?: string;

  @IsOptional()
  @IsString()
  gradeAbbreviation?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  gradeLevel?: number;

  @IsOptional()
  @IsString()
  gradeCategory?: string;

  @IsOptional()
  @IsString()
  organizationLevel?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  parentGradeId?: string;

  @IsOptional()
  @IsBoolean()
  isLeadershipGrade?: boolean;

  @IsOptional()
  @IsBoolean()
  isExecutiveGrade?: boolean;

  @IsOptional()
  @IsBoolean()
  isManagementGrade?: boolean;

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
  @IsEnum(['Annual', 'Monthly', 'Hourly'])
  salaryPeriod?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  spreadPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetCompensation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marketPositioning?: number;

  @IsOptional()
  @IsString()
  comparatorGroup?: string;

  @IsOptional()
  @IsDateString()
  lastMarketReview?: Date;

  @IsOptional()
  @IsDateString()
  nextMarketReview?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  targetBonusPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maximumBonusPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumBonusAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumBonusAmount?: number;

  @IsOptional()
  @IsBoolean()
  eligibleForLTI?: boolean;

  @IsOptional()
  @IsBoolean()
  eligibleForSTI?: boolean;

  @IsOptional()
  @IsBoolean()
  eligibleForStockOptions?: boolean;

  @IsOptional()
  @IsArray()
  incentiveStructure?: Array<{
    component: string;
    percentage: number;
    eligibility: string;
  }>;

  @IsOptional()
  @IsArray()
  benefits?: string[];

  @IsOptional()
  @IsArray()
  perquisites?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualLeaveEntitlement?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sickLeaveEntitlement?: number;

  @IsOptional()
  @IsString()
  insuranceTier?: string;

  @IsOptional()
  @IsString()
  retirementPlan?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  employerContributionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumYearsInGrade?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalYearsInGrade?: number;

  @IsOptional()
  @IsString()
  nextGradeId?: string;

  @IsOptional()
  @IsString()
  previousGradeId?: string;

  @IsOptional()
  @IsArray()
  promotionCriteria?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  typicalPromotionIncrease?: number;

  @IsOptional()
  @IsArray()
  requiredCompetencies?: Array<{
    competency: string;
    level: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  educationRequirements?: string[];

  @IsOptional()
  @IsArray()
  certificationRequirements?: string[];

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
  technicalSkills?: string[];

  @IsOptional()
  @IsArray()
  softSkills?: string[];

  @IsOptional()
  @IsString()
  decisionAuthority?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetAuthority?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalReportees?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalTeamSize?: number;

  @IsOptional()
  @IsString()
  spanOfControl?: string;

  @IsOptional()
  @IsString()
  impactScope?: string;

  @IsOptional()
  @IsString()
  problemComplexity?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hayPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ipeBandNumber?: number;

  @IsOptional()
  @IsString()
  mergerGrade?: string;

  @IsOptional()
  @IsArray()
  jobEvaluationFactors?: Array<{
    factor: string;
    weight: number;
    score: number;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentHeadcount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetedHeadcount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vacantPositions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCompensationCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageActualSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compaRatio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  averagePerformanceRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  attritionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  successorCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageTimeInGrade?: number;

  @IsOptional()
  @IsArray()
  applicableRegions?: string[];

  @IsOptional()
  @IsArray()
  applicableCountries?: string[];

  @IsOptional()
  @IsArray()
  applicableBusinessUnits?: string[];

  @IsOptional()
  @IsString()
  geographicScope?: string;

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
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  exemptStatus?: string;

  @IsOptional()
  @IsBoolean()
  isEligibleForOvertime?: boolean;

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
  isObsolete?: boolean;

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

export class UpdateGradeDto {
  @IsOptional()
  @IsString()
  gradeCode?: string;

  @IsOptional()
  @IsString()
  gradeName?: string;

  @IsOptional()
  @IsString()
  gradeDescription?: string;

  @IsOptional()
  @IsString()
  gradeAbbreviation?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  gradeLevel?: number;

  @IsOptional()
  @IsString()
  gradeCategory?: string;

  @IsOptional()
  @IsString()
  organizationLevel?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  parentGradeId?: string;

  @IsOptional()
  @IsBoolean()
  isLeadershipGrade?: boolean;

  @IsOptional()
  @IsBoolean()
  isExecutiveGrade?: boolean;

  @IsOptional()
  @IsBoolean()
  isManagementGrade?: boolean;

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
  @IsEnum(['Annual', 'Monthly', 'Hourly'])
  salaryPeriod?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  spreadPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetCompensation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marketPositioning?: number;

  @IsOptional()
  @IsString()
  comparatorGroup?: string;

  @IsOptional()
  @IsDateString()
  lastMarketReview?: Date;

  @IsOptional()
  @IsDateString()
  nextMarketReview?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  targetBonusPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maximumBonusPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumBonusAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumBonusAmount?: number;

  @IsOptional()
  @IsBoolean()
  eligibleForLTI?: boolean;

  @IsOptional()
  @IsBoolean()
  eligibleForSTI?: boolean;

  @IsOptional()
  @IsBoolean()
  eligibleForStockOptions?: boolean;

  @IsOptional()
  @IsArray()
  incentiveStructure?: Array<{
    component: string;
    percentage: number;
    eligibility: string;
  }>;

  @IsOptional()
  @IsArray()
  benefits?: string[];

  @IsOptional()
  @IsArray()
  perquisites?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualLeaveEntitlement?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sickLeaveEntitlement?: number;

  @IsOptional()
  @IsString()
  insuranceTier?: string;

  @IsOptional()
  @IsString()
  retirementPlan?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  employerContributionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumYearsInGrade?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalYearsInGrade?: number;

  @IsOptional()
  @IsString()
  nextGradeId?: string;

  @IsOptional()
  @IsString()
  previousGradeId?: string;

  @IsOptional()
  @IsArray()
  promotionCriteria?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  typicalPromotionIncrease?: number;

  @IsOptional()
  @IsArray()
  requiredCompetencies?: Array<{
    competency: string;
    level: string;
    isMandatory: boolean;
  }>;

  @IsOptional()
  @IsArray()
  educationRequirements?: string[];

  @IsOptional()
  @IsArray()
  certificationRequirements?: string[];

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
  technicalSkills?: string[];

  @IsOptional()
  @IsArray()
  softSkills?: string[];

  @IsOptional()
  @IsString()
  decisionAuthority?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetAuthority?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalReportees?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalTeamSize?: number;

  @IsOptional()
  @IsString()
  spanOfControl?: string;

  @IsOptional()
  @IsString()
  impactScope?: string;

  @IsOptional()
  @IsString()
  problemComplexity?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hayPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ipeBandNumber?: number;

  @IsOptional()
  @IsString()
  mergerGrade?: string;

  @IsOptional()
  @IsArray()
  jobEvaluationFactors?: Array<{
    factor: string;
    weight: number;
    score: number;
  }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentHeadcount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetedHeadcount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vacantPositions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCompensationCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageActualSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compaRatio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  averagePerformanceRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  attritionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  successorCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageTimeInGrade?: number;

  @IsOptional()
  @IsArray()
  applicableRegions?: string[];

  @IsOptional()
  @IsArray()
  applicableCountries?: string[];

  @IsOptional()
  @IsArray()
  applicableBusinessUnits?: string[];

  @IsOptional()
  @IsString()
  geographicScope?: string;

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
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  exemptStatus?: string;

  @IsOptional()
  @IsBoolean()
  isEligibleForOvertime?: boolean;

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
  isObsolete?: boolean;

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
