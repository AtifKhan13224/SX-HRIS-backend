import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecruitmentSource } from '../entities/recruitment-source.entity';
import { CreateRecruitmentSourceDto, UpdateRecruitmentSourceDto } from '../dto/recruitment-source.dto';

@Injectable()
export class RecruitmentSourceService {
  constructor(
    @InjectRepository(RecruitmentSource)
    private readonly sourceRepository: Repository<RecruitmentSource>,
  ) {}

  async create(createDto: CreateRecruitmentSourceDto, createdBy?: string): Promise<RecruitmentSource> {
    const source = this.sourceRepository.create({
      ...createDto,
      createdBy,
    });

    return await this.sourceRepository.save(source);
  }

  async findAll(groupCompanyId?: string, isActive?: boolean): Promise<RecruitmentSource[]> {
    const queryBuilder = this.sourceRepository.createQueryBuilder('source')
      .leftJoinAndSelect('source.groupCompany', 'groupCompany');

    if (groupCompanyId) {
      queryBuilder.andWhere('source.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('source.isActive = :isActive', { isActive });
    }

    return await queryBuilder
      .orderBy('source.isPrimary', 'DESC')
      .addOrderBy('source.name', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<RecruitmentSource> {
    const source = await this.sourceRepository.findOne({
      where: { id },
      relations: ['groupCompany'],
    });

    if (!source) {
      throw new NotFoundException(`Recruitment source with ID ${id} not found`);
    }

    return source;
  }

  async update(id: string, updateDto: UpdateRecruitmentSourceDto, updatedBy?: string): Promise<RecruitmentSource> {
    const source = await this.findOne(id);

    Object.assign(source, { ...updateDto, updatedBy });
    return await this.sourceRepository.save(source);
  }

  async remove(id: string): Promise<void> {
    const source = await this.findOne(id);
    await this.sourceRepository.remove(source);
  }

  async getStats(): Promise<any> {
    const sources = await this.sourceRepository.find();

    const totalCandidates = sources.reduce((sum, s) => sum + (s.candidatesReceived || 0), 0);
    const totalHired = sources.reduce((sum, s) => sum + (s.candidatesHired || 0), 0);

    const sourcePerformance = sources.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      candidatesReceived: s.candidatesReceived,
      candidatesHired: s.candidatesHired,
      conversionRate: s.candidatesReceived > 0 ? (s.candidatesHired / s.candidatesReceived) * 100 : 0,
      cost: s.cost,
      costPerHire: s.candidatesHired > 0 ? s.cost / s.candidatesHired : 0,
    }));

    return {
      totalSources: sources.length,
      activeSources: sources.filter(s => s.isActive).length,
      totalCandidates,
      totalHired,
      overallConversionRate: totalCandidates > 0 ? (totalHired / totalCandidates) * 100 : 0,
      sourcePerformance,
    };
  }
}
