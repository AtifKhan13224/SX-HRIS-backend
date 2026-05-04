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

export class CreateDesignationNameDto {
  @IsString()
  designationCode: string;

  @IsString()
  designationName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsString()
  abbreviation?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  designationType?: string;

  @IsOptional()
  @IsString()
  hierarchyLevel?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  levelNumber?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isExecutive?: boolean;

  @IsOptional()
  @IsBoolean()
  isManagement?: boolean;

  @IsOptional()
  @IsBoolean()
  isLeadership?: boolean;

  @IsOptional()
  @IsBoolean()
  isTechnical?: boolean;

  @IsOptional()
  @IsArray()
  alternativeNames?: string[];

  @IsOptional()
  @IsObject()
  translations?: Record<string, string>;

  @IsOptional()
  @IsArray()
  synonyms?: string[];

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  functionalArea?: string;

  @IsOptional()
  @IsArray()
  applicableDepartments?: string[];

  @IsOptional()
  @IsArray()
  applicableIndustries?: string[];

  @IsOptional()
  @IsString()
  roleType?: string;

  @IsOptional()
  @IsString()
  responsibility?: string;

  @IsOptional()
  @IsString()
  seniority?: string;

  @IsOptional()
  @IsBoolean()
  hasDirectReports?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalReportees?: number;

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
  @IsString()
  naceCode?: string;

  @IsOptional()
  @IsArray()
  occupationalFamily?: string[];

  @IsOptional()
  @IsArray()
  gradeRange?: string[];

  @IsOptional()
  @IsArray()
  bandRange?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  marketMinSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marketMaxSalary?: number;

  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  salaryCurrency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketPercentile?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  activePositionsCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalEmployeesCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vacantPositionsCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  turnoverRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  usageFrequency?: number;

  @IsOptional()
  @IsArray()
  commonSkills?: string[];

  @IsOptional()
  @IsArray()
  requiredCertifications?: string[];

  @IsOptional()
  @IsArray()
  educationRequirements?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalExperience?: number;

  @IsOptional()
  @IsString()
  previousDesignationId?: string;

  @IsOptional()
  @IsString()
  nextDesignationId?: string;

  @IsOptional()
  @IsArray()
  careerPathOptions?: Array<{
    designationId: string;
    pathway: string;
  }>;

  @IsOptional()
  @IsObject()
  progressionTimeline?: {
    minYears: number;
    typicalYears: number;
    maxYears: number;
  };

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
  growthRate?: number;

  @IsOptional()
  @IsDateString()
  lastMarketReview?: Date;

  @IsOptional()
  @IsArray()
  competitorTitles?: Array<{
    company: string;
    title: string;
    similarity: number;
  }>;

  @IsOptional()
  @IsArray()
  applicableRegions?: string[];

  @IsOptional()
  @IsArray()
  applicableCountries?: string[];

  @IsOptional()
  @IsString()
  geographicScope?: string;

  @IsOptional()
  @IsArray()
  regionalVariations?: Array<{
    region: string;
    localTitle: string;
    notes: string;
  }>;

  @IsOptional()
  @IsBoolean()
  isCustomerFacing?: boolean;

  @IsOptional()
  @IsBoolean()
  isRevenueDriving?: boolean;

  @IsOptional()
  @IsBoolean()
  isCostCenter?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresTravel?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  travelPercentage?: number;

  @IsOptional()
  @IsString()
  workArrangement?: string;

  @IsOptional()
  @IsArray()
  regulatoryRequirements?: string[];

  @IsOptional()
  @IsArray()
  complianceNeeds?: string[];

  @IsOptional()
  @IsString()
  backgroundCheckLevel?: string;

  @IsOptional()
  @IsArray()
  securityClearance?: string[];

  @IsOptional()
  @IsBoolean()
  requiresLicensing?: boolean;

  @IsOptional()
  @IsArray()
  requiredLicenses?: string[];

  @IsOptional()
  @IsString()
  externalTitle?: string;

  @IsOptional()
  @IsString()
  internalTitle?: string;

  @IsOptional()
  @IsString()
  jobPostingTitle?: string;

  @IsOptional()
  @IsString()
  marketingDescription?: string;

  @IsOptional()
  @IsArray()
  keywords?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageActualSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  averagePerformanceRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageTenureMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageTimeToFill?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  successorPipelineDepth?: number;

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
  isDeprecated?: boolean;

