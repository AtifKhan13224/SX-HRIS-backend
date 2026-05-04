import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, IsEnum, IsDateString, Min, Max } from 'class-validator';

export class CreateRoleCategoryDto {
  @IsString()
  categoryCode: string;

  @IsString()
  categoryName: string;

  @IsOptional()
  @IsString()
  categoryDescription?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  parentCategoryId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  categoryLevel?: number;

  @IsOptional()
  @IsEnum(['Functional', 'Technical', 'Leadership', 'Support', 'Operational', 'Strategic'])
  categoryType?: string;

  @IsOptional()
  @IsEnum(['Executive', 'Management', 'Professional', 'Technical', 'Administrative', 'Operational'])
  roleClassification?: string;

  @IsOptional()
  @IsEnum(['Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Consultant', 'Intern'])
  employmentType?: string;

  @IsOptional()
  @IsEnum(['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'Executive'])
  seniorityLevel?: string;

  @IsOptional()
  @IsEnum(['Individual Contributor', 'Team Lead', 'Manager', 'Senior Manager', 'Director', 'VP', 'C-Level'])
  managementLevel?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  responsibilityLevel?: string;

  @IsOptional()
  @IsEnum(['None', 'Limited', 'Moderate', 'Significant', 'Full'])
  decisionAuthority?: string;

  @IsOptional()
  @IsNumber()
  spanOfControlMin?: number;

  @IsOptional()
  @IsNumber()
  spanOfControlMax?: number;

  @IsOptional()
  @IsNumber()
  budgetAuthorityMin?: number;

  @IsOptional()
  @IsNumber()
  budgetAuthorityMax?: number;

  @IsOptional()
  @IsString()
  budgetCurrency?: string;

  @IsOptional()
  @IsString()
  compensationGradeMin?: string;

  @IsOptional()
  @IsString()
  compensationGradeMax?: string;

  @IsOptional()
  @IsNumber()
  salaryRangeMin?: number;

  @IsOptional()
  @IsNumber()
  salaryRangeMax?: number;

  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @IsOptional()
  @IsString()
  careerTrack?: string;

  @IsOptional()
  @IsObject()
  careerPath?: {
    previousRole: string;
    currentRole: string;
    nextRole: string;
    alternativePaths: string[];
  };

  @IsOptional()
  @IsString()
  requiredEducation?: string;

  @IsOptional()
  @IsString()
  preferredEducation?: string;

  @IsOptional()
  @IsNumber()
  requiredExperienceYears?: number;

  @IsOptional()
  @IsArray()
  requiredCertifications?: string[];

  @IsOptional()
  @IsArray()
  preferredCertifications?: string[];

  @IsOptional()
  @IsArray()
  coreCompetencies?: string[];

  @IsOptional()
  @IsArray()
  technicalSkills?: string[];

  @IsOptional()
  @IsArray()
  softSkills?: string[];

  @IsOptional()
  @IsArray()
  languagesRequired?: string[];

  @IsOptional()
  @IsArray()
  performanceIndicators?: {
    kpiName: string;
    target: string;
    weight: number;
  }[];

  @IsOptional()
  @IsString()
  workSchedule?: string;

  @IsOptional()
  @IsEnum(['On-Site', 'Remote', 'Hybrid', 'Field-Based', 'Flexible'])
  workLocationType?: string;

  @IsOptional()
  @IsEnum(['None', 'Occasional', 'Frequent', 'Extensive'])
  travelRequirement?: string;

  @IsOptional()
  @IsBoolean()
  shiftEligibility?: boolean;

  @IsOptional()
  @IsBoolean()
  overtimeEligible?: boolean;

  @IsOptional()
  @IsBoolean()
  remoteWorkEligible?: boolean;

  @IsOptional()
  @IsBoolean()
  hybridWorkEligible?: boolean;

  @IsOptional()
  @IsBoolean()
  internationalAssignmentEligible?: boolean;

  @IsOptional()
  @IsBoolean()
  relocationEligible?: boolean;

  @IsOptional()
  @IsArray()
  geographicScope?: string[];

  @IsOptional()
  @IsNumber()
  roleCountCurrent?: number;

  @IsOptional()
  @IsNumber()
  roleCountBudgeted?: number;

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
  @IsNumber()
  avgTimeToFill?: number;

  @IsOptional()
  @IsNumber()
  avgCostPerHire?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  turnoverRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  retentionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  internalFillRate?: number;

  @IsOptional()
  @IsNumber()
  successionBenchStrength?: number;

  @IsOptional()
  @IsNumber()
  highPotentialCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  avgPerformanceRating?: number;

  @IsOptional()
  @IsArray()
  complianceRequirements?: {
    regulatoryBody: string;
    requirement: string;
    mandatory: boolean;
  }[];

  @IsOptional()
  @IsArray()
  safetyRequirements?: string[];

  @IsOptional()
  @IsString()
  securityClearance?: string;

  @IsOptional()
  @IsString()
  backgroundCheckLevel?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  criticalityRating?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Strategic'])
  strategicImportance?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Very High'])
  businessImpact?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High'])
  automationRisk?: string;

  @IsOptional()
  @IsEnum(['Declining', 'Stable', 'Growing', 'High Growth'])
  futureDemandTrend?: string;

  @IsOptional()
  @IsEnum(['Abundant', 'Adequate', 'Limited', 'Scarce'])
  marketAvailability?: string;

  @IsOptional()
  @IsArray()
  diversityTargets?: {
    metric: string;
    target: number;
    current: number;
  }[];

  @IsOptional()
  @IsArray()
  esgAlignment?: string[];

  @IsOptional()
  @IsString()
  reportingRelationship?: string;

  @IsOptional()
  @IsString()
  typicalReportsTo?: string;

  @IsOptional()
  @IsString()
  categoryOwner?: string;

  @IsOptional()
  @IsString()
  categoryOwnerEmail?: string;

  @IsOptional()
  @IsString()
  hrBusinessPartner?: string;

  @IsOptional()
  @IsString()
  talentAcquisitionLead?: string;

  @IsOptional()
  @IsDateString()
  lastReviewDate?: string;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  customFields?: { [key: string]: any };

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

  @IsOptional()
  @IsBoolean()
  isLeadership?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublicFacing?: boolean;
}

export class UpdateRoleCategoryDto {
  @IsOptional()
  @IsString()
  categoryCode?: string;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsString()
  categoryDescription?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  parentCategoryId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  categoryLevel?: number;

  @IsOptional()
  @IsEnum(['Functional', 'Technical', 'Leadership', 'Support', 'Operational', 'Strategic'])
  categoryType?: string;

  @IsOptional()
  @IsEnum(['Executive', 'Management', 'Professional', 'Technical', 'Administrative', 'Operational'])
  roleClassification?: string;

  @IsOptional()
  @IsEnum(['Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Consultant', 'Intern'])
  employmentType?: string;

  @IsOptional()
  @IsEnum(['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'Executive'])
  seniorityLevel?: string;

  @IsOptional()
  @IsEnum(['Individual Contributor', 'Team Lead', 'Manager', 'Senior Manager', 'Director', 'VP', 'C-Level'])
  managementLevel?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  responsibilityLevel?: string;

  @IsOptional()
  @IsEnum(['None', 'Limited', 'Moderate', 'Significant', 'Full'])
  decisionAuthority?: string;

  @IsOptional()
  @IsNumber()
  spanOfControlMin?: number;

  @IsOptional()
  @IsNumber()
  spanOfControlMax?: number;

  @IsOptional()
  @IsNumber()
  budgetAuthorityMin?: number;

  @IsOptional()
  @IsNumber()
  budgetAuthorityMax?: number;

  @IsOptional()
  @IsString()
  budgetCurrency?: string;

  @IsOptional()
  @IsString()
  compensationGradeMin?: string;

  @IsOptional()
  @IsString()
  compensationGradeMax?: string;

  @IsOptional()
  @IsNumber()
  salaryRangeMin?: number;

  @IsOptional()
  @IsNumber()
  salaryRangeMax?: number;

  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @IsOptional()
  @IsString()
  careerTrack?: string;

  @IsOptional()
  @IsObject()
  careerPath?: {
    previousRole: string;
    currentRole: string;
    nextRole: string;
    alternativePaths: string[];
  };

  @IsOptional()
  @IsString()
  requiredEducation?: string;

  @IsOptional()
  @IsString()
  preferredEducation?: string;

  @IsOptional()
  @IsNumber()
  requiredExperienceYears?: number;

  @IsOptional()
  @IsArray()
  requiredCertifications?: string[];

  @IsOptional()
  @IsArray()
  preferredCertifications?: string[];

  @IsOptional()
  @IsArray()
  coreCompetencies?: string[];

  @IsOptional()
  @IsArray()
  technicalSkills?: string[];

  @IsOptional()
  @IsArray()
  softSkills?: string[];

  @IsOptional()
  @IsArray()
  languagesRequired?: string[];

  @IsOptional()
  @IsArray()
  performanceIndicators?: {
    kpiName: string;
    target: string;
    weight: number;
  }[];

  @IsOptional()
  @IsString()
  workSchedule?: string;

  @IsOptional()
  @IsEnum(['On-Site', 'Remote', 'Hybrid', 'Field-Based', 'Flexible'])
  workLocationType?: string;

  @IsOptional()
  @IsEnum(['None', 'Occasional', 'Frequent', 'Extensive'])
  travelRequirement?: string;

  @IsOptional()
  @IsBoolean()
  shiftEligibility?: boolean;

  @IsOptional()
  @IsBoolean()
  overtimeEligible?: boolean;

  @IsOptional()
  @IsBoolean()
  remoteWorkEligible?: boolean;

  @IsOptional()
  @IsBoolean()
  hybridWorkEligible?: boolean;

  @IsOptional()
  @IsBoolean()
  internationalAssignmentEligible?: boolean;

  @IsOptional()
  @IsBoolean()
  relocationEligible?: boolean;

  @IsOptional()
  @IsArray()
  geographicScope?: string[];

  @IsOptional()
  @IsNumber()
  roleCountCurrent?: number;

  @IsOptional()
  @IsNumber()
  roleCountBudgeted?: number;

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
  @IsNumber()
  avgTimeToFill?: number;

  @IsOptional()
  @IsNumber()
  avgCostPerHire?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  turnoverRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  retentionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  internalFillRate?: number;

  @IsOptional()
  @IsNumber()
  successionBenchStrength?: number;

  @IsOptional()
  @IsNumber()
  highPotentialCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  avgPerformanceRating?: number;

  @IsOptional()
  @IsArray()
  complianceRequirements?: {
    regulatoryBody: string;
    requirement: string;
    mandatory: boolean;
  }[];

  @IsOptional()
  @IsArray()
  safetyRequirements?: string[];

  @IsOptional()
  @IsString()
  securityClearance?: string;

  @IsOptional()
  @IsString()
  backgroundCheckLevel?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  criticalityRating?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Strategic'])
  strategicImportance?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Very High'])
  businessImpact?: string;

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High'])
  automationRisk?: string;

  @IsOptional()
  @IsEnum(['Declining', 'Stable', 'Growing', 'High Growth'])
  futureDemandTrend?: string;

  @IsOptional()
  @IsEnum(['Abundant', 'Adequate', 'Limited', 'Scarce'])
  marketAvailability?: string;

  @IsOptional()
  @IsArray()
  diversityTargets?: {
    metric: string;
    target: number;
    current: number;
  }[];

  @IsOptional()
  @IsArray()
  esgAlignment?: string[];

  @IsOptional()
  @IsString()
  reportingRelationship?: string;

  @IsOptional()
  @IsString()
  typicalReportsTo?: string;

  @IsOptional()
  @IsString()
  categoryOwner?: string;

  @IsOptional()
  @IsString()
  categoryOwnerEmail?: string;

  @IsOptional()
  @IsString()
  hrBusinessPartner?: string;

  @IsOptional()
  @IsString()
  talentAcquisitionLead?: string;

  @IsOptional()
  @IsDateString()
  lastReviewDate?: string;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  customFields?: { [key: string]: any };

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

  @IsOptional()
  @IsBoolean()
  isLeadership?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublicFacing?: boolean;
}
