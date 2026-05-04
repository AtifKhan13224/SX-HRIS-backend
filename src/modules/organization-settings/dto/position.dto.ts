import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, IsDateString, IsEnum, Min, Max } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  positionCode: string;

  @IsString()
  positionTitle: string;

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
  positionStatus?: string;

  @IsString()
  @IsOptional()
  positionType?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isVacant?: boolean;

  @IsBoolean()
  @IsOptional()
  isFrozen?: boolean;

  @IsBoolean()
  @IsOptional()
  isPendingApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  isBudgeted?: boolean;

  @IsBoolean()
  @IsOptional()
  isEssential?: boolean;

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
  costCenterId?: string;

  @IsString()
  @IsOptional()
  functionalAreaId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  workLocation?: string;

  @IsString()
  @IsOptional()
  officeLocation?: string;

  @IsString()
  @IsOptional()
  reportsToPositionId?: string;

  @IsString()
  @IsOptional()
  reportsToEmployeeId?: string;

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  headcountAllocation?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  numberOfPositions?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  filledPositions?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  vacantPositions?: number;

  @IsString()
  @IsOptional()
  positionControl?: string;

  @IsDateString()
  @IsOptional()
  positionControlDate?: string;

  @IsString()
  @IsOptional()
  positionControlReason?: string;

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
  minSalary?: number;

  @IsNumber()
  @IsOptional()
  midSalary?: number;

  @IsNumber()
  @IsOptional()
  maxSalary?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  salaryCurrency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  targetBonusPercentage?: number;

  @IsNumber()
  @IsOptional()
  totalCompensationTarget?: number;

  @IsNumber()
  @IsOptional()
  budgetedSalary?: number;

  @IsNumber()
  @IsOptional()
  actualSalary?: number;

  @IsNumber()
  @IsOptional()
  totalBudgetedCost?: number;

  @IsNumber()
  @IsOptional()
  totalActualCost?: number;

  @IsNumber()
  @IsOptional()
  budgetYear?: number;

  @IsString()
  @IsOptional()
  budgetStatus?: string;

  @IsDateString()
  @IsOptional()
  budgetApprovalDate?: string;

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
  shiftPattern?: string;

  @IsBoolean()
  @IsOptional()
  requiresShiftWork?: boolean;

  @IsString()
  @IsOptional()
  jobSummary?: string;

  @IsString()
  @IsOptional()
  keyResponsibilities?: string;

  @IsArray()
  @IsOptional()
  responsibilities?: any[];

  @IsString()
  @IsOptional()
  qualifications?: string;

  @IsString()
  @IsOptional()
  educationRequirements?: string;

  @IsString()
  @IsOptional()
  experienceRequirements?: string;

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
  licenses?: string[];

  @IsBoolean()
  @IsOptional()
  isCustomerFacing?: boolean;

  @IsBoolean()
  @IsOptional()
  isRevenueDriving?: boolean;

  @IsBoolean()
  @IsOptional()
  isCostCenter?: boolean;

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
  requiresSecurityClearance?: boolean;

  @IsArray()
  @IsOptional()
  securityClearances?: string[];

  @IsDateString()
  @IsOptional()
  creationDate?: string;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsDateString()
  @IsOptional()
  lastFilledDate?: string;

  @IsDateString()
  @IsOptional()
  lastVacatedDate?: string;

  @IsDateString()
  @IsOptional()
  anticipatedFillDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  daysVacant?: number;

  @IsString()
  @IsOptional()
  incumbentEmployeeId?: string;

  @IsString()
  @IsOptional()
  incumbentName?: string;

  @IsDateString()
  @IsOptional()
  incumbentStartDate?: string;

  @IsArray()
  @IsOptional()
  incumbentHistory?: any[];

  @IsArray()
  @IsOptional()
  successorCandidates?: string[];

  @IsObject()
  @IsOptional()
  successionPlan?: any;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  successionReadiness?: number;

  @IsArray()
  @IsOptional()
  keySuccessors?: string[];

  @IsArray()
  @IsOptional()
  emergencySuccessors?: string[];

  @IsString()
  @IsOptional()
  requisitionId?: string;

  @IsDateString()
  @IsOptional()
  requisitionDate?: string;

  @IsString()
  @IsOptional()
  requisitionStatus?: string;

  @IsDateString()
  @IsOptional()
  targetStartDate?: string;

  @IsNumber()
  @IsOptional()
  targetTimeToFill?: number;

  @IsNumber()
  @IsOptional()
  actualTimeToFill?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  numberOfOpenings?: number;

  @IsString()
  @IsOptional()
  jobDescriptionId?: string;

  @IsDateString()
  @IsOptional()
  jobDescriptionDate?: string;

  @IsString()
  @IsOptional()
  jobDescriptionVersion?: string;

  @IsDateString()
  @IsOptional()
  lastReviewedDate?: string;

  @IsDateString()
  @IsOptional()
  nextReviewDate?: string;

  @IsArray()
  @IsOptional()
  complianceRequirements?: string[];

  @IsArray()
  @IsOptional()
  regulatoryRequirements?: string[];

  @IsString()
  @IsOptional()
  backgroundCheckLevel?: string;

  @IsBoolean()
  @IsOptional()
  requiresLicensing?: boolean;

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  averagePerformanceRating?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  turnoverRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageTenureMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  retentionRate?: number;

  @IsNumber()
  @IsOptional()
  historicalFillTime?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  numberOfIncumbents?: number;

  @IsString()
  @IsOptional()
  businessImpact?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  vacancyRiskScore?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  successionRiskScore?: number;

  @IsBoolean()
  @IsOptional()
  isAtRisk?: boolean;

  @IsString()
  @IsOptional()
  riskMitigation?: string;

  @IsNumber()
  @IsOptional()
  marketMedianSalary?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(200)
  competitiveIndex?: number;

  @IsString()
  @IsOptional()
  marketDemand?: string;

  @IsString()
  @IsOptional()
  talentAvailability?: string;

  @IsDateString()
  @IsOptional()
  lastMarketReview?: string;

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

