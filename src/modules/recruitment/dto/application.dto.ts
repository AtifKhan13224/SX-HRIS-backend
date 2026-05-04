import { IsString, IsOptional, IsBoolean, IsNumber, IsDate, IsArray, IsObject, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateApplicationDto {
  @IsString()
  candidateId: string;

  @IsString()
  jobOpeningId: string;

  @IsOptional()
  @IsString()
  currentStageId?: string;

  @IsString()
  @MaxLength(50)
  applicationNumber: string;

  @Type(() => Date)
  @IsDate()
  applicationDate: Date;

  @IsString()
  @MaxLength(50)
  status: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  subStatus?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resumePath?: string;

  @IsOptional()
  @IsArray()
  attachmentPaths?: string[];

  @IsOptional()
  @IsObject()
  screeningAnswers?: any;

  @IsOptional()
  @IsBoolean()
  screeningPassed?: boolean;

  @IsOptional()
  @IsString()
  screeningNotes?: string;

  @IsOptional()
  @IsNumber()
  screeningScore?: number;

  @IsOptional()
  @IsArray()
  assessmentIds?: string[];

  @IsOptional()
  @IsObject()
  assessmentResults?: any;

  @IsOptional()
  @IsNumber()
  assessmentScore?: number;

  @IsOptional()
  @IsNumber()
  overallRating?: number;

  @IsOptional()
  @IsObject()
  evaluationScores?: any;

  @IsOptional()
  @IsString()
  evaluationNotes?: string;

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  weaknesses?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  hiringDecision?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsBoolean()
  isFlagged?: boolean;

  @IsOptional()
  @IsString()
  flagReason?: string;

  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmMedium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  referralUrl?: string;

  @IsOptional()
  @IsObject()
  customFields?: any;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}
