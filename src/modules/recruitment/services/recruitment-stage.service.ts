import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecruitmentStage } from '../entities/recruitment-stage.entity';
import { CreateRecruitmentStageDto, UpdateRecruitmentStageDto } from '../dto/recruitment-stage.dto';

@Injectable()
export class RecruitmentStageService {
  constructor(
    @InjectRepository(RecruitmentStage)
    private readonly stageRepository: Repository<RecruitmentStage>,
  ) {}

  async create(createDto: CreateRecruitmentStageDto, createdBy?: string): Promise<RecruitmentStage> {
    const stage = this.stageRepository.create({
      ...createDto,
      createdBy,
    });

    return await this.stageRepository.save(stage);
  }

  async findAll(groupCompanyId?: string, isActive?: boolean): Promise<RecruitmentStage[]> {
    const queryBuilder = this.stageRepository.createQueryBuilder('stage')
      .leftJoinAndSelect('stage.groupCompany', 'groupCompany');

    if (groupCompanyId) {
      queryBuilder.andWhere('stage.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('stage.isActive = :isActive', { isActive });
    }

    return await queryBuilder
      .orderBy('stage.sequence', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<RecruitmentStage> {
    const stage = await this.stageRepository.findOne({
      where: { id },
      relations: ['groupCompany'],
    });

    if (!stage) {
      throw new NotFoundException(`Recruitment stage with ID ${id} not found`);
    }

    return stage;
  }

  async update(id: string, updateDto: UpdateRecruitmentStageDto, updatedBy?: string): Promise<RecruitmentStage> {
    const stage = await this.findOne(id);

    Object.assign(stage, { ...updateDto, updatedBy });
    return await this.stageRepository.save(stage);
  }

  async remove(id: string): Promise<void> {
    const stage = await this.findOne(id);
    await this.stageRepository.remove(stage);
  }

  async reorderStages(stageIds: string[]): Promise<void> {
    for (let i = 0; i < stageIds.length; i++) {
      await this.stageRepository.update(stageIds[i], { sequence: i + 1 }); 
    }
  }
}