  @IsOptional()
  @IsBoolean()
  isStandard?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveDate?: Date;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @IsOptional()
  @IsDateString()
  lastReviewDate?: Date;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: Date;

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
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class UpdateDesignationNameDto {
  @IsOptional()
  @IsString()
  designationCode?: string;

  @IsOptional()
  @IsString()
  designationName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsString()
  abbreviation?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  designationType?: string;

  @IsOptional()
  @IsString()
  hierarchyLevel?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  levelNumber?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isExecutive?: boolean;

  @IsOptional()
  @IsBoolean()
  isManagement?: boolean;

  @IsOptional()
  @IsBoolean()
  isLeadership?: boolean;

  @IsOptional()
  @IsBoolean()
  isTechnical?: boolean;

  @IsOptional()
  @IsArray()
  alternativeNames?: string[];

  @IsOptional()
  @IsObject()
  translations?: Record<string, string>;

  @IsOptional()
  @IsArray()
  synonyms?: string[];

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  functionalArea?: string;

  @IsOptional()
  @IsArray()
  applicableDepartments?: string[];

  @IsOptional()
  @IsArray()
  applicableIndustries?: string[];

  @IsOptional()
  @IsString()
  roleType?: string;

  @IsOptional()
  @IsString()
  responsibility?: string;

  @IsOptional()
  @IsString()
  seniority?: string;

  @IsOptional()
  @IsBoolean()
  hasDirectReports?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalReportees?: number;

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
  @IsString()
  naceCode?: string;

  @IsOptional()
  @IsArray()
  occupationalFamily?: string[];

  @IsOptional()
  @IsArray()
  gradeRange?: string[];

  @IsOptional()
  @IsArray()
  bandRange?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  marketMinSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marketMaxSalary?: number;

  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  salaryCurrency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  marketPercentile?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  activePositionsCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalEmployeesCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  vacantPositionsCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  turnoverRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  usageFrequency?: number;

  @IsOptional()
  @IsArray()
  commonSkills?: string[];

  @IsOptional()
  @IsArray()
  requiredCertifications?: string[];

  @IsOptional()
  @IsArray()
  educationRequirements?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  typicalExperience?: number;

  @IsOptional()
  @IsString()
  previousDesignationId?: string;

  @IsOptional()
  @IsString()
  nextDesignationId?: string;

  @IsOptional()
  @IsArray()
  careerPathOptions?: Array<{
    designationId: string;
    pathway: string;
  }>;

  @IsOptional()
  @IsObject()
  progressionTimeline?: {
    minYears: number;
    typicalYears: number;
    maxYears: number;
  };

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
  growthRate?: number;

  @IsOptional()
  @IsDateString()
  lastMarketReview?: Date;

  @IsOptional()
  @IsArray()
  competitorTitles?: Array<{
    company: string;
    title: string;
    similarity: number;
  }>;

  @IsOptional()
  @IsArray()
  applicableRegions?: string[];

  @IsOptional()
  @IsArray()
  applicableCountries?: string[];

  @IsOptional()
  @IsString()
  geographicScope?: string;

  @IsOptional()
  @IsArray()
  regionalVariations?: Array<{
    region: string;
    localTitle: string;
    notes: string;
  }>;

  @IsOptional()
  @IsBoolean()
  isCustomerFacing?: boolean;

  @IsOptional()
  @IsBoolean()
  isRevenueDriving?: boolean;

  @IsOptional()
  @IsBoolean()
  isCostCenter?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresTravel?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  travelPercentage?: number;

  @IsOptional()
  @IsString()
  workArrangement?: string;

  @IsOptional()
  @IsArray()
  regulatoryRequirements?: string[];

  @IsOptional()
  @IsArray()
  complianceNeeds?: string[];

  @IsOptional()
  @IsString()
  backgroundCheckLevel?: string;

  @IsOptional()
  @IsArray()
  securityClearance?: string[];

  @IsOptional()
  @IsBoolean()
  requiresLicensing?: boolean;

  @IsOptional()
  @IsArray()
  requiredLicenses?: string[];

  @IsOptional()
  @IsString()
  externalTitle?: string;

  @IsOptional()
  @IsString()
  internalTitle?: string;

  @IsOptional()
  @IsString()
  jobPostingTitle?: string;

  @IsOptional()
  @IsString()
  marketingDescription?: string;

  @IsOptional()
  @IsArray()
  keywords?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageActualSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  averagePerformanceRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageTenureMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  promotionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageTimeToFill?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  successorPipelineDepth?: number;

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
  isDeprecated?: boolean;

  @IsOptional()
  @IsBoolean()
  isStandard?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveDate?: Date;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @IsOptional()
  @IsDateString()
  lastReviewDate?: Date;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: Date;

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
  @IsString()
  updatedBy?: string;
}