export class UpdatePositionDto {
  @IsString()
  @IsOptional()
  positionCode?: string;

  @IsString()
  @IsOptional()
  positionTitle?: string;

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
  positionStatus?: string;

  @IsString()
  @IsOptional()
  positionType?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isVacant?: boolean;

  @IsBoolean()
  @IsOptional()
  isFrozen?: boolean;

  @IsBoolean()
  @IsOptional()
  isPendingApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  isBudgeted?: boolean;

  @IsBoolean()
  @IsOptional()
  isEssential?: boolean;

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
  costCenterId?: string;

  @IsString()
  @IsOptional()
  functionalAreaId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  workLocation?: string;

  @IsString()
  @IsOptional()
  officeLocation?: string;

  @IsString()
  @IsOptional()
  reportsToPositionId?: string;

  @IsString()
  @IsOptional()
  reportsToEmployeeId?: string;

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  headcountAllocation?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  numberOfPositions?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  filledPositions?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  vacantPositions?: number;

  @IsString()
  @IsOptional()
  positionControl?: string;

  @IsDateString()
  @IsOptional()
  positionControlDate?: string;

  @IsString()
  @IsOptional()
  positionControlReason?: string;

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
  minSalary?: number;

  @IsNumber()
  @IsOptional()
  midSalary?: number;

  @IsNumber()
  @IsOptional()
  maxSalary?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  salaryCurrency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  targetBonusPercentage?: number;

  @IsNumber()
  @IsOptional()
  totalCompensationTarget?: number;

  @IsNumber()
  @IsOptional()
  budgetedSalary?: number;

  @IsNumber()
  @IsOptional()
  actualSalary?: number;

  @IsNumber()
  @IsOptional()
  totalBudgetedCost?: number;

  @IsNumber()
  @IsOptional()
  totalActualCost?: number;

  @IsNumber()
  @IsOptional()
  budgetYear?: number;

  @IsString()
  @IsOptional()
  budgetStatus?: string;

