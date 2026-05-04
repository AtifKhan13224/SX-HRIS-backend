import { IsString, IsOptional, IsBoolean, IsNumber, IsDate, IsArray, IsObject, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateJobOpeningDto {
  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsString()
  @MaxLength(50)
  jobCode: string;

  @IsString()
  @MaxLength(200)
  jobTitle: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  responsibilities?: string;

  @IsOptional()
  @IsString()
  qualifications?: string;

  @IsOptional()
  @IsString()
  skillsRequired?: string;

  @IsOptional()
  @IsString()
  benefitsOffered?: string;

  @IsString()
  @MaxLength(50)
  employmentType: string;

  @IsString()
  @MaxLength(50)
  workMode: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  stateId?: string;

  @IsOptional()
  @IsString()
  countryId?: string;

  @IsOptional()
  @IsNumber()
  minSalary?: number;

  @IsOptional()
  @IsNumber()
  maxSalary?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  salaryCurrency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  salaryPeriod?: string;

  @IsOptional()
  @IsBoolean()
  hideSalary?: boolean;

  @IsNumber()
  numberOfPositions: number;

  @IsOptional()
  @IsNumber()
  minExperience?: number;

  @IsOptional()
  @IsNumber()
  maxExperience?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  educationLevel?: string;

  @IsOptional()
  @IsString()
  preferredDegrees?: string;

  @IsOptional()
  @IsString()
  certifications?: string;

  @Type(() => Date)
  @IsDate()
  postingDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  closingDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  targetHireDate?: Date;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  priority?: string;

  @IsString()
  @MaxLength(50)
  status: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptApplications?: boolean;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @IsOptional()
  @IsArray()
  publishedOn?: string[];

  @IsOptional()
  @IsObject()
  externalLinks?: any;

  @IsOptional()
  @IsString()
  hiringManagerId?: string;

  @IsOptional()
  @IsString()
  recruiterId?: string;

  @IsOptional()
  @IsArray()
  interviewPanelIds?: string[];

  @IsOptional()
  @IsArray()
  approverIds?: string[];

  @IsOptional()
  @IsString()
  workflowId?: string;

  @IsOptional()
  @IsObject()
  screeningQuestions?: any;

  @IsOptional()
  @IsObject()
  customFields?: any;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateJobOpeningDto extends PartialType(CreateJobOpeningDto) {}
