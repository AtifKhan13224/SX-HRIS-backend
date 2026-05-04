import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOpening } from '../entities/job-opening.entity';
import { CreateJobOpeningDto, UpdateJobOpeningDto } from '../dto/job-opening.dto';

@Injectable()
export class JobOpeningService {
  constructor(
    @InjectRepository(JobOpening)
    private readonly jobOpeningRepository: Repository<JobOpening>,
  ) {}

  async create(createDto: CreateJobOpeningDto, createdBy?: string): Promise<JobOpening> {
    const existing = await this.jobOpeningRepository.findOne({
      where: { jobCode: createDto.jobCode },
    });

    if (existing) {
      throw new BadRequestException(`Job opening with code ${createDto.jobCode} already exists`);
    }

    const jobOpening = this.jobOpeningRepository.create({
      ...createDto,
      numberOfPositionsFilled: 0,
      numberOfPositionsRemaining: createDto.numberOfPositions,
      createdBy,
    });

    return await this.jobOpeningRepository.save(jobOpening);
  }

  async findAll(params?: any): Promise<JobOpening[]> {
    const {
      groupCompanyId,
      departmentId,
      status,
      isActive,
      search,
      employmentType,
      workMode,
    } = params || {};

    const queryBuilder = this.jobOpeningRepository.createQueryBuilder('jobOpening')
      .leftJoinAndSelect('jobOpening.groupCompany', 'groupCompany')
      .leftJoinAndSelect('jobOpening.department', 'department')
      .leftJoinAndSelect('jobOpening.position', 'position');

    if (groupCompanyId) {
      queryBuilder.andWhere('jobOpening.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (departmentId) {
      queryBuilder.andWhere('jobOpening.departmentId = :departmentId', { departmentId }); }

    if (status) {
      queryBuilder.andWhere('jobOpening.status = :status', { status });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('jobOpening.isActive = :isActive', { isActive });
    }

    if (employmentType) {
      queryBuilder.andWhere('jobOpening.employmentType = :employmentType', { employmentType });
    }

    if (workMode) {
      queryBuilder.andWhere('jobOpening.workMode = :workMode', { workMode });
    }

    if (search) {
      queryBuilder.andWhere(
        '(jobOpening.jobTitle ILIKE :search OR jobOpening.jobCode ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    return await queryBuilder
      .orderBy('jobOpening.postingDate', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<JobOpening> {
    const jobOpening = await this.jobOpeningRepository.findOne({
      where: { id },
      relations: ['groupCompany', 'department', 'position'],
    });

    if (!jobOpening) {
      throw new NotFoundException(`Job opening with ID ${id} not found`);
    }

    return jobOpening;
  }

  async update(id: string, updateDto: UpdateJobOpeningDto, updatedBy?: string): Promise<JobOpening> {
    const jobOpening = await this.findOne(id);

    if (updateDto.jobCode && updateDto.jobCode !== jobOpening.jobCode) {
      const existing = await this.jobOpeningRepository.findOne({
        where: { jobCode: updateDto.jobCode },
      });

      if (existing) {
        throw new BadRequestException(`Job opening with code ${updateDto.jobCode} already exists`);
      }
    }

    // Recalculate remaining positions if numberOfPositions changed
    if (updateDto.numberOfPositions !== undefined) {
      updateDto['numberOfPositionsRemaining'] = 
        updateDto.numberOfPositions - (jobOpening.numberOfPositionsFilled || 0);
    }

    Object.assign(jobOpening, { ...updateDto, updatedBy });
    return await this.jobOpeningRepository.save(jobOpening);
  }

  async remove(id: string): Promise<void> {
    const jobOpening = await this.findOne(id);
    await this.jobOpeningRepository.remove(jobOpening);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const queryBuilder = this.jobOpeningRepository.createQueryBuilder('jobOpening');

    if (groupCompanyId) {
      queryBuilder.where('jobOpening.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const jobOpenings = await queryBuilder.getMany();

    const total = jobOpenings.length;
    const open = jobOpenings.filter(j => j.status === 'Open').length;
    const draft = jobOpenings.filter(j => j.status === 'Draft').length;
    const onHold = jobOpenings.filter(j => j.status === 'On Hold').length;
    const closed = jobOpenings.filter(j => j.status === 'Closed').length;
    const archived = jobOpenings.filter(j => j.status === 'Archived').length;

    const totalApplications = jobOpenings.reduce((sum, j) => sum + (j.totalApplications || 0), 0);
    const totalPositions = jobOpenings.reduce((sum, j) => sum + (j.numberOfPositions || 0), 0);
    const totalFilled = jobOpenings.reduce((sum, j) => sum + (j.numberOfPositionsFilled || 0), 0);

    return {
      total,
      open,
      draft,
      onHold,
      closed,
      archived,
      active: jobOpenings.filter(j => j.isActive).length,
      totalApplications,
      totalPositions,
      totalFilled,
      totalRemaining: totalPositions - totalFilled,
      fillRate: totalPositions > 0 ? (totalFilled / totalPositions) * 100 : 0,
    };
  }

  async getTopPositions(limit: number = 5): Promise<any[]> {
    const topByApplications = await this.jobOpeningRepository
      .createQueryBuilder('jobOpening')
      .where('jobOpening.isActive = :isActive', { isActive: true })
      .andWhere('jobOpening.status = :status', { status: 'Open' })
      .orderBy('jobOpening.totalApplications', 'DESC')
      .limit(limit)
      .getMany();

    return topByApplications.map(job => ({
      id: job.id,
      title: job.jobTitle,
      code: job.jobCode,
      totalApplications: job.totalApplications,
      interviewsScheduled: job.interviewsScheduled,
      offersExtended: job.offersExtended,
      numberOfPositions: job.numberOfPositions,
      numberOfPositionsFilled: job.numberOfPositionsFilled,
      status: job.status,
    }));
  }

  async incrementApplicationCount(id: string): Promise<void> {
    await this.jobOpeningRepository.increment({ id }, 'totalApplications', 1);
    await this.jobOpeningRepository.increment({ id }, 'newApplications', 1);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.jobOpeningRepository.increment({ id }, 'viewCount', 1);
  }

  async updateStatistics(id: string): Promise<void> {
    // This would be called by other services to update statistics
    // For now, we'll leave it as a placeholder
  }
}
