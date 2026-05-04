import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, IsDateString, Min, Max } from 'class-validator';

export class CreateDesignationTitleDto {
  @IsString()
  titleCode: string;

  @IsString()
  titleName: string;

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
  titleType?: string;

  @IsString()
  @IsOptional()
  titleContext?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;

  @IsBoolean()
  @IsOptional()
  isExternal?: boolean;

  @IsBoolean()
  @IsOptional()
  isLegal?: boolean;

  @IsBoolean()
  @IsOptional()
  isMarketing?: boolean;

  @IsString()
  @IsOptional()
  languageCode?: string;

  @IsString()
  @IsOptional()
  locale?: string;

  @IsObject()
  @IsOptional()
  translations?: Record<string, string>;

  @IsArray()
  @IsOptional()
  alternativeNames?: string[];

  @IsArray()
  @IsOptional()
  synonyms?: string[];

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsArray()
  @IsOptional()
  applicableRegions?: string[];

  @IsArray()
  @IsOptional()
  applicableCountries?: string[];

  @IsString()
  @IsOptional()
  geographicScope?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsArray()
  @IsOptional()
  targetIndustries?: string[];

  @IsArray()
  @IsOptional()
  marketSegments?: string[];

  @IsString()
  @IsOptional()
  seniorityLevel?: string;

  @IsArray()
  @IsOptional()
  usageContexts?: string[];

  @IsString()
  @IsOptional()
  usageGuidelines?: string;

  @IsString()
  @IsOptional()
  usageRestrictions?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeprecated?: boolean;

  @IsBoolean()
  @IsOptional()
  isPreferred?: boolean;

  @IsString()
  @IsOptional()
  brandingGuidelines?: string;

  @IsString()
  @IsOptional()
  communicationGuidelines?: string;

  @IsString()
  @IsOptional()
  externalDescription?: string;

  @IsString()
  @IsOptional()
  internalDescription?: string;

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsArray()
  @IsOptional()
  searchTerms?: string[];

  @IsArray()
  @IsOptional()
  competitorEquivalents?: any[];

  @IsArray()
  @IsOptional()
  industryEquivalents?: string[];

