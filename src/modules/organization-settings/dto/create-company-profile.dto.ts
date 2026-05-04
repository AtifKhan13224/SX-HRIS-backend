import { IsString, IsOptional, IsBoolean, IsDateString, Length, IsUrl } from 'class-validator';

export class CreateCompanyProfileDto {
  @IsString()
  @Length(1, 255)
  companyName: string;

  @IsString()
  @Length(1, 100)
  companyCode: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  companyWebsiteURL?: string;

  @IsString()
  @IsOptional()
  groupCompanyShortName?: string;

  @IsString()
  @Length(1, 100)
  companySubdomain: string;

  @IsString()
  @IsOptional()
  orgViewDeptGroupingLabel?: string;

  @IsString()
  @IsOptional()
  permittedEmailDomains?: string;

  @IsString()
  country: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  area: string;

  @IsString()
  defaultCurrency: string;

  @IsString()
  companyTimezone: string;

  @IsString()
  tenantTimezone: string;

  @IsString()
  defaultDisplayTimezone: string;

  @IsString()
  defaultDatePreference: string;

  @IsString()
  defaultTimeFormat: string;

  @IsString()
  baseCurrency: string;

  @IsString()
  @IsOptional()
  companyLogo?: string;

  @IsString()
  financialYearBeginsIn: string;

  @IsString()
  companyType: string;

  @IsString()
  industrySector: string;

  @IsString()
  @IsOptional()
  aboutCompany?: string;

  @IsDateString()
  @IsOptional()
  dateOfIncorporation?: string;

  @IsString()
  @IsOptional()
  federalReserveBankID?: string;

  @IsString()
  @IsOptional()
  fedReserveBankDistrict?: string;

  @IsString()
  @IsOptional()
  employerID?: string;

  @IsString()
  @IsOptional()
  eeoCompanyCode?: string;

  @IsBoolean()
  @IsOptional()
  dynamicLogoBackground?: boolean;

  @IsBoolean()
  @IsOptional()
  dynamicHeaderContrast?: boolean;

  @IsBoolean()
  @IsOptional()
  sortL3Alphabetically?: boolean;

  @IsString()
  @IsOptional()
  postLoginLandingPage?: string;

  @IsString()
  @IsOptional()
  systemTopHeaderColor?: string;

  @IsString()
  @IsOptional()
  loginPageBackground?: string;

  @IsString()
  @IsOptional()
  systemStandardElementColor?: string;

  @IsString()
  @IsOptional()
  fontColorCareerPageHeader?: string;

  @IsString()
  @IsOptional()
  browserTabTitle?: string;
}
