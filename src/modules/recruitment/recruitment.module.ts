import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { JobOpening } from './entities/job-opening.entity';
import { Candidate } from './entities/candidate.entity';
import { Application } from './entities/application.entity';
import { Interview } from './entities/interview.entity';
import { Requisition } from './entities/requisition.entity';
import { OfferLetter } from './entities/offer-letter.entity';
import { RecruitmentSource } from './entities/recruitment-source.entity';
import { RecruitmentStage } from './entities/recruitment-stage.entity';

// Services
import { JobOpeningService } from './services/job-opening.service';
import { CandidateService } from './services/candidate.service';
import { ApplicationService } from './services/application.service';
import { InterviewService } from './services/interview.service';
import { RequisitionService } from './services/requisition.service';
import { OfferLetterService } from './services/offer-letter.service';
import { RecruitmentSourceService } from './services/recruitment-source.service';
import { RecruitmentStageService } from './services/recruitment-stage.service';

// Controllers
import { JobOpeningController } from './controllers/job-opening.controller';
import { CandidateController } from './controllers/candidate.controller';
import { ApplicationController } from './controllers/application.controller';
import { InterviewController } from './controllers/interview.controller';
import { RequisitionController } from './controllers/requisition.controller';
import { OfferLetterController } from './controllers/offer-letter.controller';
import { RecruitmentSourceController } from './controllers/recruitment-source.controller';
import { RecruitmentStageController } from './controllers/recruitment-stage.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobOpening,
      Candidate,
      Application,
      Interview,
      Requisition,
      OfferLetter,
      RecruitmentSource,
      RecruitmentStage,
    ]),
  ],
  controllers: [
    JobOpeningController,
    CandidateController,
    ApplicationController,
    InterviewController,
    RequisitionController,
    OfferLetterController,
    RecruitmentSourceController,
    RecruitmentStageController,
  ],
  providers: [
    JobOpeningService,
    CandidateService,
    ApplicationService,
    InterviewService,
    RequisitionService,
    OfferLetterService,
    RecruitmentSourceService,
    RecruitmentStageService,
  ],
  exports: [
    JobOpeningService,
    CandidateService,
    ApplicationService,
    InterviewService,
    RequisitionService,
    OfferLetterService,
    RecruitmentSourceService,
    RecruitmentStageService,
  ],
})
export class RecruitmentModule {}
