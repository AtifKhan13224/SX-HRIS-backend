import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, In } from 'typeorm';
import { RoleCategory } from '../entities/role-category.entity';
import { CreateRoleCategoryDto, UpdateRoleCategoryDto } from '../dto/role-category.dto';

@Injectable()
export class RoleCategoryService {
  constructor(
    @InjectRepository(RoleCategory)
    private roleCategoryRepository: Repository<RoleCategory>,
  ) {}

  async create(createRoleCategoryDto: CreateRoleCategoryDto): Promise<RoleCategory> {
    // Check for duplicate category code
    const existing = await this.roleCategoryRepository.findOne({
      where: { categoryCode: createRoleCategoryDto.categoryCode },
    });

    if (existing) {
      throw new BadRequestException(`Role category with code ${createRoleCategoryDto.categoryCode} already exists`);
    }

    // If parent category is specified, verify it exists
    if (createRoleCategoryDto.parentCategoryId) {
      const parent = await this.roleCategoryRepository.findOne({
        where: { id: createRoleCategoryDto.parentCategoryId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${createRoleCategoryDto.parentCategoryId} not found`);
      }
    }

    const roleCategory = this.roleCategoryRepository.create(createRoleCategoryDto);
    return await this.roleCategoryRepository.save(roleCategory);
  }

  async findAll(groupCompanyId?: string): Promise<RoleCategory[]> {
    const where: any = { isActive: true };
    
    if (groupCompanyId) {
      where.groupCompanyId = groupCompanyId;
    }

    return await this.roleCategoryRepository.find({
      where,
      relations: ['groupCompany'],
      order: { categoryLevel: 'ASC', categoryName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RoleCategory> {
    const roleCategory = await this.roleCategoryRepository.findOne({
      where: { id },
      relations: ['groupCompany'],
    });

    if (!roleCategory) {
      throw new NotFoundException(`Role category with ID ${id} not found`);
    }

    return roleCategory;
  }

  async update(id: string, updateRoleCategoryDto: UpdateRoleCategoryDto): Promise<RoleCategory> {
    const roleCategory = await this.findOne(id);

    // If updating category code, check for duplicates
    if (updateRoleCategoryDto.categoryCode && updateRoleCategoryDto.categoryCode !== roleCategory.categoryCode) {
      const existing = await this.roleCategoryRepository.findOne({
        where: { categoryCode: updateRoleCategoryDto.categoryCode },
      });

      if (existing) {
        throw new BadRequestException(`Role category with code ${updateRoleCategoryDto.categoryCode} already exists`);
      }
    }

    // If updating parent, verify it exists and prevent circular references
    if (updateRoleCategoryDto.parentCategoryId) {
      if (updateRoleCategoryDto.parentCategoryId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }

      const parent = await this.roleCategoryRepository.findOne({
        where: { id: updateRoleCategoryDto.parentCategoryId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${updateRoleCategoryDto.parentCategoryId} not found`);
      }

      // Check for circular reference
      const isCircular = await this.checkCircularReference(id, updateRoleCategoryDto.parentCategoryId);
      if (isCircular) {
        throw new BadRequestException('Circular reference detected. Cannot set this parent.');
      }
    }

    Object.assign(roleCategory, updateRoleCategoryDto);
    return await this.roleCategoryRepository.save(roleCategory);
  }

  async remove(id: string): Promise<void> {
    const roleCategory = await this.findOne(id);

    // Check if any categories reference this as parent
    const children = await this.roleCategoryRepository.find({
      where: { parentCategoryId: id },
    });

    if (children.length > 0) {
      throw new BadRequestException(`Cannot delete category with ${children.length} child categories`);
    }

    await this.roleCategoryRepository.remove(roleCategory);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const where: any = { isActive: true };
    
    if (groupCompanyId) {
      where.groupCompanyId = groupCompanyId;
    }

    const categories = await this.roleCategoryRepository.find({ where });

    const totalCategories = categories.length;
    const totalRoles = categories.reduce((sum, cat) => sum + (cat.roleCountCurrent || 0), 0);
    const totalHeadcount = categories.reduce((sum, cat) => sum + (cat.headcountCurrent || 0), 0);
    const openPositions = categories.reduce((sum, cat) => sum + (cat.openPositions || 0), 0);
    const avgTurnover = categories.length > 0
      ? categories.reduce((sum, cat) => sum + (cat.turnoverRate || 0), 0) / categories.length
      : 0;
    const avgRetention = categories.length > 0
      ? categories.reduce((sum, cat) => sum + (cat.retentionRate || 0), 0) / categories.length
      : 0;
    const criticalRoles = categories.filter(cat => cat.isCritical).length;
    const strategicRoles = categories.filter(cat => cat.isStrategic).length;
    const leadershipRoles = categories.filter(cat => cat.isLeadership).length;

    const byClassification = categories.reduce((acc, cat) => {
      const classification = cat.roleClassification || 'Unclassified';
      acc[classification] = (acc[classification] || 0) + 1;
      return acc;
    }, {});

    const bySeniority = categories.reduce((acc, cat) => {
      const seniority = cat.seniorityLevel || 'Unspecified';
      acc[seniority] = (acc[seniority] || 0) + 1;
      return acc;
    }, {});

    const byManagementLevel = categories.reduce((acc, cat) => {
      const level = cat.managementLevel || 'Unspecified';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCategories,
      totalRoles,
      totalHeadcount,
      openPositions,
      avgTurnover: Math.round(avgTurnover * 100) / 100,
      avgRetention: Math.round(avgRetention * 100) / 100,
      criticalRoles,
      strategicRoles,
      leadershipRoles,
      byClassification,
      bySeniority,
      byManagementLevel,
    };
  }

  async getHierarchy(groupCompanyId?: string): Promise<any[]> {
    const where: any = { isActive: true };
    
    if (groupCompanyId) {
      where.groupCompanyId = groupCompanyId;
    }

    const categories = await this.roleCategoryRepository.find({ where });

    // Build hierarchy tree
    const buildTree = (parentId: string | null): any[] => {
      return categories
        .filter(cat => cat.parentCategoryId === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat.id),
        }));
    };