  @IsArray()
  @IsOptional()
  commonVariations?: string[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  levelNumber?: number;

  @IsString()
  @IsOptional()
  hierarchyLevel?: string;

  @IsBoolean()
  @IsOptional()
  isExecutive?: boolean;

  @IsBoolean()
  @IsOptional()
  isManagement?: boolean;

  @IsBoolean()
  @IsOptional()
  isLeadership?: boolean;

  @IsBoolean()
  @IsOptional()
  isSupervisory?: boolean;

  @IsArray()
  @IsOptional()
  legalRequirements?: string[];

  @IsArray()
  @IsOptional()
  complianceNotes?: string[];

  @IsArray()
  @IsOptional()
  regulatoryConsiderations?: string[];

  @IsBoolean()
  @IsOptional()
  requiresLegalApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  isProtectedTitle?: boolean;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  previousTitleId?: string;

  @IsString()
  @IsOptional()
  replacedBy?: string;

  @IsArray()
  @IsOptional()
  versionHistory?: any[];

  @IsString()
  @IsOptional()
  changeReason?: string;

  @IsDateString()
  @IsOptional()
  lastReviewDate?: string;

  @IsDateString()
  @IsOptional()
  nextReviewDate?: string;

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

  @IsDateString()
  @IsOptional()
  firstUsedDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  popularityScore?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  preferenceScore?: number;

  @IsString()
  @IsOptional()
  marketTrend?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  marketAdoptionRate?: number;

  @IsDateString()
  @IsOptional()
  trendAnalysisDate?: string;

  @IsArray()
  @IsOptional()
  emergingAlternatives?: string[];

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsArray()
  @IsOptional()
  searchKeywords?: string[];

  @IsObject()
  @IsOptional()
  seoMetadata?: any;

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

  @IsString()
  @IsOptional()
  sourceSystem?: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsObject()
  @IsOptional()
  integrationMetadata?: any;

  @IsBoolean()
  @IsOptional()
  isMigrated?: boolean;

  @IsDateString()
  @IsOptional()
  migrationDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  characterCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  wordCount?: number;

  @IsBoolean()
  @IsOptional()
  hasSpecialCharacters?: boolean;

  @IsBoolean()
  @IsOptional()
  hasNumbers?: boolean;

  @IsBoolean()
  @IsOptional()
  isAllCaps?: boolean;

  @IsBoolean()
  @IsOptional()
  isTitleCase?: boolean;

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

export class UpdateDesignationTitleDto {
  @IsString()
  @IsOptional()
  titleCode?: string;

  @IsString()
  @IsOptional()
  titleName?: string;

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
  titleType?: string;

  @IsString()
  @IsOptional()
  titleContext?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;

  @IsBoolean()
  @IsOptional()
  isExternal?: boolean;

  @IsBoolean()
  @IsOptional()
  isLegal?: boolean;

  @IsBoolean()
  @IsOptional()
  isMarketing?: boolean;

  @IsString()
  @IsOptional()
  languageCode?: string;

  @IsString()
  @IsOptional()
  locale?: string;

  @IsObject()
  @IsOptional()
  translations?: Record<string, string>;

  @IsArray()
  @IsOptional()
  alternativeNames?: string[];

  @IsArray()
  @IsOptional()
  synonyms?: string[];

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsArray()
  @IsOptional()
  applicableRegions?: string[];

  @IsArray()
  @IsOptional()
  applicableCountries?: string[];

  @IsString()
  @IsOptional()
  geographicScope?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsArray()
  @IsOptional()
  targetIndustries?: string[];

  @IsArray()
  @IsOptional()
  marketSegments?: string[];

  @IsString()
  @IsOptional()
  seniorityLevel?: string;

  @IsArray()
  @IsOptional()
  usageContexts?: string[];

  @IsString()
  @IsOptional()
  usageGuidelines?: string;

  @IsString()
  @IsOptional()
  usageRestrictions?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeprecated?: boolean;

  @IsBoolean()
  @IsOptional()
  isPreferred?: boolean;

  @IsString()
  @IsOptional()
  brandingGuidelines?: string;

  @IsString()
  @IsOptional()
  communicationGuidelines?: string;

  @IsString()
  @IsOptional()
  externalDescription?: string;

  @IsString()
  @IsOptional()
  internalDescription?: string;

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsArray()
  @IsOptional()
  searchTerms?: string[];

  @IsArray()
  @IsOptional()
  competitorEquivalents?: any[];

  @IsArray()
  @IsOptional()
  industryEquivalents?: string[];

  @IsArray()
  @IsOptional()
  commonVariations?: string[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  levelNumber?: number;

  @IsString()
  @IsOptional()
  hierarchyLevel?: string;

  @IsBoolean()
  @IsOptional()
  isExecutive?: boolean;

  @IsBoolean()
  @IsOptional()
  isManagement?: boolean;

  @IsBoolean()
  @IsOptional()
  isLeadership?: boolean;

  @IsBoolean()
  @IsOptional()
  isSupervisory?: boolean;

  @IsArray()
  @IsOptional()
  legalRequirements?: string[];

  @IsArray()
  @IsOptional()
  complianceNotes?: string[];

  @IsArray()
  @IsOptional()
  regulatoryConsiderations?: string[];

  @IsBoolean()
  @IsOptional()
  requiresLegalApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  isProtectedTitle?: boolean;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  previousTitleId?: string;

  @IsString()
  @IsOptional()
  replacedBy?: string;

  @IsArray()
  @IsOptional()
  versionHistory?: any[];

  @IsString()
  @IsOptional()
  changeReason?: string;

  @IsDateString()
  @IsOptional()
  lastReviewDate?: string;

  @IsDateString()
  @IsOptional()
  nextReviewDate?: string;

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

  @IsDateString()
  @IsOptional()
  firstUsedDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  popularityScore?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  preferenceScore?: number;

  @IsString()
  @IsOptional()
  marketTrend?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  marketAdoptionRate?: number;

  @IsDateString()
  @IsOptional()
  trendAnalysisDate?: string;

  @IsArray()
  @IsOptional()
  emergingAlternatives?: string[];

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsArray()
  @IsOptional()
  searchKeywords?: string[];

  @IsObject()
  @IsOptional()
  seoMetadata?: any;

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

  @IsString()
  @IsOptional()
  sourceSystem?: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsObject()
  @IsOptional()
  integrationMetadata?: any;

  @IsBoolean()
  @IsOptional()
  isMigrated?: boolean;

  @IsDateString()
  @IsOptional()
  migrationDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  characterCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  wordCount?: number;

  @IsBoolean()
  @IsOptional()
  hasSpecialCharacters?: boolean;

  @IsBoolean()
  @IsOptional()
  hasNumbers?: boolean;

  @IsBoolean()
  @IsOptional()
  isAllCaps?: boolean;

  @IsBoolean()
  @IsOptional()
  isTitleCase?: boolean;

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
