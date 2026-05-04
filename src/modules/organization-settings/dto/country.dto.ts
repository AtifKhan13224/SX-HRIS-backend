import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, Min, Max, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCountryDto {
  @IsString()
  groupCompanyId: string;

  @IsString()
  countryCode: string;

  @IsString()
  countryName: string;

  @IsString()
  @IsOptional()
  officialName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  iso2Code?: string;

  @IsString()
  @IsOptional()
  iso3Code?: string;

  @IsString()
  @IsOptional()
  isoNumericCode?: string;

  // Geographic Information
  @IsString()
  @IsOptional()
  continent?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  subregion?: string;

  @IsString()
  @IsOptional()
  capital?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  areaKm2?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  population?: number;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsArray()
  @IsOptional()
  borders?: string[];

  @IsArray()
  @IsOptional()
  timezones?: string[];

  // Currency Information
  @IsString()
  @IsOptional()
  currencyCode?: string;

  @IsString()
  @IsOptional()
  currencyName?: string;

  @IsString()
  @IsOptional()
  currencySymbol?: string;

  @IsArray()
  @IsOptional()
  supportedCurrencies?: string[];

  @IsObject()
  @IsOptional()
  currencyDetails?: Record<string, any>;

  // Language Information
  @IsArray()
  @IsOptional()
  officialLanguages?: string[];

  @IsArray()
  @IsOptional()
  spokenLanguages?: string[];

  @IsString()
  @IsOptional()
  primaryLanguage?: string;

  @IsObject()
  @IsOptional()
  languageDetails?: Record<string, any>;

  // Contact & Communication
  @IsString()
  @IsOptional()
  phoneCode?: string;

  @IsString()
  @IsOptional()
  internetTLD?: string;

  @IsString()
  @IsOptional()
  postalCodeFormat?: string;

  @IsString()
  @IsOptional()
  addressFormat?: string;

  // Economic Information
  @IsNumber()
  @IsOptional()
  @Min(0)
  gdpUsd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gdpPerCapitaUsd?: number;

  @IsString()
  @IsOptional()
  economicClassification?: string;

  @IsArray()
  @IsOptional()
  majorIndustries?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  unemploymentRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(-50)
  @Max(100)
  inflationRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  corporateTaxRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  vatRate?: number;

  // Business & Legal
  @IsString()
  @IsOptional()
  businessRegistrationProcess?: string;

  @IsArray()
  @IsOptional()
  requiredBusinessLicenses?: string[];

  @IsObject()
  @IsOptional()
  businessRegulations?: Record<string, any>;

  @IsArray()
  @IsOptional()
  legalEntityTypes?: string[];

  @IsString()
  @IsOptional()
  companyRegistrationRequirements?: string;

  // Employment & Labor Laws
  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumWage?: number;

  @IsString()
  @IsOptional()
  minimumWageCurrency?: string;

  @IsString()
  @IsOptional()
  minimumWageFrequency?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(168)
  standardWorkWeekHours?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(24)
  standardWorkDayHours?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(365)
  minimumAnnualLeave?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(365)
  minimumSickLeave?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(730)
  maternityLeaveDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(365)
  paternityLeaveDays?: number;

  @IsObject()
  @IsOptional()
  publicHolidays?: Record<string, any>;

  @IsString()
  @IsOptional()
  laborLawSummary?: string;

  @IsArray()
  @IsOptional()
  employmentRegulations?: string[];

  @IsObject()
  @IsOptional()
  terminationRules?: Record<string, any>;

  @IsObject()
  @IsOptional()
  noticePeriodRequirements?: Record<string, any>;

  @IsObject()
  @IsOptional()
  severancePayRules?: Record<string, any>;

  // Immigration & Visa
  @IsBoolean()
  @IsOptional()
  requiresWorkPermit?: boolean;

  @IsArray()
  @IsOptional()
  availableVisaTypes?: string[];

  @IsObject()
  @IsOptional()
  visaRequirements?: Record<string, any>;

  @IsArray()
  @IsOptional()
  visaFreeCountries?: string[];

  @IsObject()
  @IsOptional()
  workPermitProcess?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  @Min(0)
  workPermitProcessingDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  workPermitCost?: number;

  @IsString()
  @IsOptional()
  workPermitCostCurrency?: string;

  // Social Security & Benefits
  @IsBoolean()
  @IsOptional()
  hasSocialSecurity?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  employerSocialSecurityRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  employeeSocialSecurityRate?: number;

  @IsObject()
  @IsOptional()
  socialSecurityComponents?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  hasNationalHealthcare?: boolean;

  @IsObject()
  @IsOptional()
  healthcareSystem?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  hasPensionSystem?: boolean;

  @IsObject()
  @IsOptional()
  pensionSystemDetails?: Record<string, any>;

  // Compliance & Regulatory
  @IsArray()
  @IsOptional()
  dataProtectionLaws?: string[];

  @IsBoolean()
  @IsOptional()
  hasGDPREquivalent?: boolean;

  @IsString()
  @IsOptional()
  privacyLawsSummary?: string;

  @IsArray()
  @IsOptional()
  antiCorruptionLaws?: string[];

  @IsArray()
  @IsOptional()
  complianceRequirements?: string[];

  @IsObject()
  @IsOptional()
  regulatoryBodies?: Record<string, any>;

  @IsArray()
  @IsOptional()
  auditRequirements?: string[];

  @IsArray()
  @IsOptional()
  reportingObligations?: string[];

  // Market & Business Environment
  @IsNumber()
  @IsOptional()
  @Min(1)
  easeOfDoingBusinessRank?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  corruptionPerceptionIndex?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  globalCompetitivenessIndex?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  foreignInvestmentIndex?: number;

  @IsArray()
  @IsOptional()
  tradeAgreements?: string[];

  @IsArray()
  @IsOptional()
  economicBlocs?: string[];

  // HR & Payroll Considerations
  @IsString()
  @IsOptional()
  payrollFrequency?: string;

  @IsObject()
  @IsOptional()
  payrollTaxRates?: Record<string, any>;

  @IsObject()
  @IsOptional()
  benefitsRequirements?: Record<string, any>;

  @IsObject()
  @IsOptional()
  hrBestPractices?: Record<string, any>;

  @IsString()
  @IsOptional()
  payrollNotes?: string;

  // Risk & Security
  @IsString()
  @IsOptional()
  politicalStability?: string;

  @IsString()
  @IsOptional()
  securityRating?: string;

  @IsArray()
  @IsOptional()
  travelAdvisories?: string[];

  @IsObject()
  @IsOptional()
  riskAssessment?: Record<string, any>;

  @IsString()
  @IsOptional()
  securityConsiderations?: string;

  // Cost of Living
  @IsNumber()
  @IsOptional()
  @Min(0)
  costOfLivingIndex?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageRentUsd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageSalaryUsd?: number;

  @IsObject()
  @IsOptional()
  livingCostBreakdown?: Record<string, any>;

  // Status & Configuration
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isOperational?: boolean;

  @IsBoolean()
  @IsOptional()
  hasOffice?: boolean;

  @IsBoolean()
  @IsOptional()
  hasEmployees?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  employeeCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  officeCount?: number;

  // Metadata
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  sourceSystem?: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}

export class UpdateCountryDto extends PartialType(CreateCountryDto) {}
