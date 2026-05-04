import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRecruitmentStageDto {
  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(50)
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  sequence: number;

  @IsString()
  @MaxLength(50)
  category: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  sendEmailNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  sendSmsNotification?: boolean;

  @IsOptional()
  @IsString()
  emailTemplate?: string;

  @IsOptional()
  @IsString()
  smsTemplate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsObject()
  autoActions?: any;

  @IsOptional()
  @IsObject()
  requiredFields?: any;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateRecruitmentStageDto extends PartialType(CreateRecruitmentStageDto) {}
