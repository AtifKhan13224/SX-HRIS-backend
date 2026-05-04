import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Band } from '../entities/band.entity';
import { CreateBandDto, UpdateBandDto } from '../dto/band.dto';

@Injectable()
export class BandService {
  constructor(
    @InjectRepository(Band)
    private bandRepository: Repository<Band>,
  ) {}

  async create(createBandDto: CreateBandDto): Promise<Band> {
    const existing = await this.bandRepository.findOne({
      where: { bandCode: createBandDto.bandCode },
    });

    if (existing) {
      throw new BadRequestException(`Band with code ${createBandDto.bandCode} already exists`);
    }

    const band = this.bandRepository.create(createBandDto);
    return await this.bandRepository.save(band);
  }

  async findAll(groupCompanyId?: string, search?: string, isActive?: boolean): Promise<Band[]> {
    const queryBuilder = this.bandRepository.createQueryBuilder('band')
      .leftJoinAndSelect('band.groupCompany', 'groupCompany');

    if (groupCompanyId) {
      queryBuilder.andWhere('band.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(band.bandName ILIKE :search OR band.bandCode ILIKE :search OR band.bandType ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('band.isActive = :isActive', { isActive });
    }

    return await queryBuilder.orderBy('band.bandLevel', 'ASC').addOrderBy('band.sortOrder', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Band> {
    const band = await this.bandRepository.findOne({
      where: { id },
      relations: ['groupCompany'],
    });

    if (!band) {
      throw new NotFoundException(`Band with ID ${id} not found`);
    }

    return band;
  }

  async update(id: string, updateBandDto: UpdateBandDto): Promise<Band> {
    const band = await this.findOne(id);

    if (updateBandDto.bandCode && updateBandDto.bandCode !== band.bandCode) {
      const existing = await this.bandRepository.findOne({
        where: { bandCode: updateBandDto.bandCode },
      });

      if (existing) {
        throw new BadRequestException(`Band with code ${updateBandDto.bandCode} already exists`);
      }
    }

    Object.assign(band, updateBandDto);
    return await this.bandRepository.save(band);
  }

  async remove(id: string): Promise<void> {
    const band = await this.findOne(id);
    await this.bandRepository.remove(band);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const queryBuilder = this.bandRepository.createQueryBuilder('band');

    if (groupCompanyId) {
      queryBuilder.where('band.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const bands = await queryBuilder.getMany();

    const totalBands = bands.length;
    const activeBands = bands.filter(b => b.isActive).length;
    const leadershipBands = bands.filter(b => b.isLeadershipBand).length;
    const executiveBands = bands.filter(b => b.isExecutiveBand).length;
    const technicalBands = bands.filter(b => b.isTechnicalBand).length;
    const totalHeadcount = bands.reduce((sum, b) => sum + (b.currentHeadcount || 0), 0);
    const totalVacancies = bands.reduce((sum, b) => sum + (b.vacancies || 0), 0);
    const avgTurnover = bands.length > 0 
      ? bands.reduce((sum, b) => sum + (b.turnoverRate || 0), 0) / bands.length 
      : 0;

    const byType = bands.reduce((acc, b) => {
      const type = b.bandType || 'Unclassified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const byTrack = bands.reduce((acc, b) => {
      const track = b.careerTrack || 'Unclassified';
      acc[track] = (acc[track] || 0) + 1;
      return acc;
    }, {});

    return {
      totalBands,
      activeBands,
      leadershipBands,
      executiveBands,
      technicalBands,
      totalHeadcount,
      totalVacancies,
      avgTurnover: Math.round(avgTurnover * 100) / 100,
      byType,
      byTrack,
      criticalBands: bands.filter(b => b.isCritical).length,
      strategicBands: bands.filter(b => b.isStrategic).length,
    };
  }

  async getCompetencyMatrix(groupCompanyId?: string): Promise<any> {
    const bands = await this.findAll(groupCompanyId);

    return bands.map(band => ({
      id: band.id,
      code: band.bandCode,
      name: band.bandName,
      level: band.bandLevel,
      type: band.bandType,
      competencies: {
        core: band.coreCompetencies || [],
        leadership: band.leadershipCompetencies || [],
        technical: band.technicalCompetencies || [],
        functional: band.functionalCompetencies || [],
      },
      complexity: {
        role: band.roleComplexity,
        decision: band.decisionMakingLevel,
        autonomy: band.autonomyLevel,
        impact: band.impactRadius,
      },
      headcount: band.currentHeadcount,
    }));
  }

  async getCareerPathways(groupCompanyId?: string): Promise<any> {
    const bands = await this.findAll(groupCompanyId);

    const buildPathway = (band: Band): any => {
      const nextBand = band.nextBandId 
        ? bands.find(b => b.id === band.nextBandId)
        : null;

      const previousBand = band.previousBandId
        ? bands.find(b => b.id === band.previousBandId)
        : null;

      const lateralOptions = (band.lateralMoves || [])
        .map(id => bands.find(b => b.id === id))
        .filter(b => b !== undefined);

      return {
        current: {
          id: band.id,
          code: band.bandCode,
          name: band.bandName,
          level: band.bandLevel,
          track: band.careerTrack,
          minYears: band.minYearsInBand,
          typicalYears: band.typicalYearsInBand,
        },
        progression: {
          next: nextBand ? {
            id: nextBand.id,
            code: nextBand.bandCode,
            name: nextBand.bandName,
          } : null,
          previous: previousBand ? {
            id: previousBand.id,
            code: previousBand.bandCode,
            name: previousBand.bandName,
          } : null,
          lateral: lateralOptions.map(b => ({
            id: b.id,
            code: b.bandCode,
            name: b.bandName,
            track: b.careerTrack,
          })),
          alternative: band.alternativeProgression || [],
        },
        development: {
          areas: band.developmentAreas || [],
          programs: band.trainingPrograms || [],
          pathways: band.learningPathways || [],
          annualHours: band.annualTrainingHours,
          budget: band.developmentBudget,
        },
      };
    };

    return bands.map(band => buildPathway(band));
  }

  async getDevelopmentPlans(groupCompanyId?: string): Promise<any> {
    const bands = await this.findAll(groupCompanyId);

    return bands.map(band => ({
      id: band.id,
      code: band.bandCode,
      name: band.bandName,
      development: {
        areas: band.developmentAreas || [],
        trainingPrograms: band.trainingPrograms || [],
        learningPathways: band.learningPathways || [],
        annualHours: band.annualTrainingHours,
        budget: band.developmentBudget,
      },
      requirements: {
        education: band.educationRequirements || [],
        certifications: band.certifications || [],
        minExperience: band.minimumExperience,
        preferredExperience: band.preferredExperience,
        industry: band.industryExperience || [],
      },
      headcount: band.currentHeadcount,
    }));
  }

  async getWorkforceAnalytics(groupCompanyId?: string): Promise<any> {
    const bands = await this.findAll(groupCompanyId);

    const totalCurrent = bands.reduce((sum, b) => sum + (b.currentHeadcount || 0), 0);
    const totalTarget = bands.reduce((sum, b) => sum + (b.targetHeadcount || 0), 0);
    const totalVacancies = bands.reduce((sum, b) => sum + (b.vacancies || 0), 0);

    return {
      summary: {
        totalCurrent,
        totalTarget,
        totalVacancies,
        utilizationRate: totalTarget > 0 
          ? ((totalCurrent / totalTarget) * 100).toFixed(2) + '%'
          : 'N/A',
      },
      byBand: bands.map(band => ({
        id: band.id,
        code: band.bandCode,
        name: band.bandName,
        level: band.bandLevel,
        workforce: {
          current: band.currentHeadcount,
          target: band.targetHeadcount,
          vacancies: band.vacancies,
          turnover: band.turnoverRate,
          avgTenure: band.avgTenure,
        },
        mobility: {
          promotionIn: band.promotionInRate,
          promotionOut: band.promotionOutRate,
        },
        diversity: band.diversityMetrics,
      })),
    };
  }

  async getSuccessionAnalysis(groupCompanyId?: string): Promise<any> {
    const bands = await this.findAll(groupCompanyId);

    return bands.map(band => ({
      id: band.id,
      code: band.bandCode,
      name: band.bandName,
      level: band.bandLevel,
      headcount: band.currentHeadcount,
      criticalRoles: band.criticalRoleCount,
      succession: {
        pipelineDepth: band.successorPipelineDepth,
        readiness: band.successionReadiness,
        programs: band.talentPipelinePrograms || [],
        readyNowRatio: band.successorPipelineDepth && band.currentHeadcount
          ? ((band.successorPipelineDepth / band.currentHeadcount) * 100).toFixed(2) + '%'
          : 'N/A',
      },
      turnover: band.turnoverRate,
      avgTenure: band.avgTenure,
    }));
  }

  async getMarketIntelligence(groupCompanyId?: string): Promise<any> {
    const bands = await this.findAll(groupCompanyId);

    return bands.map(band => ({
      id: band.id,
      code: band.bandCode,
      name: band.bandName,
      level: band.bandLevel,
      market: {
        demand: band.marketDemand,
        talentAvailability: band.talentAvailability,
        competitiveness: band.marketCompetitiveness,
        lastAnalysis: band.lastMarketAnalysis,
      },
      benchmark: band.competitorBenchmark || [],
      compensation: {
        min: band.minCompensation,
        max: band.maxCompensation,
        currency: band.compensationCurrency,
        bonusEligibility: band.bonusEligibility,
        equityEligible: band.eligibleForEquity,
      },
      headcount: band.currentHeadcount,
      vacancies: band.vacancies,
    }));
  }

  async getComplianceMatrix(groupCompanyId?: string): Promise<any> {
    const bands = await this.findAll(groupCompanyId);

    return bands.map(band => ({
      id: band.id,
      code: band.bandCode,
      name: band.bandName,
      level: band.bandLevel,
      compliance: {
        requirements: band.complianceRequirements || [],
        mandatoryTraining: band.mandatoryTraining || [],
        backgroundCheck: band.backgroundCheckLevel,
        securityClearance: band.securityClearance || [],
        requiresRegulation: band.requiresRegulation,
      },
      headcount: band.currentHeadcount,
    }));
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateBandDto }>): Promise<Band[]> {
    const results: Band[] = [];

    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }

    return results;
  }
}
