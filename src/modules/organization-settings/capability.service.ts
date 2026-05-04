import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Capability } from './entities/capability.entity';
import { CreateCapabilityDto, UpdateCapabilityDto } from './dto/capability.dto';

@Injectable()
export class CapabilityService {
  constructor(
    @InjectRepository(Capability)
    private capabilityRepository: Repository<Capability>,
  ) {}

  async create(createCapabilityDto: CreateCapabilityDto): Promise<Capability> {
    const capability = this.capabilityRepository.create(createCapabilityDto);
    
    // Calculate headcount gap
    if (capability.requiredHeadcount && capability.currentHeadcount) {
      capability.headcountGap = capability.requiredHeadcount - capability.currentHeadcount;
    }

    // Set hierarchy level
    if (createCapabilityDto.parentCapabilityId) {
      const parent = await this.capabilityRepository.findOne({
        where: { id: createCapabilityDto.parentCapabilityId },
      });
      if (parent) {
        capability.hierarchyLevel = parent.hierarchyLevel + 1;
        capability.hierarchyPath = parent.hierarchyPath
          ? `${parent.hierarchyPath} > ${capability.capabilityName}`
          : capability.capabilityName;
      }
    } else {
      capability.hierarchyLevel = 1;
      capability.hierarchyPath = capability.capabilityName;
    }

    return this.capabilityRepository.save(capability);
  }

  async findAll(filters?: {
    capabilityType?: string;
    capabilityCategory?: string;
    domain?: string;
    strategicImportance?: string;
    isCore?: boolean;
    isStrategic?: boolean;
    isActive?: boolean;
    lifecycleStage?: string;
  }): Promise<Capability[]> {
    const query = this.capabilityRepository.createQueryBuilder('capability');

    if (filters?.capabilityType) {
      query.andWhere('capability.capability_type = :type', { type: filters.capabilityType });
    }

    if (filters?.capabilityCategory) {
      query.andWhere('capability.capability_category = :category', { category: filters.capabilityCategory });
    }

    if (filters?.domain) {
      query.andWhere('capability.domain = :domain', { domain: filters.domain });
    }

    if (filters?.strategicImportance) {
      query.andWhere('capability.strategic_importance = :importance', { importance: filters.strategicImportance });
    }

    if (filters?.isCore !== undefined) {
      query.andWhere('capability.is_core = :isCore', { isCore: filters.isCore });
    }

    if (filters?.isStrategic !== undefined) {
      query.andWhere('capability.is_strategic = :isStrategic', { isStrategic: filters.isStrategic });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('capability.is_active = :isActive', { isActive: filters.isActive });
    }

    if (filters?.lifecycleStage) {
      query.andWhere('capability.lifecycle_stage = :stage', { stage: filters.lifecycleStage });
    }

    query.leftJoinAndSelect('capability.parentCapability', 'parent');
    query.leftJoinAndSelect('capability.subCapabilities', 'sub');
    query.orderBy('capability.capabilityName', 'ASC');

    return query.getMany();
  }

  async findOne(id: string): Promise<Capability> {
    const capability = await this.capabilityRepository.findOne({
      where: { id },
      relations: ['parentCapability', 'subCapabilities'],
    });

    if (!capability) {
      throw new NotFoundException(`Capability with ID ${id} not found`);
    }

    return capability;
  }

  async update(id: string, updateCapabilityDto: UpdateCapabilityDto): Promise<Capability> {
    const capability = await this.findOne(id);

    // Calculate headcount gap if headcount values are updated
    if (updateCapabilityDto.requiredHeadcount !== undefined || updateCapabilityDto.currentHeadcount !== undefined) {
      const required = updateCapabilityDto.requiredHeadcount ?? capability.requiredHeadcount;
      const current = updateCapabilityDto.currentHeadcount ?? capability.currentHeadcount;
      capability.headcountGap = required - current;
    }

    Object.assign(capability, updateCapabilityDto);
    return this.capabilityRepository.save(capability);
  }

  async remove(id: string): Promise<void> {
    const capability = await this.findOne(id);
    await this.capabilityRepository.remove(capability);
  }

  async toggleCore(id: string): Promise<Capability> {
    const capability = await this.findOne(id);
    capability.isCore = !capability.isCore;
    return this.capabilityRepository.save(capability);
  }

  async toggleStrategic(id: string): Promise<Capability> {
    const capability = await this.findOne(id);
    capability.isStrategic = !capability.isStrategic;
    return this.capabilityRepository.save(capability);
  }

  async toggleFutureCritical(id: string): Promise<Capability> {
    const capability = await this.findOne(id);
    capability.isFutureCritical = !capability.isFutureCritical;
    return this.capabilityRepository.save(capability);
  }

  async getTopLevelCapabilities(): Promise<Capability[]> {
    return this.capabilityRepository.find({
      where: { parentCapabilityId: null },
      relations: ['subCapabilities'],
      order: { capabilityName: 'ASC' },
    });
  }

