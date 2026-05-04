import { IsString, IsOptional, IsBoolean, IsNumber, IsDate, IsArray, IsObject, IsEmail, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCandidateDto {
  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  alternatePhone?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationality?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsNumber()
  totalExperience?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  currentJobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  currentCompany?: string;

  @IsOptional()
  @IsNumber()
  currentSalary?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  salaryCurrency?: string;

  @IsOptional()
  @IsNumber()
  expectedSalary?: number;

  @IsOptional()
  @IsNumber()
  noticePeriod?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  highestDegree?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  university?: string;

  @IsOptional()
  @IsNumber()
  graduationYear?: number;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  certifications?: string;

  @IsOptional()
  @IsString()
  languages?: string;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sourceDetail?: string;

  @IsOptional()
  @IsString()
  referredBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resumePath?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverLetterPath?: string;

  @IsOptional()
  @IsArray()
  documentPaths?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  linkedInUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  githubUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  portfolioUrl?: string;

  @IsOptional()
  @IsObject()
  socialMediaLinks?: any;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsBoolean()
  dataProcessingConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  availableFrom?: Date;

  @IsOptional()
  @IsBoolean()
  immediateJoiner?: boolean;

  @IsOptional()
  @IsArray()
  preferredLocations?: string[];

  @IsOptional()
  @IsArray()
  preferredWorkModes?: string[];

  @IsOptional()
  @IsObject()
  customFields?: any;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {}
