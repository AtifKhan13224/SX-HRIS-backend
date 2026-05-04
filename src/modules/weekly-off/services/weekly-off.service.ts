import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  WeeklyOffPolicy,
  WeeklyOffPattern,
  WeeklyOffAssignment,
  WeeklyOffAudit,
  ConfigurationLevel,
} from '../entities/weekly-off-policy.entity';
import { WeeklyOffOverride } from '../entities/work-calendar.entity';
import {
  CreateWeeklyOffPolicyDto,
  UpdateWeeklyOffPolicyDto,
  CreateWeeklyOffAssignmentDto,
  BulkAssignWeeklyOffDto,
  CreateWeeklyOffOverrideDto,
  ValidateWeeklyOffPolicyDto,
  GetEmployeeWorkCalendarDto,
  RecalculateWorkCalendarDto,
  ApproveOverrideDto,
  WeeklyOffPolicyQueryDto,
  WeeklyOffPolicyResponseDto,
} from '../dto/weekly-off.dto';
import { LaborLawComplianceService } from './labor-law-compliance.service';
import { WorkCalendarService } from './work-calendar.service';

@Injectable()
export class WeeklyOffService {
  private readonly logger = new Logger(WeeklyOffService.name);

  // Priority mapping for configuration levels (lower = higher priority)
  private readonly LEVEL_PRIORITY = {
    [ConfigurationLevel.EMPLOYEE]: 10,
    [ConfigurationLevel.SHIFT]: 20,
    [ConfigurationLevel.DEPARTMENT]: 30,
    [ConfigurationLevel.LOCATION]: 40,
    [ConfigurationLevel.BUSINESS_UNIT]: 50,
    [ConfigurationLevel.LEGAL_ENTITY]: 60,
    [ConfigurationLevel.COUNTRY]: 70,
    [ConfigurationLevel.GLOBAL]: 80,
  };

  constructor(
    @InjectRepository(WeeklyOffPolicy)
    private readonly policyRepository: Repository<WeeklyOffPolicy>,
    @InjectRepository(WeeklyOffPattern)
    private readonly patternRepository: Repository<WeeklyOffPattern>,
    @InjectRepository(WeeklyOffAssignment)
    private readonly assignmentRepository: Repository<WeeklyOffAssignment>,
    @InjectRepository(WeeklyOffAudit)
    private readonly auditRepository: Repository<WeeklyOffAudit>,
    @InjectRepository(WeeklyOffOverride)
    private readonly overrideRepository: Repository<WeeklyOffOverride>,
    private readonly complianceService: LaborLawComplianceService,
    private readonly calendarService: WorkCalendarService,
  ) {}

  /**
   * Create new weekly off policy
   */
  async createPolicy(
    tenantId: string,
    userId: string,
    dto: CreateWeeklyOffPolicyDto,
  ): Promise<WeeklyOffPolicyResponseDto> {
    this.logger.log(`Creating weekly off policy: ${dto.policyName} for tenant ${tenantId}`);

    // Check for duplicate policy code
    const existing = await this.policyRepository.findOne({
      where: { tenantId, policyCode: dto.policyCode },
    });

    if (existing) {
      throw new ConflictException(`Policy with code ${dto.policyCode} already exists`);
    }

    // Create policy
    const policy = this.policyRepository.create({
      tenantId,
      policyName: dto.policyName,
      policyCode: dto.policyCode,
      description: dto.description,
      weeklyOffType: dto.weeklyOffType,
      configurationLevel: dto.configurationLevel,
      referenceId: dto.referenceId,
      priority: dto.priority || this.LEVEL_PRIORITY[dto.configurationLevel],
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      countryId: dto.countryId,
      createdBy: userId,
    });

    const savedPolicy = await this.policyRepository.save(policy);

    // Create patterns
    const patterns: WeeklyOffPattern[] = [];
    for (const patternDto of dto.patterns) {
      const pattern = this.patternRepository.create({
        policyId: savedPolicy.id,
        patternName: patternDto.patternName,
        offDays: patternDto.offDays,
        workingDaysCycle: patternDto.workingDaysCycle,
        offDaysCycle: patternDto.offDaysCycle,
        rotationStartDate: patternDto.rotationStartDate ? new Date(patternDto.rotationStartDate) : null,
        hoursPerDay: patternDto.hoursPerDay,
        daysPerWeek: patternDto.daysPerWeek,
        isPaid: patternDto.isPaid !== undefined ? patternDto.isPaid : true,
        isActive: patternDto.isActive !== undefined ? patternDto.isActive : true,
      });
      patterns.push(await this.patternRepository.save(pattern));
    }

    // Validate compliance
    const validation = await this.complianceService.validatePolicy(
      tenantId,
      savedPolicy,
      patterns,
    );

    savedPolicy.isCompliant = validation.isValid;
    savedPolicy.complianceWarnings = validation.warnings.length > 0 ? validation.warnings : null;
    await this.policyRepository.save(savedPolicy);

    // Audit log
    await this.createAuditLog(tenantId, savedPolicy.id, userId, 'POLICY_CREATED', null, savedPolicy);

    return this.mapToResponseDto(savedPolicy, patterns);
  }

