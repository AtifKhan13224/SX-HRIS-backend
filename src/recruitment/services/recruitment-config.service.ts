import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, Like, FindOptionsWhere } from 'typeorm';
import { RecruitmentConfig } from '../entities/recruitment-config.entity';

/**
 * Recruitment Configuration Service
 * Manages configurable recruitment settings
 */
@Injectable()
export class RecruitmentConfigService {
  constructor(
    @InjectRepository(RecruitmentConfig)
    private recruitmentConfigRepository: Repository<RecruitmentConfig>,
  ) {}

  async create(createDto: Partial<RecruitmentConfig>): Promise<RecruitmentConfig> {
    // If this is set as default, unset other defaults
    if (createDto.isDefault) {
      await this.recruitmentConfigRepository.update(
        { companyId: createDto.companyId, isDefault: true },
        { isDefault: false },
      );
    }

    const config = this.recruitmentConfigRepository.create(createDto);
    return await this.recruitmentConfigRepository.save(config);
  }

  async findAll(companyId: string, filters?: any): Promise<RecruitmentConfig[]> {
    const where: FindOptionsWhere<RecruitmentConfig> = { companyId };
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return await this.recruitmentConfigRepository.find({
      where,
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<RecruitmentConfig> {
    const config = await this.recruitmentConfigRepository.findOne({
      where: { id, companyId },
    });

    if (!config) {
      throw new NotFoundException('Recruitment configuration not found');
    }

    return config;
  }

  async findDefault(companyId: string): Promise<RecruitmentConfig> {
    let config = await this.recruitmentConfigRepository.findOne({
      where: { companyId, isDefault: true, isActive: true },
    });

    if (!config) {
      // Create default configuration
      config = await this.createDefaultConfig(companyId);
    }

    return config;
  }

  async update(id: string, companyId: string, updateDto: Partial<RecruitmentConfig>): Promise<RecruitmentConfig> {
    const config = await this.findOne(id, companyId);

    // If setting as default, unset other defaults
    if (updateDto.isDefault && !config.isDefault) {
      await this.recruitmentConfigRepository.update(
        { companyId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(config, updateDto);
    return await this.recruitmentConfigRepository.save(config);
  }

  async delete(id: string, companyId: string): Promise<void> {
    const config = await this.findOne(id, companyId);
    
    if (config.isDefault) {
      throw new BadRequestException('Cannot delete default configuration');
    }

    await this.recruitmentConfigRepository.remove(config);
  }

  private async createDefaultConfig(companyId: string): Promise<RecruitmentConfig> {
    const defaultConfig = {
      companyId,
      configName: 'Default Recruitment Configuration',
      description: 'Auto-generated default configuration',
      pipelineStages: {
        stages: [
          { id: '1', name: 'New Application', order: 1, type: 'screening', isRequired: true, duration: 2, actions: ['review_resume'], autoActions: [] },
          { id: '2', name: 'Initial Screening', order: 2, type: 'screening', isRequired: true, duration: 3, actions: ['phone_screen'], autoActions: [] },
          { id: '3', name: 'Technical Interview', order: 3, type: 'interview', isRequired: true, duration: 5, actions: ['schedule_interview'], autoActions: [] },
          { id: '4', name: 'Manager Interview', order: 4, type: 'interview', isRequired: true, duration: 5, actions: ['schedule_interview'], autoActions: [] },
          { id: '5', name: 'Assessment', order: 5, type: 'assessment', isRequired: false, duration: 3, actions: ['send_assessment'], autoActions: [] },
          { id: '6', name: 'Final Interview', order: 6, type: 'interview', isRequired: true, duration: 5, actions: ['schedule_interview'], autoActions: [] },
          { id: '7', name: 'Background Check', order: 7, type: 'custom', isRequired: true, duration: 7, actions: ['initiate_background_check'], autoActions: [] },
          { id: '8', name: 'Offer', order: 8, type: 'offer', isRequired: true, duration: 3, actions: ['extend_offer'], autoActions: [] },
        ],
      },
      approvalWorkflows: {
        requisition: [
          { level: 1, roles: ['HIRING_MANAGER'], required: true, parallelApproval: false },
          { level: 2, roles: ['HR_MANAGER'], required: true, parallelApproval: false },
        ],
        offer: [
          { level: 1, role: 'HIRING_MANAGER', required: true },
          { level: 2, role: 'HR_DIRECTOR', required: true },
        ],
      },
      emailTemplates: {
        applicationReceived: {
          subject: 'Application Received - {{jobTitle}}',
          body: 'Dear {{candidateName}}, Thank you for your application.',
        },
        interviewInvitation: {
          subject: 'Interview Invitation - {{jobTitle}}',
          body: 'Dear {{candidateName}}, We would like to invite you for an interview.',
        },
        interviewReminder: {
          subject: 'Interview Reminder - {{jobTitle}}',
          body: 'Dear {{candidateName}}, This is a reminder about your upcoming interview.',
        },
        offerExtended: {
          subject: 'Job Offer - {{jobTitle}}',
          body: 'Dear {{candidateName}}, We are pleased to extend an offer.',
        },
        offerAccepted: {
          subject: 'Offer Acceptance Confirmation',
          body: 'Dear {{candidateName}}, We have received your acceptance.',
        },
        rejection: {
          subject: 'Application Status - {{jobTitle}}',
          body: 'Dear {{candidateName}}, Thank you for your interest.',
        },
      },
      scoringConfig: {
        weights: {
          skills: 0.3,
          experience: 0.25,
          education: 0.15,
          culturalFit: 0.15,
          interview: 0.10,
          assessment: 0.05,
        },
        passingScore: 70,
        categories: [],
      },
      interviewTypes: [
        { id: '1', name: 'Phone Screening', duration: 30, isPanelInterview: false, evaluationCriteria: [], defaultInterviewers: [] },
        { id: '2', name: 'Technical Interview', duration: 60, isPanelInterview: false, evaluationCriteria: [], defaultInterviewers: [] },
        { id: '3', name: 'Behavioral Interview', duration: 45, isPanelInterview: false, evaluationCriteria: [], defaultInterviewers: [] },
        { id: '4', name: 'Panel Interview', duration: 90, isPanelInterview: true, evaluationCriteria: [], defaultInterviewers: [] },
      ],
      assessmentConfig: {
        types: [],
        autoSchedule: false,
        retakePolicy: {},
      },
      postingChannels: [],
      complianceSettings: {
        gdpr: {
          enabled: true,
          dataRetentionDays: 365,
          consentRequired: true,
          autoDeleteAfterDays: 730,
        },
        eeoc: {
          enabled: false,
          reportingEnabled: false,
          requireDemographics: false,
        },
        ofccp: {
          enabled: false,
          veteranStatus: false,
          disabilityStatus: false,
        },
        localLaws: [],
      },
      slaConfig: {
        responseTime: 24,
        timeToInterview: 7,
        timeToOffer: 14,
        timeToHire: 30,
        escalationRules: [],
      },
      notificationSettings: {
        channels: ['email', 'in_app'],
        events: {
          newApplication: ['recruiter', 'hiring_manager'],
          stageChange: ['recruiter'],
          interviewScheduled: ['candidate', 'interviewer', 'recruiter'],
          offerExtended: ['candidate', 'hiring_manager', 'hr'],
        },
      },
      aiConfig: {
        resumeParsing: {
          enabled: false,
          autoScore: false,
        },
        candidateMatching: {
          enabled: false,
          threshold: 70,
        },
        duplicateDetection: {
          enabled: true,
          matchFields: ['email', 'phoneNumber'],
        },
      },
      integrationSettings: {
        calendar: {
          autoSync: false,
        },
        ats: {
          syncEnabled: false,
        },
        backgroundCheck: {
          autoTrigger: false,
        },
      },
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      defaultTimezone: 'UTC',
      isDefault: true,
      isActive: true,
      createdBy: 'system',
    };

    return await this.create(defaultConfig as any);
  }
}
