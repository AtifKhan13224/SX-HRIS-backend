import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { NoticePeriodPolicy, SeparationType } from '../../entities/notice-period-policy.entity';
import { EmployeeSeparation, SeparationStatus } from '../../entities/employee-separation.entity';
import {
  CreateNoticePeriodPolicyDto,
  UpdateNoticePeriodPolicyDto,
  CreateSeparationDto,
  UpdateSeparationDto,
  ApproveSeparationDto,
  CalculateBuyoutDto,
  BuyoutResponseDto,
  WithdrawalRequestDto,
  NoticePeriodQueryDto,
  SeparationQueryDto,
} from '../../dto/notice-period.dto';

@Injectable()
export class NoticePeriodService {
  constructor(
    @InjectRepository(NoticePeriodPolicy)
    private policyRepository: Repository<NoticePeriodPolicy>,
    @InjectRepository(EmployeeSeparation)
    private separationRepository: Repository<EmployeeSeparation>,
  ) {}

  // ==================== POLICY MANAGEMENT ====================

  async createPolicy(
    tenantId: string,
    userId: string,
    dto: CreateNoticePeriodPolicyDto,
  ): Promise<NoticePeriodPolicy> {
    // Check for policy code uniqueness
    const existing = await this.policyRepository.findOne({
      where: { tenant_id: tenantId, policy_code: dto.policy_code },
    });

    if (existing) {
      throw new BadRequestException('Policy code already exists');
    }

    // Check for rule conflicts
    const conflicts = await this.checkRuleConflicts(tenantId, dto);
    if (conflicts.length > 0) {
      throw new BadRequestException({
        message: 'Policy conflicts with existing rules',
        conflicts,
      });
    }

    const policy = this.policyRepository.create({
      ...dto,
      tenant_id: tenantId,
      created_by: userId,
    });

    return await this.policyRepository.save(policy);
  }

  async getPolicies(
    tenantId: string,
    query: NoticePeriodQueryDto,
  ): Promise<{ data: NoticePeriodPolicy[]; total: number }> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<NoticePeriodPolicy> = {
      tenant_id: tenantId,
    };

    if (filters.country_id) where.country_id = filters.country_id;
    if (filters.legal_entity_id) where.legal_entity_id = filters.legal_entity_id;
    if (filters.employee_type_id) where.employee_type_id = filters.employee_type_id;
    if (filters.separation_type !== undefined) {
      // This would need custom query for JSONB array containment
    }
    if (filters.is_active !== undefined) where.is_active = filters.is_active;

