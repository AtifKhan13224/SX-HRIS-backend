import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  BankPolicyMaster,
  BankPolicySchedule,
  BankPolicyException,
  BankPolicyAuditLog,
  CountryPolicyTemplate,
  PolicyStatus,
} from '../entities/bank-policy.entity';
import {
  CreateBankPolicyDto,
  UpdateBankPolicyDto,
  BankPolicyQueryDto,
  CreatePolicyExceptionDto,
  CreatePolicyScheduleDto,
  ValidatePolicyDto,
  CountryTemplateQueryDto,
} from '../dto/bank-policy.dto';

@Injectable()
export class BankPolicyService {
  constructor(
    @InjectRepository(BankPolicyMaster)
    private policyRepository: Repository<BankPolicyMaster>,
    @InjectRepository(BankPolicySchedule)
    private scheduleRepository: Repository<BankPolicySchedule>,
    @InjectRepository(BankPolicyException)
    private exceptionRepository: Repository<BankPolicyException>,
    @InjectRepository(BankPolicyAuditLog)
    private auditRepository: Repository<BankPolicyAuditLog>,
    @InjectRepository(CountryPolicyTemplate)
    private templateRepository: Repository<CountryPolicyTemplate>,
  ) {}

  /**
   * CREATE BANK POLICY
   */
  async createPolicy(dto: CreateBankPolicyDto): Promise<BankPolicyMaster> {
    // Check for duplicate policy code
    const existingPolicy = await this.policyRepository.findOne({
      where: {
        tenant_id: dto.tenant_id,
        policy_code: dto.policy_code,
        is_deleted: false,
      },
    });

    if (existingPolicy) {
      throw new ConflictException(`Policy with code '${dto.policy_code}' already exists`);
    }

    // Validate dates
    if (dto.effective_to && new Date(dto.effective_to) < new Date(dto.effective_from)) {
      throw new BadRequestException('effective_to must be after effective_from');
    }

    // Validate payroll timing logic
    if (dto.bank_file_generation_day && dto.payroll_cutoff_day) {
      if (dto.bank_file_generation_day <= dto.payroll_cutoff_day) {
        throw new BadRequestException('bank_file_generation_day must be after payroll_cutoff_day');
      }
    }

    if (dto.salary_credit_day && dto.bank_file_generation_day) {
      if (dto.salary_credit_day <= dto.bank_file_generation_day) {
        throw new BadRequestException('salary_credit_day must be after bank_file_generation_day');
      }
    }

    // Validate split salary configuration
    if (dto.allow_split_salary && dto.max_split_accounts < 2) {
      throw new BadRequestException('max_split_accounts must be at least 2 when split salary is enabled');
    }

    // Create policy
    const policy = this.policyRepository.create({
      ...dto,
      effective_from: new Date(dto.effective_from),
      effective_to: dto.effective_to ? new Date(dto.effective_to) : null,
      is_current_version: true,
      version_number: 1,
    });

    const savedPolicy = await this.policyRepository.save(policy);

    // Create audit log
    await this.createAuditLog({
      tenant_id: dto.tenant_id,
      policy_id: savedPolicy.id,
      action: 'CREATE',
      changes: [
        {
          field: 'policy',
          old_value: null,
          new_value: savedPolicy,
        },
      ],
      change_reason: 'Policy created',
      performed_by: dto.created_by,
    });

    return savedPolicy;
  }

  /**
   * UPDATE BANK POLICY
   * Creates a new version if policy is active and has breaking changes
   */
  async updatePolicy(id: string, dto: UpdateBankPolicyDto): Promise<BankPolicyMaster> {
    const policy = await this.policyRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    // Track changes for audit
    const changes = [];
    Object.keys(dto).forEach((key) => {
      if (key !== 'updated_by' && dto[key] !== undefined && dto[key] !== policy[key]) {
        changes.push({
          field: key,
          old_value: policy[key],
          new_value: dto[key],
        });
      }
    });

    // Check if update requires versioning (breaking changes on active policy)
    const requiresVersioning = policy.status === PolicyStatus.ACTIVE && this.hasBreakingChanges(changes);

    if (requiresVersioning) {
      // Create new version
      const newVersion = await this.createPolicyVersion(policy, dto);
      
      await this.createAuditLog({
        tenant_id: policy.tenant_id,
        policy_id: newVersion.id,
        action: 'VERSION_CREATE',
        changes,
        change_reason: 'Breaking changes on active policy - new version created',
        performed_by: dto.updated_by,
      });

      return newVersion;
    } else {
      // Update in place
      Object.assign(policy, dto);
      const updatedPolicy = await this.policyRepository.save(policy);

      if (changes.length > 0) {
        await this.createAuditLog({
          tenant_id: policy.tenant_id,
          policy_id: policy.id,
          action: 'UPDATE',
          changes,
          change_reason: 'Policy updated',
          performed_by: dto.updated_by,
        });
      }

      return updatedPolicy;
    }
  }