  /**
   * Update weekly off policy
   */
  async updatePolicy(
    tenantId: string,
    policyId: string,
    userId: string,
    dto: UpdateWeeklyOffPolicyDto,
  ): Promise<WeeklyOffPolicyResponseDto> {
    const policy = await this.findPolicyById(tenantId, policyId);
    const oldValues = { ...policy };

    if (dto.policyName) policy.policyName = dto.policyName;
    if (dto.description !== undefined) policy.description = dto.description;
    if (dto.weeklyOffType) policy.weeklyOffType = dto.weeklyOffType;
    if (dto.priority) policy.priority = dto.priority;
    if (dto.effectiveFrom) policy.effectiveFrom = new Date(dto.effectiveFrom);
    if (dto.effectiveTo) policy.effectiveTo = new Date(dto.effectiveTo);
    if (dto.isActive !== undefined) policy.isActive = dto.isActive;
    policy.updatedBy = userId;

    const updatedPolicy = await this.policyRepository.save(policy);
    const patterns = await this.patternRepository.find({ where: { policyId: policy.id, isActive: true } });

    // Revalidate compliance
    const validation = await this.complianceService.validatePolicy(tenantId, updatedPolicy, patterns);
    updatedPolicy.isCompliant = validation.isValid;
    updatedPolicy.complianceWarnings = validation.warnings.length > 0 ? validation.warnings : null;
    await this.policyRepository.save(updatedPolicy);

    // Audit log
    await this.createAuditLog(tenantId, policyId, userId, 'POLICY_UPDATED', oldValues, updatedPolicy);

    return this.mapToResponseDto(updatedPolicy, patterns);
  }

  /**
   * Delete/deactivate policy
   */
  async deletePolicy(tenantId: string, policyId: string, userId: string): Promise<void> {
    const policy = await this.findPolicyById(tenantId, policyId);

    // Check if policy is assigned
    const assignments = await this.assignmentRepository.count({
      where: { tenantId, policyId, isActive: true },
    });

    if (assignments > 0) {
      throw new BadRequestException('Cannot delete policy with active assignments');
    }

    policy.isActive = false;
    policy.updatedBy = userId;
    await this.policyRepository.save(policy);

    await this.createAuditLog(tenantId, policyId, userId, 'POLICY_DELETED', policy, null);
  }

  /**
   * Assign weekly off policy to entities
   */
  async assignPolicy(
    tenantId: string,
    userId: string,
    dto: CreateWeeklyOffAssignmentDto,
  ): Promise<WeeklyOffAssignment> {
    const policy = await this.findPolicyById(tenantId, dto.policyId);

    // Check for existing active assignments
    const existing = await this.assignmentRepository.findOne({
      where: {
        tenantId,
        policyId: dto.policyId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        isActive: true,
      },
    });

    if (existing) {
      throw new ConflictException('Active assignment already exists for this entity');
    }

    const assignment = this.assignmentRepository.create({
      tenantId,
      policyId: dto.policyId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      isActive: true,
      isOverride: dto.isOverride || false,
      overrideReason: dto.overrideReason,
      requiresApproval: dto.requiresApproval || false,
      approvalStatus: dto.requiresApproval ? 'PENDING' : 'APPROVED',
      createdBy: userId,
    });

    const savedAssignment = await this.assignmentRepository.save(assignment);

    await this.createAuditLog(tenantId, dto.policyId, userId, 'POLICY_ASSIGNED', null, {
      assignmentId: savedAssignment.id,
      entityType: dto.entityType,
      entityId: dto.entityId,
    });

    return savedAssignment;
  }

  /**
   * Bulk assign policy
   */
  async bulkAssignPolicy(
    tenantId: string,
    userId: string,
    dto: BulkAssignWeeklyOffDto,
  ): Promise<{ success: number; failed: number; errors: any[] }> {
    const policy = await this.findPolicyById(tenantId, dto.policyId);

    let success = 0;
    let failed = 0;
    const errors = [];

    for (const entityId of dto.entityIds) {
      try {
        await this.assignPolicy(tenantId, userId, {
          policyId: dto.policyId,
          entityType: dto.entityType,
          entityId,
          effectiveFrom: dto.effectiveFrom,
          effectiveTo: dto.effectiveTo,
        });
        success++;
      } catch (error) {
        failed++;
        errors.push({ entityId, error: error.message });
      }
    }

    await this.createAuditLog(tenantId, dto.policyId, userId, 'BULK_ASSIGNMENT', null, {
      entityType: dto.entityType,
      totalEntities: dto.entityIds.length,
      success,
      failed,
    });

    return { success, failed, errors };
  }