  async getCapabilityHierarchy(id: string): Promise<Capability> {
    const capability = await this.findOne(id);
    const hierarchy = await this.buildHierarchy(capability);
    return hierarchy;
  }

  private async buildHierarchy(capability: Capability): Promise<Capability> {
    const subCapabilities = await this.capabilityRepository.find({
      where: { parentCapabilityId: capability.id },
      relations: ['subCapabilities'],
    });

    if (subCapabilities.length > 0) {
      capability.subCapabilities = await Promise.all(
        subCapabilities.map(sub => this.buildHierarchy(sub))
      );
    }

    return capability;
  }

  async getStats(): Promise<any> {
    const total = await this.capabilityRepository.count();
    const active = await this.capabilityRepository.count({ where: { isActive: true } });
    const inactive = await this.capabilityRepository.count({ where: { isActive: false } });
    const core = await this.capabilityRepository.count({ where: { isCore: true } });
    const strategic = await this.capabilityRepository.count({ where: { isStrategic: true } });
    const futureCritical = await this.capabilityRepository.count({ where: { isFutureCritical: true } });

    // Aggregate headcount
    const headcountData = await this.capabilityRepository
      .createQueryBuilder('capability')
      .select('SUM(capability.current_headcount)', 'totalHeadcount')
      .addSelect('SUM(capability.required_headcount)', 'requiredHeadcount')
      .addSelect('SUM(capability.headcount_gap)', 'totalGap')
      .getRawOne();

    // Group by type
    const byType = await this.capabilityRepository
      .createQueryBuilder('capability')
      .select('capability.capability_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('capability.capability_type IS NOT NULL')
      .groupBy('capability.capability_type')
      .getRawMany();

    // Group by category
    const byCategory = await this.capabilityRepository
      .createQueryBuilder('capability')
      .select('capability.capability_category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('capability.capability_category IS NOT NULL')
      .groupBy('capability.capability_category')
      .getRawMany();

    // Group by domain
    const byDomain = await this.capabilityRepository
      .createQueryBuilder('capability')
      .select('capability.domain', 'domain')
      .addSelect('COUNT(*)', 'count')
      .where('capability.domain IS NOT NULL')
      .groupBy('capability.domain')
      .getRawMany();

    // Group by lifecycle stage
    const byLifecycleStage = await this.capabilityRepository
      .createQueryBuilder('capability')
      .select('capability.lifecycle_stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .where('capability.lifecycle_stage IS NOT NULL')
      .groupBy('capability.lifecycle_stage')
      .getRawMany();

    // Group by strategic importance
    const byStrategicImportance = await this.capabilityRepository
      .createQueryBuilder('capability')
      .select('capability.strategic_importance', 'importance')
      .addSelect('COUNT(*)', 'count')
      .where('capability.strategic_importance IS NOT NULL')
      .groupBy('capability.strategic_importance')
      .getRawMany();

    // Group by market availability
    const byMarketAvailability = await this.capabilityRepository
      .createQueryBuilder('capability')
      .select('capability.market_availability', 'availability')
      .addSelect('COUNT(*)', 'count')
      .where('capability.market_availability IS NOT NULL')
      .groupBy('capability.market_availability')
      .getRawMany();

    // Average maturity levels
    const maturityData = await this.capabilityRepository
      .createQueryBuilder('capability')
      .select('AVG(capability.current_maturity_level)', 'avgCurrent')
      .addSelect('AVG(capability.target_maturity_level)', 'avgTarget')
      .getRawOne();

    // Investment metrics
    const investmentData = await this.capabilityRepository
      .createQueryBuilder('capability')
      .select('SUM(capability.investment_required)', 'totalInvestment')
      .addSelect('AVG(capability.roi_expected)', 'avgROI')
      .addSelect('SUM(capability.revenue_impact)', 'totalRevenueImpact')
      .addSelect('SUM(capability.cost_savings_potential)', 'totalCostSavings')
      .getRawOne();

    // Risk metrics
    const highRisk = await this.capabilityRepository.count({
      where: { riskLevel: 'Critical' },
    });
    const singlePointOfFailure = await this.capabilityRepository.count({
      where: { singlePointOfFailure: true },
    });
    const withoutSuccessionPlan = await this.capabilityRepository.count({
      where: { successionPlanExists: false },
    });

    return {
      total,
      active,
      inactive,
      core,
      strategic,
      futureCritical,
      totalHeadcount: parseInt(headcountData.totalHeadcount) || 0,
      requiredHeadcount: parseInt(headcountData.requiredHeadcount) || 0,
      totalGap: parseInt(headcountData.totalGap) || 0,
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: parseInt(item.count) }), {}),
      byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item.category]: parseInt(item.count) }), {}),
      byDomain: byDomain.reduce((acc, item) => ({ ...acc, [item.domain]: parseInt(item.count) }), {}),
      byLifecycleStage: byLifecycleStage.reduce((acc, item) => ({ ...acc, [item.stage]: parseInt(item.count) }), {}),
      byStrategicImportance: byStrategicImportance.reduce((acc, item) => ({ ...acc, [item.importance]: parseInt(item.count) }), {}),
      byMarketAvailability: byMarketAvailability.reduce((acc, item) => ({ ...acc, [item.availability]: parseInt(item.count) }), {}),
      avgCurrentMaturity: parseFloat(maturityData.avgCurrent) || 0,
      avgTargetMaturity: parseFloat(maturityData.avgTarget) || 0,
      totalInvestment: parseFloat(investmentData.totalInvestment) || 0,
      avgROI: parseFloat(investmentData.avgROI) || 0,
      totalRevenueImpact: parseFloat(investmentData.totalRevenueImpact) || 0,
      totalCostSavings: parseFloat(investmentData.totalCostSavings) || 0,
      highRisk,
      singlePointOfFailure,
      withoutSuccessionPlan,
    };
  }

  async getMaturityGapAnalysis(): Promise<any> {
    const capabilities = await this.capabilityRepository.find({
      where: { isActive: true },
      select: ['id', 'capabilityName', 'currentMaturityLevel', 'targetMaturityLevel', 'strategicImportance'],
    });

    return capabilities
      .filter(c => c.currentMaturityLevel && c.targetMaturityLevel)
      .map(c => ({
        id: c.id,
        name: c.capabilityName,
        currentLevel: c.currentMaturityLevel,
        targetLevel: c.targetMaturityLevel,
        gap: c.targetMaturityLevel - c.currentMaturityLevel,
        importance: c.strategicImportance,
      }))
      .sort((a, b) => b.gap - a.gap);
  }

  async getHeadcountGapAnalysis(): Promise<any> {
    const capabilities = await this.capabilityRepository.find({
      where: { isActive: true },
      select: ['id', 'capabilityName', 'currentHeadcount', 'requiredHeadcount', 'headcountGap', 'strategicImportance'],
    });

    return capabilities
      .filter(c => c.headcountGap !== 0)
      .map(c => ({
        id: c.id,
        name: c.capabilityName,
        current: c.currentHeadcount,
        required: c.requiredHeadcount,
        gap: c.headcountGap,
        gapPercentage: c.currentHeadcount > 0 ? ((c.headcountGap / c.currentHeadcount) * 100).toFixed(2) : 0,
        importance: c.strategicImportance,
      }))
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  }

  async getRiskAnalysis(): Promise<any> {
    const capabilities = await this.capabilityRepository.find({
      where: { isActive: true },
      select: ['id', 'capabilityName', 'riskLevel', 'singlePointOfFailure', 'successionPlanExists', 'strategicImportance'],
    });

    const highRiskCapabilities = capabilities.filter(c => 
      c.riskLevel === 'Critical' || c.singlePointOfFailure || !c.successionPlanExists
    );

    return highRiskCapabilities.map(c => ({
      id: c.id,
      name: c.capabilityName,
      riskLevel: c.riskLevel,
      singlePointOfFailure: c.singlePointOfFailure,
      hasSuccessionPlan: c.successionPlanExists,
      importance: c.strategicImportance,
      riskScore: this.calculateRiskScore(c),
    })).sort((a, b) => b.riskScore - a.riskScore);
  }

  private calculateRiskScore(capability: any): number {
    let score = 0;
    if (capability.riskLevel === 'Critical') score += 40;
    else if (capability.riskLevel === 'High') score += 30;
    else if (capability.riskLevel === 'Medium') score += 20;
    
    if (capability.singlePointOfFailure) score += 30;
    if (!capability.successionPlanExists) score += 30;
    
    return score;
  }

  async getInvestmentPriorities(): Promise<any> {
    const capabilities = await this.capabilityRepository.find({
      where: { isActive: true },
      select: ['id', 'capabilityName', 'investmentRequired', 'roiExpected', 'developmentPriority', 'strategicImportance'],
    });

    return capabilities
      .filter(c => c.investmentRequired && c.investmentRequired > 0)
      .map(c => ({
        id: c.id,
        name: c.capabilityName,
        investment: c.investmentRequired,
        roi: c.roiExpected || 0,
        priority: c.developmentPriority,
        importance: c.strategicImportance,
        priorityScore: this.calculatePriorityScore(c),
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }

  private calculatePriorityScore(capability: any): number {
    let score = 0;
    
    // Strategic importance weight
    if (capability.strategicImportance === 'Critical') score += 40;
    else if (capability.strategicImportance === 'High') score += 30;
    else if (capability.strategicImportance === 'Medium') score += 20;
    else if (capability.strategicImportance === 'Low') score += 10;
    
    // Development priority weight
    if (capability.developmentPriority === 'Urgent') score += 30;
    else if (capability.developmentPriority === 'High') score += 20;
    else if (capability.developmentPriority === 'Medium') score += 10;
    
    // ROI weight
    if (capability.roiExpected >= 100) score += 30;
    else if (capability.roiExpected >= 50) score += 20;
    else if (capability.roiExpected >= 25) score += 10;
    
    return score;
  }
}
