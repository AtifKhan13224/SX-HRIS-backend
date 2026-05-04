import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, IsDateString, IsEnum, Min, Max } from 'class-validator';

export class CreateSponsoringCompanyDto {
  @IsString()
  companyCode: string;

  @IsString()
  companyName: string;

  @IsString()
  @IsOptional()
  groupCompanyId?: string;

  @IsString()
  @IsOptional()
  legalName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortName?: string;

  @IsString()
  @IsOptional()
  abbreviation?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  vatNumber?: string;

  @IsString()
  @IsOptional()
  incorporationNumber?: string;

  @IsDateString()
  @IsOptional()
  incorporationDate?: string;

  @IsString()
  @IsOptional()
  jurisdictionOfIncorporation?: string;

  @IsString()
  @IsOptional()
  companyType?: string;

  @IsString()
  @IsOptional()
  legalStatus?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  registeredAddress?: string;

  @IsString()
  @IsOptional()
  businessAddress?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsBoolean()
  @IsOptional()
  canSponsorVisa?: boolean;

  @IsBoolean()
  @IsOptional()
  hasH1BSponsor?: boolean;

  @IsBoolean()
  @IsOptional()
  hasL1Sponsor?: boolean;

  @IsBoolean()
  @IsOptional()
  hasE3Sponsor?: boolean;

  @IsBoolean()
  @IsOptional()
  hasTN1Sponsor?: boolean;

  @IsArray()
  @IsOptional()
  supportedVisaTypes?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  annualH1BCap?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  usedH1BCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  remainingH1BCount?: number;

  @IsArray()
  @IsOptional()
  sponsorshipCountries?: string[];

  @IsBoolean()
  @IsOptional()
  isEVerifyEnrolled?: boolean;

  @IsString()
  @IsOptional()
  eVerifyNumber?: string;

  @IsDateString()
  @IsOptional()
  eVerifyEnrollmentDate?: string;

  @IsBoolean()
  @IsOptional()
  hasI9Compliance?: boolean;

  @IsBoolean()
  @IsOptional()
  hasLCACompliance?: boolean;

  @IsArray()
  @IsOptional()
  complianceCertifications?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  activeWorkPermits?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pendingWorkPermits?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  expiringWorkPermits?: number;

  @IsObject()
  @IsOptional()
  workPermitStats?: any;

  @IsNumber()
  @IsOptional()
  averageH1BCost?: number;

  @IsNumber()
  @IsOptional()
  averageGreenCardCost?: number;

  @IsNumber()
  @IsOptional()
  totalSponsorshipCost?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  sponsorshipCurrency?: string;

  @IsObject()
  @IsOptional()
  costBreakdown?: any;

  @IsString()
  @IsOptional()
  immigrationAttorney?: string;

  @IsString()
  @IsOptional()
  lawFirm?: string;

  @IsString()
  @IsOptional()
  attorneyEmail?: string;

  @IsString()
  @IsOptional()
  attorneyPhone?: string;

  @IsArray()
  @IsOptional()
  legalContacts?: string[];

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  primaryBusinessActivity?: string;

  @IsArray()
  @IsOptional()
  businessActivities?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  numberOfEmployees?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  numberOfForeignNationals?: number;

  @IsNumber()
  @IsOptional()
  annualRevenue?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  revenueCurrency?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimarySponsorship?: boolean;

  @IsArray()
  @IsOptional()
  regulatoryRequirements?: string[];

  @IsArray()
  @IsOptional()
  complianceDocuments?: string[];

  @IsDateString()
  @IsOptional()
  lastComplianceReview?: string;

  @IsDateString()
  @IsOptional()
  nextComplianceReview?: string;

  @IsString()
  @IsOptional()
  complianceStatus?: string;

  @IsArray()
  @IsOptional()
  bankAccounts?: string[];

  @IsString()
  @IsOptional()
  defaultPayrollProvider?: string;

  @IsString()
  @IsOptional()
  defaultBenefitsProvider?: string;

  @IsObject()
  @IsOptional()
  financialDetails?: any;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsDateString()
  @IsOptional()
  lastAuditDate?: string;

  @IsDateString()
  @IsOptional()
  nextAuditDate?: string;

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalSponsored?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  activeSponsored?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  approvedPetitions?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  deniedPetitions?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  approvalRate?: number;