    const [data, total] = await this.policyRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { rule_priority: 'DESC', effective_from: 'DESC' },
    });

    return { data, total };
  }

  async getPolicyById(tenantId: string, id: string): Promise<NoticePeriodPolicy> {
    const policy = await this.policyRepository.findOne({
      where: { id, tenant_id: tenantId },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    return policy;
  }

  async updatePolicy(
    tenantId: string,
    userId: string,
    id: string,
    dto: UpdateNoticePeriodPolicyDto,
  ): Promise<NoticePeriodPolicy> {
    const policy = await this.getPolicyById(tenantId, id);

    Object.assign(policy, dto);
    policy.updated_by = userId;

    return await this.policyRepository.save(policy);
  }

  async deletePolicy(tenantId: string, id: string): Promise<void> {
    const policy = await this.getPolicyById(tenantId, id);
    await this.policyRepository.remove(policy);
  }

  async togglePolicyStatus(tenantId: string, userId: string, id: string): Promise<NoticePeriodPolicy> {
    const policy = await this.getPolicyById(tenantId, id);
    policy.is_active = !policy.is_active;
    policy.updated_by = userId;
    return await this.policyRepository.save(policy);
  }

  // ==================== SEPARATION MANAGEMENT ====================

  async createSeparation(
    tenantId: string,
    userId: string,
    dto: CreateSeparationDto,
  ): Promise<EmployeeSeparation> {
    // Find applicable policy
    const policy = await this.findApplicablePolicy(
      tenantId,
      dto.employee_id,
      dto.separation_type,
      new Date(dto.submission_date),
    );

    if (!policy) {
      throw new NotFoundException('No applicable notice period policy found');
    }

    // Calculate notice period dates
    const noticeDates = await this.calculateNoticeDates(
      policy,
      new Date(dto.submission_date),
      dto.preferred_last_working_day ? new Date(dto.preferred_last_working_day) : null,
    );

    // Generate case ID
    const caseId = await this.generateSeparationCaseId(tenantId);

    const separation = this.separationRepository.create({
      tenant_id: tenantId,
      separation_case_id: caseId,
      employee_id: dto.employee_id,
      separation_type: dto.separation_type,
      separation_reason: dto.separation_reason,
      submission_date: new Date(dto.submission_date),
      applied_policy_id: policy.id,
      notice_days_required: policy.standard_notice_days,
      notice_day_type: policy.notice_day_type,
      notice_start_date: noticeDates.startDate,
      notice_end_date: noticeDates.endDate,
      last_working_day: noticeDates.lastWorkingDay,
      status: SeparationStatus.SUBMITTED,
      attendance_required: policy.attendance_required_during_notice,
      created_by: userId,
      remarks: dto.remarks,
    });

    return await this.separationRepository.save(separation);
  }

  async getSeparations(
    tenantId: string,
    query: SeparationQueryDto,
  ): Promise<{ data: EmployeeSeparation[]; total: number }> {
    const { page = 1, limit = 10, from_date, to_date, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<EmployeeSeparation> = {
      tenant_id: tenantId,
    };

    if (filters.employee_id) where.employee_id = filters.employee_id;
    if (filters.status) where.status = filters.status;
    if (filters.separation_type) where.separation_type = filters.separation_type;

    if (from_date && to_date) {
      where.submission_date = Between(new Date(from_date), new Date(to_date));
    } else if (from_date) {
      where.submission_date = MoreThanOrEqual(new Date(from_date));
    } else if (to_date) {
      where.submission_date = LessThanOrEqual(new Date(to_date));
    }

    const [data, total] = await this.separationRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { submission_date: 'DESC' },
    });

    return { data, total };
  }

  async getSeparationById(tenantId: string, id: string): Promise<EmployeeSeparation> {
    const separation = await this.separationRepository.findOne({
      where: { id, tenant_id: tenantId },
    });

    if (!separation) {
      throw new NotFoundException('Separation not found');
    }

    return separation;
  }

  async updateSeparation(
    tenantId: string,
    userId: string,
    id: string,
    dto: UpdateSeparationDto,
  ): Promise<EmployeeSeparation> {
    const separation = await this.getSeparationById(tenantId, id);

    Object.assign(separation, dto);
    separation.updated_by = userId;

    return await this.separationRepository.save(separation);
  }

  async approveSeparation(
    tenantId: string,
    userId: string,
    id: string,
    dto: ApproveSeparationDto,
  ): Promise<EmployeeSeparation> {
    const separation = await this.getSeparationById(tenantId, id);

    const timestamp = new Date();

    switch (dto.approval_level.toUpperCase()) {
      case 'MANAGER':
        separation.manager_approved = dto.approved;
        separation.manager_approved_at = timestamp;
        separation.immediate_manager_id = userId;
        break;
      case 'HR':
        separation.hr_approved = dto.approved;
        separation.hr_approved_at = timestamp;
        separation.hr_approver_id = userId;
        break;
      case 'FINAL':
        separation.final_approved = dto.approved;
        separation.final_approved_at = timestamp;
        separation.final_approver_id = userId;
        if (dto.approved) {
          separation.status = SeparationStatus.APPROVED;
        } else {
          separation.status = SeparationStatus.REJECTED;
        }
        break;
    }

    // Update workflow history
    const workflowEntry = {
      step: dto.approval_level,
      action: dto.approved ? 'APPROVED' : 'REJECTED',
      actor_id: userId,
      timestamp,
      comments: dto.comments,
    };

    separation.workflow_history = [
      ...(separation.workflow_history || []),
      workflowEntry,
    ];

    return await this.separationRepository.save(separation);
  }

  async calculateBuyout(
    tenantId: string,
    dto: CalculateBuyoutDto,
  ): Promise<BuyoutResponseDto> {
    const separation = await this.getSeparationById(tenantId, dto.separation_id);
    const policy = await this.getPolicyById(tenantId, separation.applied_policy_id);

    if (!policy.employee_buyout_allowed) {
      throw new BadRequestException('Buyout not allowed for this policy');
    }

    // Calculate remaining notice days
    const today = new Date();
    const noticeDaysRemaining = this.calculateDaysDifference(
      today,
      separation.notice_end_date,
      policy.notice_day_type,
    );

    if (noticeDaysRemaining <= 0) {
      throw new BadRequestException('Notice period already completed');
    }

    // Calculate buyout days
    const buyoutDays = dto.buyout_days || noticeDaysRemaining;

    if (dto.buyout_days && !policy.partial_buyout_allowed) {
      throw new BadRequestException('Partial buyout not allowed for this policy');
    }

    // TODO: Fetch employee salary from employee module
    const dailySalary = 500; // Placeholder - should be fetched from employee service
    const multiplier = policy.buyout_multiplier || 1.0;
    const buyoutAmount = buyoutDays * dailySalary * multiplier;

    return {
      separation_id: dto.separation_id,
      notice_days_remaining: noticeDaysRemaining,
      buyout_amount: buyoutAmount,
      daily_salary: dailySalary,
      multiplier,
      tax_treatment: 'TAXABLE', // Should be determined by country tax rules
      is_partial: buyoutDays < noticeDaysRemaining,
    };
  }

  async applyBuyout(
    tenantId: string,
    userId: string,
    dto: CalculateBuyoutDto,
  ): Promise<EmployeeSeparation> {
    const buyoutCalculation = await this.calculateBuyout(tenantId, dto);
    const separation = await this.getSeparationById(tenantId, dto.separation_id);

    separation.buyout_requested = true;
    separation.buyout_approved = true; // Should go through approval workflow
    separation.buyout_amount = buyoutCalculation.buyout_amount;
    separation.buyout_tax_treatment = buyoutCalculation.tax_treatment;
    separation.status = SeparationStatus.BOUGHT_OUT;
    separation.updated_by = userId;

    return await this.separationRepository.save(separation);
  }

  async withdrawSeparation(
    tenantId: string,
    userId: string,
    dto: WithdrawalRequestDto,
  ): Promise<EmployeeSeparation> {
    const separation = await this.getSeparationById(tenantId, dto.separation_id);

    if (separation.status === SeparationStatus.COMPLETED) {
      throw new BadRequestException('Cannot withdraw completed separation');
    }

    separation.withdrawal_requested = true;
    separation.withdrawal_requested_at = new Date();
    separation.status = SeparationStatus.WITHDRAWN;
    separation.updated_by = userId;
    separation.remarks = `${separation.remarks || ''}\nWithdrawal Reason: ${dto.withdrawal_reason}`;

    return await this.separationRepository.save(separation);
  }

  async cancelSeparation(
    tenantId: string,
    userId: string,
    id: string,
    reason: string,
  ): Promise<EmployeeSeparation> {
    const separation = await this.getSeparationById(tenantId, id);

    separation.status = SeparationStatus.CANCELLED;
    separation.updated_by = userId;
    separation.remarks = `${separation.remarks || ''}\nCancellation Reason: ${reason}`;

    return await this.separationRepository.save(separation);
  }

  // ==================== HELPER METHODS ====================

  private async findApplicablePolicy(
    tenantId: string,
    employeeId: string,
    separationType: SeparationType,
    effectiveDate: Date,
  ): Promise<NoticePeriodPolicy | null> {
    // TODO: Fetch employee details from employee module to get all hierarchy data
    // For now, using basic query

    const policies = await this.policyRepository
      .createQueryBuilder('policy')
      .where('policy.tenant_id = :tenantId', { tenantId })
      .andWhere('policy.is_active = :isActive', { isActive: true })
      .andWhere('policy.effective_from <= :effectiveDate', { effectiveDate })
      .andWhere(
        '(policy.effective_to IS NULL OR policy.effective_to >= :effectiveDate)',
        { effectiveDate },
      )
      .andWhere(':separationType = ANY(policy.applicable_separation_types)', {
        separationType,
      })
      .orderBy('policy.rule_priority', 'DESC')
      .addOrderBy('policy.effective_from', 'DESC')
      .getMany();

    // Return the highest priority matching policy
    return policies[0] || null;
  }

  private async calculateNoticeDates(
    policy: NoticePeriodPolicy,
    startDate: Date,
    preferredLastDay: Date | null,
  ): Promise<{ startDate: Date; endDate: Date; lastWorkingDay: Date }> {
    const noticeDays = policy.standard_notice_days;

    // Calculate end date based on notice day type
    let endDate: Date;
    if (policy.notice_day_type === 'WORKING') {
      endDate = this.addWorkingDays(startDate, noticeDays);
    } else {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + noticeDays);
    }

    // Use preferred last day if provided and valid
    const lastWorkingDay = preferredLastDay && preferredLastDay >= endDate
      ? preferredLastDay
      : endDate;

    return {
      startDate,
      endDate,
      lastWorkingDay,
    };
  }

  private addWorkingDays(startDate: Date, days: number): Date {
    const result = new Date(startDate);
    let addedDays = 0;

    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++;
      }
    }

    return result;
  }

  private calculateDaysDifference(
    fromDate: Date,
    toDate: Date,
    dayType: string,
  ): number {
    if (dayType === 'WORKING') {
      return this.calculateWorkingDays(fromDate, toDate);
    } else {
      const diffTime = toDate.getTime() - fromDate.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  private calculateWorkingDays(fromDate: Date, toDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  private async generateSeparationCaseId(tenantId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const count = await this.separationRepository.count({
      where: { tenant_id: tenantId },
    });

    return `SEP-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }

  private async checkRuleConflicts(
    tenantId: string,
    dto: CreateNoticePeriodPolicyDto,
  ): Promise<any[]> {
    // Check for overlapping rules with same criteria
    const conflictingPolicies = await this.policyRepository
      .createQueryBuilder('policy')
      .where('policy.tenant_id = :tenantId', { tenantId })
      .andWhere('policy.is_active = :isActive', { isActive: true })
      .andWhere(
        '(policy.effective_from <= :effectiveTo AND (policy.effective_to IS NULL OR policy.effective_to >= :effectiveFrom))',
        {
          effectiveFrom: dto.effective_from,
          effectiveTo: dto.effective_to || '9999-12-31',
        },
      )
      .getMany();

    const conflicts = [];
    for (const existing of conflictingPolicies) {
      if (this.policiesOverlap(dto, existing)) {
        conflicts.push({
          policy_code: existing.policy_code,
          policy_name: existing.policy_name,
        });
      }
    }

    return conflicts;
  }

  private policiesOverlap(
    dto: CreateNoticePeriodPolicyDto,
    existing: NoticePeriodPolicy,
  ): boolean {
    // Check if criteria overlap
    if (dto.country_id && existing.country_id && dto.country_id !== existing.country_id) {
      return false;
    }
    if (dto.legal_entity_id && existing.legal_entity_id && dto.legal_entity_id !== existing.legal_entity_id) {
      return false;
    }
    if (dto.employee_type_id && existing.employee_type_id && dto.employee_type_id !== existing.employee_type_id) {
      return false;
    }

    // Check separation type overlap
    const dtoTypes = dto.applicable_separation_types;
    const existingTypes = existing.applicable_separation_types;
    const hasCommonType = dtoTypes.some(type => existingTypes.includes(type));

    return hasCommonType;
  }
}
