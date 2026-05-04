import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from '../entities/state.entity';
import { CreateStateDto, UpdateStateDto } from '../dto/state.dto';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) {}

  async create(createStateDto: CreateStateDto): Promise<State> {
    const existing = await this.stateRepository.findOne({
      where: { stateCode: createStateDto.stateCode },
    });

    if (existing) {
      throw new BadRequestException(`State with code ${createStateDto.stateCode} already exists`);
    }

    const state = this.stateRepository.create(createStateDto);
    return await this.stateRepository.save(state);
  }

  async findAll(groupCompanyId?: string, search?: string, countryId?: string, regionId?: string): Promise<State[]> {
    const query = this.stateRepository.createQueryBuilder('state');

    if (groupCompanyId) {
      query.andWhere('state.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      query.andWhere('(state.stateCode ILIKE :search OR state.stateName ILIKE :search)', { search: `%${search}%` });
    }

    if (countryId) {
      query.andWhere('state.countryId = :countryId', { countryId });
    }

    if (regionId) {
      query.andWhere('state.regionId = :regionId', { regionId });
    }

    return await query.orderBy('state.stateName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<State> {
    const state = await this.stateRepository.findOne({ where: { id } });

    if (!state) {
      throw new NotFoundException(`State with ID ${id} not found`);
    }

    return state;
  }

  async update(id: string, updateStateDto: UpdateStateDto): Promise<State> {
    const state = await this.findOne(id);

    if (updateStateDto.stateCode && updateStateDto.stateCode !== state.stateCode) {
      const existing = await this.stateRepository.findOne({
        where: { stateCode: updateStateDto.stateCode },
      });

      if (existing) {
        throw new BadRequestException(`State with code ${updateStateDto.stateCode} already exists`);
      }
    }

    Object.assign(state, updateStateDto);
    return await this.stateRepository.save(state);
  }

  async remove(id: string): Promise<void> {
    const state = await this.findOne(id);
    await this.stateRepository.remove(state);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const query = this.stateRepository.createQueryBuilder('state');

    if (groupCompanyId) {
      query.where('state.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const totalStates = await query.getCount();
    const activeStates = await query.andWhere('state.isActive = :isActive', { isActive: true }).getCount();
    const operationalStates = await query
      .andWhere('state.isOperational = :isOperational', { isOperational: true })
      .getCount();

    const byCountry = await this.stateRepository
      .createQueryBuilder('state')
      .select('state.countryName', 'country')
      .addSelect('COUNT(*)', 'count')
      .where(groupCompanyId ? 'state.groupCompanyId = :groupCompanyId' : '1=1', { groupCompanyId })
      .groupBy('state.countryName')
      .getRawMany();

    return {
      totalStates,
      activeStates,
      operationalStates,
      byCountry,
    };
  }

  async getTaxInformation(groupCompanyId?: string): Promise<any> {
    const query = this.stateRepository.createQueryBuilder('state');

    if (groupCompanyId) {
      query.where('state.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    return await query
      .select([
        'state.id',
        'state.stateName',
        'state.stateCode',
        'state.stateTaxRate',
        'state.salesTaxRate',
        'state.propertyTaxRate',
        'state.hasIncomeTax',
        'state.taxRates',
        'state.taxBrackets',
      ])
      .getMany();
  }

  async getLaborLaws(groupCompanyId?: string): Promise<any> {
    const query = this.stateRepository.createQueryBuilder('state');

    if (groupCompanyId) {
      query.where('state.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    return await query
      .select([
        'state.id',
        'state.stateName',
        'state.stateCode',
        'state.minimumWage',
        'state.standardWorkWeekHours',
        'state.laborLaws',
        'state.employmentRegulations',
        'state.hasRightToWorkLaws',
        'state.hasAtWillEmployment',
      ])
      .getMany();
  }

  async getPayrollRequirements(groupCompanyId?: string): Promise<any> {
    const query = this.stateRepository.createQueryBuilder('state');

    if (groupCompanyId) {
      query.where('state.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    return await query
      .select([
        'state.id',
        'state.stateName',
        'state.stateCode',
        'state.requiresWorkersComp',
        'state.hasUnemploymentInsurance',
        'state.unemploymentInsuranceRate',
        'state.hasDisabilityInsurance',
        'state.payrollRequirements',
        'state.payrollTaxes',
      ])
      .getMany();
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateStateDto }>): Promise<State[]> {
    const results: State[] = [];

    for (const update of updates) {
      const state = await this.update(update.id, update.data);
      results.push(state);
    }

    return results;
  }
}