  /**
   * Get policy by ID
   */
  async getPolicyById(tenantId: string, policyId: string): Promise<WeeklyOffPolicyResponseDto> {
    const policy = await this.findPolicyById(tenantId, policyId);
    const patterns = await this.patternRepository.find({
      where: { policyId: policy.id },
      order: { displayOrder: 'ASC' },
    });
    return this.mapToResponseDto(policy, patterns);
  }

  /**
   * Query policies
   */
  async queryPolicies(
    tenantId: string,
    query: WeeklyOffPolicyQueryDto,
  ): Promise<{ data: WeeklyOffPolicyResponseDto[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.policyRepository
      .createQueryBuilder('policy')
      .where('policy.tenantId = :tenantId', { tenantId });

    if (query.weeklyOffType) {
      queryBuilder.andWhere('policy.weeklyOffType = :weeklyOffType', { weeklyOffType: query.weeklyOffType });
    }

    if (query.configurationLevel) {
      queryBuilder.andWhere('policy.configurationLevel = :configurationLevel', {
        configurationLevel: query.configurationLevel,
      });
    }

    if (query.referenceId) {
      queryBuilder.andWhere('policy.referenceId = :referenceId', { referenceId: query.referenceId });
    }

    if (query.countryId) {
      queryBuilder.andWhere('policy.countryId = :countryId', { countryId: query.countryId });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('policy.isActive = :isActive', { isActive: query.isActive });
    }

    if (query.effectiveDate) {
      const effectiveDate = new Date(query.effectiveDate);
      queryBuilder.andWhere('policy.effectiveFrom <= :effectiveDate', { effectiveDate });
      queryBuilder.andWhere('(policy.effectiveTo IS NULL OR policy.effectiveTo >= :effectiveDate)', {
        effectiveDate,
      });
    }

    const [policies, total] = await queryBuilder
      .orderBy('policy.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = await Promise.all(
      policies.map(async (policy) => {
        const patterns = await this.patternRepository.find({ where: { policyId: policy.id } });
        return this.mapToResponseDto(policy, patterns);
      }),
    );

    return { data, total, page, limit };
  }

  /**
   * Get employee resolved weekly off policy
   */
  async getEmployeeResolvedPolicy(
    tenantId: string,
    employeeId: string,
    effectiveDate: Date,
  ): Promise<WeeklyOffPolicyResponseDto | null> {
    // Get all active assignments for employee (direct and inherited)
    const assignments = await this.getEmployeeAssignments(tenantId, employeeId, effectiveDate);

    if (assignments.length === 0) {
      return null;
    }

    // Sort by priority (employee-level overrides take precedence)
    assignments.sort((a, b) => {
      const policyA = a.policy;
      const policyB = b.policy;
      return policyA.priority - policyB.priority;
    });

    // Return highest priority policy
    const topAssignment = assignments[0];
    const patterns = await this.patternRepository.find({
      where: { policyId: topAssignment.policyId, isActive: true },
    });

    return this.mapToResponseDto(topAssignment.policy, patterns);
  }

  /**
   * Get employee assignments
   */
  private async getEmployeeAssignments(
    tenantId: string,
    employeeId: string,
    effectiveDate: Date,
  ): Promise<WeeklyOffAssignment[]> {
    const assignments = await this.assignmentRepository.find({
      where: {
        tenantId,
        entityType: 'EMPLOYEE',
        entityId: employeeId,
        isActive: true,
      },
      relations: ['policy'],
    });

    return assignments.filter(
      (a) =>
        a.effectiveFrom <= effectiveDate &&
        (!a.effectiveTo || a.effectiveTo >= effectiveDate) &&
        a.policy.isActive,
    );
  }

  /**
   * Validate policy compliance
   */
  async validatePolicy(tenantId: string, dto: ValidateWeeklyOffPolicyDto): Promise<any> {
    const policy = await this.findPolicyById(tenantId, dto.policyId);
    const patterns = await this.patternRepository.find({
      where: { policyId: policy.id, isActive: true },
    });

    return await this.complianceService.validatePolicy(tenantId, policy, patterns, dto.employeeId);
  }

  /**
   * Create weekly off override
   */
  async createOverride(
    tenantId: string,
    userId: string,
    dto: CreateWeeklyOffOverrideDto,
  ): Promise<WeeklyOffOverride> {
    const override = this.overrideRepository.create({
      tenantId,
      employeeId: dto.employeeId,
      overrideDate: new Date(dto.overrideDate),
      overrideType: dto.overrideType as any,
      originalDayType: dto.originalDayType,
      newDayType: dto.newDayType,
      reason: dto.reason,
      requiresCompensation: dto.requiresCompensation || false,
      compensationType: dto.compensationType,
      compensationDate: dto.compensationDate ? new Date(dto.compensationDate) : null,
      otMultiplier: dto.otMultiplier,
      approvalStatus: 'PENDING',
      requestedBy: userId,
    });

    const savedOverride = await this.overrideRepository.save(override);

    await this.createAuditLog(tenantId, null, userId, 'OVERRIDE_CREATED', null, savedOverride);

    return savedOverride;
  }

  /**
   * Approve/reject override
   */
  async approveOverride(
    tenantId: string,
    userId: string,
    dto: ApproveOverrideDto,
  ): Promise<WeeklyOffOverride> {
    const override = await this.overrideRepository.findOne({
      where: { id: dto.overrideId, tenantId },
    });

    if (!override) {
      throw new NotFoundException('Override not found');
    }

    override.approvalStatus = dto.approved ? 'APPROVED' : 'REJECTED';
    override.approvedBy = userId;
    override.approvedAt = new Date();
    override.approvalComments = dto.comments;

    const updatedOverride = await this.overrideRepository.save(override);

    // If approved, apply to work calendar
    if (dto.approved) {
      await this.calendarService.applyOverride(tenantId, updatedOverride);
    }

    await this.createAuditLog(tenantId, null, userId, 'OVERRIDE_APPROVED', { approved: dto.approved }, updatedOverride);

    return updatedOverride;
  }

  /**
   * Get employee work calendar
   */
  async getEmployeeWorkCalendar(tenantId: string, dto: GetEmployeeWorkCalendarDto): Promise<any> {
    return await this.calendarService.getEmployeeCalendar(
      tenantId,
      dto.employeeId,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.includeMetadata,
    );
  }

  /**
   * Recalculate work calendar
   */
  async recalculateWorkCalendar(tenantId: string, userId: string, dto: RecalculateWorkCalendarDto): Promise<any> {
    const employeeIds = dto.employeeIds || [];
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    const result = await this.calendarService.recalculateCalendar(
      tenantId,
      employeeIds,
      startDate,
      endDate,
      dto.forceRecalculation,
    );

    await this.createAuditLog(tenantId, null, userId, 'CALENDAR_RECALCULATED', null, {
      employeeCount: employeeIds.length,
      ...result,
    });

    return result;
  }

  /**
   * Helper: Find policy by ID
   */
  private async findPolicyById(tenantId: string, policyId: string): Promise<WeeklyOffPolicy> {
    const policy = await this.policyRepository.findOne({
      where: { id: policyId, tenantId },
    });

    if (!policy) {
      throw new NotFoundException('Weekly off policy not found');
    }

    return policy;
  }

  /**
   * Helper: Create audit log
   */
  private async createAuditLog(
    tenantId: string,
    policyId: string | null,
    userId: string,
    actionType: string,
    oldValues: any,
    newValues: any,
  ): Promise<void> {
    try {
      const audit = this.auditRepository.create({
        tenantId,
        policyId,
        actionType,
        actionBy: userId,
        oldValues,
        newValues,
      });

      await this.auditRepository.save(audit);
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
    }
  }

  /**
   * Helper: Map to response DTO
   */
  private mapToResponseDto(
    policy: WeeklyOffPolicy,
    patterns: WeeklyOffPattern[],
  ): WeeklyOffPolicyResponseDto {
    return {
      id: policy.id,
      tenantId: policy.tenantId,
      policyName: policy.policyName,
      policyCode: policy.policyCode,
      description: policy.description,
      weeklyOffType: policy.weeklyOffType,
      configurationLevel: policy.configurationLevel,
      referenceId: policy.referenceId,
      priority: policy.priority,
      effectiveFrom: policy.effectiveFrom,
      effectiveTo: policy.effectiveTo,
      isActive: policy.isActive,
      countryId: policy.countryId,
      isCompliant: policy.isCompliant,
      complianceWarnings: policy.complianceWarnings,
      patterns: patterns.map((p) => ({
        id: p.id,
        patternName: p.patternName,
        offDays: p.offDays,
        workingDaysCycle: p.workingDaysCycle,
        offDaysCycle: p.offDaysCycle,
        rotationStartDate: p.rotationStartDate,
        hoursPerDay: p.hoursPerDay,
        daysPerWeek: p.daysPerWeek,
        isPaid: p.isPaid,
        isActive: p.isActive,
      })),
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
    };
  }
}
