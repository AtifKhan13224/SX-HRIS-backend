import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEmail, IsUUID, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateDivisionDto {
  @IsString()
  @IsNotEmpty()
  divisionName: string;

  @IsString()
  @IsNotEmpty()
  divisionCode: string;

  @IsString()
  @IsOptional()
  divisionDescription?: string;

  @IsUUID()
  @IsOptional()
  parentBusinessUnitId?: string;

  @IsString()
  @IsOptional()
  costCenter?: string;

  @IsString()
  @IsOptional()
  divisionHead?: string;

  @IsString()
  @IsOptional()
  divisionManager?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  divisionType?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  employeeCount?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  departmentCount?: number;

  @IsString()
  @IsOptional()
  budgetCurrency?: string;

  @IsNumber()
  @IsOptional()
  annualBudget?: number;

  @IsDateString()
  @IsOptional()
  establishedDate?: string;

  @IsString()
  @IsOptional()
  functionalArea?: string;

  @IsString()
  @IsOptional()
  reportingRegion?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  autoNumbering?: boolean;

  @IsBoolean()
  @IsOptional()
  isStrategic?: boolean;
}
