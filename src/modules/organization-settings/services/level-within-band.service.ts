import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LevelWithinBand } from '../entities/level-within-band.entity';
import { CreateLevelWithinBandDto, UpdateLevelWithinBandDto } from '../dto/level-within-band.dto';

@Injectable()
export class LevelWithinBandService {
  constructor(
    @InjectRepository(LevelWithinBand)
    private levelRepository: Repository<LevelWithinBand>,
  ) {}

  async create(createLevelDto: CreateLevelWithinBandDto): Promise<LevelWithinBand> {
    const existing = await this.levelRepository.findOne({
      where: { levelCode: createLevelDto.levelCode },
    });

    if (existing) {
      throw new BadRequestException(`Level with code ${createLevelDto.levelCode} already exists`);
    }

    if (createLevelDto.salaryMinimum && createLevelDto.salaryMaximum) {
      if (createLevelDto.salaryMinimum > createLevelDto.salaryMaximum) {
        throw new BadRequestException('Minimum salary cannot exceed maximum salary');
      }

      if (createLevelDto.salaryMidpoint) {
        if (createLevelDto.salaryMidpoint < createLevelDto.salaryMinimum || 
            createLevelDto.salaryMidpoint > createLevelDto.salaryMaximum) {
          throw new BadRequestException('Midpoint must be between minimum and maximum salary');
        }
      }
    }

    const level = this.levelRepository.create(createLevelDto);
    return await this.levelRepository.save(level);
  }

