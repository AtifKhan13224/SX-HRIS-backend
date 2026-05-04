import { IsString, IsEmail, IsOptional, IsUUID, IsBoolean, IsDateString, IsNumber, MaxLength, IsIn } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @MaxLength(255)
  departmentName: string;

  @IsString()
  @MaxLength(100)
  departmentCode: string;

  @IsOptional()
  @IsString()
  departmentDescription?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  departmentEmail?: string;

  @IsOptional()
  @IsUUID()
  parentDivisionId?: string;

  @IsOptional()
  @IsUUID()
  parentDepartmentId?: string;

  @IsOptional()
  @IsUUID()
  topDepartmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  costCenter?: string;

  @IsOptional()
  @IsUUID()
  capabilityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  hod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  functionalHead?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  headHR?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  groupHRHead?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  performanceHead?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fax?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsNumber()
  employeeCount?: number;

  @IsOptional()
  @IsNumber()
  subDepartmentCount?: number;

  @IsOptional()
  @IsNumber()
  otBudget?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  budgetCurrency?: string;

  @IsOptional()
  @IsNumber()
  annualBudget?: number;

  @IsOptional()
  @IsDateString()
  establishedDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsIn(['Core', 'Support', 'Strategic', 'Operational'])
  departmentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  functionalArea?: string;

  @IsOptional()
  @IsBoolean()
  autoNumbering?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isCore?: boolean;
}
