import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CreateCandidateDto, UpdateCandidateDto } from '../dto/candidate.dto';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async create(createDto: CreateCandidateDto, createdBy?: string): Promise<Candidate> {
    const existing = await this.candidateRepository.findOne({
      where: { email: createDto.email },
    });

    if (existing) {
      throw new BadRequestException(`Candidate with email ${createDto.email} already exists`);
    }

    const candidate = this.candidateRepository.create({
      ...createDto,
      status: createDto.status || 'New',
      createdBy,
    });

    return await this.candidateRepository.save(candidate);
  }

  async findAll(params?: any): Promise<Candidate[]> {
    const {
      status,
      isActive,
      search,
      sourceId,
      minExperience,
      maxExperience,
      skills,
      tags,
    } = params || {};

    const queryBuilder = this.candidateRepository.createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.source', 'source');

    if (status) {
      queryBuilder.andWhere('candidate.status = :status', { status });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('candidate.isActive = :isActive', { isActive });
    }

    if (sourceId) {
      queryBuilder.andWhere('candidate.sourceId = :sourceId', { sourceId });
    }

    if (minExperience !== undefined) {
      queryBuilder.andWhere('candidate.totalExperience >= :minExperience', { minExperience });
    }

    if (maxExperience !== undefined) {
      queryBuilder.andWhere('candidate.totalExperience <= :maxExperience', { maxExperience });
    }

    if (search) {
      queryBuilder.andWhere(
        '(candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR candidate.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (skills) {
      queryBuilder.andWhere('candidate.skills ILIKE :skills', { skills: `%${skills}%` });
    }

    if (tags && Array.isArray(tags)) {
      queryBuilder.andWhere('candidate.tags && :tags', { tags });
    }

    return await queryBuilder
      .orderBy('candidate.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id },
      relations: ['source'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    return candidate;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return await this.candidateRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateDto: UpdateCandidateDto, updatedBy?: string): Promise<Candidate> {
    const candidate = await this.findOne(id);

    if (updateDto.email && updateDto.email !== candidate.email) {
      const existing = await this.candidateRepository.findOne({
        where: { email: updateDto.email },
      });

      if (existing) {
        throw new BadRequestException(`Candidate with email ${updateDto.email} already exists`);
      }
    }

    Object.assign(candidate, { ...updateDto, updatedBy });
    return await this.candidateRepository.save(candidate);
  }

  async remove(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    await this.candidateRepository.remove(candidate);
  }

  async getStats(): Promise<any> {
    const candidates = await this.candidateRepository.find();

    const total = candidates.length;
    const active = candidates.filter(c => c.status === 'Active').length;
    const newCandidates = candidates.filter(c => c.status === 'New').length;
    const hired = candidates.filter(c => c.status === 'Hired').length;
    const rejected = candidates.filter(c => c.status === 'Rejected').length;

    const bySource = candidates.reduce((acc, c) => {
      const source = c.sourceId || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      newCandidates,
      hired,
      rejected,
      onHold: candidates.filter(c => c.status === 'On Hold').length,
      blacklisted: candidates.filter(c => c.isBlacklisted).length,
      bySource,
    };
  }

  async incrementApplicationCount(id: string): Promise<void> {
    await this.candidateRepository.increment({ id }, 'totalApplications', 1);
  }

  async updateLastActivity(id: string): Promise<void> {
    await this.candidateRepository.update(id, { lastActivityDate: new Date() });
  }
}
