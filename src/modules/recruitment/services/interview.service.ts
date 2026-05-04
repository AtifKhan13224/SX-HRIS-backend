import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { Interview } from '../entities/interview.entity';
import { CreateInterviewDto, UpdateInterviewDto } from '../dto/interview.dto';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
  ) {}

  async create(createDto: CreateInterviewDto, createdBy?: string): Promise<Interview> {
    const interview = this.interviewRepository.create({
      ...createDto,
      createdBy,
    });

    return await this.interviewRepository.save(interview);
  }

  async findAll(params?: any): Promise<Interview[]> {
    const {
      applicationId,
      status,
      type,
      startDate,
      endDate,
      interviewerId,
    } = params || {};

    const queryBuilder = this.interviewRepository.createQueryBuilder('interview')
      .leftJoinAndSelect('interview.application', 'application')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('application.jobOpening', 'jobOpening');

    if (applicationId) {
      queryBuilder.andWhere('interview.applicationId = :applicationId', { applicationId });
    }

    if (status) {
      queryBuilder.andWhere('interview.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('interview.type = :type', { type });
    }

    if (startDate) {
      queryBuilder.andWhere('interview.scheduledDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('interview.scheduledDate <= :endDate', { endDate });
    }

    if (interviewerId) {
      queryBuilder.andWhere(':interviewerId = ANY(interview.interviewerIds)', { interviewerId });
    }

    return await queryBuilder
      .orderBy('interview.scheduledDate', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: ['application', 'application.candidate', 'application.jobOpening'],
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return interview;
  }

  async update(id: string, updateDto: UpdateInterviewDto, updatedBy?: string): Promise<Interview> {
    const interview = await this.findOne(id);

    Object.assign(interview, { ...updateDto, updatedBy });
    return await this.interviewRepository.save(interview);
  }

  async remove(id: string): Promise<void> {
    const interview = await this.findOne(id);
    await this.interviewRepository.remove(interview);
  }

  async reschedule(id: string, newDate: Date, reason: string, updatedBy?: string): Promise<Interview> {
    const interview = await this.findOne(id);

    if (!interview.originalScheduledDate) {
      interview.originalScheduledDate = interview.scheduledDate;
    }

    interview.scheduledDate = newDate;
    interview.rescheduleCount = (interview.rescheduleCount || 0) + 1;
    interview.rescheduleReason = reason;
    interview.status = 'Rescheduled';
    interview.updatedBy = updatedBy;

    return await this.interviewRepository.save(interview);
  }

  async cancel(id: string, reason: string, cancelledBy: string): Promise<Interview> {
    const interview = await this.findOne(id);

    interview.isCancelled = true;
    interview.cancellationReason = reason;
    interview.cancelledBy = cancelledBy;
    interview.cancelledDate = new Date();
    interview.status = 'Cancelled';

    return await this.interviewRepository.save(interview);
  }

  async submitFeedback(id: string, feedback: any, rating: number, recommendation: string, updatedBy?: string): Promise<Interview> {
    const interview = await this.findOne(id);

    interview.feedback = feedback;
    interview.overallRating = rating;
    interview.recommendation = recommendation;
    interview.feedbackSubmitted = true;
    interview.feedbackSubmittedDate = new Date();
    interview.updatedBy = updatedBy;

    return await this.interviewRepository.save(interview);
  }

  async getUpcoming(days: number = 7): Promise<Interview[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await this.interviewRepository.find({
      where: {
        scheduledDate: Between(today, futureDate),
        status: 'Scheduled',
      },
      relations: ['application', 'application.candidate', 'application.jobOpening'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async getStats(): Promise<any> {
    const interviews = await this.interviewRepository.find();

    const total = interviews.length;
    const scheduled = interviews.filter(i => i.status === 'Scheduled').length;
    const completed = interviews.filter(i => i.status === 'Completed').length;
    const cancelled = interviews.filter(i => i.status === 'Cancelled').length;
    const rescheduled = interviews.filter(i => i.status === 'Rescheduled').length;
    const noShow = interviews.filter(i => i.status === 'No Show').length;

    const byType = interviews.reduce((acc, i) => {
      const type = i.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const withFeedback = interviews.filter(i => i.feedbackSubmitted).length;

    return {
      total,
      scheduled,
      completed,
      cancelled,
      rescheduled,
      noShow,
      byType,
      withFeedback,
      feedbackRate: completed > 0 ? (withFeedback / completed) * 100 : 0,
    };
  }
}