  @IsDateString()
  @IsOptional()
  budgetApprovalDate?: string;

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
  shiftPattern?: string;

  @IsBoolean()
  @IsOptional()
  requiresShiftWork?: boolean;

  @IsString()
  @IsOptional()
  jobSummary?: string;

  @IsString()
  @IsOptional()
  keyResponsibilities?: string;

  @IsArray()
  @IsOptional()
  responsibilities?: any[];

  @IsString()
  @IsOptional()
  qualifications?: string;

  @IsString()
  @IsOptional()
  educationRequirements?: string;

  @IsString()
  @IsOptional()
  experienceRequirements?: string;

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
  licenses?: string[];

  @IsBoolean()
  @IsOptional()
  isCustomerFacing?: boolean;

  @IsBoolean()
  @IsOptional()
  isRevenueDriving?: boolean;

  @IsBoolean()
  @IsOptional()
  isCostCenter?: boolean;

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
  requiresSecurityClearance?: boolean;

  @IsArray()
  @IsOptional()
  securityClearances?: string[];

  @IsDateString()
  @IsOptional()
  creationDate?: string;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsDateString()
  @IsOptional()
  lastFilledDate?: string;

  @IsDateString()
  @IsOptional()
  lastVacatedDate?: string;

  @IsDateString()
  @IsOptional()
  anticipatedFillDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  daysVacant?: number;

  @IsString()
  @IsOptional()
  incumbentEmployeeId?: string;

  @IsString()
  @IsOptional()
  incumbentName?: string;

  @IsDateString()
  @IsOptional()
  incumbentStartDate?: string;

  @IsArray()
  @IsOptional()
  incumbentHistory?: any[];

  @IsArray()
  @IsOptional()
  successorCandidates?: string[];

  @IsObject()
  @IsOptional()
  successionPlan?: any;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  successionReadiness?: number;

  @IsArray()
  @IsOptional()
  keySuccessors?: string[];

  @IsArray()
  @IsOptional()
  emergencySuccessors?: string[];

  @IsString()
  @IsOptional()
  requisitionId?: string;

  @IsDateString()
  @IsOptional()
  requisitionDate?: string;

  @IsString()
  @IsOptional()
  requisitionStatus?: string;

  @IsDateString()
  @IsOptional()
  targetStartDate?: string;

  @IsNumber()
  @IsOptional()
  targetTimeToFill?: number;

  @IsNumber()
  @IsOptional()
  actualTimeToFill?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  numberOfOpenings?: number;

  @IsString()
  @IsOptional()
  jobDescriptionId?: string;

  @IsDateString()
  @IsOptional()
  jobDescriptionDate?: string;

  @IsString()
  @IsOptional()
  jobDescriptionVersion?: string;

  @IsDateString()
  @IsOptional()
  lastReviewedDate?: string;

  @IsDateString()
  @IsOptional()
  nextReviewDate?: string;

  @IsArray()
  @IsOptional()
  complianceRequirements?: string[];

  @IsArray()
  @IsOptional()
  regulatoryRequirements?: string[];

  @IsString()
  @IsOptional()
  backgroundCheckLevel?: string;

  @IsBoolean()
  @IsOptional()
  requiresLicensing?: boolean;

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  averagePerformanceRating?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  turnoverRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageTenureMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  retentionRate?: number;

  @IsNumber()
  @IsOptional()
  historicalFillTime?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  numberOfIncumbents?: number;

  @IsString()
  @IsOptional()
  businessImpact?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  vacancyRiskScore?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  successionRiskScore?: number;

  @IsBoolean()
  @IsOptional()
  isAtRisk?: boolean;

  @IsString()
  @IsOptional()
  riskMitigation?: string;

  @IsNumber()
  @IsOptional()
  marketMedianSalary?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(200)
  competitiveIndex?: number;

  @IsString()
  @IsOptional()
  marketDemand?: string;

  @IsString()
  @IsOptional()
  talentAvailability?: string;

  @IsDateString()
  @IsOptional()
  lastMarketReview?: string;

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
