import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from '../entities/position.entity';
import { CreatePositionDto, UpdatePositionDto } from '../dto/position.dto';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
  ) {}

  async create(createDto: CreatePositionDto): Promise<Position> {
    const existing = await this.positionRepository.findOne({
      where: { positionCode: createDto.positionCode },
    });

    if (existing) {
      throw new BadRequestException(`Position with code ${createDto.positionCode} already exists`);
    }

    const position = this.positionRepository.create(createDto);
    return await this.positionRepository.save(position);
  }

  async findAll(groupCompanyId?: string, search?: string, positionStatus?: string): Promise<Position[]> {
    const queryBuilder = this.positionRepository.createQueryBuilder('position')
      .leftJoinAndSelect('position.groupCompany', 'groupCompany')
      .leftJoinAndSelect('position.designationName', 'designationName');

    if (groupCompanyId) {
      queryBuilder.andWhere('position.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(position.positionTitle ILIKE :search OR position.positionCode ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (positionStatus) {
      queryBuilder.andWhere('position.positionStatus = :positionStatus', { positionStatus });
    }

    return await queryBuilder
      .orderBy('position.sortOrder', 'ASC')
      .addOrderBy('position.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['groupCompany', 'designationName'],
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return position;
  }

  async update(id: string, updateDto: UpdatePositionDto): Promise<Position> {
    const position = await this.findOne(id);

    if (updateDto.positionCode && updateDto.positionCode !== position.positionCode) {
      const existing = await this.positionRepository.findOne({
        where: { positionCode: updateDto.positionCode },
      });

      if (existing) {
        throw new BadRequestException(`Position with code ${updateDto.positionCode} already exists`);
      }
    }

    Object.assign(position, updateDto);
    return await this.positionRepository.save(position);
  }

  async remove(id: string): Promise<void> {
    const position = await this.findOne(id);
    await this.positionRepository.remove(position);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const queryBuilder = this.positionRepository.createQueryBuilder('position');

    if (groupCompanyId) {
      queryBuilder.where('position.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const positions = await queryBuilder.getMany();

    const totalPositions = positions.length;
    const activePositions = positions.filter(p => p.isActive).length;
    const vacantPositions = positions.filter(p => p.isVacant).length;
    const filledPositions = positions.filter(p => !p.isVacant && p.isActive).length;
    const frozenPositions = positions.filter(p => p.isFrozen).length;
    const budgetedPositions = positions.filter(p => p.isBudgeted).length;

    const byStatus = positions.reduce((acc, p) => {
      const status = p.positionStatus || 'Unclassified';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalHeadcount = positions.reduce((sum, p) => sum + (p.headcountAllocation || 0), 0);
    const totalBudget = positions.reduce((sum, p) => sum + (p.totalBudgetedCost || 0), 0);

    return {
      totalPositions,
      activePositions,
      vacantPositions,
      filledPositions,
      frozenPositions,
      budgetedPositions,
      byStatus,
      totalHeadcount,
      totalBudget,
      essentialPositions: positions.filter(p => p.isEssential).length,
      atRiskPositions: positions.filter(p => p.isAtRisk).length,
    };
  }

  async getHeadcountSummary(groupCompanyId?: string): Promise<any> {
    const positions = await this.findAll(groupCompanyId);

    const totalHeadcount = positions.reduce((sum, p) => sum + (p.headcountAllocation || 0), 0);
    const filled = positions.filter(p => !p.isVacant).length;
    const vacant = positions.filter(p => p.isVacant).length;

    return {
      totalHeadcount,
      totalPositions: positions.length,
      filled,
      vacant,
      fillRate: positions.length > 0 ? (filled / positions.length) * 100 : 0,
      byDepartment: this.groupBy(positions, 'departmentId'),
      byLocation: this.groupBy(positions, 'locationId'),
      byType: this.groupBy(positions, 'positionType'),
    };
  }

  async getBudgetSummary(groupCompanyId?: string): Promise<any> {
    const positions = await this.findAll(groupCompanyId);

    const totalBudgeted = positions.reduce((sum, p) => sum + (p.totalBudgetedCost || 0), 0);
    const totalActual = positions.reduce((sum, p) => sum + (p.totalActualCost || 0), 0);
    const variance = totalBudgeted - totalActual;

    return {
      totalBudgeted,
      totalActual,
      variance,
      variancePercentage: totalBudgeted > 0 ? (variance / totalBudgeted) * 100 : 0,
      budgetedPositions: positions.filter(p => p.isBudgeted).length,
      approvedBudget: positions.filter(p => p.budgetStatus === 'Approved').length,
    };
  }

  async getSuccessionRisk(groupCompanyId?: string): Promise<any> {
    const positions = await this.findAll(groupCompanyId);

    return positions.map(p => ({
      id: p.id,
      code: p.positionCode,
      title: p.positionTitle,
      risk: {
        vacancyRisk: p.vacancyRiskScore,
        successionRisk: p.successionRiskScore,
        isAtRisk: p.isAtRisk,
        businessImpact: p.businessImpact,
      },
      succession: {
        readiness: p.successionReadiness,
        candidates: p.successorCandidates?.length || 0,
        hasKeySuccessors: (p.keySuccessors?.length || 0) > 0,
        hasEmergencyPlan: (p.emergencySuccessors?.length || 0) > 0,
      },
    }));
  }

  async getRecruitmentPipeline(groupCompanyId?: string): Promise<any> {
    const positions = await this.findAll(groupCompanyId);

    const vacant = positions.filter(p => p.isVacant);

    return {
      totalVacant: vacant.length,
      withRequisition: vacant.filter(p => p.requisitionId).length,
      avgDaysVacant: vacant.reduce((sum, p) => sum + (p.daysVacant || 0), 0) / (vacant.length || 1),
      avgTimeToFill: positions.reduce((sum, p) => sum + (p.historicalFillTime || 0), 0) / (positions.length || 1),
      byStatus: vacant.reduce((acc, p) => {
        const status = p.requisitionStatus || 'No Requisition';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  async getOrganizationalStructure(groupCompanyId?: string): Promise<any> {
    const positions = await this.findAll(groupCompanyId);

    const buildHierarchy = (parentId: string | null) => {
      return positions
        .filter(p => p.reportsToPositionId === parentId)
        .map(p => ({
          id: p.id,
          code: p.positionCode,
          title: p.positionTitle,
          incumbent: p.incumbentName,
          directReports: p.directReportsCount,
          children: buildHierarchy(p.id),
        }));
    };

    return buildHierarchy(null);
  }

  async getComplianceReport(groupCompanyId?: string): Promise<any> {
    const positions = await this.findAll(groupCompanyId);

    return positions.map(p => ({
      id: p.id,
      code: p.positionCode,
      title: p.positionTitle,
      compliance: {
        requirements: p.complianceRequirements || [],
        regulatory: p.regulatoryRequirements || [],
        backgroundCheck: p.backgroundCheckLevel,
        requiresLicensing: p.requiresLicensing,
        licenses: p.licenses || [],
        securityClearance: p.requiresSecurityClearance,
        clearances: p.securityClearances || [],
      },
    }));
  }

  async getMarketAnalysis(groupCompanyId?: string): Promise<any> {
    const positions = await this.findAll(groupCompanyId);

    return positions.map(p => ({
      id: p.id,
      code: p.positionCode,
      title: p.positionTitle,
      market: {
        medianSalary: p.marketMedianSalary,
        salaryRange: {
          min: p.minSalary,
          mid: p.midSalary,
          max: p.maxSalary,
        },
        competitiveIndex: p.competitiveIndex,
        demand: p.marketDemand,
        talentAvailability: p.talentAvailability,
        lastReview: p.lastMarketReview,
      },
    }));
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdatePositionDto }>): Promise<Position[]> {
    const results: Position[] = [];

    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }

    return results;
  }

  private groupBy(items: any[], key: string): any {
    return items.reduce((acc, item) => {
      const group = item[key] || 'Unassigned';
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
  }
}
