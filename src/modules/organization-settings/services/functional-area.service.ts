import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionalArea } from '../entities/functional-area.entity';
import { CreateFunctionalAreaDto, UpdateFunctionalAreaDto } from '../dto/functional-area.dto';

@Injectable()
export class FunctionalAreaService {
  constructor(
    @InjectRepository(FunctionalArea)
    private functionalAreaRepository: Repository<FunctionalArea>,
  ) {}

  async create(createFunctionalAreaDto: CreateFunctionalAreaDto): Promise<FunctionalArea> {
    const existing = await this.functionalAreaRepository.findOne({
      where: { areaCode: createFunctionalAreaDto.areaCode },
    });

    if (existing) {
      throw new BadRequestException(`Functional area with code ${createFunctionalAreaDto.areaCode} already exists`);
    }

    if (createFunctionalAreaDto.parentAreaId) {
      const parent = await this.functionalAreaRepository.findOne({
        where: { id: createFunctionalAreaDto.parentAreaId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent area with ID ${createFunctionalAreaDto.parentAreaId} not found`);
      }
    }

    const functionalArea = this.functionalAreaRepository.create(createFunctionalAreaDto);
    return await this.functionalAreaRepository.save(functionalArea);
  }

  async findAll(groupCompanyId?: string, search?: string, isActive?: boolean): Promise<FunctionalArea[]> {
    const queryBuilder = this.functionalAreaRepository.createQueryBuilder('area')
      .leftJoinAndSelect('area.groupCompany', 'groupCompany');

    if (groupCompanyId) {
      queryBuilder.andWhere('area.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(area.areaName ILIKE :search OR area.areaCode ILIKE :search OR area.businessFunction ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('area.isActive = :isActive', { isActive });
    }

    return await queryBuilder.orderBy('area.areaLevel', 'ASC').addOrderBy('area.areaName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<FunctionalArea> {
    const functionalArea = await this.functionalAreaRepository.findOne({
      where: { id },
      relations: ['groupCompany'],
    });

    if (!functionalArea) {
      throw new NotFoundException(`Functional area with ID ${id} not found`);
    }

    return functionalArea;
  }

  async update(id: string, updateFunctionalAreaDto: UpdateFunctionalAreaDto): Promise<FunctionalArea> {
    const functionalArea = await this.findOne(id);

    if (updateFunctionalAreaDto.areaCode && updateFunctionalAreaDto.areaCode !== functionalArea.areaCode) {
      const existing = await this.functionalAreaRepository.findOne({
        where: { areaCode: updateFunctionalAreaDto.areaCode },
      });

      if (existing) {
        throw new BadRequestException(`Functional area with code ${updateFunctionalAreaDto.areaCode} already exists`);
      }
    }

    if (updateFunctionalAreaDto.parentAreaId) {
      if (updateFunctionalAreaDto.parentAreaId === id) {
        throw new BadRequestException('An area cannot be its own parent');
      }

      const parent = await this.functionalAreaRepository.findOne({
        where: { id: updateFunctionalAreaDto.parentAreaId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent area with ID ${updateFunctionalAreaDto.parentAreaId} not found`);
      }

      const isCircular = await this.checkCircularReference(id, updateFunctionalAreaDto.parentAreaId);
      if (isCircular) {
        throw new BadRequestException('Circular reference detected. Cannot set this parent.');
      }
    }

    Object.assign(functionalArea, updateFunctionalAreaDto);
    return await this.functionalAreaRepository.save(functionalArea);
  }

  async remove(id: string): Promise<void> {
    const functionalArea = await this.findOne(id);

    const children = await this.functionalAreaRepository.find({
      where: { parentAreaId: id },
    });

    if (children.length > 0) {
      throw new BadRequestException(`Cannot delete area with ${children.length} child areas`);
    }

    await this.functionalAreaRepository.remove(functionalArea);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const queryBuilder = this.functionalAreaRepository.createQueryBuilder('area');

    if (groupCompanyId) {
      queryBuilder.where('area.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const areas = await queryBuilder.getMany();

    const totalAreas = areas.length;
    const activeAreas = areas.filter(a => a.isActive).length;
    const criticalAreas = areas.filter(a => a.isCritical).length;
    const strategicAreas = areas.filter(a => a.isStrategic).length;
    const totalHeadcount = areas.reduce((sum, a) => sum + (a.headcountCurrent || 0), 0);
    const totalBudget = areas.reduce((sum, a) => sum + (a.annualBudget || 0), 0);
    const avgEfficiency = areas.length > 0 
      ? areas.reduce((sum, a) => sum + (a.efficiencyScore || 0), 0) / areas.length 
      : 0;

    const byType = areas.reduce((acc, a) => {
      const type = a.areaType || 'Unclassified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const byFunction = areas.reduce((acc, a) => {
      const func = a.businessFunction || 'Unclassified';
      acc[func] = (acc[func] || 0) + 1;
      return acc;
    }, {});

    return {
      totalAreas,
      activeAreas,
      criticalAreas,
      strategicAreas,
      totalHeadcount,
      totalBudget,
      avgEfficiency: Math.round(avgEfficiency * 100) / 100,
      byType,
      byFunction,
      coreAreas: areas.filter(a => a.isCore).length,
      revenueAreas: areas.filter(a => a.isRevenue).length,
      supportAreas: areas.filter(a => a.isSupport).length,
    };
  }

  async getHierarchy(groupCompanyId?: string): Promise<any[]> {
    const areas = await this.findAll(groupCompanyId);

    const buildTree = (parentId: string | null): any[] => {
      return areas
        .filter(area => area.parentAreaId === parentId)
        .map(area => ({
          ...area,
          children: buildTree(area.id),
        }));
    };

    return buildTree(null);
  }

  async getPerformanceAnalysis(groupCompanyId?: string): Promise<any> {
    const queryBuilder = this.functionalAreaRepository.createQueryBuilder('area');

    if (groupCompanyId) {
      queryBuilder.where('area.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const areas = await queryBuilder.getMany();

    return areas.map(area => ({
      id: area.id,
      name: area.areaName,
      code: area.areaCode,
      type: area.areaType,
      function: area.businessFunction,
      headcount: area.headcountCurrent,
      budget: area.annualBudget,
      actualSpend: area.actualSpend,
      budgetUtilization: area.annualBudget && area.actualSpend 
        ? ((area.actualSpend / area.annualBudget) * 100).toFixed(2) + '%'
        : 'N/A',
      efficiencyScore: area.efficiencyScore,
      productivityScore: area.productivityScore,
      qualityScore: area.qualityScore,
      customerSatisfaction: area.customerSatisfactionScore,
      performanceTargets: area.performanceTargets,
    }));
  }

  async getCapabilityMatrix(groupCompanyId?: string): Promise<any> {
    const areas = await this.findAll(groupCompanyId);

    return areas.map(area => ({
      id: area.id,
      name: area.areaName,
      code: area.areaCode,
      coreCapabilities: area.coreCapabilities || [],
      requiredSkills: area.requiredSkills || [],
      certifications: area.certifications || [],
      toolsUsed: area.toolsUsed || [],
      systemsManaged: area.systemsManaged || [],
      technologyStack: area.technologyStack || [],
      headcount: area.headcountCurrent,
      automationPotential: area.automationPotential,
      digitalizationStatus: area.digitalizationStatus,
    }));
  }

  async getDigitalTransformation(groupCompanyId?: string): Promise<any> {
    const areas = await this.findAll(groupCompanyId);

    const byDigitalization = areas.reduce((acc, area) => {
      const status = area.digitalizationStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const byAutomation = areas.reduce((acc, area) => {
      const potential = area.automationPotential || 'Unknown';
      acc[potential] = (acc[potential] || 0) + 1;
      return acc;
    }, {});

    const transformationProjects = areas
      .filter(area => area.transformationRoadmap && area.transformationRoadmap.length > 0)
      .flatMap(area => 
        (area.transformationRoadmap || []).map(project => ({
          areaName: area.areaName,
          initiative: project.initiative,
          timeline: project.timeline,
          status: project.status,
        }))
      );

    return {
      overview: {
        totalAreas: areas.length,
        byDigitalization,
        byAutomation,
      },
      transformationProjects,
      highPotential: areas.filter(a => a.automationPotential === 'High').map(a => ({
        name: a.areaName,
        headcount: a.headcountCurrent,
        automationPotential: a.automationPotential,
      })),
    };
  }

  async getRiskCompliance(groupCompanyId?: string): Promise<any> {
    const areas = await this.findAll(groupCompanyId);

    const byRiskLevel = areas.reduce((acc, area) => {
      const risk = area.riskLevel || 'Unknown';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});

    const areasRequiringAudit = areas.filter(a => a.auditRequired).length;
    const overdueAudits = areas.filter(a => 
      a.nextAuditDate && new Date(a.nextAuditDate) < new Date()
    ).length;

    return {
      overview: {
        totalAreas: areas.length,
        byRiskLevel,
        areasRequiringAudit,
        overdueAudits,
      },
      criticalRisk: areas.filter(a => a.riskLevel === 'Critical').map(a => ({
        name: a.areaName,
        complianceRequirements: a.complianceRequirements || [],
        regulatoryBodies: a.regulatoryBodies || [],
        lastAuditDate: a.lastAuditDate,
        nextAuditDate: a.nextAuditDate,
      })),
    };
  }

  async getCostAnalysis(groupCompanyId?: string): Promise<any> {
    const areas = await this.findAll(groupCompanyId);

    const totalBudget = areas.reduce((sum, a) => sum + (a.annualBudget || 0), 0);
    const totalSpend = areas.reduce((sum, a) => sum + (a.actualSpend || 0), 0);
    const totalHeadcount = areas.reduce((sum, a) => sum + (a.headcountCurrent || 0), 0);

    return areas.map(area => ({
      id: area.id,
      name: area.areaName,
      code: area.areaCode,
      budget: area.annualBudget,
      actualSpend: area.actualSpend,
      variance: area.annualBudget && area.actualSpend 
        ? area.annualBudget - area.actualSpend 
        : null,
      utilizationRate: area.annualBudget && area.actualSpend
        ? ((area.actualSpend / area.annualBudget) * 100).toFixed(2) + '%'
        : 'N/A',
      headcount: area.headcountCurrent,
      costPerEmployee: area.costPerEmployee,
      costBreakdown: area.costBreakdown || [],
      budgetPercentage: totalBudget > 0 
        ? ((area.annualBudget || 0) / totalBudget * 100).toFixed(2) + '%'
        : 'N/A',
    }));
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateFunctionalAreaDto }>): Promise<FunctionalArea[]> {
    const results: FunctionalArea[] = [];

    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }

    return results;
  }

  async checkCircularReference(areaId: string, newParentId: string): Promise<boolean> {
    let currentId = newParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === areaId) {
        return true;
      }

      if (visited.has(currentId)) {
        break;
      }

      visited.add(currentId);

      const parent = await this.functionalAreaRepository.findOne({
        where: { id: currentId },
      });

      if (!parent || !parent.parentAreaId) {
        break;
      }

      currentId = parent.parentAreaId;
    }

    return false;
  }
}
