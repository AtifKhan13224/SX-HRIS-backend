import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  RecruitmentConfig,
  JobRequisition,
  JobPosting,
  Candidate,
  JobApplication,
  RecruitmentPipeline,
  ApplicationPipelineStage,
  Interview,
  InterviewEvaluation,
  Assessment,
  Offer,
  ReferenceCheck,
  BackgroundCheck,
  TalentPool,
  RecruitmentAnalytics,
} from './entities';
import { RecruitmentService, RecruitmentConfigService } from './services';
import { RecruitmentController } from './recruitment.controller';

/**
 * Recruitment Module
 * Enterprise-grade recruitment management system
 * Zero hardcoded values - fully configurable
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecruitmentConfig,
      JobRequisition,
      JobPosting,
      Candidate,
      JobApplication,
      RecruitmentPipeline,
      ApplicationPipelineStage,
      Interview,
      InterviewEvaluation,
      Assessment,
      Offer,
      ReferenceCheck,
      BackgroundCheck,
      TalentPool,
      RecruitmentAnalytics,
    ]),
  ],
  controllers: [RecruitmentController],
  providers: [RecruitmentService, RecruitmentConfigService],
  exports: [RecruitmentService, RecruitmentConfigService],
})
export class RecruitmentModule {}
