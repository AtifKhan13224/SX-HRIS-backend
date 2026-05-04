import {
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ReviewCycle, ReviewStatus, GoalStatus } from '../entities/performance.entity';

export class CreatePerformanceReviewDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Reviewer ID' })
  @IsString()
  reviewerId: string;

  @ApiProperty({ description: 'Review period', example: 'Q1 2026' })
  @IsString()
  reviewPeriod: string;

  @ApiProperty({ enum: ReviewCycle })
  @IsEnum(ReviewCycle)
  reviewCycle: ReviewCycle;

  @ApiProperty({ description: 'Review start date', example: '2026-01-01' })
  @IsDateString()
  reviewStartDate: string;

  @ApiProperty({ description: 'Review end date', example: '2026-03-31' })
  @IsDateString()
  reviewEndDate: string;
}

export class UpdatePerformanceReviewDto extends PartialType(CreatePerformanceReviewDto) {}

export class SelfReviewDto {
  @ApiProperty({ description: 'Self rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  selfRating: number;

  @ApiProperty({ description: 'Self comments' })
  @IsString()
  selfComments: string;

  @ApiProperty({ description: 'Competency ratings', required: false })
  @IsOptional()
  @IsObject()
  competencyRatings?: Record<string, number>;
}

export class ManagerReviewDto {
  @ApiProperty({ description: 'Manager rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  managerRating: number;

  @ApiProperty({ description: 'Manager comments' })
  @IsString()
  managerComments: string;

  @ApiProperty({ description: 'Final rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  finalRating: number;

  @ApiProperty({ description: 'Competency ratings', required: false })
  @IsOptional()
  @IsObject()
  competencyRatings?: Record<string, number>;

  @ApiProperty({ description: 'Strengths', required: false })
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiProperty({ description: 'Areas of improvement', required: false })
  @IsOptional()
  @IsString()
  areasOfImprovement?: string;

  @ApiProperty({ description: 'Development plan', required: false })
  @IsOptional()
  @IsString()
  developmentPlan?: string;
}

export class ReviewQueryDto {
  @ApiProperty({ description: 'Employee ID', required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ description: 'Reviewer ID', required: false })
  @IsOptional()
  @IsString()
  reviewerId?: string;

  @ApiProperty({ enum: ReviewStatus, required: false })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiProperty({ description: 'Review period', required: false })
  @IsOptional()
  @IsString()
  reviewPeriod?: string;

  @ApiProperty({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreatePerformanceGoalDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Goal title' })
  @IsString()
  goalTitle: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Start date', example: '2026-02-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Target date', example: '2026-06-30' })
  @IsDateString()
  targetDate: string;

  @ApiProperty({ description: 'Success criteria', required: false })
  @IsOptional()
  @IsString()
  successCriteria?: string;

  @ApiProperty({ description: 'Assigned by', required: false })
  @IsOptional()
  @IsString()
  assignedBy?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePerformanceGoalDto extends PartialType(CreatePerformanceGoalDto) {
  @ApiProperty({ enum: GoalStatus, required: false })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiProperty({ description: 'Progress (0-100)', minimum: 0, maximum: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;
}

export class GoalQueryDto {
  @ApiProperty({ description: 'Employee ID', required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ enum: GoalStatus, required: false })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiProperty({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreateCompetencyDto {
  @ApiProperty({ description: 'Competency name' })
  @IsString()
  competencyName: string;

  @ApiProperty({ description: 'Competency code' })
  @IsString()
  competencyCode: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Rating scale', required: false })
  @IsOptional()
  @IsObject()
  ratingScale?: Record<string, string>;
}

export class UpdateCompetencyDto extends PartialType(CreateCompetencyDto) {}
