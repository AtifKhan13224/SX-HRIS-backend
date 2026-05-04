import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, IsDateString, IsEnum, Min, Max } from 'class-validator';

export class CreateDesignationDto {
  @IsString()
  designationCode: string;

  @IsString()
  designationTitle: string;

  @IsString()
  @IsOptional()
  groupCompanyId?: string;

  @IsString()
  @IsOptional()
  designationNameId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortTitle?: string;

  @IsString()
  @IsOptional()
  abbreviation?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  designationType?: string;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsBoolean()
  @IsOptional()
  isActing?: boolean;

  @IsBoolean()
  @IsOptional()
  isTemporary?: boolean;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  divisionId?: string;

  @IsString()
  @IsOptional()
  businessUnitId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  costCenterId?: string;

  @IsString()
  @IsOptional()
  reportingToDesignationId?: string;

  @IsString()
  @IsOptional()
  reportingToEmployeeId?: string;

  @IsString()
  @IsOptional()
  reportingRelationship?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  directReportsCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  indirectReportsCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalTeamSize?: number;

  @IsString()
  @IsOptional()
  supervisoryLevel?: string;

  @IsString()
  @IsOptional()
  gradeId?: string;

  @IsString()
  @IsOptional()
  bandId?: string;

  @IsString()
  @IsOptional()
  levelId?: string;

  @IsNumber()
  @IsOptional()
  baseSalary?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  salaryCurrency?: string;

  @IsString()
  @IsOptional()
  payFrequency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  bonusPercentage?: number;

  @IsNumber()
  @IsOptional()
  targetBonus?: number;

  @IsNumber()
  @IsOptional()
  actualBonus?: number;

  @IsNumber()
  @IsOptional()
  totalCompensation?: number;

  @IsString()
  @IsOptional()
  employmentType?: string;

  @IsString()
  @IsOptional()
  workArrangement?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  ftePercentage?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  hoursPerWeek?: number;

  @IsBoolean()
  @IsOptional()
  isExempt?: boolean;

  @IsString()
  @IsOptional()
  keyResponsibilities?: string;

  @IsArray()
  @IsOptional()
  responsibilities?: any[];

  @IsString()
  @IsOptional()
  decisionAuthority?: string;

  @IsNumber()
  @IsOptional()
  budgetAuthority?: number;

  @IsNumber()
  @IsOptional()
  revenueResponsibility?: number;

  @IsNumber()
  @IsOptional()
  profitLossResponsibility?: number;

  @IsArray()
  @IsOptional()
  functionalResponsibilities?: string[];

  @IsObject()
  @IsOptional()
  performanceGoals?: any;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  currentPerformanceRating?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  lastPerformanceRating?: number;

  @IsDateString()
  @IsOptional()
  lastPerformanceReview?: string;

  @IsDateString()
  @IsOptional()
  nextPerformanceReview?: string;

  @IsArray()
  @IsOptional()
  kpis?: string[];

  @IsArray()
  @IsOptional()
  requiredSkills?: string[];

  @IsArray()
  @IsOptional()
  preferredSkills?: string[];

  @IsArray()
  @IsOptional()
  certifications?: string[];

  @IsArray()
  @IsOptional()
  languages?: string[];

  @IsObject()
  @IsOptional()
  competencyProfile?: any;

  @IsDateString()
  @IsOptional()
  dateAssigned?: string;

  @IsDateString()
  @IsOptional()
  dateEnded?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tenureMonths?: number;

  @IsString()
  @IsOptional()
  previousDesignationId?: string;

  @IsArray()
  @IsOptional()
  careerHistory?: any[];

  @IsObject()
  @IsOptional()
  developmentPlan?: any;

  @IsArray()
  @IsOptional()
  successionCandidates?: string[];

  @IsBoolean()
  @IsOptional()
  requiresTravel?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  travelPercentage?: number;

  @IsBoolean()
  @IsOptional()
  requiresShiftWork?: boolean;

  @IsString()
  @IsOptional()
  shiftPattern?: string;

  @IsBoolean()
  @IsOptional()
  requiresOnsitePresence?: boolean;

  @IsBoolean()
  @IsOptional()
  hasFlexibleHours?: boolean;

  @IsArray()
  @IsOptional()
  complianceRequirements?: string[];

  @IsString()
  @IsOptional()
  backgroundCheckStatus?: string;

  @IsDateString()
  @IsOptional()
  backgroundCheckDate?: string;

  @IsArray()
  @IsOptional()
  securityClearances?: string[];

