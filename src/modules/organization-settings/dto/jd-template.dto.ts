import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, IsDateString, Min, Max } from 'class-validator';

export class CreateJDTemplateDto {
  @IsString()
  templateCode: string;

  @IsString()
  templateName: string;

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
  category?: string;

  @IsString()
  @IsOptional()
  templateType?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  jobSummary?: string;

  @IsString()
  @IsOptional()
  jobOverview?: string;

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

  @IsString()
  @IsOptional()
  workingConditions?: string;

  @IsString()
  @IsOptional()
  physicalRequirements?: string;

  @IsString()
  @IsOptional()
  travelRequirements?: string;

  @IsString()
  @IsOptional()
  benefitsPackage?: string;

  @IsString()
  @IsOptional()
  compensationRange?: string;

  @IsString()
  @IsOptional()
  careerPath?: string;

  @IsString()
  @IsOptional()
  companyOverview?: string;

  @IsString()
  @IsOptional()
  equalOpportunityStatement?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  isStandard?: boolean;

  @IsBoolean()
  @IsOptional()
  isCustomizable?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsArray()
  @IsOptional()
  sections?: any[];

  @IsObject()
  @IsOptional()
  layout?: any;

  @IsArray()
  @IsOptional()
  includedSections?: string[];

  @IsArray()
  @IsOptional()
  optionalSections?: string[];

  @IsObject()
  @IsOptional()
  styling?: any;

  @IsArray()
  @IsOptional()
  brandingElements?: string[];

  @IsString()
  @IsOptional()
  headerTemplate?: string;

  @IsString()
  @IsOptional()
  footerTemplate?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  usageCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  activeUsageCount?: number;

  @IsDateString()
  @IsOptional()
  lastUsedDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  averageRating?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalRatings?: number;

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

  @IsObject()
  @IsOptional()
  approvalWorkflow?: any;

  @IsArray()
  @IsOptional()
  versionHistory?: any[];

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  previousVersionId?: string;

  @IsString()
  @IsOptional()
  parentTemplateId?: string;

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

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateJDTemplateDto {
  @IsString()
  @IsOptional()
  templateCode?: string;

  @IsString()
  @IsOptional()
  templateName?: string;

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
  category?: string;

  @IsString()
  @IsOptional()
  templateType?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  jobSummary?: string;

  @IsString()
  @IsOptional()
  jobOverview?: string;

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

  @IsString()
  @IsOptional()
  workingConditions?: string;

  @IsString()
  @IsOptional()
  physicalRequirements?: string;

  @IsString()
  @IsOptional()
  travelRequirements?: string;

  @IsString()
  @IsOptional()
  benefitsPackage?: string;

  @IsString()
  @IsOptional()
  compensationRange?: string;

  @IsString()
  @IsOptional()
  careerPath?: string;

  @IsString()
  @IsOptional()
  companyOverview?: string;

  @IsString()
  @IsOptional()
  equalOpportunityStatement?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  isStandard?: boolean;

  @IsBoolean()
  @IsOptional()
  isCustomizable?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsArray()
  @IsOptional()
  sections?: any[];

  @IsObject()
  @IsOptional()
  layout?: any;

  @IsArray()
  @IsOptional()
  includedSections?: string[];

  @IsArray()
  @IsOptional()
  optionalSections?: string[];

  @IsObject()
  @IsOptional()
  styling?: any;

  @IsArray()
  @IsOptional()
  brandingElements?: string[];

  @IsString()
  @IsOptional()
  headerTemplate?: string;

  @IsString()
  @IsOptional()
  footerTemplate?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  usageCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  activeUsageCount?: number;

  @IsDateString()
  @IsOptional()
  lastUsedDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  averageRating?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalRatings?: number;

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

  @IsObject()
  @IsOptional()
  approvalWorkflow?: any;

  @IsArray()
  @IsOptional()
  versionHistory?: any[];

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  previousVersionId?: string;

  @IsString()
  @IsOptional()
  parentTemplateId?: string;

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

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
