import { IsString, IsOptional, IsBoolean, IsNumber, IsDate, IsArray, IsObject, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOfferLetterDto {
  @IsString()
  applicationId: string;

  @IsString()
  candidateId: string;

  @IsString()
  jobOpeningId: string;

  @IsString()
  @MaxLength(50)
  offerNumber: string;

  @IsString()
  @MaxLength(200)
  positionTitle: string;

  @IsString()
  @MaxLength(50)
  employmentType: string;

  @Type(() => Date)
  @IsDate()
  offerDate: Date;

  @Type(() => Date)
  @IsDate()
  expiryDate: Date;

  @IsString()
  @MaxLength(50)
  status: string;

  @IsNumber()
  basicSalary: number;

  @IsString()
  @MaxLength(20)
  salaryCurrency: string;

  @IsString()
  @MaxLength(50)
  salaryPeriod: string;

  @IsOptional()
  @IsNumber()
  housingAllowance?: number;

  @IsOptional()
  @IsNumber()
  transportAllowance?: number;

  @IsOptional()
  @IsNumber()
  otherAllowances?: number;

  @IsOptional()
  @IsObject()
  allowanceBreakdown?: any;

  @IsNumber()
  totalMonthlyCompensation: number;

  @IsNumber()
  totalAnnualCompensation: number;

  @IsOptional()
  @IsNumber()
  signingBonus?: number;

  @IsOptional()
  @IsNumber()
  annualBonus?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bonusStructure?: string;

  @IsOptional()
  @IsNumber()
  relocationAllowance?: number;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsObject()
  benefitsPackage?: any;

  @IsOptional()
  @IsNumber()
  annualLeave?: number;

  @IsOptional()
  @IsNumber()
  sickLeave?: number;

  @IsOptional()
  @IsNumber()
  casualLeave?: number;

  @IsOptional()
  @IsString()
  otherLeaves?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  workLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  workMode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reportingTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  reportingToTitle?: string;

  @IsOptional()
  @IsString()
  reportingToId?: string;

  @Type(() => Date)
  @IsDate()
  proposedJoiningDate: Date;

  @IsOptional()
  @IsNumber()
  probationPeriod?: number;

  @IsOptional()
  @IsNumber()
  noticePeriod?: number;

  @IsOptional()
  @IsNumber()
  contractDuration?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  workingHours?: string;

  @IsOptional()
  @IsNumber()
  hoursPerWeek?: number;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  offerLetterContent?: string;

  @IsOptional()
  @IsArray()
  attachmentPaths?: string[];

  @IsOptional()
  @IsString()
  specialConditions?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsOptional()
  @IsString()
  confidentialityClauses?: string;

  @IsOptional()
  @IsString()
  nonCompeteClauses?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  approvalStatus?: string;

  @IsOptional()
  @IsArray()
  approverIds?: string[];

  @IsOptional()
  @IsObject()
  customFields?: any;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateOfferLetterDto extends PartialType(CreateOfferLetterDto) {}
