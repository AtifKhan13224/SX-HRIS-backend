import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { CreateApplicationDto, UpdateApplicationDto } from '../dto/application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async create(createDto: CreateApplicationDto, createdBy?: string): Promise<Application> {
    const existing = await this.applicationRepository.findOne({
      where: { applicationNumber: createDto.applicationNumber },
    });

    if (existing) {
      throw new BadRequestException(`Application with number ${createDto.applicationNumber} already exists`);
    }

    const application = this.applicationRepository.create({
      ...createDto,
      createdBy,
    });

    return await this.applicationRepository.save(application);
  }

  async findAll(params?: any): Promise<Application[]> {
    const {
      candidateId,
      jobOpeningId,
      status,
      currentStageId,
      isActive,
      assignedTo,
      isFlagged,
      isStarred,
    } = params || {};

    const queryBuilder = this.applicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('application.jobOpening', 'jobOpening')
      .leftJoinAndSelect('application.currentStage', 'currentStage');

    if (candidateId) {
      queryBuilder.andWhere('application.candidateId = :candidateId', { candidateId });
    }

    if (jobOpeningId) {
      queryBuilder.andWhere('application.jobOpeningId = :jobOpeningId', { jobOpeningId });
    }

    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    if (currentStageId) {
      queryBuilder.andWhere('application.currentStageId = :currentStageId', { currentStageId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('application.isActive = :isActive', { isActive });
    }

    if (assignedTo) {
      queryBuilder.andWhere('application.assignedTo = :assignedTo', { assignedTo });
    }

    if (isFlagged !== undefined) {
      queryBuilder.andWhere('application.isFlagged = :isFlagged', { isFlagged });
    }

    if (isStarred !== undefined) {
      queryBuilder.andWhere('application.isStarred = :isStarred', { isStarred });
    }

    return await queryBuilder
      .orderBy('application.applicationDate', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['candidate', 'jobOpening', 'currentStage'],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async update(id: string, updateDto: UpdateApplicationDto, updatedBy?: string): Promise<Application> {
    const application = await this.findOne(id);

    Object.assign(application, { ...updateDto, updatedBy });
    return await this.applicationRepository.save(application);
  }

  async remove(id: string): Promise<void> {
    const application = await this.findOne(id);
    await this.applicationRepository.remove(application);
  }

  async moveToStage(id: string, stageId: string, updatedBy?: string): Promise<Application> {
    const application = await this.findOne(id);
    
    // Add to stage history
    const stageHistory = application.stageHistory || [];
    stageHistory.push({
      stageId,
      movedAt: new Date(),
      movedBy: updatedBy,
    });

    application.currentStageId = stageId;
    application.stageHistory = stageHistory;
    application.updatedBy = updatedBy;

    return await this.applicationRepository.save(application);
  }

  async getStats(jobOpeningId?: string): Promise<any> {
    const queryBuilder = this.applicationRepository.createQueryBuilder('application');

    if (jobOpeningId) {
      queryBuilder.where('application.jobOpeningId = :jobOpeningId', { jobOpeningId });
    }

    const applications = await queryBuilder.getMany();

    const total = applications.length;
    const byStatus = applications.reduce((acc, app) => {
      const status = app.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      applied: applications.filter(a => a.status === 'Applied').length,
      screening: applications.filter(a => a.status === 'Screening').length,
      interview: applications.filter(a => a.status === 'Interview').length,
      shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
      offered: applications.filter(a => a.status === 'Offered').length,
      hired: applications.filter(a => a.status === 'Hired').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
      withdrawn: applications.filter(a => a.status === 'Withdrawn').length,
      byStatus,
    };
  }

  async getPipelineStats(): Promise<any> {
    const applications = await this.applicationRepository.find();

    const pipeline = {
      newApplications: applications.filter(a => a.status === 'Applied').length,
      underReview: applications.filter(a => a.status === 'Screening').length,
      shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
      interview: applications.filter(a => a.status === 'Interview').length,
      offerExtended: applications.filter(a => a.status === 'Offered').length,
    };

    return pipeline;
  }

  async generateApplicationNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await this.applicationRepository.count();
    const sequence = String(count + 1).padStart(5, '0');
    
    return `APP-${year}${month}-${sequence}`;
  }
}
