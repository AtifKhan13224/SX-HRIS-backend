import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesignationName } from '../entities/designation-name.entity';
import { CreateDesignationNameDto, UpdateDesignationNameDto } from '../dto/designation-name.dto';

@Injectable()
export class DesignationNameService {
  constructor(
    @InjectRepository(DesignationName)
    private designationNameRepository: Repository<DesignationName>,
  ) {}

  async create(createDto: CreateDesignationNameDto): Promise<DesignationName> {
    const existing = await this.designationNameRepository.findOne({
      where: { designationCode: createDto.designationCode },
    });

    if (existing) {
      throw new BadRequestException(`Designation with code ${createDto.designationCode} already exists`);
    }

    const designation = this.designationNameRepository.create(createDto);
    return await this.designationNameRepository.save(designation);
  }

  async findAll(groupCompanyId?: string, search?: string, isActive?: boolean): Promise<DesignationName[]> {
    const queryBuilder = this.designationNameRepository.createQueryBuilder('designation')
      .leftJoinAndSelect('designation.groupCompany', 'groupCompany');

    if (groupCompanyId) {
      queryBuilder.andWhere('designation.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(designation.designationName ILIKE :search OR designation.designationCode ILIKE :search OR designation.shortName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('designation.isActive = :isActive', { isActive });
    }

    return await queryBuilder
      .orderBy('designation.levelNumber', 'DESC')
      .addOrderBy('designation.sortOrder', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<DesignationName> {
    const designation = await this.designationNameRepository.findOne({
      where: { id },
      relations: ['groupCompany'],
    });

    if (!designation) {
      throw new NotFoundException(`Designation with ID ${id} not found`);
    }

    return designation;
  }

  async update(id: string, updateDto: UpdateDesignationNameDto): Promise<DesignationName> {
    const designation = await this.findOne(id);

    if (updateDto.designationCode && updateDto.designationCode !== designation.designationCode) {
      const existing = await this.designationNameRepository.findOne({
        where: { designationCode: updateDto.designationCode },
      });

      if (existing) {
        throw new BadRequestException(`Designation with code ${updateDto.designationCode} already exists`);
      }
    }

    Object.assign(designation, updateDto);
    return await this.designationNameRepository.save(designation);
  }

  async remove(id: string): Promise<void> {
    const designation = await this.findOne(id);
    await this.designationNameRepository.remove(designation);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const queryBuilder = this.designationNameRepository.createQueryBuilder('designation');

    if (groupCompanyId) {
      queryBuilder.where('designation.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const designations = await queryBuilder.getMany();

    const totalDesignations = designations.length;
    const activeDesignations = designations.filter(d => d.isActive).length;
    const executiveDesignations = designations.filter(d => d.isExecutive).length;
    const managementDesignations = designations.filter(d => d.isManagement).length;
    const leadershipDesignations = designations.filter(d => d.isLeadership).length;
    const totalEmployees = designations.reduce((sum, d) => sum + (d.totalEmployeesCount || 0), 0);
    const totalVacancies = designations.reduce((sum, d) => sum + (d.vacantPositionsCount || 0), 0);

    const byType = designations.reduce((acc, d) => {
      const type = d.designationType || 'Unclassified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const byHierarchy = designations.reduce((acc, d) => {
      const level = d.hierarchyLevel || 'Unclassified';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    return {
      totalDesignations,
      activeDesignations,
      executiveDesignations,
      managementDesignations,
      leadershipDesignations,
      totalEmployees,
      totalVacancies,
      byType,
      byHierarchy,
      technicalDesignations: designations.filter(d => d.isTechnical).length,
      deprecatedDesignations: designations.filter(d => d.isDeprecated).length,
    };
  }

  async getHierarchy(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      name: d.designationName,
      levelNumber: d.levelNumber,
      hierarchyLevel: d.hierarchyLevel,
      designationType: d.designationType,
      isExecutive: d.isExecutive,
      isManagement: d.isManagement,
      previousDesignationId: d.previousDesignationId,
      nextDesignationId: d.nextDesignationId,
    }));
  }

  async getCareerPaths(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => {
      const nextDesignation = d.nextDesignationId 
        ? designations.find(des => des.id === d.nextDesignationId)
        : null;

      const previousDesignation = d.previousDesignationId
        ? designations.find(des => des.id === d.previousDesignationId)
        : null;

      return {
        current: {
          id: d.id,
          code: d.designationCode,
          name: d.designationName,
          level: d.levelNumber,
        },
        progression: {
          previous: previousDesignation ? {
            id: previousDesignation.id,
            name: previousDesignation.designationName,
          } : null,
          next: nextDesignation ? {
            id: nextDesignation.id,
            name: nextDesignation.designationName,
          } : null,
          alternatives: d.careerPathOptions || [],
        },
        timeline: d.progressionTimeline,
      };
    });
  }

  async getMarketIntelligence(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      name: d.designationName,
      market: {
        demand: d.marketDemand,
        talentAvailability: d.talentAvailability,
        growthRate: d.growthRate,
        salaryRange: {
          min: d.marketMinSalary,
          max: d.marketMaxSalary,
          currency: d.salaryCurrency,
          percentile: d.marketPercentile,
        },
        lastReview: d.lastMarketReview,
      },
      competitor: d.competitorTitles || [],
      analytics: {
        activePositions: d.activePositionsCount,
        employees: d.totalEmployeesCount,
        vacancies: d.vacantPositionsCount,
        turnover: d.turnoverRate,
        avgSalary: d.averageActualSalary,
        avgTimeToFill: d.averageTimeToFill,
      },
    }));
  }