  async findAll(groupCompanyId?: string, bandId?: string, search?: string, isActive?: boolean): Promise<LevelWithinBand[]> {
    const queryBuilder = this.levelRepository.createQueryBuilder('level')
      .leftJoinAndSelect('level.groupCompany', 'groupCompany')
      .leftJoinAndSelect('level.band', 'band');

    if (groupCompanyId) {
      queryBuilder.andWhere('level.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (bandId) {
      queryBuilder.andWhere('level.bandId = :bandId', { bandId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(level.levelName ILIKE :search OR level.levelCode ILIKE :search OR level.levelTitle ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('level.isActive = :isActive', { isActive });
    }

    return await queryBuilder.orderBy('level.levelNumber', 'ASC').addOrderBy('level.sortOrder', 'ASC').getMany();
  }

  async findOne(id: string): Promise<LevelWithinBand> {
    const level = await this.levelRepository.findOne({
      where: { id },
      relations: ['groupCompany', 'band'],
    });

    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }

    return level;
  }

  async update(id: string, updateLevelDto: UpdateLevelWithinBandDto): Promise<LevelWithinBand> {
    const level = await this.findOne(id);

    if (updateLevelDto.levelCode && updateLevelDto.levelCode !== level.levelCode) {
      const existing = await this.levelRepository.findOne({
        where: { levelCode: updateLevelDto.levelCode },
      });

      if (existing) {
        throw new BadRequestException(`Level with code ${updateLevelDto.levelCode} already exists`);
      }
    }

    const minSalary = updateLevelDto.salaryMinimum ?? level.salaryMinimum;
    const maxSalary = updateLevelDto.salaryMaximum ?? level.salaryMaximum;
    const midSalary = updateLevelDto.salaryMidpoint ?? level.salaryMidpoint;

    if (minSalary && maxSalary && minSalary > maxSalary) {
      throw new BadRequestException('Minimum salary cannot exceed maximum salary');
    }

    if (midSalary && minSalary && maxSalary) {
      if (midSalary < minSalary || midSalary > maxSalary) {
        throw new BadRequestException('Midpoint must be between minimum and maximum salary');
      }
    }

    Object.assign(level, updateLevelDto);
    return await this.levelRepository.save(level);
  }

  async remove(id: string): Promise<void> {
    const level = await this.findOne(id);
    await this.levelRepository.remove(level);
  }

  async getStats(groupCompanyId?: string, bandId?: string): Promise<any> {
    const queryBuilder = this.levelRepository.createQueryBuilder('level');

    if (groupCompanyId) {
      queryBuilder.andWhere('level.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (bandId) {
      queryBuilder.andWhere('level.bandId = :bandId', { bandId });
    }

    const levels = await queryBuilder.getMany();

    const totalLevels = levels.length;
    const activeLevels = levels.filter(l => l.isActive).length;
    const entryLevels = levels.filter(l => l.isEntryLevel).length;
    const midLevels = levels.filter(l => l.isMidLevel).length;
    const seniorLevels = levels.filter(l => l.isSeniorLevel).length;
    const leadershipLevels = levels.filter(l => l.isLeadershipLevel).length;
    const totalHeadcount = levels.reduce((sum, l) => sum + (l.currentHeadcount || 0), 0);
    const totalOpenPositions = levels.reduce((sum, l) => sum + (l.openPositions || 0), 0);
    const avgCompaRatio = levels.length > 0 
      ? levels.reduce((sum, l) => sum + (l.compaRatio || 0), 0) / levels.length 
      : 0;

    return {
      totalLevels,
      activeLevels,
      entryLevels,
      midLevels,
      seniorLevels,
      leadershipLevels,
      totalHeadcount,
      totalOpenPositions,
      avgCompaRatio: Math.round(avgCompaRatio * 100) / 100,
      criticalLevels: levels.filter(l => l.isCritical).length,
      highDemandLevels: levels.filter(l => l.isHighDemand).length,
    };
  }

  async getCompetencyProfile(groupCompanyId?: string, bandId?: string): Promise<any> {
    const levels = await this.findAll(groupCompanyId, bandId);

    return levels.map(level => ({
      id: level.id,
      code: level.levelCode,
      name: level.levelName,
      title: level.levelTitle,
      number: level.levelNumber,
      competencies: {
        required: level.requiredCompetencies || [],
        technical: level.technicalSkills || [],
        soft: level.softSkills || [],
        leadership: level.leadershipCapabilities || [],
      },
      roleCharacteristics: {
        complexity: level.roleComplexity,
        problemSolving: level.problemSolving,
        decision: level.decisionAuthority,
        autonomy: level.autonomyLevel,
        innovation: level.innovationExpectation,
      },
      experience: {
        minimum: level.minimumExperience,
        typical: level.typicalExperience,
        maximum: level.maximumExperience,
      },
      headcount: level.currentHeadcount,
    }));
  }

  async getCareerLadder(groupCompanyId?: string, bandId?: string): Promise<any> {
    const levels = await this.findAll(groupCompanyId, bandId);

    const buildLadder = (level: LevelWithinBand): any => {
      const nextLevel = level.nextLevelId 
        ? levels.find(l => l.id === level.nextLevelId)
        : null;

      const previousLevel = level.previousLevelId
        ? levels.find(l => l.id === level.previousLevelId)
        : null;

      return {
        current: {
          id: level.id,
          code: level.levelCode,
          name: level.levelName,
          title: level.levelTitle,
          number: level.levelNumber,
        },
        progression: {
          previous: previousLevel ? {
            id: previousLevel.id,
            code: previousLevel.levelCode,
            name: previousLevel.levelName,
            title: previousLevel.levelTitle,
          } : null,
          next: nextLevel ? {
            id: nextLevel.id,
            code: nextLevel.levelCode,
            name: nextLevel.levelName,
            title: nextLevel.levelTitle,
          } : null,
          lateral: level.lateralMoves || [],
        },
        timeInLevel: {
          minimum: level.minTimeInLevel,
          typical: level.typicalTimeInLevel,
          maximum: level.maxTimeInLevel,
        },
        promotion: {
          criteria: level.promotionCriteria || [],
          readinessThreshold: level.promotionReadinessThreshold,
          rate: level.promotionRate,
        },
      };
    };

    return levels.map(level => buildLadder(level));
  }

  async getDevelopmentPlans(groupCompanyId?: string, bandId?: string): Promise<any> {
    const levels = await this.findAll(groupCompanyId, bandId);

    return levels.map(level => ({
      id: level.id,
      code: level.levelCode,
      name: level.levelName,
      title: level.levelTitle,
      development: {
        areas: level.developmentAreas || [],
        trainingPrograms: level.trainingPrograms || [],
        onboarding: level.onboardingProgram || [],
        annualHours: level.annualTrainingHours,
        budgetPerEmployee: level.developmentBudgetPerEmployee,
        mentorship: level.mentorshipRequirements,
      },
      requirements: {
        education: level.educationRequirements || [],
        certifications: level.certifications || [],
        memberships: level.professionalMemberships || [],
      },
      headcount: level.currentHeadcount,
    }));
  }

  async getCompensationBenchmark(groupCompanyId?: string, bandId?: string): Promise<any> {
    const levels = await this.findAll(groupCompanyId, bandId);

    return levels.map(level => {
      const midpoint = level.salaryMidpoint || 0;
      const avgActual = level.avgSalary || 0;
      const compaRatio = midpoint > 0 ? (avgActual / midpoint) * 100 : 0;

      return {
        id: level.id,
        code: level.levelCode,
        name: level.levelName,
        title: level.levelTitle,
        compensation: {
          salaryRange: {
            minimum: level.salaryMinimum,
            midpoint: level.salaryMidpoint,
            maximum: level.salaryMaximum,
            currency: level.salaryCurrency,
          },
          bonus: {
            target: level.targetBonusPercentage,
            maximum: level.maxBonusPercentage,
          },
          equity: {
            eligible: level.eligibleForEquity,
            range: level.equityRange,
          },
          benefits: level.benefitsPackage || [],
          leave: level.annualLeaveEntitlement,
        },
        analytics: {
          avgSalary: avgActual,
          compaRatio: Math.round(compaRatio * 100) / 100,
          headcount: level.currentHeadcount,
        },
        market: {
          percentile: level.marketPercentile,
          benchmark: level.marketBenchmark || [],
          lastReview: level.lastMarketReview,
        },
      };
    });
  }

  async getWorkforceAnalytics(groupCompanyId?: string, bandId?: string): Promise<any> {
    const levels = await this.findAll(groupCompanyId, bandId);

    const totalCurrent = levels.reduce((sum, l) => sum + (l.currentHeadcount || 0), 0);
    const totalTarget = levels.reduce((sum, l) => sum + (l.targetHeadcount || 0), 0);
    const totalOpen = levels.reduce((sum, l) => sum + (l.openPositions || 0), 0);

    return {
      summary: {
        totalCurrent,
        totalTarget,
        totalOpen,
        utilizationRate: totalTarget > 0 
          ? ((totalCurrent / totalTarget) * 100).toFixed(2) + '%'
          : 'N/A',
      },
      byLevel: levels.map(level => ({
        id: level.id,
        code: level.levelCode,
        name: level.levelName,
        title: level.levelTitle,
        number: level.levelNumber,
        workforce: {
          current: level.currentHeadcount,
          target: level.targetHeadcount,
          open: level.openPositions,
          utilizationRate: level.targetHeadcount > 0
            ? (((level.currentHeadcount || 0) / level.targetHeadcount) * 100).toFixed(2) + '%'
            : 'N/A',
        },
        performance: {
          avgRating: level.avgPerformanceRating,
          turnover: level.turnoverRate,
          avgTenure: level.avgTenureMonths,
          promotionRate: level.promotionRate,
          timeToFill: level.timeToFillDays,
        },
        succession: {
          successors: level.successorCount,
          highPotential: level.highPotentialCount,
          coverage: level.successionCoverage,
        },
        diversity: level.diversityMetrics,
      })),
    };
  }

  async getSuccessionPipeline(groupCompanyId?: string, bandId?: string): Promise<any> {
    const levels = await this.findAll(groupCompanyId, bandId);

    return levels.map(level => ({
      id: level.id,
      code: level.levelCode,
      name: level.levelName,
      title: level.levelTitle,
      headcount: level.currentHeadcount,
      succession: {
        successorCount: level.successorCount,
        highPotential: level.highPotentialCount,
        coverage: level.successionCoverage,
        programs: level.talentPoolPrograms || [],
        readyNowRatio: level.successorCount && level.currentHeadcount
          ? ((level.successorCount / level.currentHeadcount) * 100).toFixed(2) + '%'
          : 'N/A',
      },
      performance: {
        avgRating: level.avgPerformanceRating,
        promotionRate: level.promotionRate,
        avgTenure: level.avgTenureMonths,
      },
      turnover: level.turnoverRate,
      isCritical: level.isCritical,
    }));
  }

  async getPerformanceStandards(groupCompanyId?: string, bandId?: string): Promise<any> {
    const levels = await this.findAll(groupCompanyId, bandId);

    return levels.map(level => ({
      id: level.id,
      code: level.levelCode,
      name: level.levelName,
      title: level.levelTitle,
      standards: {
        expectations: level.performanceExpectations || [],
        kpis: level.kpis || [],
        targetRating: level.targetPerformanceRating,
        deliverables: level.deliverables || [],
        qualityStandards: level.qualityStandards || [],
      },
      responsibilities: {
        key: level.keyResponsibilities || [],
        accountabilities: level.accountabilities || [],
        impact: level.impactScope,
        timeHorizon: level.timeHorizon,
      },
      management: {
        directReports: level.typicalDirectReports,
        indirectReports: level.typicalIndirectReports,
        budgetAuthority: level.budgetAuthority,
        approvalLimits: level.approvalLimits || [],
      },
      actualPerformance: {
        avgRating: level.avgPerformanceRating,
        headcount: level.currentHeadcount,
      },
    }));
  }

  async getComplianceMatrix(groupCompanyId?: string, bandId?: string): Promise<any> {
    const levels = await this.findAll(groupCompanyId, bandId);

    return levels.map(level => ({
      id: level.id,
      code: level.levelCode,
      name: level.levelName,
      title: level.levelTitle,
      compliance: {
        requirements: level.complianceRequirements || [],
        mandatoryTraining: level.mandatoryTraining || [],
        backgroundCheck: level.backgroundCheckLevel,
        securityClearance: level.securityClearance || [],
        riskLevel: level.riskLevel,
      },
      headcount: level.currentHeadcount,
    }));
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateLevelWithinBandDto }>): Promise<LevelWithinBand[]> {
    const results: LevelWithinBand[] = [];

    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }

    return results;
  }
}