  @IsArray()
  @IsOptional()
  licenses?: string[];

  @IsDateString()
  @IsOptional()
  licenseExpiryDate?: string;

  @IsString()
  @IsOptional()
  contractId?: string;

  @IsDateString()
  @IsOptional()
  contractStartDate?: string;

  @IsDateString()
  @IsOptional()
  contractEndDate?: string;

  @IsBoolean()
  @IsOptional()
  isContingent?: boolean;

  @IsString()
  @IsOptional()
  employmentStatus?: string;

  @IsString()
  @IsOptional()
  sponsoringCompanyId?: string;

  @IsString()
  @IsOptional()
  legalEntity?: string;

  @IsString()
  @IsOptional()
  approvalStatus?: string;

  @IsString()
  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  approvedDate?: string;

  @IsString()
  @IsOptional()
  approvalComments?: string;

  @IsString()
  @IsOptional()
  requestedBy?: string;

  @IsDateString()
  @IsOptional()
  requestedDate?: string;

  @IsObject()
  @IsOptional()
  approvalWorkflow?: any;

  @IsString()
  @IsOptional()
  jobDescriptionId?: string;

  @IsString()
  @IsOptional()
  jobSummary?: string;

  @IsString()
  @IsOptional()
  qualifications?: string;

  @IsString()
  @IsOptional()
  educationRequirements?: string;

  @IsString()
  @IsOptional()
  experienceRequirements?: string;

  @IsString()
  @IsOptional()
  workLocation?: string;

  @IsString()
  @IsOptional()
  officeLocation?: string;

  @IsString()
  @IsOptional()
  floorNumber?: string;

  @IsString()
  @IsOptional()
  seatNumber?: string;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsArray()
  @IsOptional()
  workLocations?: string[];

  @IsString()
  @IsOptional()
  workEmail?: string;

  @IsString()
  @IsOptional()
  workPhone?: string;

  @IsString()
  @IsOptional()
  extension?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  utilizationRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  productivityScore?: number;

  @IsNumber()
  @IsOptional()
  costToCompany?: number;

  @IsNumber()
  @IsOptional()
  revenueGenerated?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  employeeRetentionRisk?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  daysInRole?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  internalNotes?: string;

