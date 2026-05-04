import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsArray,
  IsNumber,
  IsEmail,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BankStatus,
  BankType,
  PayrollIntegrationType,
} from '../entities/bank-master.entity';

/**
 * CREATE BANK MASTER DTO
 */
export class CreateBankMasterDto {
  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Bank name', example: 'Emirates NBD' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  bankName: string;

  @ApiProperty({ description: 'National bank code', example: 'ENBD' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  bankCode: string;

  @ApiPropertyOptional({ description: 'Bank short name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankShortName?: string;

  @ApiPropertyOptional({ description: 'Bank local name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bankLocalName?: string;

  @ApiProperty({ description: 'Country ID (UUID)' })
  @IsUUID()
  countryId: string;

  @ApiProperty({ description: 'Country code', example: 'ARE' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  countryCode: string;

  @ApiProperty({ description: 'Currency code', example: 'AED' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currencyCode: string;

  @ApiPropertyOptional({ description: 'Geographic region' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({ description: 'SWIFT/BIC code', example: 'EBILAEAD' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(11)
  @Matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, {
    message: 'Invalid SWIFT code format',
  })
  swiftCode?: string;

  @ApiPropertyOptional({ description: 'IBAN prefix for the bank' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  ibanPrefix?: string;

  @ApiPropertyOptional({ description: 'Routing number (USA)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  routingNumber?: string;

  @ApiPropertyOptional({ description: 'Sort code (UK)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  sortCode?: string;

  @ApiPropertyOptional({ description: 'IFSC prefix (India)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  ifscPrefix?: string;

  @ApiPropertyOptional({ description: 'BSB code (Australia)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bsbCode?: string;

  @ApiProperty({ description: 'Bank type', enum: BankType })
  @IsEnum(BankType)
  bankType: BankType;

  @ApiPropertyOptional({ description: 'Is Islamic banking?', default: false })
  @IsOptional()
  @IsBoolean()
  isIslamicBanking?: boolean;

  @ApiPropertyOptional({ description: 'Is central bank?', default: false })
  @IsOptional()
  @IsBoolean()
  isCentralBank?: boolean;

  @ApiPropertyOptional({
    description: 'Supported payroll integration types',
    enum: PayrollIntegrationType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PayrollIntegrationType, { each: true })
  payrollIntegrationTypes?: PayrollIntegrationType[];

  @ApiPropertyOptional({ description: 'WPS enabled?', default: false })
  @IsOptional()
  @IsBoolean()
  wpsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'WPS routing code' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  wpsRoutingCode?: string;

  @ApiPropertyOptional({ description: 'WPS employer ID format (regex)' })
  @IsOptional()
  @IsString()
  wpsEmployerIdFormat?: string;

  @ApiPropertyOptional({ description: 'Account number format (regex)' })
  @IsOptional()
  @IsString()
  accountNumberFormat?: string;

  @ApiPropertyOptional({ description: 'Account number minimum length' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  accountNumberMinLength?: number;

  @ApiPropertyOptional({ description: 'Account number maximum length' })
  @IsOptional()
  @IsNumber()
  @Max(50)
  accountNumberMaxLength?: number;

  @ApiPropertyOptional({ description: 'IBAN required?', default: false })
  @IsOptional()
  @IsBoolean()
  ibanRequired?: boolean;

  @ApiPropertyOptional({ description: 'IBAN format (regex)' })
  @IsOptional()
  @IsString()
  ibanFormat?: string;

  @ApiPropertyOptional({ description: 'Branch code required?', default: false })
  @IsOptional()
  @IsBoolean()
  branchCodeRequired?: boolean;

  @ApiPropertyOptional({ description: 'Branch code format (regex)' })
  @IsOptional()
  @IsString()
  branchCodeFormat?: string;

  @ApiPropertyOptional({ description: 'Head office address' })
  @IsOptional()
  @IsString()
  headOfficeAddress?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  stateProvince?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Central bank license number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  centralBankLicenseNumber?: string;

  @ApiPropertyOptional({ description: 'Regulatory authority' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  regulatoryAuthority?: string;

  @ApiPropertyOptional({ description: 'License issue date' })
  @IsOptional()
  @IsDateString()
  licenseIssueDate?: string;

  @ApiPropertyOptional({ description: 'License expiry date' })
  @IsOptional()
  @IsDateString()
  licenseExpiryDate?: string;

  @ApiPropertyOptional({ description: 'Payroll file format' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  payrollFileFormat?: string;

  @ApiPropertyOptional({ description: 'Payroll file template configuration' })
  @IsOptional()
  @IsObject()
  payrollFileTemplate?: object;

  @ApiProperty({ description: 'Bank status', enum: BankStatus })
  @IsEnum(BankStatus)
  status: BankStatus;

  @ApiProperty({ description: 'Effective from date' })
  @IsDateString()
  effectiveFrom: string;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsOptional()
  @IsObject()
  customFields?: object;

  @ApiProperty({ description: 'Created by user ID' })
  @IsUUID()
  createdBy: string;
}

/**
 * UPDATE BANK MASTER DTO
 */
export class UpdateBankMasterDto {
  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  bankName?: string;

  @ApiPropertyOptional({ description: 'Bank short name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankShortName?: string;

  @ApiPropertyOptional({ description: 'Bank local name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bankLocalName?: string;

  @ApiPropertyOptional({ description: 'SWIFT/BIC code' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(11)
  @Matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, {
    message: 'Invalid SWIFT code format',
  })
  swiftCode?: string;

  @ApiPropertyOptional({ description: 'Bank type', enum: BankType })
  @IsOptional()
  @IsEnum(BankType)
  bankType?: BankType;

  @ApiPropertyOptional({ description: 'Payroll integration types', enum: PayrollIntegrationType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(PayrollIntegrationType, { each: true })
  payrollIntegrationTypes?: PayrollIntegrationType[];

  @ApiPropertyOptional({ description: 'WPS enabled?' })
  @IsOptional()
  @IsBoolean()
  wpsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Account number format (regex)' })
  @IsOptional()
  @IsString()
  accountNumberFormat?: string;

  @ApiPropertyOptional({ description: 'IBAN required?' })
  @IsOptional()
  @IsBoolean()
  ibanRequired?: boolean;

  @ApiPropertyOptional({ description: 'Branch code required?' })
  @IsOptional()
  @IsBoolean()
  branchCodeRequired?: boolean;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Website' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Bank status', enum: BankStatus })
  @IsOptional()
  @IsEnum(BankStatus)
  status?: BankStatus;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsOptional()
  @IsObject()
  customFields?: object;

  @ApiProperty({ description: 'Updated by user ID' })
  @IsUUID()
  updatedBy: string;
}

/**
 * CREATE BANK BRANCH DTO
 */
export class CreateBankBranchDto {
  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Bank ID' })
  @IsUUID()
  bankId: string;

  @ApiProperty({ description: 'Branch name', example: 'Dubai Main Branch' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  branchName: string;

  @ApiProperty({ description: 'Branch code', example: '001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  branchCode: string;

  @ApiPropertyOptional({ description: 'Branch local name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  branchLocalName?: string;

  @ApiProperty({ description: 'Address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  stateProvince?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ description: 'Country code', example: 'ARE' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  countryCode: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Branch SWIFT code' })
  @IsOptional()
  @IsString()
  @MaxLength(11)
  swiftCode?: string;

  @ApiPropertyOptional({ description: 'IFSC code (India)' })
  @IsOptional()
  @IsString()
  @MaxLength(11)
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid IFSC code format' })
  ifscCode?: string;

  @ApiPropertyOptional({ description: 'MICR code (India)' })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  micrCode?: string;

  @ApiPropertyOptional({ description: 'Sort code (UK)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  sortCode?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Manager name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  managerName?: string;

  @ApiProperty({ description: 'Effective from date' })
  @IsDateString()
  effectiveFrom: string;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Created by user ID' })
  @IsUUID()
  createdBy: string;
}

/**
 * UPDATE BANK BRANCH DTO
 */
export class UpdateBankBranchDto {
  @ApiPropertyOptional({ description: 'Branch name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  branchName?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Manager name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  managerName?: string;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Updated by user ID' })
  @IsUUID()
  updatedBy: string;
}

/**
 * CREATE COMPANY BANK ACCOUNT DTO
 */
export class CreateCompanyBankAccountDto {
  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Legal entity ID' })
  @IsUUID()
  legalEntityId: string;

  @ApiProperty({ description: 'Legal entity name' })
  @IsString()
  @MaxLength(255)
  legalEntityName: string;

  @ApiProperty({ description: 'Country ID' })
  @IsUUID()
  countryId: string;

  @ApiProperty({ description: 'Bank ID' })
  @IsUUID()
  bankId: string;

  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ description: 'Account holder name' })
  @IsString()
  @MaxLength(255)
  accountName: string;

  @ApiProperty({ description: 'Account number' })
  @IsString()
  @MaxLength(50)
  accountNumber: string;

  @ApiPropertyOptional({ description: 'IBAN' })
  @IsOptional()
  @IsString()
  @MaxLength(34)
  @Matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, { message: 'Invalid IBAN format' })
  iban?: string;

  @ApiProperty({ description: 'Currency code', example: 'AED' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currencyCode: string;

  @ApiPropertyOptional({ description: 'Account type', default: 'CURRENT' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountType?: string;

  @ApiPropertyOptional({ description: 'Is primary payroll account?', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimaryPayrollAccount?: boolean;

  @ApiPropertyOptional({ description: 'Payroll purposes', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payrollPurpose?: string[];

  @ApiPropertyOptional({ description: 'WPS employer ID' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  wpsEmployerId?: string;

  @ApiPropertyOptional({ description: 'WPS establishment code' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  wpsEstablishmentCode?: string;

  @ApiPropertyOptional({ description: 'SEPA creditor ID' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sepaCreditorId?: string;

  @ApiProperty({ description: 'Effective from date' })
  @IsDateString()
  effectiveFrom: string;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Created by user ID' })
  @IsUUID()
  createdBy: string;
}

/**
 * UPDATE COMPANY BANK ACCOUNT DTO
 */
export class UpdateCompanyBankAccountDto {
  @ApiPropertyOptional({ description: 'Account holder name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  accountName?: string;

  @ApiPropertyOptional({ description: 'Is primary payroll account?' })
  @IsOptional()
  @IsBoolean()
  isPrimaryPayrollAccount?: boolean;

  @ApiPropertyOptional({ description: 'Payroll purposes', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  payrollPurpose?: string[];

  @ApiPropertyOptional({ description: 'WPS employer ID' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  wpsEmployerId?: string;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Updated by user ID' })
  @IsUUID()
  updatedBy: string;
}

/**
 * QUERY/FILTER DTOs
 */
export class BankMasterQueryDto {
  @ApiPropertyOptional({ description: 'Tenant ID filter' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Country code filter' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ description: 'Bank status filter', enum: BankStatus })
  @IsOptional()
  @IsEnum(BankStatus)
  status?: BankStatus;

  @ApiPropertyOptional({ description: 'Active only?', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * VALIDATION DTOs
 */
export class ValidateBankAccountDto {
  @ApiProperty({ description: 'Country code' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  countryCode: string;

  @ApiProperty({ description: 'Bank code' })
  @IsString()
  bankCode: string;

  @ApiPropertyOptional({ description: 'Branch code' })
  @IsOptional()
  @IsString()
  branchCode?: string;

  @ApiProperty({ description: 'Account number' })
  @IsString()
  accountNumber: string;

  @ApiPropertyOptional({ description: 'IBAN' })
  @IsOptional()
  @IsString()
  iban?: string;
}

export class ValidateIBANDto {
  @ApiProperty({ description: 'IBAN to validate' })
  @IsString()
  @Matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, { message: 'Invalid IBAN format' })
  iban: string;
}
