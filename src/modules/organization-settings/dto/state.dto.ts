import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, Min, Max, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateStateDto {
  @IsString()
  groupCompanyId: string;

  @IsString()
  stateCode: string;

  @IsString()
  stateName: string;

  @IsString()
  @IsOptional()
  officialName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  stateAbbreviation?: string;

  @IsString()
  @IsOptional()
  isoCode?: string;

  @IsString()
  @IsOptional()
  countryId?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsString()
  @IsOptional()
  countryName?: string;

  @IsString()
  @IsOptional()
  regionId?: string;

  @IsString()
  @IsOptional()
  regionCode?: string;

  @IsString()
  @IsOptional()
  regionName?: string;

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
  timezones?: string[];

  @IsString()
  @IsOptional()
  primaryTimezone?: string;

  @IsArray()
  @IsOptional()
  borderingStates?: string[];

  @IsString()
  @IsOptional()
  stateType?: string;

  @IsString()
  @IsOptional()
  governmentType?: string;

  @IsString()
  @IsOptional()
  governorName?: string;

  @IsString()
  @IsOptional()
  legislatureType?: string;

  @IsString()
  @IsOptional()
  governmentStructure?: string;

  @IsString()
  @IsOptional()
  capitalAddress?: string;

  @IsString()
  @IsOptional()
  phoneCode?: string;

  @IsString()
  @IsOptional()
  officialWebsite?: string;

  @IsString()
  @IsOptional()
  emergencyNumber?: string;

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
  currencyCode?: string;

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
  @Min(0)
  @Max(100)
  povertyRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  medianHouseholdIncome?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  stateTaxRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  salesTaxRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  propertyTaxRate?: number;

  @IsBoolean()
  @IsOptional()
  hasIncomeTax?: boolean;

  @IsObject()
  @IsOptional()
  taxRates?: Record<string, any>;

  @IsObject()
  @IsOptional()
  taxBrackets?: Record<string, any>;

  @IsString()
  @IsOptional()
  taxNotes?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumWage?: number;

  @IsString()
  @IsOptional()
  minimumWageCurrency?: string;

  @IsDateString()
  @IsOptional()
  minimumWageEffectiveDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(168)
  standardWorkWeekHours?: number;

  @IsArray()
  @IsOptional()
  laborLaws?: string[];

  @IsObject()
  @IsOptional()
  employmentRegulations?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  hasRightToWorkLaws?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAtWillEmployment?: boolean;

  @IsObject()
  @IsOptional()
  terminationRules?: Record<string, any>;

  @IsString()
  @IsOptional()
  laborLawSummary?: string;

  @IsBoolean()
  @IsOptional()
  requiresWorkersComp?: boolean;

  @IsObject()
  @IsOptional()
  workersCompRates?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  hasUnemploymentInsurance?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  unemploymentInsuranceRate?: number;

  @IsBoolean()
  @IsOptional()
  hasDisabilityInsurance?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  disabilityInsuranceRate?: number;

  @IsObject()
  @IsOptional()
  mandatoryBenefits?: Record<string, any>;

  @IsArray()
  @IsOptional()
  payrollRequirements?: string[];

  @IsArray()
  @IsOptional()
  registrationRequirements?: string[];

  @IsArray()
  @IsOptional()
  complianceDeadlines?: string[];

  @IsObject()
  @IsOptional()
  payrollTaxes?: Record<string, any>;

  @IsString()
  @IsOptional()
  hrComplianceNotes?: string;

  @IsArray()
  @IsOptional()
  businessLicenseTypes?: string[];

  @IsObject()
  @IsOptional()
  businessRegistrationProcess?: Record<string, any>;

  @IsArray()
  @IsOptional()
  requiredPermits?: string[];

  @IsString()
  @IsOptional()
  businessRegulations?: string;

  @IsArray()
  @IsOptional()
  dataProtectionLaws?: string[];

  @IsBoolean()
  @IsOptional()
  hasPrivacyLaws?: boolean;

  @IsString()
  @IsOptional()
  privacyLawsSummary?: string;

  @IsArray()
  @IsOptional()
  regulatoryBodies?: string[];

  @IsArray()
  @IsOptional()
  complianceRequirements?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  costOfLivingIndex?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  housingCostIndex?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageRent?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageHomePrice?: number;

  @IsObject()
  @IsOptional()
  livingCostBreakdown?: Record<string, any>;

  @IsArray()
  @IsOptional()
  officialLanguages?: string[];

  @IsArray()
  @IsOptional()
  spokenLanguages?: string[];

  @IsString()
  @IsOptional()
  primaryLanguage?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  literacyRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  urbanPopulationPercent?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  ruralPopulationPercent?: number;

  @IsObject()
  @IsOptional()
  demographicBreakdown?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isOperational?: boolean;

  @IsBoolean()
  @IsOptional()
  hasOffices?: boolean;

  @IsBoolean()
  @IsOptional()
  hasEmployees?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  officeCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  employeeCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cityCount?: number;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;

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

export class UpdateStateDto extends PartialType(CreateStateDto) {}
