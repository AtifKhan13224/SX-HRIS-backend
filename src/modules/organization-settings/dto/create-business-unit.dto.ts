import { IsString, IsOptional, IsBoolean, IsInt, IsEmail, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateBusinessUnitDto {
  @IsString()
  @MaxLength(255)
  businessUnitName: string;

  @IsString()
  @MaxLength(100)
  businessUnitCode: string;

  @IsOptional()
  @IsString()
  businessUnitAddress?: string;

  @IsOptional()
  @IsUUID()
  parentGroupCompanyId?: string;

  @IsOptional()
  @IsString()
  costCenter?: string;

  @IsOptional()
  @IsString()
  businessUnitHead?: string;

  @IsOptional()
  @IsString()
  businessUnitHR?: string;

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
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  employeeCount?: number;

  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  taxIdentificationNumber?: string;

  @IsOptional()
  @IsBoolean()
  isHeadquarters?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  autoNumbering?: boolean;
}
