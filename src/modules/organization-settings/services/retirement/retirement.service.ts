import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import {
  RetirementPolicy,
  RetirementEligibilityCriteria,
  RetirementTriggerType,
} from '../../entities/retirement-policy.entity';
import {
  EmployeeRetirement,
  RetirementStatus,
  RetirementType,
  ApprovalStatus,
} from '../../entities/employee-retirement.entity';
import {
  CreateRetirementPolicyDto,
  UpdateRetirementPolicyDto,
  CreateEmployeeRetirementDto,
  UpdateEmployeeRetirementDto,
  RequestExtensionDto,
  ApproveExtensionDto,
  RejectExtensionDto,
  RequestEarlyRetirementDto,
  ApproveRetirementDto,
  RejectRetirementDto,
  CancelRetirementDto,
  CheckEligibilityDto,
  BulkEligibilityCheckDto,
  RetirementQueryDto,
  PolicyImpactPreviewDto,
  OverridePolicyDto,
} from '../../dto/retirement.dto';

@Injectable()
export class RetirementService {
  constructor(
    @InjectRepository(RetirementPolicy)
    private policyRepository: Repository<RetirementPolicy>,
    @InjectRepository(EmployeeRetirement)
    private retirementRepository: Repository<EmployeeRetirement>,
  ) {}

  // ==================== POLICY MANAGEMENT ====================

  async createPolicy(dto: CreateRetirementPolicyDto, userId?: string): Promise<RetirementPolicy> {
    // Validate business rules
    this.validatePolicyRules(dto);

    // Check for duplicate policy code
    const existing = await this.policyRepository.findOne({
      where: { policy_code: dto.policy_code },
    });
    if (existing) {
      throw new BadRequestException(`Policy code ${dto.policy_code} already exists`);
    }

    const policy = this.policyRepository.create({
      ...dto,
      created_by: userId,
      updated_by: userId,
    });

    return await this.policyRepository.save(policy);
  }