  async getUsageAnalytics(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      name: d.designationName,
      usage: {
        activePositions: d.activePositionsCount,
        totalEmployees: d.totalEmployeesCount,
        vacancies: d.vacantPositionsCount,
        frequency: d.usageFrequency,
      },
      performance: {
        avgRating: d.averagePerformanceRating,
        avgTenure: d.averageTenureMonths,
        turnover: d.turnoverRate,
        promotionRate: d.promotionRate,
      },
      succession: {
        pipelineDepth: d.successorPipelineDepth,
      },
    }));
  }

  async getCompetencyProfile(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      name: d.designationName,
      level: d.levelNumber,
      skills: d.commonSkills || [],
      certifications: d.requiredCertifications || [],
      education: d.educationRequirements || [],
      experience: {
        minimum: d.minimumExperience,
        typical: d.typicalExperience,
      },
      characteristics: {
        roleType: d.roleType,
        responsibility: d.responsibility,
        seniority: d.seniority,
        hasDirectReports: d.hasDirectReports,
        typicalReportees: d.typicalReportees,
      },
    }));
  }

  async getGeographicCoverage(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      name: d.designationName,
      coverage: {
        regions: d.applicableRegions || [],
        countries: d.applicableCountries || [],
        scope: d.geographicScope,
        variations: d.regionalVariations || [],
      },
      work: {
        arrangement: d.workArrangement,
        requiresTravel: d.requiresTravel,
        travelPercentage: d.travelPercentage,
      },
    }));
  }

  async getTitleVariations(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      primary: d.designationName,
      variations: {
        short: d.shortName,
        abbreviation: d.abbreviation,
        external: d.externalTitle,
        internal: d.internalTitle,
        jobPosting: d.jobPostingTitle,
        alternatives: d.alternativeNames || [],
        synonyms: d.synonyms || [],
      },
      translations: d.translations || {},
      regional: d.regionalVariations || [],
    }));
  }

  async getComplianceMatrix(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      name: d.designationName,
      compliance: {
        regulatory: d.regulatoryRequirements || [],
        complianceNeeds: d.complianceNeeds || [],
        backgroundCheck: d.backgroundCheckLevel,
        securityClearance: d.securityClearance || [],
        requiresLicensing: d.requiresLicensing,
        licenses: d.requiredLicenses || [],
      },
      standards: {
        onet: d.onetCode,
        isco: d.iscoCode,
        soc: d.socCode,
        nace: d.naceCode,
        occupationalFamily: d.occupationalFamily || [],
      },
    }));
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateDesignationNameDto }>): Promise<DesignationName[]> {
    const results: DesignationName[] = [];

    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }

    return results;
  }
}