  @IsArray()
  @IsOptional()
  sponsorshipHistory?: any[];

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

export class UpdateSponsoringCompanyDto {
  @IsString()
  @IsOptional()
  companyCode?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  groupCompanyId?: string;

  @IsString()
  @IsOptional()
  legalName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortName?: string;

  @IsString()
  @IsOptional()
  abbreviation?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  vatNumber?: string;

  @IsString()
  @IsOptional()
  incorporationNumber?: string;

  @IsDateString()
  @IsOptional()
  incorporationDate?: string;

  @IsString()
  @IsOptional()
  jurisdictionOfIncorporation?: string;

  @IsString()
  @IsOptional()
  companyType?: string;

  @IsString()
  @IsOptional()
  legalStatus?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  registeredAddress?: string;

  @IsString()
  @IsOptional()
  businessAddress?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsBoolean()
  @IsOptional()
  canSponsorVisa?: boolean;

  @IsBoolean()
  @IsOptional()
  hasH1BSponsor?: boolean;

  @IsBoolean()
  @IsOptional()
  hasL1Sponsor?: boolean;

  @IsBoolean()
  @IsOptional()
  hasE3Sponsor?: boolean;

  @IsBoolean()
  @IsOptional()
  hasTN1Sponsor?: boolean;

  @IsArray()
  @IsOptional()
  supportedVisaTypes?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  annualH1BCap?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  usedH1BCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  remainingH1BCount?: number;

  @IsArray()
  @IsOptional()
  sponsorshipCountries?: string[];

  @IsBoolean()
  @IsOptional()
  isEVerifyEnrolled?: boolean;

  @IsString()
  @IsOptional()
  eVerifyNumber?: string;

  @IsDateString()
  @IsOptional()
  eVerifyEnrollmentDate?: string;

  @IsBoolean()
  @IsOptional()
  hasI9Compliance?: boolean;

  @IsBoolean()
  @IsOptional()
  hasLCACompliance?: boolean;

  @IsArray()
  @IsOptional()
  complianceCertifications?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  activeWorkPermits?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pendingWorkPermits?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  expiringWorkPermits?: number;

  @IsObject()
  @IsOptional()
  workPermitStats?: any;

  @IsNumber()
  @IsOptional()
  averageH1BCost?: number;

  @IsNumber()
  @IsOptional()
  averageGreenCardCost?: number;

  @IsNumber()
  @IsOptional()
  totalSponsorshipCost?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  sponsorshipCurrency?: string;

  @IsObject()
  @IsOptional()
  costBreakdown?: any;

  @IsString()
  @IsOptional()
  immigrationAttorney?: string;

  @IsString()
  @IsOptional()
  lawFirm?: string;

  @IsString()
  @IsOptional()
  attorneyEmail?: string;

  @IsString()
  @IsOptional()
  attorneyPhone?: string;

  @IsArray()
  @IsOptional()
  legalContacts?: string[];

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  primaryBusinessActivity?: string;

  @IsArray()
  @IsOptional()
  businessActivities?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  numberOfEmployees?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  numberOfForeignNationals?: number;

  @IsNumber()
  @IsOptional()
  annualRevenue?: number;

  @IsString()
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'INR', 'AUD'])
  revenueCurrency?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimarySponsorship?: boolean;

  @IsArray()
  @IsOptional()
  regulatoryRequirements?: string[];

  @IsArray()
  @IsOptional()
  complianceDocuments?: string[];

  @IsDateString()
  @IsOptional()
  lastComplianceReview?: string;

  @IsDateString()
  @IsOptional()
  nextComplianceReview?: string;

  @IsString()
  @IsOptional()
  complianceStatus?: string;

  @IsArray()
  @IsOptional()
  bankAccounts?: string[];

  @IsString()
  @IsOptional()
  defaultPayrollProvider?: string;

  @IsString()
  @IsOptional()
  defaultBenefitsProvider?: string;

  @IsObject()
  @IsOptional()
  financialDetails?: any;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsDateString()
  @IsOptional()
  lastAuditDate?: string;

  @IsDateString()
  @IsOptional()
  nextAuditDate?: string;

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalSponsored?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  activeSponsored?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  approvedPetitions?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  deniedPetitions?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  approvalRate?: number;

  @IsArray()
  @IsOptional()
  sponsorshipHistory?: any[];

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