  async updatePolicy(id: string, dto: UpdateRetirementPolicyDto, userId?: string): Promise<RetirementPolicy> {
    const policy = await this.policyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`Policy ${id} not found`);
    }

    Object.assign(policy, dto);
    policy.updated_by = userId;
    policy.policy_version += 1;

    return await this.policyRepository.save(policy);
  }

  async getPolicyById(id: string): Promise<RetirementPolicy> {
    const policy = await this.policyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`Policy ${id} not found`);
    }
    return policy;
  }

  async getAllPolicies(filters?: {
    country_code?: string;
    legal_entity_id?: string;
    is_active?: boolean;
  }): Promise<RetirementPolicy[]> {
    const where: any = {};
    if (filters?.country_code) where.country_code = filters.country_code;
    if (filters?.legal_entity_id) where.legal_entity_id = filters.legal_entity_id;
    if (filters?.is_active !== undefined) where.is_active = filters.is_active;

    return await this.policyRepository.find({
      where,
      order: { rule_priority: 'ASC', effective_from: 'DESC' },
    });
  }

  async getActivePolicies(asOfDate?: Date): Promise<RetirementPolicy[]> {
    const date = asOfDate || new Date();
    return await this.policyRepository.find({
      where: {
        is_active: true,
        effective_from: LessThanOrEqual(date),
      },
      order: { rule_priority: 'ASC' },
    });
  }

  async togglePolicyStatus(id: string, userId?: string): Promise<RetirementPolicy> {
    const policy = await this.getPolicyById(id);
    policy.is_active = !policy.is_active;
    policy.updated_by = userId;
    return await this.policyRepository.save(policy);
  }

  async deletePolicy(id: string): Promise<void> {
    // Check if policy is in use
    const inUse = await this.retirementRepository.count({ where: { policy_id: id } });
    if (inUse > 0) {
      throw new BadRequestException(`Cannot delete policy ${id} - it is in use by ${inUse} retirement cases`);
    }

    await this.policyRepository.delete(id);
  }

  // ==================== ELIGIBILITY EVALUATION ====================

  async checkEmployeeEligibility(dto: CheckEligibilityDto): Promise<{
    eligible: boolean;
    matched_policy?: RetirementPolicy;
    eligibility_date?: Date;
    age?: number;
    service_years?: number;
    service_months?: number;
    details: string;
  }> {
    // In production, fetch employee data from Employee service
    // For now, assuming employee data is passed or fetched
    const asOfDate = dto.as_of_date ? new Date(dto.as_of_date) : new Date();
    
    // Get all active policies
    const policies = await this.getActivePolicies(asOfDate);
    
    // Find matching policy based on precedence
    const matchedPolicy = await this.findMatchingPolicy(dto.employee_id, policies);
    
    if (!matchedPolicy) {
      return {
        eligible: false,
        details: 'No matching retirement policy found for employee',
      };
    }

    // Calculate eligibility (mock calculation - in production, fetch real employee data)
    const eligibilityResult = await this.calculateEligibility(
      dto.employee_id,
      matchedPolicy,
      asOfDate,
    );

    return eligibilityResult;
  }

  async bulkEligibilityCheck(dto: BulkEligibilityCheckDto): Promise<any[]> {
    const results = [];
    for (const employeeId of dto.employee_ids) {
      const result = await this.checkEmployeeEligibility({
        employee_id: employeeId,
        as_of_date: dto.as_of_date,
      });
      results.push({ employee_id: employeeId, ...result });
    }
    return results;
  }

  private async findMatchingPolicy(
    employeeId: string,
    policies: RetirementPolicy[],
  ): Promise<RetirementPolicy | null> {
    // In production: fetch employee details and match against policy criteria
    // For now, return first active policy (sorted by priority)
    return policies.length > 0 ? policies[0] : null;
  }

  private async calculateEligibility(
    employeeId: string,
    policy: RetirementPolicy,
    asOfDate: Date,
  ): Promise<any> {
    // Mock calculation - in production, fetch real employee DOB and DOJ
    // Calculate age and service based on DOB and DOJ
    
    const mockAge = 60; // Would calculate from actual DOB
    const mockServiceYears = 25; // Would calculate from actual DOJ
    const mockServiceMonths = 300;

    let eligible = false;
    let details = '';

    switch (policy.eligibility_criteria) {
      case RetirementEligibilityCriteria.AGE_ONLY:
        eligible = mockAge >= (policy.mandatory_retirement_age || 0);
        details = `Age-based: ${mockAge} >= ${policy.mandatory_retirement_age}`;
        break;

      case RetirementEligibilityCriteria.SERVICE_ONLY:
        eligible = mockServiceYears >= (policy.minimum_service_years || 0);
        details = `Service-based: ${mockServiceYears} years >= ${policy.minimum_service_years}`;
        break;

      case RetirementEligibilityCriteria.AGE_OR_SERVICE:
        eligible =
          mockAge >= (policy.mandatory_retirement_age || 0) ||
          mockServiceYears >= (policy.minimum_service_years || 0);
        details = `Age OR Service: ${mockAge}/${policy.mandatory_retirement_age} OR ${mockServiceYears}/${policy.minimum_service_years}`;
        break;

      case RetirementEligibilityCriteria.AGE_AND_SERVICE:
        eligible =
          mockAge >= (policy.mandatory_retirement_age || 0) &&
          mockServiceYears >= (policy.minimum_service_years || 0);
        details = `Age AND Service: ${mockAge}>=${policy.mandatory_retirement_age} AND ${mockServiceYears}>=${policy.minimum_service_years}`;
        break;

      case RetirementEligibilityCriteria.AGE_PLUS_SERVICE_FORMULA:
        const sum = mockAge + mockServiceYears;
        const threshold = 80; // Configurable in policy
        eligible = sum >= threshold;
        details = `Formula: ${mockAge} + ${mockServiceYears} = ${sum} >= ${threshold}`;
        break;

      default:
        details = 'Custom formula evaluation not implemented';
    }

    return {
      eligible,
      matched_policy: policy,
      age: mockAge,
      service_years: mockServiceYears,
      service_months: mockServiceMonths,
      details,
    };
  }

  // ==================== EMPLOYEE RETIREMENT MANAGEMENT ====================

  async createRetirement(dto: CreateEmployeeRetirementDto, userId?: string): Promise<EmployeeRetirement> {
    // Validate policy exists
    const policy = await this.getPolicyById(dto.policy_id);

    // Generate case ID
    const caseId = await this.generateRetirementCaseId();

    // Check eligibility
    const eligibility = await this.checkEmployeeEligibility({
      employee_id: dto.employee_id,
    });

    const retirement = this.retirementRepository.create({
      ...dto,
      retirement_case_id: caseId,
      is_eligible: eligibility.eligible,
      age_at_eligibility: eligibility.age,
      service_years_at_eligibility: eligibility.service_years,
      service_months_at_eligibility: eligibility.service_months,
      eligibility_determination_date: new Date(),
      retirement_status: RetirementStatus.DRAFT,
      policy_snapshot: policy as any, // Store policy snapshot
      created_by: userId,
      updated_by: userId,
    });

    return await this.retirementRepository.save(retirement);
  }

  async updateRetirement(id: string, dto: UpdateEmployeeRetirementDto, userId?: string): Promise<EmployeeRetirement> {
    const retirement = await this.getRetirementById(id);
    Object.assign(retirement, dto);
    retirement.updated_by = userId;
    return await this.retirementRepository.save(retirement);
  }

  async getRetirementById(id: string): Promise<EmployeeRetirement> {
    const retirement = await this.retirementRepository.findOne({ where: { id } });
    if (!retirement) {
      throw new NotFoundException(`Retirement case ${id} not found`);
    }
    return retirement;
  }

  async getRetirementsByEmployee(employeeId: string): Promise<EmployeeRetirement[]> {
    return await this.retirementRepository.find({
      where: { employee_id: employeeId },
      order: { created_at: 'DESC' },
    });
  }

  async queryRetirements(query: RetirementQueryDto): Promise<{
    data: EmployeeRetirement[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: any = {};
    if (query.employee_id) where.employee_id = query.employee_id;
    if (query.policy_id) where.policy_id = query.policy_id;
    if (query.status) where.retirement_status = query.status;
    if (query.retirement_type) where.retirement_type = query.retirement_type;
    if (query.requires_approval !== undefined) where.requires_approval = query.requires_approval;

    if (query.from_date && query.to_date) {
      where.expected_retirement_date = Between(new Date(query.from_date), new Date(query.to_date));
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.retirementRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total, page, limit };
  }

  // ==================== EXTENSION MANAGEMENT ====================

  async requestExtension(dto: RequestExtensionDto, userId?: string): Promise<EmployeeRetirement> {
    const retirement = await this.getRetirementById(dto.retirement_id);
    const policy = await this.getPolicyById(retirement.policy_id);

    if (!policy.allow_age_extension) {
      throw new BadRequestException('Age extension not allowed by policy');
    }

    if (dto.extension_months_requested > (policy.max_extension_years || 0) * 12) {
      throw new BadRequestException(
        `Extension requested (${dto.extension_months_requested} months) exceeds policy maximum (${policy.max_extension_years} years)`,
      );
    }

    retirement.extension_requested = true;
    retirement.extension_months_requested = dto.extension_months_requested;
    retirement.extension_request_date = new Date();
    retirement.extension_justification = dto.extension_justification;
    retirement.extension_approval_status = policy.extension_requires_approval
      ? ApprovalStatus.PENDING
      : ApprovalStatus.NOT_REQUIRED;
    retirement.retirement_status = RetirementStatus.EXTENSION_REQUESTED;
    retirement.updated_by = userId;

    return await this.retirementRepository.save(retirement);
  }

  async approveExtension(dto: ApproveExtensionDto): Promise<EmployeeRetirement> {
    const retirement = await this.getRetirementById(dto.retirement_id);

    retirement.extension_approval_status = ApprovalStatus.APPROVED;
    retirement.extension_months_approved = dto.extension_months_approved;
    retirement.extended_retirement_date = new Date(dto.extended_retirement_date);
    retirement.extension_approved_by = dto.approved_by;
    retirement.extension_approved_at = new Date();
    retirement.retirement_status = RetirementStatus.EXTENSION_APPROVED;

    return await this.retirementRepository.save(retirement);
  }

  async rejectExtension(dto: RejectExtensionDto): Promise<EmployeeRetirement> {
    const retirement = await this.getRetirementById(dto.retirement_id);

    retirement.extension_approval_status = ApprovalStatus.REJECTED;
    retirement.extension_rejection_reason = dto.rejection_reason;
    retirement.rejected_by = dto.rejected_by;
    retirement.rejected_at = new Date();
    retirement.retirement_status = RetirementStatus.EXTENSION_REJECTED;

    return await this.retirementRepository.save(retirement);
  }

  // ==================== EARLY RETIREMENT ====================

  async requestEarlyRetirement(dto: RequestEarlyRetirementDto, userId?: string): Promise<EmployeeRetirement> {
    const policy = await this.getPolicyById(dto.policy_id);

    if (!policy.allow_early_retirement) {
      throw new BadRequestException('Early retirement not allowed by policy');
    }

    const caseId = await this.generateRetirementCaseId();

    const retirement = this.retirementRepository.create({
      retirement_case_id: caseId,
      employee_id: dto.employee_id,
      policy_id: dto.policy_id,
      retirement_type: RetirementType.EARLY_VOLUNTARY,
      is_early_retirement: true,
      early_retirement_request_date: new Date(),
      early_retirement_justification: dto.justification,
      expected_retirement_date: new Date(dto.requested_retirement_date),
      early_retirement_approval_status: policy.allow_early_retirement_approval
        ? ApprovalStatus.PENDING
        : ApprovalStatus.NOT_REQUIRED,
      retirement_status: RetirementStatus.EARLY_RETIREMENT_REQUESTED,
      eligibility_determination_date: new Date(),
      created_by: userId,
      updated_by: userId,
    });

    return await this.retirementRepository.save(retirement);
  }

  // ==================== APPROVAL WORKFLOW ====================

  async approveRetirement(dto: ApproveRetirementDto): Promise<EmployeeRetirement> {
    const retirement = await this.getRetirementById(dto.retirement_id);

    retirement.primary_approver_id = dto.approved_by;
    retirement.primary_approval_date = new Date();
    retirement.approval_comments = dto.approval_comments;

    if (dto.secondary_approver_id) {
      retirement.secondary_approver_id = dto.secondary_approver_id;
      retirement.secondary_approval_date = new Date();
    }

    if (retirement.is_early_retirement) {
      retirement.early_retirement_approval_status = ApprovalStatus.APPROVED;
      retirement.early_retirement_approved_by = dto.approved_by;
      retirement.early_retirement_approved_at = new Date();
      retirement.retirement_status = RetirementStatus.EARLY_RETIREMENT_APPROVED;
    } else {
      retirement.retirement_status = RetirementStatus.APPROVED;
    }

    return await this.retirementRepository.save(retirement);
  }

  async rejectRetirement(dto: RejectRetirementDto): Promise<EmployeeRetirement> {
    const retirement = await this.getRetirementById(dto.retirement_id);

    retirement.rejection_reason = dto.rejection_reason;
    retirement.rejected_by = dto.rejected_by;
    retirement.rejected_at = new Date();
    retirement.retirement_status = RetirementStatus.REJECTED;

    return await this.retirementRepository.save(retirement);
  }

  async cancelRetirement(dto: CancelRetirementDto): Promise<EmployeeRetirement> {
    const retirement = await this.getRetirementById(dto.retirement_id);

    retirement.is_cancelled = true;
    retirement.cancellation_reason = dto.cancellation_reason;
    retirement.cancelled_by = dto.cancelled_by;
    retirement.cancelled_at = new Date();
    retirement.retirement_status = RetirementStatus.CANCELLED;

    return await this.retirementRepository.save(retirement);
  }

  // ==================== POLICY IMPACT PREVIEW ====================

  async previewPolicyImpact(dto: PolicyImpactPreviewDto): Promise<{
    policy: RetirementPolicy;
    affected_employees_count: number;
    projected_retirements: any[];
  }> {
    const policy = await this.getPolicyById(dto.policy_id);
    
    // In production: query employee database and calculate impact
    // For now, return mock data
    return {
      policy,
      affected_employees_count: 0,
      projected_retirements: [],
    };
  }

  // ==================== OVERRIDE MANAGEMENT ====================

  async overridePolicy(dto: OverridePolicyDto, userId?: string): Promise<EmployeeRetirement> {
    const retirement = await this.getRetirementById(dto.retirement_id);
    const overridePolicy = await this.getPolicyById(dto.override_policy_id);

    retirement.is_override = true;
    retirement.policy_id = dto.override_policy_id;
    retirement.override_justification = dto.override_justification;
    retirement.override_approved_by = dto.override_approved_by;
    retirement.override_approved_at = new Date();
    if (dto.override_valid_until) {
      retirement.override_valid_until = new Date(dto.override_valid_until);
    }
    retirement.updated_by = userId;

    return await this.retirementRepository.save(retirement);
  }

  // ==================== UTILITY METHODS ====================

  private async generateRetirementCaseId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.retirementRepository.count();
    return `RET-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private validatePolicyRules(dto: CreateRetirementPolicyDto | UpdateRetirementPolicyDto): void {
    // Validate age ranges
    if ('minimum_retirement_age' in dto && 'mandatory_retirement_age' in dto) {
      if (dto.minimum_retirement_age && dto.mandatory_retirement_age) {
        if (dto.minimum_retirement_age > dto.mandatory_retirement_age) {
          throw new BadRequestException('Minimum retirement age cannot exceed mandatory retirement age');
        }
      }
    }

    // Validate extension rules
    if ('allow_age_extension' in dto && dto.allow_age_extension && !('max_extension_years' in dto && dto.max_extension_years)) {
      throw new BadRequestException('Max extension years must be specified when age extension is allowed');
    }
  }

  async getUpcomingRetirements(months: number = 6): Promise<EmployeeRetirement[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);

    return await this.retirementRepository.find({
      where: {
        expected_retirement_date: Between(today, futureDate),
        retirement_status: In([
          RetirementStatus.APPROVED,
          RetirementStatus.RETIREMENT_IN_PROGRESS,
          RetirementStatus.NOTICE_ACKNOWLEDGED,
        ]),
      },
      order: { expected_retirement_date: 'ASC' },
    });
  }
}
