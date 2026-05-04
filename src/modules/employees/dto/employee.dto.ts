import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString, IsDecimal, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmploymentType, EmploymentStatus } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  employeeId: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ example: '1990-01-15', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string;

  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  emergencyContact?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyPhone?: string;

  @ApiProperty({ example: 'Engineering', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiProperty({ example: 'Senior Developer', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  designation?: string;

  @ApiProperty({ example: 'Software Engineer', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiProperty({ example: 'Manager Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reportingManager?: string;

  @ApiProperty({ enum: EmploymentType, default: EmploymentType.FULL_TIME })
  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @ApiProperty({ example: 'ACT', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employeeCategory?: string;

  @ApiProperty({ example: '2020-01-15' })
  @IsDateString()
  @IsNotEmpty()
  hireDate: string;

  @ApiProperty({ example: '2023-01-15', required: false })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @ApiProperty({ example: 'New York Office', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  workLocation?: string;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @IsDecimal()
  baseSalary?: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  currency?: string;

  @ApiProperty({ example: 'Monthly', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  salaryFrequency?: string;

  @ApiProperty({ example: 'Bank Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumber?: string;

  @ApiProperty({ example: '021000021', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  routingNumber?: string;

  @ApiProperty({ example: 'ID123456', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationalId?: string;

  @ApiProperty({ example: 'P123456789', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  passportNumber?: string;

  @ApiProperty({ example: 'O+', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bloodGroup?: string;

  @ApiProperty({ example: 'V123456789', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  visaNumber?: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  visaExpiryDate?: string;

  @ApiProperty({ example: 'Company Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sponsoringCompany?: string;

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  missionStartDate?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  missionEndDate?: string;

  @ApiProperty({ example: '2024-06-30', required: false })
  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @ApiProperty({ example: 'Resignation', required: false })
  @IsOptional()
  @IsString()
  terminationReason?: string;

  @ApiProperty({ example: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateEmployeeDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ example: '1990-01-15', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string;

  @ApiProperty({ example: 'Engineering', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiProperty({ example: 'Senior Developer', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  designation?: string;

  @ApiProperty({ enum: EmploymentStatus, required: false })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @ApiProperty({ example: 'ACT', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employeeCategory?: string;

  @ApiProperty({ example: 'V123456789', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  visaNumber?: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  visaExpiryDate?: string;

  @ApiProperty({ example: 'Company Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sponsoringCompany?: string;

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  missionStartDate?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  missionEndDate?: string;

  @ApiProperty({ example: '2024-06-30', required: false })
  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @ApiProperty({ example: 'Resignation', required: false })
  @IsOptional()
  @IsString()
  terminationReason?: string;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @IsDecimal()
  baseSalary?: number;

  @ApiProperty({ example: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}
