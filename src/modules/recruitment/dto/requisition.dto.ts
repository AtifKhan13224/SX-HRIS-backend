import { IsString, IsOptional, IsBoolean, IsNumber, IsDate, IsArray, IsObject, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRequisitionDto {
  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsString()
  @MaxLength(50)
  requisitionNumber: string;

  @IsString()
  @MaxLength(200)
  positionTitle: string;

  @IsString()
  @MaxLength(50)
  requisitionType: string;

  @IsOptional()
  @IsString()
  businessJustification?: string;

  @IsNumber()
  numberOfPositions: number;

  @IsString()
  @MaxLength(50)
  employmentType: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  workMode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  replacingEmployeeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  replacingEmployeeName?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  vacancyDate?: Date;

  @IsOptional()
  @IsString()
  reasonForVacancy?: string;

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
  @IsNumber()
  annualBudget?: number;

  @IsOptional()
  @IsNumber()
  totalBudgetImpact?: number;

  @IsOptional()
  @IsBoolean()
  isBudgeted?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  budgetCode?: string;

  @IsOptional()
  @IsString()
  costCenterId?: string;

  @IsOptional()
  @IsString()
  keyResponsibilities?: string;

  @IsOptional()
  @IsString()
  requiredQualifications?: string;

  @IsOptional()
  @IsString()
  requiredSkills?: string;

  @IsOptional()
  @IsNumber()
  minExperience?: number;

  @IsOptional()
  @IsNumber()
  maxExperience?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  educationLevel?: string;

  @Type(() => Date)
  @IsDate()
  requestDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  targetHireDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  closingDate?: Date;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  priority?: string;

  @IsString()
  requestedBy: string;

  @IsString()
  @MaxLength(200)
  requestedByName: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  requestedByTitle?: string;

  @IsOptional()
  @IsString()
  hiringManagerId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  hiringManagerName?: string;

  @IsString()
  @MaxLength(50)
  status: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  approvalStatus?: string;

  @IsOptional()
  @IsObject()
  approvalWorkflow?: any;

  @IsOptional()
  @IsArray()
  approverIds?: string[];

  @IsOptional()
  @IsString()
  additionalRequirements?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsArray()
  attachmentPaths?: string[];

  @IsOptional()
  @IsObject()
  customFields?: any;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateRequisitionDto extends PartialType(CreateRequisitionDto) {}
