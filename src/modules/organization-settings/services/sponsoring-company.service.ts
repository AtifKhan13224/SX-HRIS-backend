import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SponsoringCompany } from '../entities/sponsoring-company.entity';
import { CreateSponsoringCompanyDto, UpdateSponsoringCompanyDto } from '../dto/sponsoring-company.dto';

@Injectable()
export class SponsoringCompanyService {
  constructor(
    @InjectRepository(SponsoringCompany)
    private companyRepository: Repository<SponsoringCompany>,
  ) {}

  async create(createDto: CreateSponsoringCompanyDto): Promise<SponsoringCompany> {
    const existing = await this.companyRepository.findOne({
      where: { companyCode: createDto.companyCode },
    });

    if (existing) {
      throw new BadRequestException(`Company with code ${createDto.companyCode} already exists`);
    }

    const company = this.companyRepository.create(createDto);
    return await this.companyRepository.save(company);
  }

  async findAll(groupCompanyId?: string, search?: string): Promise<SponsoringCompany[]> {
    const queryBuilder = this.companyRepository.createQueryBuilder('company')
      .leftJoinAndSelect('company.groupCompany', 'groupCompany');

    if (groupCompanyId) {
      queryBuilder.andWhere('company.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(company.companyName ILIKE :search OR company.companyCode ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    return await queryBuilder.orderBy('company.sortOrder', 'ASC').getMany();
  }

  async findOne(id: string): Promise<SponsoringCompany> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['groupCompany'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: string, updateDto: UpdateSponsoringCompanyDto): Promise<SponsoringCompany> {
    const company = await this.findOne(id);
    Object.assign(company, updateDto);
    return await this.companyRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companyRepository.remove(company);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const companies = await this.findAll(groupCompanyId);

    return {
      totalCompanies: companies.length,
      activeCompanies: companies.filter(c => c.isActive).length,
      canSponsorVisa: companies.filter(c => c.canSponsorVisa).length,
      h1bSponsors: companies.filter(c => c.hasH1BSponsor).length,
      totalSponsored: companies.reduce((sum, c) => sum + (c.totalSponsored || 0), 0),
      activeSponsored: companies.reduce((sum, c) => sum + (c.activeSponsored || 0), 0),
    };
  }

  async getVisaCapacity(groupCompanyId?: string): Promise<any> {
    const companies = await this.findAll(groupCompanyId);

    return companies.map(c => ({
      id: c.id,
      code: c.companyCode,
      name: c.companyName,
      h1bCap: c.annualH1BCap,
      used: c.usedH1BCount,
      remaining: c.remainingH1BCount,
      supportedTypes: c.supportedVisaTypes || [],
    }));
  }

  async getComplianceStatus(groupCompanyId?: string): Promise<any> {
    const companies = await this.findAll(groupCompanyId);

    return companies.map(c => ({
      id: c.id,
      code: c.companyCode,
      name: c.companyName,
      eVerifyEnrolled: c.isEVerifyEnrolled,
      i9Compliant: c.hasI9Compliance,
      lcaCompliant: c.hasLCACompliance,
      status: c.complianceStatus,
      lastReview: c.lastComplianceReview,
      nextReview: c.nextComplianceReview,
    }));
  }
}
