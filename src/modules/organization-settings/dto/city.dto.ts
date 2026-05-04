import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCityDto {
  @IsString()
  groupCompanyId: string;

  @IsString()
  cityCode: string;

  @IsString()
  cityName: string;

  @IsString()
  @IsOptional()
  officialName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  stateId?: string;

  @IsString()
  @IsOptional()
  stateCode?: string;

  @IsString()
  @IsOptional()
  stateName?: string;

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

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsNumber()
  @IsOptional()
  @Min(-12)
  @Max(14)
  utcOffset?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  elevation?: number;

  @IsString()
  @IsOptional()
  climate?: string;

  @IsString()
  @IsOptional()
  cityType?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  population?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  areaKm2?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  populationDensity?: number;

  @IsString()
  @IsOptional()
  mayorName?: string;

  @IsString()
  @IsOptional()
  governmentStructure?: string;

  @IsString()
  @IsOptional()
  cityHallAddress?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  cityWebsite?: string;

  @IsString()
  @IsOptional()
  emergencyNumber?: string;

  @IsString()
  @IsOptional()
  cityEmail?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gdpUsd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gdpPerCapitaUsd?: number;

  @IsArray()
  @IsOptional()
  majorIndustries?: string[];

  @IsArray()
  @IsOptional()
  economicZones?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  unemploymentRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  medianHouseholdIncome?: number;

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
  averageRent1BR?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageRent2BR?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageRent3BR?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averageHomePrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  transportationCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  foodCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  utilitiesCost?: number;

  @IsObject()
  @IsOptional()
  livingCostBreakdown?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  cityTaxRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  localTaxRate?: number;

  @IsObject()
  @IsOptional()
  taxRates?: Record<string, any>;

  @IsArray()
  @IsOptional()
  primaryLanguages?: string[];

  @IsArray()
  @IsOptional()
  spokenLanguages?: string[];

  @IsBoolean()
  @IsOptional()
  hasAirport?: boolean;

  @IsString()
  @IsOptional()
  airportName?: string;

  @IsString()
  @IsOptional()
  airportCode?: string;

  @IsBoolean()
  @IsOptional()
  hasSeaport?: boolean;

  @IsBoolean()
  @IsOptional()
  hasSubway?: boolean;

  @IsBoolean()
  @IsOptional()
  hasTrainStation?: boolean;

  @IsArray()
  @IsOptional()
  publicTransport?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  trafficIndex?: number;

  @IsObject()
  @IsOptional()
  transportationNetwork?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  @Min(0)
  internetSpeedMbps?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  internetPenetrationRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  mobilePenetrationRate?: number;

  @IsArray()
  @IsOptional()
  internetProviders?: string[];

  @IsString()
  @IsOptional()
  techHubStatus?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  universitiesCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  hospitalsCount?: number;

  @IsArray()
  @IsOptional()
  majorUniversities?: string[];

  @IsArray()
  @IsOptional()
  majorHospitals?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  literacyRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  healthcareQualityIndex?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  qualityOfLifeIndex?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  safetyIndex?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  pollutionIndex?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  healthcareIndex?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  climateIndex?: number;

  @IsObject()
  @IsOptional()
  qualityOfLifeMetrics?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isBusinessHub?: boolean;

  @IsBoolean()
  @IsOptional()
  isFinancialCenter?: boolean;

  @IsBoolean()
  @IsOptional()
  isTechHub?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  fortuneCompaniesCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  startupsCount?: number;

  @IsArray()
  @IsOptional()
  majorEmployers?: string[];

  @IsObject()
  @IsOptional()
  businessEnvironment?: Record<string, any>;

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

export class UpdateCityDto extends PartialType(CreateCityDto) {}