  /**
   * GET POLICY BY ID
   */
  async getPolicyById(id: string): Promise<BankPolicyMaster> {
    const policy = await this.policyRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['schedules', 'exceptions'],
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    return policy;
  }

  /**
   * GET POLICIES WITH FILTERS
   */
  async getPolicies(query: BankPolicyQueryDto): Promise<{ data: BankPolicyMaster[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC', ...filters } = query;

    const where: any = { is_deleted: false };

    if (filters.tenant_id) where.tenant_id = filters.tenant_id;
    if (filters.country_code) where.country_code = filters.country_code;
    if (filters.legal_entity_id) where.legal_entity_id = filters.legal_entity_id;
    if (filters.status) where.status = filters.status;
    if (filters.wps_enabled !== undefined) where.wps_enabled = filters.wps_enabled;
    if (filters.is_current_version !== undefined) where.is_current_version = filters.is_current_version;

    const [data, total] = await this.policyRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * GET POLICIES BY COUNTRY
   */
  async getPoliciesByCountry(countryCode: string): Promise<BankPolicyMaster[]> {
    return this.policyRepository.find({
      where: {
        country_code: countryCode,
        status: PolicyStatus.ACTIVE,
        is_deleted: false,
        is_current_version: true,
      },
      order: { policy_name: 'ASC' },
    });
  }

  /**
   * GET ACTIVE POLICY FOR LEGAL ENTITY
   */
  async getActivePolicyForEntity(tenantId: string, legalEntityId: string, date?: Date): Promise<BankPolicyMaster> {
    const effectiveDate = date || new Date();

    const policy = await this.policyRepository.findOne({
      where: {
        tenant_id: tenantId,
        legal_entity_id: legalEntityId,
        status: PolicyStatus.ACTIVE,
        is_deleted: false,
        is_current_version: true,
        effective_from: LessThanOrEqual(effectiveDate),
      },
      order: { effective_from: 'DESC' },
    });

    if (!policy) {
      throw new NotFoundException(`No active policy found for legal entity ${legalEntityId}`);
    }

    // Check if policy is still valid
    if (policy.effective_to && new Date(policy.effective_to) < effectiveDate) {
      throw new NotFoundException(`Policy expired on ${policy.effective_to}`);
    }

    return policy;
  }

  /**
   * ACTIVATE POLICY
   */
  async activatePolicy(id: string, userId: string): Promise<BankPolicyMaster> {
    const policy = await this.getPolicyById(id);

    if (policy.status === PolicyStatus.ACTIVE) {
      throw new BadRequestException('Policy is already active');
    }

    // Validate policy configuration before activation
    await this.validatePolicyConfiguration(policy);

    policy.status = PolicyStatus.ACTIVE;
    policy.updated_by = userId;

    const updatedPolicy = await this.policyRepository.save(policy);

    await this.createAuditLog({
      tenant_id: policy.tenant_id,
      policy_id: policy.id,
      action: 'ACTIVATE',
      changes: [{ field: 'status', old_value: PolicyStatus.DRAFT, new_value: PolicyStatus.ACTIVE }],
      change_reason: 'Policy activated',
      performed_by: userId,
    });

    return updatedPolicy;
  }

  /**
   * SUSPEND POLICY
   */
  async suspendPolicy(id: string, userId: string, reason: string): Promise<BankPolicyMaster> {
    const policy = await this.getPolicyById(id);

    policy.status = PolicyStatus.SUSPENDED;
    policy.updated_by = userId;

    const updatedPolicy = await this.policyRepository.save(policy);

    await this.createAuditLog({
      tenant_id: policy.tenant_id,
      policy_id: policy.id,
      action: 'SUSPEND',
      changes: [{ field: 'status', old_value: PolicyStatus.ACTIVE, new_value: PolicyStatus.SUSPENDED }],
      change_reason: reason,
      performed_by: userId,
    });

    return updatedPolicy;
  }

  /**
   * DELETE POLICY (SOFT DELETE)
   */
  async deletePolicy(id: string, userId: string): Promise<void> {
    const policy = await this.getPolicyById(id);

    // Check if policy is in use
    const scheduleCount = await this.scheduleRepository.count({
      where: { policy_id: id, status: 'PROCESSING' },
    });

    if (scheduleCount > 0) {
      throw new BadRequestException('Cannot delete policy with active processing schedules');
    }

    policy.is_deleted = true;
    policy.deleted_at = new Date();
    policy.deleted_by = userId;
    policy.status = PolicyStatus.ARCHIVED;

    await this.policyRepository.save(policy);

    await this.createAuditLog({
      tenant_id: policy.tenant_id,
      policy_id: policy.id,
      action: 'DELETE',
      changes: [{ field: 'is_deleted', old_value: false, new_value: true }],
      change_reason: 'Policy deleted',
      performed_by: userId,
    });
  }

  /**
   * CREATE POLICY EXCEPTION
   */
  async createException(dto: CreatePolicyExceptionDto): Promise<BankPolicyException> {
    const policy = await this.getPolicyById(dto.policy_id);

    // Validate exception dates
    if (dto.effective_to && new Date(dto.effective_to) < new Date(dto.effective_from)) {
      throw new BadRequestException('effective_to must be after effective_from');
    }

    const exception = this.exceptionRepository.create({
      ...dto,
      effective_from: new Date(dto.effective_from),
      effective_to: dto.effective_to ? new Date(dto.effective_to) : null,
      approved_at: new Date(),
    });

    const savedException = await this.exceptionRepository.save(exception);

    await this.createAuditLog({
      tenant_id: dto.tenant_id,
      policy_id: dto.policy_id,
      action: 'EXCEPTION_CREATE',
      changes: [{ field: 'exception', old_value: null, new_value: savedException }],
      change_reason: `Exception created: ${dto.exception_type}`,
      performed_by: dto.created_by,
    });

    return savedException;
  }

  /**
   * GET EXCEPTIONS FOR EMPLOYEE
   */
  async getExceptionsForEmployee(policyId: string, employeeId: string, date?: Date): Promise<BankPolicyException[]> {
    const effectiveDate = date || new Date();

    return this.exceptionRepository.find({
      where: {
        policy_id: policyId,
        employee_id: employeeId,
        is_active: true,
        effective_from: LessThanOrEqual(effectiveDate),
      },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * CREATE POLICY SCHEDULE
   */
  async createSchedule(dto: CreatePolicyScheduleDto): Promise<BankPolicySchedule> {
    const policy = await this.getPolicyById(dto.policy_id);

    // Check for duplicate schedule
    const existingSchedule = await this.scheduleRepository.findOne({
      where: {
        policy_id: dto.policy_id,
        processing_month: dto.processing_month,
      },
    });

    if (existingSchedule) {
      throw new ConflictException(`Schedule for ${dto.processing_month} already exists`);
    }

    const schedule = this.scheduleRepository.create({
      ...dto,
      payroll_cutoff_date: new Date(dto.payroll_cutoff_date),
      bank_file_generation_date: new Date(dto.bank_file_generation_date),
      bank_file_submission_date: new Date(dto.bank_file_submission_date),
      expected_salary_credit_date: new Date(dto.expected_salary_credit_date),
      actual_salary_credit_date: new Date(dto.expected_salary_credit_date),
      is_holiday_adjusted: (dto.holiday_dates && dto.holiday_dates.length > 0) || false,
    });

    return this.scheduleRepository.save(schedule);
  }

  /**
   * GET SCHEDULE FOR MONTH
   */
  async getScheduleForMonth(policyId: string, processingMonth: string): Promise<BankPolicySchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { policy_id: policyId, processing_month: processingMonth },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule for ${processingMonth} not found`);
    }

    return schedule;
  }

  /**
   * VALIDATE POLICY AGAINST BUSINESS RULES
   */
  async validatePolicy(dto: ValidatePolicyDto): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const policy = await this.getPolicyById(dto.policy_id);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if policy is active
    if (policy.status !== PolicyStatus.ACTIVE) {
      errors.push(`Policy is ${policy.status}, not ACTIVE`);
    }

    // Check effective date range
    const now = new Date();
    if (policy.effective_from > now) {
      errors.push(`Policy not yet effective (effective from ${policy.effective_from})`);
    }
    if (policy.effective_to && policy.effective_to < now) {
      errors.push(`Policy has expired (effective to ${policy.effective_to})`);
    }

    // Check bank change freeze period
    if (dto.context?.bank_change_requested) {
      const schedule = await this.getScheduleForMonth(dto.policy_id, dto.processing_month).catch(() => null);
      if (schedule) {
        const freezeDate = new Date(schedule.payroll_cutoff_date);
        freezeDate.setDate(freezeDate.getDate() - policy.bank_change_freeze_days);
        
        if (now > freezeDate) {
          errors.push(`Bank changes are frozen (freeze period: ${policy.bank_change_freeze_days} days before cutoff)`);
        }
      }
    }

    // Check WPS validation if enabled
    if (policy.wps_enabled && policy.wps_mandatory_validation) {
      if (!policy.wps_employer_id || !policy.wps_routing_code) {
        errors.push('WPS is mandatory but configuration is incomplete');
      }
    }

    // Check regulatory validations
    if (policy.regulatory_validations?.blocking_validations) {
      for (const validation of policy.regulatory_validations.blocking_validations) {
        // Placeholder for actual validation logic
        warnings.push(`Blocking validation required: ${validation}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * GET COUNTRY TEMPLATES
   */
  async getCountryTemplates(query: CountryTemplateQueryDto): Promise<CountryPolicyTemplate[]> {
    const where: any = {};
    if (query.country_code) where.country_code = query.country_code;
    if (query.is_active !== undefined) where.is_active = query.is_active;

    return this.templateRepository.find({
      where,
      order: { country_name: 'ASC', template_name: 'ASC' },
    });
  }

  /**
   * CREATE POLICY FROM TEMPLATE
   */
  async createPolicyFromTemplate(templateId: string, overrides: Partial<CreateBankPolicyDto>): Promise<BankPolicyMaster> {
    const template = await this.templateRepository.findOne({ where: { id: templateId } });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    const policyDto: CreateBankPolicyDto = {
      ...template.default_configuration,
      ...overrides,
      country_code: template.country_code,
    } as CreateBankPolicyDto;

    return this.createPolicy(policyDto);
  }

  /**
   * GET AUDIT LOGS
   */
  async getAuditLogs(policyId: string, limit: number = 50): Promise<BankPolicyAuditLog[]> {
    return this.auditRepository.find({
      where: { policy_id: policyId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  // ===== PRIVATE HELPER METHODS =====

  private async createAuditLog(data: Partial<BankPolicyAuditLog>): Promise<BankPolicyAuditLog> {
    const auditLog = this.auditRepository.create(data);
    return this.auditRepository.save(auditLog);
  }

  private hasBreakingChanges(changes: any[]): boolean {
    const breakingFields = [
      'payroll_cutoff_day',
      'salary_credit_day',
      'bank_file_generation_day',
      'wps_enabled',
      'sepa_enabled',
      'ach_enabled',
      'disbursement_method',
      'bank_change_frequency',
    ];

    return changes.some((change) => breakingFields.includes(change.field));
  }

  private async createPolicyVersion(currentPolicy: BankPolicyMaster, updates: UpdateBankPolicyDto): Promise<BankPolicyMaster> {
    // Mark current version as no longer current
    currentPolicy.is_current_version = false;
    await this.policyRepository.save(currentPolicy);

    // Create new version
    const { id, created_at, updated_at, ...policyData } = currentPolicy;
    const newVersion = this.policyRepository.create({
      ...policyData,
      ...updates,
      previous_version_id: currentPolicy.id,
      version_number: currentPolicy.version_number + 1,
      is_current_version: true,
      created_by: updates.updated_by,
      created_at: new Date(),
    });

    return this.policyRepository.save(newVersion);
  }

  private async validatePolicyConfiguration(policy: BankPolicyMaster): Promise<void> {
    const errors: string[] = [];

    // Validate WPS configuration
    if (policy.wps_enabled) {
      if (!policy.wps_provider) errors.push('WPS provider is required when WPS is enabled');
      if (!policy.wps_employer_id) errors.push('WPS employer ID is required when WPS is enabled');
    }

    // Validate SEPA configuration
    if (policy.sepa_enabled) {
      if (!policy.sepa_creditor_identifier) errors.push('SEPA creditor identifier is required');
      if (policy.base_currency !== 'EUR') errors.push('SEPA requires EUR as base currency');
    }

    // Validate ACH configuration
    if (policy.ach_enabled) {
      if (!policy.ach_company_id) errors.push('ACH company ID is required');
      if (!policy.ach_company_name) errors.push('ACH company name is required');
    }

    // Validate payroll timing
    if (policy.bank_file_generation_day <= policy.payroll_cutoff_day) {
      errors.push('Bank file generation day must be after payroll cutoff day');
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Policy validation failed: ${errors.join(', ')}`);
    }
  }
}
