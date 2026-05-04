import { IsString, IsOptional, IsBoolean, IsDateString, IsEmail, IsUrl, MaxLength } from 'class-validator';

export class CreateGroupCompanyDto {
  @IsString()
  @MaxLength(255)
  groupCompanyName: string;

  @IsString()
  @MaxLength(100)
  groupCompanyCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  groupCompanyShortName?: string;

  @IsOptional()
  @IsUrl()
  companyWebsiteUrl?: string;

  @IsOptional()
  @IsString()
  orgViewDeptGroupingLabel?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  defaultDisplayTimezone?: string;

  @IsOptional()
  @IsString()
  defaultDatePreference?: string;

  @IsOptional()
  @IsString()
  defaultTimeFormat?: string;

  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @IsOptional()
  @IsString()
  companyLogo?: string;

  @IsOptional()
  @IsString()
  systemStandardElementColor?: string;

  @IsOptional()
  @IsString()
  systemTopHeaderColor?: string;

  @IsOptional()
  @IsString()
  companyType?: string;

  @IsOptional()
  @IsString()
  industrySector?: string;

  @IsOptional()
  @IsString()
  aboutCompany?: string;

  @IsOptional()
  @IsDateString()
  dateOfIncorporation?: string;

  @IsOptional()
  @IsString()
  federalReserveBankID?: string;

  @IsOptional()
  @IsString()
  employerID?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  taxIdentificationNumber?: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