    return buildTree(null);
  }

  async getCareerPath(categoryId: string): Promise<any> {
    const category = await this.findOne(categoryId);

    if (!category.careerPath) {
      return null;
    }

    // Get related categories for career path
    const pathRoles = [
      category.careerPath.previousRole,
      category.careerPath.nextRole,
      ...(category.careerPath.alternativePaths || []),
    ].filter(Boolean);

    const relatedCategories = await this.roleCategoryRepository.find({
      where: {
        categoryName: In(pathRoles),
        isActive: true,
      },
    });

    return {
      currentCategory: {
        id: category.id,
        name: category.categoryName,
        code: category.categoryCode,
        level: category.categoryLevel,
        seniorityLevel: category.seniorityLevel,
      },
      careerPath: {
        previousRole: category.careerPath.previousRole,
        currentRole: category.careerPath.currentRole,
        nextRole: category.careerPath.nextRole,
        alternativePaths: category.careerPath.alternativePaths,
      },
      relatedCategories: relatedCategories.map(cat => ({
        id: cat.id,
        name: cat.categoryName,
        code: cat.categoryCode,
        level: cat.categoryLevel,
        seniorityLevel: cat.seniorityLevel,
        salaryRange: {
          min: cat.salaryRangeMin,
          max: cat.salaryRangeMax,
          currency: cat.salaryCurrency,
        },
      })),
    };
  }

  async getSuccessionPlan(categoryId: string): Promise<any> {
    const category = await this.findOne(categoryId);

    return {
      categoryInfo: {
        id: category.id,
        name: category.categoryName,
        code: category.categoryCode,
        isLeadership: category.isLeadership,
        isCritical: category.isCritical,
      },
      succession: {
        benchStrength: category.successionBenchStrength,
        highPotentialCount: category.highPotentialCount,
        avgPerformanceRating: category.avgPerformanceRating,
        currentHeadcount: category.headcountCurrent,
        budgetedHeadcount: category.headcountBudgeted,
      },
      metrics: {
        turnoverRate: category.turnoverRate,
        retentionRate: category.retentionRate,
        internalFillRate: category.internalFillRate,
        avgTimeToFill: category.avgTimeToFill,
      },
    };
  }

  async getCompensationAnalysis(groupCompanyId?: string): Promise<any[]> {
    const where: any = { isActive: true };
    
    if (groupCompanyId) {
      where.groupCompanyId = groupCompanyId;
    }

    const categories = await this.roleCategoryRepository.find({
      where,
      order: { seniorityLevel: 'DESC', salaryRangeMax: 'DESC' },
    });

    return categories.map(cat => ({
      id: cat.id,
      name: cat.categoryName,
      code: cat.categoryCode,
      classification: cat.roleClassification,
      seniorityLevel: cat.seniorityLevel,
      managementLevel: cat.managementLevel,
      compensationGrade: {
        min: cat.compensationGradeMin,
        max: cat.compensationGradeMax,
      },
      salaryRange: {
        min: cat.salaryRangeMin,
        max: cat.salaryRangeMax,
        currency: cat.salaryCurrency,
        midpoint: cat.salaryRangeMin && cat.salaryRangeMax
          ? (cat.salaryRangeMin + cat.salaryRangeMax) / 2
          : null,
      },
      headcount: cat.headcountCurrent,
    }));
  }

  async getTalentAnalytics(groupCompanyId?: string): Promise<any> {
    const where: any = { isActive: true };
    
    if (groupCompanyId) {
      where.groupCompanyId = groupCompanyId;
    }

    const categories = await this.roleCategoryRepository.find({ where });

    const criticalRoles = categories.filter(cat => cat.isCritical);
    const strategicRoles = categories.filter(cat => cat.isStrategic);
    const leadershipRoles = categories.filter(cat => cat.isLeadership);

    const highTurnover = categories.filter(cat => (cat.turnoverRate || 0) > 15);
    const lowRetention = categories.filter(cat => (cat.retentionRate || 0) < 80);
    const weakSuccession = categories.filter(cat => (cat.successionBenchStrength || 0) < 2);
    const highAutomationRisk = categories.filter(cat => cat.automationRisk === 'High');
    const scarceTalent = categories.filter(cat => cat.marketAvailability === 'Scarce' || cat.marketAvailability === 'Limited');

    return {
      overview: {
        totalCategories: categories.length,
        criticalRoles: criticalRoles.length,
        strategicRoles: strategicRoles.length,
        leadershipRoles: leadershipRoles.length,
      },
      riskMetrics: {
        highTurnover: {
          count: highTurnover.length,
          categories: highTurnover.map(cat => ({ name: cat.categoryName, rate: cat.turnoverRate })),
        },
        lowRetention: {
          count: lowRetention.length,
          categories: lowRetention.map(cat => ({ name: cat.categoryName, rate: cat.retentionRate })),
        },
        weakSuccession: {
          count: weakSuccession.length,
          categories: weakSuccession.map(cat => ({ name: cat.categoryName, strength: cat.successionBenchStrength })),
        },
      },
      futureReadiness: {
        highAutomationRisk: highAutomationRisk.length,
        scarceTalent: scarceTalent.length,
        growingDemand: categories.filter(cat => cat.futureDemandTrend === 'Growing' || cat.futureDemandTrend === 'High Growth').length,
      },
      diversityMetrics: {
        categoriesWithTargets: categories.filter(cat => cat.diversityTargets && cat.diversityTargets.length > 0).length,
        esgAligned: categories.filter(cat => cat.esgAlignment && cat.esgAlignment.length > 0).length,
      },
    };
  }

  async getWorkforceDistribution(groupCompanyId?: string): Promise<any> {
    const where: any = { isActive: true };
    
    if (groupCompanyId) {
      where.groupCompanyId = groupCompanyId;
    }

    const categories = await this.roleCategoryRepository.find({ where });

    const byEmploymentType = categories.reduce((acc, cat) => {
      const type = cat.employmentType || 'Unspecified';
      acc[type] = {
        count: (acc[type]?.count || 0) + 1,
        headcount: (acc[type]?.headcount || 0) + (cat.headcountCurrent || 0),
      };
      return acc;
    }, {});

    const byWorkLocation = categories.reduce((acc, cat) => {
      const location = cat.workLocationType || 'Unspecified';
      acc[location] = {
        count: (acc[location]?.count || 0) + 1,
        headcount: (acc[location]?.headcount || 0) + (cat.headcountCurrent || 0),
      };
      return acc;
    }, {});

    const flexibilityMetrics = {
      remoteEligible: categories.filter(cat => cat.remoteWorkEligible).length,
      hybridEligible: categories.filter(cat => cat.hybridWorkEligible).length,
      internationalEligible: categories.filter(cat => cat.internationalAssignmentEligible).length,
      relocationEligible: categories.filter(cat => cat.relocationEligible).length,
    };

    return {
      byEmploymentType,
      byWorkLocation,
      flexibilityMetrics,
      totalCategories: categories.length,
      totalHeadcount: categories.reduce((sum, cat) => sum + (cat.headcountCurrent || 0), 0),
    };
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateRoleCategoryDto }>): Promise<RoleCategory[]> {
    const results: RoleCategory[] = [];

    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }

    return results;
  }

  async checkCircularReference(categoryId: string, newParentId: string): Promise<boolean> {
    let currentId = newParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === categoryId) {
        return true; // Circular reference found
      }

      if (visited.has(currentId)) {
        break; // Break infinite loop
      }

      visited.add(currentId);

      const parent = await this.roleCategoryRepository.findOne({
        where: { id: currentId },
      });

      if (!parent || !parent.parentCategoryId) {
        break;
      }

      currentId = parent.parentCategoryId;
    }

    return false;
  }
}
