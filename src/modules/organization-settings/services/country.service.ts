import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { CreateCountryDto, UpdateCountryDto } from '../dto/country.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    // Check if country code already exists
    const existing = await this.countryRepository.findOne({
      where: { countryCode: createCountryDto.countryCode },
    });

    if (existing) {
      throw new BadRequestException(`Country with code ${createCountryDto.countryCode} already exists`);
    }

    const country = this.countryRepository.create(createCountryDto);
    return await this.countryRepository.save(country);
  }

  async findAll(groupCompanyId?: string, search?: string, continent?: string, region?: string): Promise<Country[]> {
    const query = this.countryRepository.createQueryBuilder('country');

    if (groupCompanyId) {
      query.andWhere('country.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      query.andWhere(
        '(country.countryCode ILIKE :search OR country.countryName ILIKE :search OR country.officialName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (continent) {
      query.andWhere('country.continent = :continent', { continent });
    }

    if (region) {
      query.andWhere('country.region = :region', { region });
    }

    return await query.orderBy('country.countryName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Country> {
    const country = await this.countryRepository.findOne({ where: { id } });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return country;
  }

  async update(id: string, updateCountryDto: UpdateCountryDto): Promise<Country> {
    const country = await this.findOne(id);

    // Check if updating to a code that already exists
    if (updateCountryDto.countryCode && updateCountryDto.countryCode !== country.countryCode) {
      const existing = await this.countryRepository.findOne({
        where: { countryCode: updateCountryDto.countryCode },
      });

      if (existing) {
        throw new BadRequestException(`Country with code ${updateCountryDto.countryCode} already exists`);
      }
    }

    Object.assign(country, updateCountryDto);
    return await this.countryRepository.save(country);
  }

  async remove(id: string): Promise<void> {
    const country = await this.findOne(id);
    await this.countryRepository.remove(country);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const query = this.countryRepository.createQueryBuilder('country');

    if (groupCompanyId) {
      query.where('country.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const totalCountries = await query.getCount();
    const activeCountries = await query.andWhere('country.isActive = :isActive', { isActive: true }).getCount();
    const operationalCountries = await query
      .andWhere('country.isOperational = :isOperational', { isOperational: true })
      .getCount();
    const countriesWithOffices = await query.andWhere('country.hasOffice = :hasOffice', { hasOffice: true }).getCount();
    const countriesWithEmployees = await query
      .andWhere('country.hasEmployees = :hasEmployees', { hasEmployees: true })
      .getCount();

    // Count by continent
    const byContinent = await this.countryRepository
      .createQueryBuilder('country')
      .select('country.continent', 'continent')
      .addSelect('COUNT(*)', 'count')
      .where(groupCompanyId ? 'country.groupCompanyId = :groupCompanyId' : '1=1', { groupCompanyId })
      .groupBy('country.continent')
      .getRawMany();

    // Count by region
    const byRegion = await this.countryRepository
      .createQueryBuilder('country')
      .select('country.region', 'region')
      .addSelect('COUNT(*)', 'count')
      .where(groupCompanyId ? 'country.groupCompanyId = :groupCompanyId' : '1=1', { groupCompanyId })
      .groupBy('country.region')
      .getRawMany();

    return {
      totalCountries,
      activeCountries,
      operationalCountries,
      countriesWithOffices,
      countriesWithEmployees,
      byContinent,
      byRegion,
    };
  }

  async getEconomicProfile(groupCompanyId?: string): Promise<any> {
    const query = this.countryRepository.createQueryBuilder('country');

    if (groupCompanyId) {
      query.where('country.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const countries = await query
      .select([
        'country.id',
        'country.countryName',
        'country.countryCode',
        'country.gdpUsd',
        'country.gdpPerCapitaUsd',
        'country.economicClassification',
        'country.unemploymentRate',
        'country.inflationRate',
        'country.taxRate',
        'country.corporateTaxRate',
        'country.vatRate',
        'country.majorIndustries',
        'country.easeOfDoingBusinessRank',
        'country.corruptionPerceptionIndex',
      ])
      .getMany();

    return countries;
  }

  async getLaborLaws(groupCompanyId?: string): Promise<any> {
    const query = this.countryRepository.createQueryBuilder('country');

    if (groupCompanyId) {
      query.where('country.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const countries = await query
      .select([
        'country.id',
        'country.countryName',
        'country.countryCode',
        'country.minimumWage',
        'country.minimumWageCurrency',
        'country.standardWorkWeekHours',
        'country.standardWorkDayHours',
        'country.minimumAnnualLeave',
        'country.minimumSickLeave',
        'country.maternityLeaveDays',
        'country.paternityLeaveDays',
        'country.laborLawSummary',
        'country.employmentRegulations',
        'country.terminationRules',
        'country.noticePeriodRequirements',
        'country.severancePayRules',
      ])
      .getMany();

    return countries;
  }

  async getImmigrationInfo(groupCompanyId?: string): Promise<any> {
    const query = this.countryRepository.createQueryBuilder('country');

    if (groupCompanyId) {
      query.where('country.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const countries = await query
      .select([
        'country.id',
        'country.countryName',
        'country.countryCode',
        'country.requiresWorkPermit',
        'country.availableVisaTypes',
        'country.visaRequirements',
        'country.visaFreeCountries',
        'country.workPermitProcess',
        'country.workPermitProcessingDays',
        'country.workPermitCost',
        'country.workPermitCostCurrency',
      ])
      .getMany();

    return countries;
  }

  async getComplianceMatrix(groupCompanyId?: string): Promise<any> {
    const query = this.countryRepository.createQueryBuilder('country');

    if (groupCompanyId) {
      query.where('country.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const countries = await query
      .select([
        'country.id',
        'country.countryName',
        'country.countryCode',
        'country.dataProtectionLaws',
        'country.hasGDPREquivalent',
        'country.privacyLawsSummary',
        'country.antiCorruptionLaws',
        'country.complianceRequirements',
        'country.regulatoryBodies',
        'country.auditRequirements',
        'country.reportingObligations',
      ])
      .getMany();

    return countries;
  }

  async getCostOfLiving(groupCompanyId?: string): Promise<any> {
    const query = this.countryRepository.createQueryBuilder('country');

    if (groupCompanyId) {
      query.where('country.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const countries = await query
      .select([
        'country.id',
        'country.countryName',
        'country.countryCode',
        'country.costOfLivingIndex',
        'country.averageRentUsd',
        'country.averageSalaryUsd',
        'country.livingCostBreakdown',
        'country.currencyCode',
        'country.currencySymbol',
      ])
      .orderBy('country.costOfLivingIndex', 'DESC')
      .getMany();

    return countries;
  }

  async getPayrollRequirements(groupCompanyId?: string): Promise<any> {
    const query = this.countryRepository.createQueryBuilder('country');

    if (groupCompanyId) {
      query.where('country.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const countries = await query
      .select([
        'country.id',
        'country.countryName',
        'country.countryCode',
        'country.payrollFrequency',
        'country.payrollTaxRates',
        'country.hasSocialSecurity',
        'country.employerSocialSecurityRate',
        'country.employeeSocialSecurityRate',
        'country.socialSecurityComponents',
        'country.benefitsRequirements',
        'country.payrollNotes',
      ])
      .getMany();

    return countries;
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateCountryDto }>): Promise<Country[]> {
    const results: Country[] = [];

    for (const update of updates) {
      const country = await this.update(update.id, update.data);
      results.push(country);
    }

    return results;
  }
}
