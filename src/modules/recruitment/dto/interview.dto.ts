import { IsString, IsOptional, IsBoolean, IsNumber, IsDate, IsArray, IsObject, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateInterviewDto {
  @IsString()
  applicationId: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(50)
  type: string;

  @IsString()
  @MaxLength(50)
  round: string;

  @IsOptional()
  @IsNumber()
  roundNumber?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Date)
  @IsDate()
  scheduledDate: Date;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsString()
  @MaxLength(50)
  status: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  mode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  meetingLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  meetingId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  meetingPassword?: string;

  @IsArray()
  interviewerIds: string[];

  @IsOptional()
  @IsString()
  primaryInterviewerId?: string;

  @IsOptional()
  @IsObject()
  interviewerDetails?: any;

  @IsOptional()
  @IsString()
  agenda?: string;

  @IsOptional()
  @IsString()
  preparationNotes?: string;

  @IsOptional()
  @IsObject()
  questionBank?: any;

  @IsOptional()
  @IsArray()
  skillsToAssess?: string[];

  @IsOptional()
  @IsArray()
  requiredDocuments?: string[];

  @IsOptional()
  @IsObject()
  feedback?: any;

  @IsOptional()
  @IsNumber()
  overallRating?: number;

  @IsOptional()
  @IsObject()
  skillRatings?: any;

  @IsOptional()
  @IsString()
  interviewNotes?: string;

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  concerns?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  recommendation?: string;

  @IsOptional()
  @IsBoolean()
  hasCodingTest?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  codingTestLink?: string;

  @IsOptional()
  @IsNumber()
  codingTestScore?: number;

  @IsOptional()
  @IsString()
  technicalAssessmentNotes?: string;

  @IsOptional()
  @IsObject()
  customFields?: any;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {}
