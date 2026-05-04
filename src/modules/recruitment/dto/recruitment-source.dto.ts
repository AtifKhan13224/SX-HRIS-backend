import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, IsArray, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRecruitmentSourceDto {
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

  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  costType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsObject()
  configuration?: any;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateRecruitmentSourceDto extends PartialType(CreateRecruitmentSourceDto) {}
