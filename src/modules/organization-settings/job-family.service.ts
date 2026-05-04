import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobFamily } from './entities/job-family.entity';
import { CreateJobFamilyDto, UpdateJobFamilyDto } from './dto/job-family.dto';

@Injectable()
export class JobFamilyService {
  constructor(
    @InjectRepository(JobFamily)
    private jobFamilyRepository: Repository<JobFamily>,
  ) {}

  async findAll(
    search?: string,
    isActive?: boolean,
    groupCompanyId?: string,
    functionalAreaId?: string,
    classification?: string,
    criticalityRating?: string,
  ): Promise<JobFamily[]> {
    const query = this.jobFamilyRepository.createQueryBuilder('jobFamily');

    if (search) {
      query.andWhere(
        '(jobFamily.familyName ILIKE :search OR jobFamily.familyCode ILIKE :search OR jobFamily.familyDescription ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      query.andWhere('jobFamily.isActive = :isActive', { isActive });
    }

    if (groupCompanyId) {
      query.andWhere('jobFamily.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (functionalAreaId) {
      query.andWhere('jobFamily.functionalAreaId = :functionalAreaId', { functionalAreaId });
    }

    if (classification) {
      query.andWhere('jobFamily.classification = :classification', { classification });
    }

    if (criticalityRating) {
      query.andWhere('jobFamily.criticalityRating = :criticalityRating', { criticalityRating });
    }

    query.orderBy('jobFamily.familyName', 'ASC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<JobFamily> {
    const jobFamily = await this.jobFamilyRepository.findOne({
      where: { id },
    });

    if (!jobFamily) {
      throw new NotFoundException(`Job Family with ID ${id} not found`);
    }

    return jobFamily;
  }

  async findByCode(code: string): Promise<JobFamily> {
    return await this.jobFamilyRepository.findOne({
      where: { familyCode: code },
    });
  }

  async create(createDto: CreateJobFamilyDto): Promise<JobFamily> {
    // Check if job family code already exists
    const existing = await this.findByCode(createDto.familyCode);
    if (existing) {
      throw new ConflictException(
        `Job Family with code ${createDto.familyCode} already exists`,
      );
    }

    const jobFamily = this.jobFamilyRepository.create(createDto);
    return await this.jobFamilyRepository.save(jobFamily);
  }

  async update(id: string, updateDto: UpdateJobFamilyDto): Promise<JobFamily> {
    const jobFamily = await this.findOne(id);

    // Check if updating code and if it conflicts with another job family
    if (updateDto.familyCode && updateDto.familyCode !== jobFamily.familyCode) {
      const existing = await this.findByCode(updateDto.familyCode);
      if (existing) {
        throw new ConflictException(
          `Job Family with code ${updateDto.familyCode} already exists`,
        );
      }
    }

    Object.assign(jobFamily, updateDto);
    return await this.jobFamilyRepository.save(jobFamily);
  }

  async delete(id: string): Promise<void> {
    const jobFamily = await this.findOne(id);
    await this.jobFamilyRepository.remove(jobFamily);
  }

  async getStats(): Promise<any> {
    const total = await this.jobFamilyRepository.count();
    const active = await this.jobFamilyRepository.count({
      where: { isActive: true },
    });
    const critical = await this.jobFamilyRepository.count({
      where: { isCritical: true },
    });
    const strategic = await this.jobFamilyRepository.count({
      where: { isStrategic: true },
    });

    const jobFamilies = await this.jobFamilyRepository.find();

    const totalHeadcount = jobFamilies.reduce(
      (sum, family) => sum + (family.headcountCurrent || 0),
      0,
    );

    const totalOpenPositions = jobFamilies.reduce(
      (sum, family) => sum + (family.openPositions || 0),
      0,
    );

    const avgTurnoverRate = jobFamilies.length > 0
      ? jobFamilies.reduce((sum, family) => sum + (family.turnoverRate || 0), 0) / jobFamilies.length
      : 0;

    const avgTimeToFill = jobFamilies.length > 0
      ? jobFamilies.reduce((sum, family) => sum + (family.timeToFillAvg || 0), 0) / jobFamilies.length
      : 0;

    // Classification breakdown
    const byClassification = await this.jobFamilyRepository
      .createQueryBuilder('jobFamily')
      .select('jobFamily.classification', 'classification')
      .addSelect('COUNT(*)', 'count')
      .where('jobFamily.classification IS NOT NULL')
      .groupBy('jobFamily.classification')
      .getRawMany();

    // Criticality breakdown
    const byCriticality = await this.jobFamilyRepository
      .createQueryBuilder('jobFamily')
      .select('jobFamily.criticalityRating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('jobFamily.criticalityRating IS NOT NULL')
      .groupBy('jobFamily.criticalityRating')
      .getRawMany();

    // Strategic importance breakdown
    const byStrategicImportance = await this.jobFamilyRepository
      .createQueryBuilder('jobFamily')
      .select('jobFamily.strategicImportance', 'importance')
      .addSelect('COUNT(*)', 'count')
      .where('jobFamily.strategicImportance IS NOT NULL')
      .groupBy('jobFamily.strategicImportance')
      .getRawMany();

    // Future demand trend breakdown
    const byDemandTrend = await this.jobFamilyRepository
      .createQueryBuilder('jobFamily')
      .select('jobFamily.futureDemandTrend', 'trend')
      .addSelect('COUNT(*)', 'count')
      .where('jobFamily.futureDemandTrend IS NOT NULL')
      .groupBy('jobFamily.futureDemandTrend')
      .getRawMany();

    return {
      total,
      active,
      inactive: total - active,
      critical,
      strategic,
      totalHeadcount,
      totalOpenPositions,
      avgTurnoverRate: parseFloat(avgTurnoverRate.toFixed(2)),
      avgTimeToFill: Math.round(avgTimeToFill),
      byClassification,
      byCriticality,
      byStrategicImportance,
      byDemandTrend,
    };
  }

  async getHierarchy(): Promise<any> {
    const jobFamilies = await this.jobFamilyRepository.find({
      where: { isActive: true },
    });

    // Build hierarchy tree
    const familyMap = new Map<string, any>();
    const rootFamilies: any[] = [];

    // First pass: create all nodes
    jobFamilies.forEach(family => {
      familyMap.set(family.id, {
        ...family,
        children: [],
      });
    });

    // Second pass: build tree structure
    jobFamilies.forEach(family => {
      const node = familyMap.get(family.id);
      if (family.parentFamilyId && familyMap.has(family.parentFamilyId)) {
        const parent = familyMap.get(family.parentFamilyId);
        parent.children.push(node);
      } else {
        rootFamilies.push(node);
      }
    });

    return rootFamilies;
  }

  async getCareerPath(familyId: string): Promise<any> {
    const jobFamily = await this.findOne(familyId);

    // Get related families in the same career stream
    const relatedFamilies = await this.jobFamilyRepository.find({
      where: {
        careerStream: jobFamily.careerStream,
        isActive: true,
      },
      order: {
        familyName: 'ASC',
      },
    });

    return {
      currentFamily: jobFamily,
      careerStream: jobFamily.careerStream,
      relatedFamilies,
      progression: jobFamily.careerProgression,
    };
  }

  async getCompensationBenchmark(familyId: string): Promise<any> {
    const jobFamily = await this.findOne(familyId);

    // Get all families with similar classification for comparison
    const similarFamilies = await this.jobFamilyRepository.find({
      where: {
        classification: jobFamily.classification,
        isActive: true,
      },
      select: ['id', 'familyName', 'compensationBandMin', 'compensationBandMax', 'compensationCurrency'],
    });

    const avgMin = similarFamilies.reduce(
      (sum, f) => sum + (f.compensationBandMin || 0),
      0,
    ) / similarFamilies.length;

    const avgMax = similarFamilies.reduce(
      (sum, f) => sum + (f.compensationBandMax || 0),
      0,
    ) / similarFamilies.length;

    return {
      currentFamily: {
        id: jobFamily.id,
        familyName: jobFamily.familyName,
        compensationBandMin: jobFamily.compensationBandMin,
        compensationBandMax: jobFamily.compensationBandMax,
        compensationCurrency: jobFamily.compensationCurrency,
        marketBenchmarkSource: jobFamily.marketBenchmarkSource,
        lastMarketReview: jobFamily.lastMarketReview,
      },
      marketAverage: {
        min: Math.round(avgMin),
        max: Math.round(avgMax),
        currency: jobFamily.compensationCurrency,
      },
      similarFamilies: similarFamilies.map(f => ({
        id: f.id,
        familyName: f.familyName,
        min: f.compensationBandMin,
        max: f.compensationBandMax,
        currency: f.compensationCurrency,
      })),
    };
  }

  async getSuccessionPlan(familyId: string): Promise<any> {
    const jobFamily = await this.findOne(familyId);

    return {
      familyId: jobFamily.id,
      familyName: jobFamily.familyName,
      currentHeadcount: jobFamily.headcountCurrent,
      talentPoolSize: jobFamily.talentPoolSize,
      successionDepth: jobFamily.successionDepth,
      successionPlanning: jobFamily.successionPlanning,
      criticalityRating: jobFamily.criticalityRating,
      turnoverRate: jobFamily.turnoverRate,
    };
  }

  async getSkillsGap(familyId: string): Promise<any> {
    const jobFamily = await this.findOne(familyId);

    return {
      familyId: jobFamily.id,
      familyName: jobFamily.familyName,
      requiredSkills: jobFamily.skillsFramework,
      learningDevelopment: jobFamily.learningDevelopment,
      complianceRequirements: jobFamily.complianceRequirements,
    };
  }

  async getTalentAnalytics(familyId: string): Promise<any> {
    const jobFamily = await this.findOne(familyId);

    return {
      familyId: jobFamily.id,
      familyName: jobFamily.familyName,
      headcount: {
        current: jobFamily.headcountCurrent,
        budgeted: jobFamily.headcountBudgeted,
        variance: (jobFamily.headcountBudgeted || 0) - (jobFamily.headcountCurrent || 0),
      },
      openPositions: jobFamily.openPositions,
      recruitment: {
        avgTimeToFill: jobFamily.timeToFillAvg,
        avgCostPerHire: jobFamily.costPerHireAvg,
      },
      performance: jobFamily.performanceMetrics,
      diversity: jobFamily.diversityMetrics,
      turnover: {
        rate: jobFamily.turnoverRate,
        talentPoolSize: jobFamily.talentPoolSize,
      },
      geographic: jobFamily.geographicDistribution,
      workforce: {
        contingentPercent: jobFamily.contingentWorkforcePercent,
        globalMobility: jobFamily.globalMobility,
        remoteWorkEligible: jobFamily.remoteWorkEligible,
      },
    };
  }

  async bulkUpdate(ids: string[], updateDto: Partial<UpdateJobFamilyDto>): Promise<any> {
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          await this.update(id, updateDto);
          return { id, success: true };
        } catch (error) {
          return { id, success: false, error: error.message };
        }
      }),
    );

    return {
      total: ids.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  async export(): Promise<JobFamily[]> {
    return await this.jobFamilyRepository.find({
      order: {
        familyName: 'ASC',
      },
    });
  }
}
