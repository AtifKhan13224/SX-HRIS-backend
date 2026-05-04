import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities/city.entity';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    const existing = await this.cityRepository.findOne({
      where: { cityCode: createCityDto.cityCode },
    });

    if (existing) {
      throw new BadRequestException(`City with code ${createCityDto.cityCode} already exists`);
    }

    const city = this.cityRepository.create(createCityDto);
    return await this.cityRepository.save(city);
  }

  async findAll(
    groupCompanyId?: string,
    search?: string,
    stateId?: string,
    countryId?: string,
    regionId?: string,
  ): Promise<City[]> {
    const query = this.cityRepository.createQueryBuilder('city');

    if (groupCompanyId) {
      query.andWhere('city.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      query.andWhere('(city.cityCode ILIKE :search OR city.cityName ILIKE :search)', { search: `%${search}%` });
    }

    if (stateId) {
      query.andWhere('city.stateId = :stateId', { stateId });
    }

    if (countryId) {
      query.andWhere('city.countryId = :countryId', { countryId });
    }

    if (regionId) {
      query.andWhere('city.regionId = :regionId', { regionId });
    }

    return await query.orderBy('city.cityName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<City> {
    const city = await this.cityRepository.findOne({ where: { id } });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  async update(id: string, updateCityDto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);

    if (updateCityDto.cityCode && updateCityDto.cityCode !== city.cityCode) {
      const existing = await this.cityRepository.findOne({
        where: { cityCode: updateCityDto.cityCode },
      });

      if (existing) {
        throw new BadRequestException(`City with code ${updateCityDto.cityCode} already exists`);
      }
    }

    Object.assign(city, updateCityDto);
    return await this.cityRepository.save(city);
  }

  async remove(id: string): Promise<void> {
    const city = await this.findOne(id);
    await this.cityRepository.remove(city);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const query = this.cityRepository.createQueryBuilder('city');

    if (groupCompanyId) {
      query.where('city.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const totalCities = await query.getCount();
    const activeCities = await query.andWhere('city.isActive = :isActive', { isActive: true }).getCount();
    const operationalCities = await query
      .andWhere('city.isOperational = :isOperational', { isOperational: true })
      .getCount();

    const byCountry = await this.cityRepository
      .createQueryBuilder('city')
      .select('city.countryName', 'country')
      .addSelect('COUNT(*)', 'count')
      .where(groupCompanyId ? 'city.groupCompanyId = :groupCompanyId' : '1=1', { groupCompanyId })
      .groupBy('city.countryName')
      .getRawMany();

    return {
      totalCities,
      activeCities,
      operationalCities,
      byCountry,
    };
  }

  async getCostOfLiving(groupCompanyId?: string): Promise<any> {
    const query = this.cityRepository.createQueryBuilder('city');

    if (groupCompanyId) {
      query.where('city.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    return await query
      .select([
        'city.id',
        'city.cityName',
        'city.cityCode',
        'city.countryName',
        'city.costOfLivingIndex',
        'city.housingCostIndex',
        'city.averageRent1BR',
        'city.averageRent2BR',
        'city.averageRent3BR',
        'city.averageHomePrice',
        'city.livingCostBreakdown',
      ])
      .orderBy('city.costOfLivingIndex', 'DESC')
      .getMany();
  }

  async getQualityOfLife(groupCompanyId?: string): Promise<any> {
    const query = this.cityRepository.createQueryBuilder('city');

    if (groupCompanyId) {
      query.where('city.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    return await query
      .select([
        'city.id',
        'city.cityName',
        'city.cityCode',
        'city.countryName',
        'city.qualityOfLifeIndex',
        'city.safetyIndex',
        'city.pollutionIndex',
        'city.healthcareIndex',
        'city.climateIndex',
        'city.qualityOfLifeMetrics',
      ])
      .orderBy('city.qualityOfLifeIndex', 'DESC')
      .getMany();
  }

  async getBusinessHubs(groupCompanyId?: string): Promise<any> {
    const query = this.cityRepository.createQueryBuilder('city');

    if (groupCompanyId) {
      query.where('city.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    return await query
      .select([
        'city.id',
        'city.cityName',
        'city.cityCode',
        'city.countryName',
        'city.isBusinessHub',
        'city.isFinancialCenter',
        'city.isTechHub',
        'city.fortuneCompaniesCount',
        'city.startupsCount',
        'city.majorEmployers',
        'city.businessEnvironment',
      ])
      .where('city.isBusinessHub = :isBusinessHub OR city.isFinancialCenter = :isFinancialCenter OR city.isTechHub = :isTechHub', {
        isBusinessHub: true,
        isFinancialCenter: true,
        isTechHub: true,
      })
      .getMany();
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateCityDto }>): Promise<City[]> {
    const results: City[] = [];

    for (const update of updates) {
      const city = await this.update(update.id, update.data);
      results.push(city);
    }

    return results;
  }
}
