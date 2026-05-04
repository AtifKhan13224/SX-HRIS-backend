import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Designation } from '../entities/designation.entity';
import { CreateDesignationDto, UpdateDesignationDto } from '../dto/designation.dto';

@Injectable()
export class DesignationService {
  constructor(
    @InjectRepository(Designation)
    private designationRepository: Repository<Designation>,
  ) {}

  async create(createDto: CreateDesignationDto): Promise<Designation> {
    const existing = await this.designationRepository.findOne({
      where: { designationCode: createDto.designationCode },
    });

    if (existing) {
      throw new BadRequestException(`Designation with code ${createDto.designationCode} already exists`);
    }

    const designation = this.designationRepository.create(createDto);
    return await this.designationRepository.save(designation);
  }

  async findAll(groupCompanyId?: string, search?: string, status?: string): Promise<Designation[]> {
    const queryBuilder = this.designationRepository.createQueryBuilder('designation')
      .leftJoinAndSelect('designation.groupCompany', 'groupCompany')
      .leftJoinAndSelect('designation.designationName', 'designationName');

    if (groupCompanyId) {
      queryBuilder.andWhere('designation.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(designation.designationTitle ILIKE :search OR designation.designationCode ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('designation.status = :status', { status });
    }

    return await queryBuilder
      .orderBy('designation.sortOrder', 'ASC')
      .addOrderBy('designation.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Designation> {
    const designation = await this.designationRepository.findOne({
      where: { id },
      relations: ['groupCompany', 'designationName'],
    });

    if (!designation) {
      throw new NotFoundException(`Designation with ID ${id} not found`);
    }

    return designation;
  }

  async update(id: string, updateDto: UpdateDesignationDto): Promise<Designation> {
    const designation = await this.findOne(id);

    if (updateDto.designationCode && updateDto.designationCode !== designation.designationCode) {
      const existing = await this.designationRepository.findOne({
        where: { designationCode: updateDto.designationCode },
      });

      if (existing) {
        throw new BadRequestException(`Designation with code ${updateDto.designationCode} already exists`);
      }
    }

    Object.assign(designation, updateDto);
    return await this.designationRepository.save(designation);
  }

  async remove(id: string): Promise<void> {
    const designation = await this.findOne(id);
    await this.designationRepository.remove(designation);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const queryBuilder = this.designationRepository.createQueryBuilder('designation');

    if (groupCompanyId) {
      queryBuilder.where('designation.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const designations = await queryBuilder.getMany();

    const totalDesignations = designations.length;
    const activeDesignations = designations.filter(d => d.isActive).length;
    const primaryDesignations = designations.filter(d => d.isPrimary).length;
    const actingDesignations = designations.filter(d => d.isActing).length;
    const temporaryDesignations = designations.filter(d => d.isTemporary).length;

    const byStatus = designations.reduce((acc, d) => {
      const status = d.status || 'Unclassified';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const byType = designations.reduce((acc, d) => {
      const type = d.designationType || 'Regular';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const byEmploymentType = designations.reduce((acc, d) => {
      const type = d.employmentType || 'Unclassified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const totalCompensation = designations.reduce((sum, d) => sum + (d.totalCompensation || 0), 0);
    const avgCompensation = totalDesignations > 0 ? totalCompensation / totalDesignations : 0;

    return {
      totalDesignations,
      activeDesignations,
      primaryDesignations,
      actingDesignations,
      temporaryDesignations,
      byStatus,
      byType,
      byEmploymentType,
      totalCompensation,
      avgCompensation,
    };
  }

  async getReportingStructure(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      title: d.designationTitle,
      employeeId: d.employeeId,
      reporting: {
        reportingToDesignationId: d.reportingToDesignationId,
        reportingToEmployeeId: d.reportingToEmployeeId,
        relationship: d.reportingRelationship,
        directReports: d.directReportsCount,
        indirectReports: d.indirectReportsCount,
        totalTeamSize: d.totalTeamSize,
        supervisoryLevel: d.supervisoryLevel,
      },
    }));
  }

  async getCompensationSummary(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      title: d.designationTitle,
      compensation: {
        baseSalary: d.baseSalary,
        currency: d.salaryCurrency,
        bonusPercentage: d.bonusPercentage,
        targetBonus: d.targetBonus,
        actualBonus: d.actualBonus,
        totalCompensation: d.totalCompensation,
      },
      grade: {
        gradeId: d.gradeId,
        bandId: d.bandId,
        levelId: d.levelId,
      },
    }));
  }

  async getPerformanceMetrics(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      title: d.designationTitle,
      employeeId: d.employeeId,
      performance: {
        currentRating: d.currentPerformanceRating,
        lastRating: d.lastPerformanceRating,
        lastReview: d.lastPerformanceReview,
        nextReview: d.nextPerformanceReview,
        goals: d.performanceGoals,
        kpis: d.kpis || [],
      },
      productivity: {
        utilizationRate: d.utilizationRate,
        productivityScore: d.productivityScore,
        daysInRole: d.daysInRole,
      },
    }));
  }

  async getCareerProgression(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      title: d.designationTitle,
      employeeId: d.employeeId,
      career: {
        dateAssigned: d.dateAssigned,
        dateEnded: d.dateEnded,
        tenureMonths: d.tenureMonths,
        previousDesignationId: d.previousDesignationId,
        history: d.careerHistory || [],
        developmentPlan: d.developmentPlan,
        successionCandidates: d.successionCandidates || [],
      },
    }));
  }

  async getComplianceStatus(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      title: d.designationTitle,
      employeeId: d.employeeId,
      compliance: {
        requirements: d.complianceRequirements || [],
        backgroundCheck: {
          status: d.backgroundCheckStatus,
          date: d.backgroundCheckDate,
        },
        securityClearances: d.securityClearances || [],
        licenses: d.licenses || [],
        licenseExpiry: d.licenseExpiryDate,
      },
    }));
  }

  async getWorkLocationMatrix(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      title: d.designationTitle,
      employeeId: d.employeeId,
      location: {
        primary: d.workLocation,
        office: d.officeLocation,
        floor: d.floorNumber,
        seat: d.seatNumber,
        timeZone: d.timeZone,
        multiple: d.workLocations || [],
      },
      work: {
        arrangement: d.workArrangement,
        requiresTravel: d.requiresTravel,
        travelPercentage: d.travelPercentage,
        requiresOnsitePresence: d.requiresOnsitePresence,
        hasFlexibleHours: d.hasFlexibleHours,
      },
    }));
  }

  async getApprovalWorkflow(groupCompanyId?: string): Promise<any> {
    const designations = await this.findAll(groupCompanyId);

    return designations.map(d => ({
      id: d.id,
      code: d.designationCode,
      title: d.designationTitle,
      approval: {
        status: d.approvalStatus,
        approvedBy: d.approvedBy,
        approvedDate: d.approvedDate,
        comments: d.approvalComments,
        requestedBy: d.requestedBy,
        requestedDate: d.requestedDate,
        workflow: d.approvalWorkflow,
      },
    }));
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateDesignationDto }>): Promise<Designation[]> {
    const results: Designation[] = [];

    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }

    return results;
  }

  async bulkAssign(assignments: Array<{ id: string; employeeId: string }>): Promise<Designation[]> {
    const results: Designation[] = [];

    for (const assignment of assignments) {
      const updated = await this.update(assignment.id, { employeeId: assignment.employeeId });
      results.push(updated);
    }

    return results;
  }
}
