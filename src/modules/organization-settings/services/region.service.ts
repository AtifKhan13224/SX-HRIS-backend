import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../entities/region.entity';
import { CreateRegionDto, UpdateRegionDto } from '../dto/region.dto';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    // Check if region code already exists
    const existing = await this.regionRepository.findOne({
      where: { regionCode: createRegionDto.regionCode },
    });

    if (existing) {
      throw new BadRequestException(`Region with code ${createRegionDto.regionCode} already exists`);
    }

    const region = this.regionRepository.create(createRegionDto);
    return await this.regionRepository.save(region);
  }

  async findAll(groupCompanyId?: string, search?: string, regionType?: string): Promise<Region[]> {
    const query = this.regionRepository.createQueryBuilder('region');

    if (groupCompanyId) {
      query.andWhere('region.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      query.andWhere('(region.regionCode ILIKE :search OR region.regionName ILIKE :search)', { search: `%${search}%` });
    }

    if (regionType) {
      query.andWhere('region.regionType = :regionType', { regionType });
    }

    return await query.orderBy('region.regionName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Region> {
    const region = await this.regionRepository.findOne({ where: { id } });

    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return region;
  }

  async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
    const region = await this.findOne(id);

    // Check if updating to a code that already exists
    if (updateRegionDto.regionCode && updateRegionDto.regionCode !== region.regionCode) {
      const existing = await this.regionRepository.findOne({
        where: { regionCode: updateRegionDto.regionCode },
      });

      if (existing) {
        throw new BadRequestException(`Region with code ${updateRegionDto.regionCode} already exists`);
      }
    }

    Object.assign(region, updateRegionDto);
    return await this.regionRepository.save(region);
  }

  async remove(id: string): Promise<void> {
    const region = await this.findOne(id);
    await this.regionRepository.remove(region);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const query = this.regionRepository.createQueryBuilder('region');

    if (groupCompanyId) {
      query.where('region.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const totalRegions = await query.getCount();
    const activeRegions = await query.andWhere('region.isActive = :isActive', { isActive: true }).getCount();
    const operationalRegions = await query
      .andWhere('region.isOperational = :isOperational', { isOperational: true })
      .getCount();
    const regionsWithOffices = await query.andWhere('region.hasOffices = :hasOffices', { hasOffices: true }).getCount();
    const regionsWithEmployees = await query
      .andWhere('region.hasEmployees = :hasEmployees', { hasEmployees: true })
      .getCount();

    // Count by type
    const byType = await this.regionRepository
      .createQueryBuilder('region')
      .select('region.regionType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(groupCompanyId ? 'region.groupCompanyId = :groupCompanyId' : '1=1', { groupCompanyId })
      .groupBy('region.regionType')
      .getRawMany();

    // Aggregate statistics
    const aggregates = await this.regionRepository
      .createQueryBuilder('region')
      .select('SUM(region.countryCount)', 'totalCountries')
      .addSelect('SUM(region.officeCount)', 'totalOffices')
      .addSelect('SUM(region.employeeCount)', 'totalEmployees')
      .addSelect('SUM(region.totalPopulation)', 'totalPopulation')
      .where(groupCompanyId ? 'region.groupCompanyId = :groupCompanyId' : '1=1', { groupCompanyId })
      .getRawOne();

    return {
      totalRegions,
      activeRegions,
      operationalRegions,
      regionsWithOffices,
      regionsWithEmployees,
      byType,
      aggregates,
    };
  }

  async getHierarchy(groupCompanyId?: string): Promise<any> {
    const query = this.regionRepository.createQueryBuilder('region');

    if (groupCompanyId) {
      query.where('region.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const regions = await query
      .select([
        'region.id',
        'region.regionCode',
        'region.regionName',
        'region.parentRegionId',
        'region.childRegionIds',
        'region.hierarchyLevel',
        'region.hierarchyPath',
        'region.regionType',
        'region.countryCount',
        'region.officeCount',
        'region.employeeCount',
      ])
      .orderBy('region.hierarchyLevel', 'ASC')
      .addOrderBy('region.regionName', 'ASC')
      .getMany();

    return this.buildHierarchyTree(regions);
  }

  private buildHierarchyTree(regions: any[]): any[] {
    const map = new Map();
    const roots: any[] = [];

    // Create a map of all regions
    regions.forEach((region) => {
      map.set(region.id, { ...region, children: [] });
    });

    // Build the tree
    regions.forEach((region) => {
      const node = map.get(region.id);
      if (region.parentRegionId && map.has(region.parentRegionId)) {
        const parent = map.get(region.parentRegionId);
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async getEconomicProfile(groupCompanyId?: string): Promise<any> {
    const query = this.regionRepository.createQueryBuilder('region');

    if (groupCompanyId) {
      query.where('region.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const regions = await query
      .select([
        'region.id',
        'region.regionName',
        'region.regionCode',
        'region.totalGdpUsd',
        'region.averageGdpPerCapitaUsd',
        'region.totalPopulation',
        'region.economicClassification',
        'region.marketMaturity',
        'region.averageUnemploymentRate',
        'region.averageInflationRate',
        'region.majorIndustries',
        'region.marketCharacteristics',
        'region.growthPotential',
      ])
      .getMany();

    return regions;
  }

  async getPerformanceMetrics(groupCompanyId?: string): Promise<any> {
    const query = this.regionRepository.createQueryBuilder('region');

    if (groupCompanyId) {
      query.where('region.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const regions = await query
      .select([
        'region.id',
        'region.regionName',
        'region.regionCode',
        'region.annualRevenue',
        'region.revenueCurrency',
        'region.operatingCost',
        'region.profitMargin',
        'region.revenueGrowthRate',
        'region.officeCount',
        'region.employeeCount',
        'region.performanceMetrics',
      ])
      .getMany();

    return regions;
  }

  async getComplianceOverview(groupCompanyId?: string): Promise<any> {
    const query = this.regionRepository.createQueryBuilder('region');

    if (groupCompanyId) {
      query.where('region.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const regions = await query
      .select([
        'region.id',
        'region.regionName',
        'region.regionCode',
        'region.regulatoryFrameworks',
        'region.tradeAgreements',
        'region.economicBlocs',
        'region.complianceRequirements',
        'region.dataProtectionRegulations',
        'region.hasUnifiedDataProtection',
        'region.regulatoryBodies',
      ])
      .getMany();

    return regions;
  }

  async getTalentAnalysis(groupCompanyId?: string): Promise<any> {
    const query = this.regionRepository.createQueryBuilder('region');

    if (groupCompanyId) {
      query.where('region.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const regions = await query
      .select([
        'region.id',
        'region.regionName',
        'region.regionCode',
        'region.talentAvailabilityScore',
        'region.skillsAvailability',
        'region.educationInstitutions',
        'region.averageLiteracyRate',
        'region.workforceStatistics',
        'region.averageSalaryUsd',
        'region.salaryRangesByLevel',
      ])
      .getMany();

    return regions;
  }

  async getRiskAssessment(groupCompanyId?: string): Promise<any> {
    const query = this.regionRepository.createQueryBuilder('region');

    if (groupCompanyId) {
      query.where('region.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const regions = await query
      .select([
        'region.id',
        'region.regionName',
        'region.regionCode',
        'region.overallRiskLevel',
        'region.politicalStability',
        'region.economicStability',
        'region.securityRating',
        'region.riskAssessment',
        'region.travelAdvisories',
      ])
      .getMany();

    return regions;
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateRegionDto }>): Promise<Region[]> {
    const results: Region[] = [];

    for (const update of updates) {
      const region = await this.update(update.id, update.data);
      results.push(region);
    }

    return results;
  }
}