  @IsObject()
  @IsOptional()
  customFields?: any;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  categories?: string[];

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateDesignationDto {
  @IsString()
  @IsOptional()
  designationCode?: string;

  @IsString()
  @IsOptional()
  designationTitle?: string;

  @IsString()
  @IsOptional()
  groupCompanyId?: string;

  @IsString()
  @IsOptional()
  designationNameId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortTitle?: string;

  @IsString()
  @IsOptional()
  abbreviation?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  designationType?: string;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsBoolean()
  @IsOptional()
  isActing?: boolean;

  @IsBoolean()
  @IsOptional()
  isTemporary?: boolean;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  divisionId?: string;

  @IsString()
  @IsOptional()
  businessUnitId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  costCenterId?: string;

  @IsString()
  @IsOptional()
  reportingToDesignationId?: string;

  @IsString()
  @IsOptional()
  reportingToEmployeeId?: string;

  @IsString()
  @IsOptional()
  reportingRelationship?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  directReportsCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  indirectReportsCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalTeamSize?: number;

  @IsString()
  @IsOptional()
  supervisoryLevel?: string;

  @IsString()
  @IsOptional()
  gradeId?: string;

  @IsString()
  @IsOptional()
  bandId?: string;

  @IsString()
  @IsOptional()
  levelId?: string;

  @IsNumber()
  @IsOptional()
  baseSalary?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  salaryCurrency?: string;

  @IsString()
  @IsOptional()
  payFrequency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  bonusPercentage?: number;

  @IsNumber()
  @IsOptional()
  targetBonus?: number;

  @IsNumber()
  @IsOptional()
  actualBonus?: number;

  @IsNumber()
  @IsOptional()
  totalCompensation?: number;

  @IsString()
  @IsOptional()
  employmentType?: string;

  @IsString()
  @IsOptional()
  workArrangement?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  ftePercentage?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  hoursPerWeek?: number;

  @IsBoolean()
  @IsOptional()
  isExempt?: boolean;

  @IsString()
  @IsOptional()
  keyResponsibilities?: string;

  @IsArray()
  @IsOptional()
  responsibilities?: any[];

  @IsString()
  @IsOptional()
  decisionAuthority?: string;

  @IsNumber()
  @IsOptional()
  budgetAuthority?: number;

  @IsNumber()
  @IsOptional()
  revenueResponsibility?: number;

  @IsNumber()
  @IsOptional()
  profitLossResponsibility?: number;

  @IsArray()
  @IsOptional()
  functionalResponsibilities?: string[];

  @IsObject()
  @IsOptional()
  performanceGoals?: any;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  currentPerformanceRating?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  lastPerformanceRating?: number;

  @IsDateString()
  @IsOptional()
  lastPerformanceReview?: string;

  @IsDateString()
  @IsOptional()
  nextPerformanceReview?: string;

  @IsArray()
  @IsOptional()
  kpis?: string[];

  @IsArray()
  @IsOptional()
  requiredSkills?: string[];

  @IsArray()
  @IsOptional()
  preferredSkills?: string[];

  @IsArray()
  @IsOptional()
  certifications?: string[];

  @IsArray()
  @IsOptional()
  languages?: string[];

  @IsObject()
  @IsOptional()
  competencyProfile?: any;

  @IsDateString()
  @IsOptional()
  dateAssigned?: string;

  @IsDateString()
  @IsOptional()
  dateEnded?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tenureMonths?: number;

  @IsString()
  @IsOptional()
  previousDesignationId?: string;

  @IsArray()
  @IsOptional()
  careerHistory?: any[];

  @IsObject()
  @IsOptional()
  developmentPlan?: any;

  @IsArray()
  @IsOptional()
  successionCandidates?: string[];

  @IsBoolean()
  @IsOptional()
  requiresTravel?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  travelPercentage?: number;

  @IsBoolean()
  @IsOptional()
  requiresShiftWork?: boolean;

  @IsString()
  @IsOptional()
  shiftPattern?: string;

  @IsBoolean()
  @IsOptional()
  requiresOnsitePresence?: boolean;

  @IsBoolean()
  @IsOptional()
  hasFlexibleHours?: boolean;

  @IsArray()
  @IsOptional()
  complianceRequirements?: string[];

  @IsString()
  @IsOptional()
  backgroundCheckStatus?: string;

  @IsDateString()
  @IsOptional()
  backgroundCheckDate?: string;

  @IsArray()
  @IsOptional()
  securityClearances?: string[];

  @IsArray()
  @IsOptional()
  licenses?: string[];

  @IsDateString()
  @IsOptional()
  licenseExpiryDate?: string;

  @IsString()
  @IsOptional()
  contractId?: string;

  @IsDateString()
  @IsOptional()
  contractStartDate?: string;

  @IsDateString()
  @IsOptional()
  contractEndDate?: string;

  @IsBoolean()
  @IsOptional()
  isContingent?: boolean;

  @IsString()
  @IsOptional()
  employmentStatus?: string;

  @IsString()
  @IsOptional()
  sponsoringCompanyId?: string;

  @IsString()
  @IsOptional()
  legalEntity?: string;

  @IsString()
  @IsOptional()
  approvalStatus?: string;

  @IsString()
  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  approvedDate?: string;

  @IsString()
  @IsOptional()
  approvalComments?: string;

  @IsString()
  @IsOptional()
  requestedBy?: string;

  @IsDateString()
  @IsOptional()
  requestedDate?: string;

  @IsObject()
  @IsOptional()
  approvalWorkflow?: any;

  @IsString()
  @IsOptional()
  jobDescriptionId?: string;

  @IsString()
  @IsOptional()
  jobSummary?: string;

  @IsString()
  @IsOptional()
  qualifications?: string;

  @IsString()
  @IsOptional()
  educationRequirements?: string;

  @IsString()
  @IsOptional()
  experienceRequirements?: string;

  @IsString()
  @IsOptional()
  workLocation?: string;

  @IsString()
  @IsOptional()
  officeLocation?: string;

  @IsString()
  @IsOptional()
  floorNumber?: string;

  @IsString()
  @IsOptional()
  seatNumber?: string;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsArray()
  @IsOptional()
  workLocations?: string[];

  @IsString()
  @IsOptional()
  workEmail?: string;

  @IsString()
  @IsOptional()
  workPhone?: string;

  @IsString()
  @IsOptional()
  extension?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  utilizationRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  productivityScore?: number;

  @IsNumber()
  @IsOptional()
  costToCompany?: number;

  @IsNumber()
  @IsOptional()
  revenueGenerated?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  employeeRetentionRisk?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  daysInRole?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  internalNotes?: string;

  @IsObject()
  @IsOptional()
  customFields?: any;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  categories?: string[];

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
