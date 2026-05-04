import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';
import { CreateGradeDto, UpdateGradeDto } from '../dto/grade.dto';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
  ) {}

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const existing = await this.gradeRepository.findOne({
      where: { gradeCode: createGradeDto.gradeCode },
    });

    if (existing) {
      throw new BadRequestException(`Grade with code ${createGradeDto.gradeCode} already exists`);
    }

    if (createGradeDto.salaryMinimum && createGradeDto.salaryMaximum) {
      if (createGradeDto.salaryMinimum > createGradeDto.salaryMaximum) {
        throw new BadRequestException('Minimum salary cannot exceed maximum salary');
      }

      if (createGradeDto.salaryMidpoint) {
        if (createGradeDto.salaryMidpoint < createGradeDto.salaryMinimum || 
            createGradeDto.salaryMidpoint > createGradeDto.salaryMaximum) {
          throw new BadRequestException('Midpoint must be between minimum and maximum salary');
        }
      }

      if (!createGradeDto.spreadPercentage) {
        const spread = ((createGradeDto.salaryMaximum - createGradeDto.salaryMinimum) / 
                        createGradeDto.salaryMinimum) * 100;
        createGradeDto.spreadPercentage = Math.round(spread * 100) / 100;
      }
    }

    const grade = this.gradeRepository.create(createGradeDto);
    return await this.gradeRepository.save(grade);
  }

  async findAll(groupCompanyId?: string, search?: string, isActive?: boolean): Promise<Grade[]> {
    const queryBuilder = this.gradeRepository.createQueryBuilder('grade')
      .leftJoinAndSelect('grade.groupCompany', 'groupCompany');

    if (groupCompanyId) {
      queryBuilder.andWhere('grade.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(grade.gradeName ILIKE :search OR grade.gradeCode ILIKE :search OR grade.gradeCategory ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('grade.isActive = :isActive', { isActive });
    }

    return await queryBuilder.orderBy('grade.gradeLevel', 'ASC').addOrderBy('grade.sortOrder', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({
      where: { id },
      relations: ['groupCompany'],
    });

    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    return grade;
  }

  async update(id: string, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findOne(id);

    if (updateGradeDto.gradeCode && updateGradeDto.gradeCode !== grade.gradeCode) {
      const existing = await this.gradeRepository.findOne({
        where: { gradeCode: updateGradeDto.gradeCode },
      });

      if (existing) {
        throw new BadRequestException(`Grade with code ${updateGradeDto.gradeCode} already exists`);
      }
    }

    const minSalary = updateGradeDto.salaryMinimum ?? grade.salaryMinimum;
    const maxSalary = updateGradeDto.salaryMaximum ?? grade.salaryMaximum;
    const midSalary = updateGradeDto.salaryMidpoint ?? grade.salaryMidpoint;

    if (minSalary && maxSalary && minSalary > maxSalary) {
      throw new BadRequestException('Minimum salary cannot exceed maximum salary');
    }

    if (midSalary && minSalary && maxSalary) {
      if (midSalary < minSalary || midSalary > maxSalary) {
        throw new BadRequestException('Midpoint must be between minimum and maximum salary');
      }
    }

    if (minSalary && maxSalary && !updateGradeDto.spreadPercentage) {
      const spread = ((maxSalary - minSalary) / minSalary) * 100;
      updateGradeDto.spreadPercentage = Math.round(spread * 100) / 100;
    }

    Object.assign(grade, updateGradeDto);
    return await this.gradeRepository.save(grade);
  }

  async remove(id: string): Promise<void> {
    const grade = await this.findOne(id);
    await this.gradeRepository.remove(grade);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const queryBuilder = this.gradeRepository.createQueryBuilder('grade');

    if (groupCompanyId) {
      queryBuilder.where('grade.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const grades = await queryBuilder.getMany();

    const totalGrades = grades.length;
    const activeGrades = grades.filter(g => g.isActive).length;
    const executiveGrades = grades.filter(g => g.isExecutiveGrade).length;
    const managementGrades = grades.filter(g => g.isManagementGrade).length;
    const leadershipGrades = grades.filter(g => g.isLeadershipGrade).length;
    const totalHeadcount = grades.reduce((sum, g) => sum + (g.currentHeadcount || 0), 0);
    const totalCompCost = grades.reduce((sum, g) => sum + (g.totalCompensationCost || 0), 0);
    const avgCompaRatio = grades.length > 0 
      ? grades.reduce((sum, g) => sum + (g.compaRatio || 0), 0) / grades.length 
      : 0;

    const byCategory = grades.reduce((acc, g) => {
      const cat = g.gradeCategory || 'Unclassified';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const byOrgLevel = grades.reduce((acc, g) => {
      const level = g.organizationLevel || 'Unclassified';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    return {
      totalGrades,
      activeGrades,
      executiveGrades,
      managementGrades,
      leadershipGrades,
      totalHeadcount,
      totalCompCost,
      avgCompaRatio: Math.round(avgCompaRatio * 100) / 100,
      byCategory,
      byOrgLevel,
    };
  }

  async getSalaryStructure(groupCompanyId?: string): Promise<any> {
    const grades = await this.findAll(groupCompanyId);

    return grades.map(grade => ({
      id: grade.id,
      code: grade.gradeCode,
      name: grade.gradeName,
      level: grade.gradeLevel,
      category: grade.gradeCategory,
      salaryRange: {
        minimum: grade.salaryMinimum,
        midpoint: grade.salaryMidpoint,
        maximum: grade.salaryMaximum,
        currency: grade.salaryCurrency,
        period: grade.salaryPeriod,
        spread: grade.spreadPercentage,
      },
      bonusStructure: {
        targetPercentage: grade.targetBonusPercentage,
        maximumPercentage: grade.maximumBonusPercentage,
        minimumAmount: grade.minimumBonusAmount,
        maximumAmount: grade.maximumBonusAmount,
      },
      incentives: {
        lti: grade.eligibleForLTI,
        sti: grade.eligibleForSTI,
        stockOptions: grade.eligibleForStockOptions,
        structure: grade.incentiveStructure || [],
      },
      headcount: grade.currentHeadcount,
      avgSalary: grade.averageActualSalary,
      compaRatio: grade.compaRatio,
    }));
  }

  async getCompensationAnalysis(groupCompanyId?: string): Promise<any> {
    const grades = await this.findAll(groupCompanyId);

    const totalBudget = grades.reduce((sum, g) => sum + (g.totalCompensationCost || 0), 0);

    return grades.map(grade => {
      const midpoint = grade.salaryMidpoint || 0;
      const avgActual = grade.averageActualSalary || 0;
      const compaRatio = midpoint > 0 ? (avgActual / midpoint) * 100 : 0;
      const budgetShare = totalBudget > 0 
        ? ((grade.totalCompensationCost || 0) / totalBudget * 100).toFixed(2) + '%'
        : 'N/A';

      return {
        id: grade.id,
        code: grade.gradeCode,
        name: grade.gradeName,
        headcount: grade.currentHeadcount,
        budgetedHeadcount: grade.budgetedHeadcount,
        vacancies: grade.vacantPositions,
        avgActualSalary: avgActual,
        salaryMidpoint: midpoint,
        compaRatio: Math.round(compaRatio * 100) / 100,
        totalCompCost: grade.totalCompensationCost,
        budgetShare,
        marketPositioning: grade.marketPositioning,
        lastMarketReview: grade.lastMarketReview,
      };
    });
  }

  async getCareerProgression(groupCompanyId?: string): Promise<any> {
    const grades = await this.findAll(groupCompanyId);

    const buildCareerPath = (grade: Grade): any => {
      const nextGrade = grade.nextGradeId 
        ? grades.find(g => g.id === grade.nextGradeId)
        : null;

      return {
        current: {
          id: grade.id,
          code: grade.gradeCode,
          name: grade.gradeName,
          level: grade.gradeLevel,
          minYears: grade.minimumYearsInGrade,
          typicalYears: grade.typicalYearsInGrade,
          avgTimeInGrade: grade.averageTimeInGrade,
          promotionRate: grade.promotionRate,
          promotionIncrease: grade.typicalPromotionIncrease,
        },
        next: nextGrade ? {
          id: nextGrade.id,
          code: nextGrade.gradeCode,
          name: nextGrade.gradeName,
          level: nextGrade.gradeLevel,
        } : null,
        promotionCriteria: grade.promotionCriteria || [],
        requiredCompetencies: grade.requiredCompetencies || [],
      };
    };

    return grades.map(grade => buildCareerPath(grade));
  }

  async getWorkforcePlan(groupCompanyId?: string): Promise<any> {
    const grades = await this.findAll(groupCompanyId);

    const totalCurrent = grades.reduce((sum, g) => sum + (g.currentHeadcount || 0), 0);
    const totalBudgeted = grades.reduce((sum, g) => sum + (g.budgetedHeadcount || 0), 0);
    const totalVacant = grades.reduce((sum, g) => sum + (g.vacantPositions || 0), 0);

    return {
      summary: {
        totalCurrent,
        totalBudgeted,
        totalVacant,
        utilizationRate: totalBudgeted > 0 
          ? ((totalCurrent / totalBudgeted) * 100).toFixed(2) + '%'
          : 'N/A',
      },
      byGrade: grades.map(grade => ({
        id: grade.id,
        code: grade.gradeCode,
        name: grade.gradeName,
        level: grade.gradeLevel,
        current: grade.currentHeadcount,
        budgeted: grade.budgetedHeadcount,
        vacant: grade.vacantPositions,
        utilizationRate: grade.budgetedHeadcount > 0
          ? (((grade.currentHeadcount || 0) / grade.budgetedHeadcount) * 100).toFixed(2) + '%'
          : 'N/A',
        attrition: grade.attritionRate,
        avgPerformance: grade.averagePerformanceRating,
        successors: grade.successorCount,
      })),
    };
  }

  async getTalentAnalytics(groupCompanyId?: string): Promise<any> {
    const grades = await this.findAll(groupCompanyId);

    return grades.map(grade => ({
      id: grade.id,
      code: grade.gradeCode,
      name: grade.gradeName,
      headcount: grade.currentHeadcount,
      performance: {
        avgRating: grade.averagePerformanceRating,
        attritionRate: grade.attritionRate,
        promotionRate: grade.promotionRate,
        avgTimeInGrade: grade.averageTimeInGrade,
      },
      succession: {
        successorCount: grade.successorCount,
        readyNowRatio: grade.successorCount && grade.currentHeadcount
          ? ((grade.successorCount / grade.currentHeadcount) * 100).toFixed(2) + '%'
          : 'N/A',
      },
      requirements: {
        education: grade.educationRequirements || [],
        certifications: grade.certificationRequirements || [],
        minExperience: grade.minimumExperience,
        preferredExperience: grade.preferredExperience,
      },
    }));
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateGradeDto }>): Promise<Grade[]> {
    const results: Grade[] = [];

    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }

    return results;
  }
}
