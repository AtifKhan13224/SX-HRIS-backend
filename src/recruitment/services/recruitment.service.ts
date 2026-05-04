import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, Like, FindOptionsWhere, LessThan, MoreThan } from 'typeorm';
import {
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
} from '../entities';

/**
 * Comprehensive Recruitment Service
 * Handles all recruitment module operations
 * Enterprise-grade recruitment management
 */
@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(JobRequisition)
    private requisitionRepository: Repository<JobRequisition>,
    @InjectRepository(JobPosting)
    private postingRepository: Repository<JobPosting>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
    @InjectRepository(RecruitmentPipeline)
    private pipelineRepository: Repository<RecruitmentPipeline>,
    @InjectRepository(ApplicationPipelineStage)
    private stageRepository: Repository<ApplicationPipelineStage>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewEvaluation)
    private evaluationRepository: Repository<InterviewEvaluation>,
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(ReferenceCheck)
    private referenceCheckRepository: Repository<ReferenceCheck>,
    @InjectRepository(BackgroundCheck)
    private backgroundCheckRepository: Repository<BackgroundCheck>,
    @InjectRepository(TalentPool)
    private talentPoolRepository: Repository<TalentPool>,
    @InjectRepository(RecruitmentAnalytics)
    private analyticsRepository: Repository<RecruitmentAnalytics>,
  ) {}

  // ==================== JOB REQUISITIONS ====================
  
  async createRequisition(createDto: Partial<JobRequisition>): Promise<JobRequisition> {
    const requisitionNumber = await this.generateRequisitionNumber(createDto.companyId);
    const requisition = this.requisitionRepository.create({
      ...createDto,
      requisitionNumber,
      status: 'draft',
    });
    return await this.requisitionRepository.save(requisition);
  }

  async findRequisitions(companyId: string, filters?: any): Promise<{ data: JobRequisition[]; total: number }> {
    const where: FindOptionsWhere<JobRequisition> = { companyId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.hiringManagerId) where.hiringManagerId = filters.hiringManagerId;
    
    const [data, total] = await this.requisitionRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: filters?.skip || 0,
      take: filters?.take || 50,
    });

    return { data, total };
  }

  async findRequisitionById(id: string, companyId: string): Promise<JobRequisition> {
    const requisition = await this.requisitionRepository.findOne({
      where: { id, companyId },
    });

    if (!requisition) {
      throw new NotFoundException('Job requisition not found');
    }

    return requisition;
  }

  async updateRequisition(id: string, companyId: string, updateDto: Partial<JobRequisition>): Promise<JobRequisition> {
    const requisition = await this.findRequisitionById(id, companyId);
    Object.assign(requisition, updateDto);
    return await this.requisitionRepository.save(requisition);
  }

  async approveRequisition(id: string, companyId: string, approverId: string, comments?: string): Promise<JobRequisition> {
    const requisition = await this.findRequisitionById(id, companyId);
    
    // Update approval chain
    const approvalChain = requisition.approvalChain.map(approval => {
      if (approval.approverId === approverId && approval.status === 'pending') {
        return {
          ...approval,
          status: 'approved' as const,
          comments,
          approvedAt: new Date(),
        };
      }
      return approval;
    });

    // Check if all approvals are complete
    const allApproved = approvalChain.every(a => a.status === 'approved');
    
    requisition.approvalChain = approvalChain;
    if (allApproved) {
      requisition.status = 'approved';
      requisition.approvedAt = new Date();
    }

    return await this.requisitionRepository.save(requisition);
  }

  private async generateRequisitionNumber(companyId: string): Promise<string> {
    const count = await this.requisitionRepository.count({ where: { companyId } });
    const date = new Date();
    return `REQ-${date.getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }

  // ==================== JOB POSTINGS ====================
  
  async createPosting(createDto: Partial<JobPosting>): Promise<JobPosting> {
    const postingNumber = await this.generatePostingNumber(createDto.companyId);
    const slug = await this.generateSlug(createDto.jobTitle, createDto.companyId);
    
    const posting = this.postingRepository.create({
      ...createDto,
      postingNumber,
      slug,
      status: 'draft',
    });
    
    return await this.postingRepository.save(posting);
  }

  async findPostings(companyId: string, filters?: any): Promise<{ data: JobPosting[]; total: number }> {
    const where: FindOptionsWhere<JobPosting> = { companyId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.requisitionId) where.requisitionId = filters.requisitionId;
    
    const [data, total] = await this.postingRepository.findAndCount({
      where,
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
      skip: filters?.skip || 0,
      take: filters?.take || 50,
    });

    return { data, total };
  }

  async findPostingById(id: string, companyId: string): Promise<JobPosting> {
    const posting = await this.postingRepository.findOne({
      where: { id, companyId },
    });

    if (!posting) {
      throw new NotFoundException('Job posting not found');
    }

    return posting;
  }

  async publishPosting(id: string, companyId: string): Promise<JobPosting> {
    const posting = await this.findPostingById(id, companyId);
    
    posting.status = 'published';
    posting.publishedAt = new Date();
    posting.expiresAt = new Date(Date.now() + posting.postingDurationDays * 24 * 60 * 60 * 1000);
    
    return await this.postingRepository.save(posting);
  }

  private async generatePostingNumber(companyId: string): Promise<string> {
    const count = await this.postingRepository.count({ where: { companyId } });
    const date = new Date();
    return `POST-${date.getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }

  private async generateSlug(jobTitle: string, companyId: string): Promise<string> {
    const baseSlug = jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    let counter = 1;

    while (await this.postingRepository.findOne({ where: { slug, companyId } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // ==================== CANDIDATES ====================
  
  async createCandidate(createDto: Partial<Candidate>): Promise<Candidate> {
    // Check for duplicates
    const existingCandidate = await this.candidateRepository.findOne({
      where: [
        { email: createDto.email, companyId: createDto.companyId },
        { phoneNumber: createDto.phoneNumber, companyId: createDto.companyId },
      ],
    });

    if (existingCandidate) {
      throw new BadRequestException('Candidate with this email or phone already exists');
    }

    const candidateNumber = await this.generateCandidateNumber(createDto.companyId);
    const candidate = this.candidateRepository.create({
      ...createDto,
      candidateNumber,
      status: 'new',
    });
    
    return await this.candidateRepository.save(candidate);
  }

  async findCandidates(companyId: string, filters?: any): Promise<{ data: Candidate[]; total: number }> {
    const where: FindOptionsWhere<Candidate> = { companyId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.source) where.source = filters.source;
    
    const [data, total] = await this.candidateRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: filters?.skip || 0,
      take: filters?.take || 50,
    });

    return { data, total };
  }

  async findCandidateById(id: string, companyId: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id, companyId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  private async generateCandidateNumber(companyId: string): Promise<string> {
    const count = await this.candidateRepository.count({ where: { companyId } });
    const date = new Date();
    return `CND-${date.getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }

  // ==================== JOB APPLICATIONS ====================
  
  async createApplication(createDto: Partial<JobApplication>): Promise<JobApplication> {
    const applicationNumber = await this.generateApplicationNumber(createDto.companyId);
    
    const application = this.applicationRepository.create({
      ...createDto,
      applicationNumber,
      status: 'new',
      submittedAt: new Date(),
    });
    
    const savedApplication = await this.applicationRepository.save(application);
    
    // Initialize pipeline stages
    await this.initializeApplicationPipeline(savedApplication);
    
    return savedApplication;
  }

  async findApplications(companyId: string, filters?: any): Promise<{ data: JobApplication[]; total: number }> {
    const where: FindOptionsWhere<JobApplication> = { companyId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.candidateId) where.candidateId = filters.candidateId;
    if (filters?.postingId) where.postingId = filters.postingId;
    if (filters?.requisitionId) where.requisitionId = filters.requisitionId;
    
    const [data, total] = await this.applicationRepository.findAndCount({
      where,
      order: { submittedAt: 'DESC' },
      skip: filters?.skip || 0,
      take: filters?.take || 50,
    });

    return { data, total };
  }

  async findApplicationById(id: string, companyId: string): Promise<JobApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id, companyId },
    });

    if (!application) {
      throw new NotFoundException('Job application not found');
    }

    return application;
  }

  async moveApplicationToStage(applicationId: string, companyId: string, stageId: string, movedBy: string, reason?: string): Promise<JobApplication> {
    const application = await this.findApplicationById(applicationId, companyId);
    
    // Update current stage to exited
    await this.stageRepository.update(
      { applicationId, isCurrentStage: true },
      { isCurrentStage: false, exitedAt: new Date(), status: 'completed' },
    );

    // Create new stage entry
    const newStage = this.stageRepository.create({
      applicationId,
      pipelineId: application.pipelineId,
      stageId,
      status: 'in_progress',
      isCurrentStage: true,
      enteredAt: new Date(),
      movedBy,
      moveReason: reason,
    });
    
    await this.stageRepository.save(newStage);
    
    // Update application
    application.currentStageId = stageId;
    application.daysInCurrentStage = 0;
    
    return await this.applicationRepository.save(application);
  }

  private async generateApplicationNumber(companyId: string): Promise<string> {
    const count = await this.applicationRepository.count({ where: { companyId } });
    const date = new Date();
    return `APP-${date.getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }

  private async initializeApplicationPipeline(application: JobApplication): Promise<void> {
    const pipeline = await this.pipelineRepository.findOne({
      where: { id: application.pipelineId },
    });

    if (!pipeline) return;

    const firstStage = pipeline.stages.sort((a, b) => a.order - b.order)[0];
    
    if (firstStage) {
      const stage = this.stageRepository.create({
        applicationId: application.id,
        pipelineId: pipeline.id,
        stageId: firstStage.id,
        stageName: firstStage.name,
        stageOrder: firstStage.order,
        stageType: firstStage.type,
        status: 'in_progress',
        isCurrentStage: true,
        enteredAt: new Date(),
        expectedDuration: firstStage.duration,
        createdBy: application.createdBy,
      });
      
      await this.stageRepository.save(stage);
      
      application.currentStageId = firstStage.id;
      application.currentStageName = firstStage.name;
      await this.applicationRepository.save(application);
    }
  }

  // ==================== INTERVIEWS ====================
  
  async scheduleInterview(createDto: Partial<Interview>): Promise<Interview> {
    const interviewNumber = await this.generateInterviewNumber(createDto.companyId);
    
    const interview = this.interviewRepository.create({
      ...createDto,
      interviewNumber,
      status: 'scheduled',
    });
    
    return await this.interviewRepository.save(interview);
  }

  async findInterviews(companyId: string, filters?: any): Promise<{ data: Interview[]; total: number }> {
    const where: FindOptionsWhere<Interview> = { companyId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.applicationId) where.applicationId = filters.applicationId;
    
    const [data, total] = await this.interviewRepository.findAndCount({
      where,
      order: { scheduledAt: 'ASC' },
      skip: filters?.skip || 0,
      take: filters?.take || 50,
    });

    return { data, total };
  }

  private async generateInterviewNumber(companyId: string): Promise<string> {
    const count = await this.interviewRepository.count({ where: { companyId } });
    const date = new Date();
    return `INT-${date.getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }

  // ==================== OFFERS ====================
  
  async createOffer(createDto: Partial<Offer>): Promise<Offer> {
    const offerNumber = await this.generateOfferNumber(createDto.companyId);
    
    const offer = this.offerRepository.create({
      ...createDto,
      offerNumber,
      status: 'draft',
      version: 1,
    });
    
    return await this.offerRepository.save(offer);
  }

  async findOffers(companyId: string, filters?: any): Promise<{ data: Offer[]; total: number }> {
    const where: FindOptionsWhere<Offer> = { companyId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.applicationId) where.applicationId = filters.applicationId;
    
    const [data, total] = await this.offerRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: filters?.skip || 0,
      take: filters?.take || 50,
    });

    return { data, total };
  }

  private async generateOfferNumber(companyId: string): Promise<string> {
    const count = await this.offerRepository.count({ where: { companyId } });
    const date = new Date();
    return `OFR-${date.getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }

  // ==================== ANALYTICS ====================
  
  async getRecruitmentAnalytics(companyId: string, periodType: string, periodStart: Date, periodEnd: Date): Promise<RecruitmentAnalytics> {
    // Calculate all metrics
    const analytics = await this.calculateAnalytics(companyId, periodStart, periodEnd);
    
    // Save or update analytics record
    let analyticsRecord = await this.analyticsRepository.findOne({
      where: { companyId, periodType, periodStart, periodEnd },
    });

    if (analyticsRecord) {
      Object.assign(analyticsRecord, analytics);
    } else {
      analyticsRecord = this.analyticsRepository.create({
        companyId,
        periodType,
        periodStart,
        periodEnd,
        ...analytics,
        createdBy: 'system',
      });
    }

    return await this.analyticsRepository.save(analyticsRecord);
  }

  private async calculateAnalytics(companyId: string, startDate: Date, endDate: Date): Promise<Partial<RecruitmentAnalytics>> {
    const requisitionsCreated = await this.requisitionRepository.count({
      where: { companyId, createdAt: Between(startDate, endDate) },
    });

    const applicationsReceived = await this.applicationRepository.count({
      where: { companyId, submittedAt: Between(startDate, endDate) },
    });

    const interviewsScheduled = await this.interviewRepository.count({
      where: { companyId, scheduledAt: Between(startDate, endDate) },
    });

    const offersExtended = await this.offerRepository.count({
      where: { companyId, createdAt: Between(startDate, endDate) },
    });

    return {
      requisitionsCreated,
      applicationsReceived,
      interviewsScheduled,
      offersExtended,
      scope: 'company',
    };
  }

  // ==================== DASHBOARD STATS ====================
  
  async getDashboardStats(companyId: string): Promise<any> {
    const [
      activeRequisitions,
      openPostings,
      activeApplications,
      upcomingInterviews,
      pendingOffers,
    ] = await Promise.all([
      this.requisitionRepository.count({ where: { companyId, status: In(['approved', 'open']) } }),
      this.postingRepository.count({ where: { companyId, status: 'published' } }),
      this.applicationRepository.count({ where: { companyId, status: In(['new', 'screening', 'interviewing']) } }),
      this.interviewRepository.count({ where: { companyId, status: 'scheduled', scheduledAt: MoreThan(new Date()) } }),
      this.offerRepository.count({ where: { companyId, status: In(['sent', 'pending_approval']) } }),
    ]);

    return {
      activeRequisitions,
      openPostings,
      activeApplications,
      upcomingInterviews,
      pendingOffers,
    };
  }
}
