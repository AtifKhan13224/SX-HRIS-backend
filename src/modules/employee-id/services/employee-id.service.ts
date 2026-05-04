import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, LessThan, MoreThanOrEqual, IsNull } from 'typeorm';
import {
  EmployeeIDPolicy,
  EmployeeIDSequence,
  EmployeeIDReservation,
  EmployeeIDAssignment,
  EmployeeIDAuditLog,
  EmployeeIDToken,
  PolicyStatus,
  PolicyLevel,
  SequenceResetFrequency,
  IDReservationStatus,
  RehireIDStrategy,
  EmployeeIDType,
  IDTransitionTrigger,
} from '../entities/employee-id.entity';
import {
  CreateEmployeeIDPolicyDto,
  UpdateEmployeeIDPolicyDto,
  EmployeeIDPolicyQueryDto,
  ReserveEmployeeIDDto,
  AssignEmployeeIDDto,
  GenerateEmployeeIDDto,
  ValidateIDPatternDto,
  CorrectEmployeeIDDto,
  BulkReserveEmployeeIDDto,
  CancelReservationDto,
  ResetSequenceDto,
  GetApplicablePolicyDto,
  EmployeeIDSearchDto,
  TransitionEmployeeIDDto,
  CheckTransitionEligibilityDto,
  GetIDByTypeDto,
} from '../dto/employee-id.dto';

@Injectable()
export class EmployeeIDService {
  constructor(
    @InjectRepository(EmployeeIDPolicy)
    private policyRepo: Repository<EmployeeIDPolicy>,
    @InjectRepository(EmployeeIDSequence)
    private sequenceRepo: Repository<EmployeeIDSequence>,
    @InjectRepository(EmployeeIDReservation)
    private reservationRepo: Repository<EmployeeIDReservation>,
    @InjectRepository(EmployeeIDAssignment)
    private assignmentRepo: Repository<EmployeeIDAssignment>,
    @InjectRepository(EmployeeIDAuditLog)
    private auditRepo: Repository<EmployeeIDAuditLog>,
    @InjectRepository(EmployeeIDToken)
    private tokenRepo: Repository<EmployeeIDToken>,
    private dataSource: DataSource,
  ) {}

  // ===== POLICY MANAGEMENT =====

  async createPolicy(dto: CreateEmployeeIDPolicyDto): Promise<EmployeeIDPolicy> {
    // Validate ID pattern
    const patternValidation = await this.validateIDPattern({
      id_pattern: dto.id_pattern,
      sample_context: {},
    });

    if (!patternValidation.is_valid) {
      throw new BadRequestException(
        `Invalid ID pattern: ${patternValidation.errors.join(', ')}`,
      );
    }

    // Check for duplicate policy_code
    const existing = await this.policyRepo.findOne({
      where: {
        tenant_id: dto.tenant_id,
        policy_code: dto.policy_code,
      },
    });

    if (existing) {
      throw new ConflictException(`Policy with code '${dto.policy_code}' already exists`);
    }

    const policy = this.policyRepo.create({
      ...dto,
      status: PolicyStatus.DRAFT,
      is_current_version: true,
      version_number: 1,
      available_tokens: patternValidation.tokens,
    });

    const saved = await this.policyRepo.save(policy);

    // Create audit log
    await this.createAuditLog({
      tenant_id: dto.tenant_id,
      policy_id: saved.id,
      action: 'POLICY_CREATE',
      performed_by: dto.created_by,
      changes: [
        {
          field: 'status',
          old_value: null,
          new_value: PolicyStatus.DRAFT,
        },
      ],
    });

    // Initialize sequences if applicable
    if (dto.sequence_scope) {
      await this.initializeSequence(saved);
    }

    return saved;
  }

  async updatePolicy(
    policyId: string,
    dto: UpdateEmployeeIDPolicyDto,
  ): Promise<EmployeeIDPolicy> {
    const policy = await this.policyRepo.findOne({ where: { id: policyId } });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    // Check if update requires versioning (breaking changes)
    const requiresVersioning = this.requiresNewVersion(policy, dto);

    if (requiresVersioning && policy.status === PolicyStatus.ACTIVE) {
      // Create new version
      return await this.createNewVersion(policy, dto);
    }

    // Track changes
    const changes = this.trackChanges(policy, dto);

    // Apply updates
    Object.assign(policy, dto);
    policy.updated_at = new Date();

    const updated = await this.policyRepo.save(policy);

    // Audit log
    await this.createAuditLog({
      tenant_id: policy.tenant_id,
      policy_id: policy.id,
      action: 'POLICY_UPDATE',
      performed_by: dto.updated_by,
      changes,
    });

    return updated;
  }

  async getPolicyById(policyId: string): Promise<EmployeeIDPolicy> {
    const policy = await this.policyRepo.findOne({
      where: { id: policyId },
      relations: ['sequences', 'reservations', 'assignments'],
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    return policy;
  }

  async getPolicies(query: EmployeeIDPolicyQueryDto): Promise<{
    data: EmployeeIDPolicy[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const whereConditions: any = {};

    if (filters.tenant_id) whereConditions.tenant_id = filters.tenant_id;
    if (filters.policy_level) whereConditions.policy_level = filters.policy_level;
    if (filters.level_value) whereConditions.level_value = filters.level_value;
    if (filters.status) whereConditions.status = filters.status;
    if (filters.is_current_version !== undefined)
      whereConditions.is_current_version = filters.is_current_version;

    const [data, total] = await this.policyRepo.findAndCount({
      where: whereConditions,
      order: { priority: 'DESC', created_at: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async activatePolicy(
    policyId: string,
    activatedBy: string,
  ): Promise<EmployeeIDPolicy> {
    const policy = await this.getPolicyById(policyId);

    if (policy.status === PolicyStatus.ACTIVE) {
      throw new BadRequestException('Policy is already active');
    }

    // Validate policy is complete
    this.validatePolicyForActivation(policy);

    policy.status = PolicyStatus.ACTIVE;
    const updated = await this.policyRepo.save(policy);

    await this.createAuditLog({
      tenant_id: policy.tenant_id,
      policy_id: policy.id,
      action: 'POLICY_ACTIVATE',
      performed_by: activatedBy,
      changes: [
        {
          field: 'status',
          old_value: PolicyStatus.DRAFT,
          new_value: PolicyStatus.ACTIVE,
        },
      ],
    });

    return updated;
  }

  async deactivatePolicy(
    policyId: string,
    deactivatedBy: string,
  ): Promise<EmployeeIDPolicy> {
    const policy = await this.getPolicyById(policyId);

    policy.status = PolicyStatus.INACTIVE;
    const updated = await this.policyRepo.save(policy);

    await this.createAuditLog({
      tenant_id: policy.tenant_id,
      policy_id: policy.id,
      action: 'POLICY_DEACTIVATE',
      performed_by: deactivatedBy,
      changes: [
        {
          field: 'status',
          old_value: PolicyStatus.ACTIVE,
          new_value: PolicyStatus.INACTIVE,
        },
      ],
    });

    return updated;
  }

  // ===== TOKEN RESOLVER ENGINE =====

  async validateIDPattern(dto: ValidateIDPatternDto): Promise<{
    is_valid: boolean;
    errors: string[];
    tokens: any[];
    example_output?: string;
  }> {
    const errors: string[] = [];
    const tokens: any[] = [];

    const pattern = dto.id_pattern;

    // Extract tokens from pattern
    const tokenRegex = /\{([A-Z_]+)(?::(\d+))?\}/g;
    let match;
    let hasSequence = false;

    while ((match = tokenRegex.exec(pattern)) !== null) {
      const tokenCode = match[1];
      const lengthSpec = match[2] ? parseInt(match[2]) : null;

      // Validate token exists
      const tokenDef = await this.tokenRepo.findOne({
        where: { token_code: tokenCode },
      });

      if (!tokenDef) {
        errors.push(`Unknown token: ${tokenCode}`);
      } else {
        tokens.push({
          token: tokenCode,
          description: tokenDef.description,
          example: tokenDef.example_output,
          length: lengthSpec,
        });

        if (tokenCode === 'SEQUENCE') {
          hasSequence = true;
        }
      }
    }

    // Validate sequence exists
    if (!hasSequence) {
      errors.push('Pattern must contain {SEQUENCE} token');
    }

    // Generate example output
    let exampleOutput = pattern;
    if (dto.sample_context && errors.length === 0) {
      try {
        exampleOutput = await this.resolvePattern(pattern, dto.sample_context, null);
      } catch (err) {
        errors.push(`Failed to generate example: ${err.message}`);
      }
    }

    return {
      is_valid: errors.length === 0,
      errors,
      tokens,
      example_output: exampleOutput,
    };
  }

  private async resolvePattern(
    pattern: string,
    context: Record<string, any>,
    sequenceValue: number | null,
  ): Promise<string> {
    let resolved = pattern;

    // Extract tokens
    const tokenRegex = /\{([A-Z_]+)(?::(\d+))?\}/g;
    let match;
    const tokenReplacements: { token: string; value: string }[] = [];

    while ((match = tokenRegex.exec(pattern)) !== null) {
      const tokenCode = match[1];
      const lengthSpec = match[2] ? parseInt(match[2]) : null;

      let value = '';

      switch (tokenCode) {
        case 'COUNTRY':
          value = context.country_code || 'XXX';
          break;

        case 'YEAR':
          value = context.year
            ? context.year.toString()
            : new Date().getFullYear().toString();
          if (lengthSpec === 2) {
            value = value.substring(2); // YY format
          }
          break;

        case 'MONTH':
          const month = context.month || new Date().getMonth() + 1;
          value = month.toString().padStart(2, '0');
          break;

        case 'DAY':
          const day = context.day || new Date().getDate();
          value = day.toString().padStart(2, '0');
          break;

        case 'QUARTER':
          const quarter = context.quarter || Math.ceil((new Date().getMonth() + 1) / 3);
          value = `Q${quarter}`;
          break;

        case 'COMPANY':
          value = context.company_code || 'COMP';
          break;

        case 'LEGAL_ENTITY':
          value = context.legal_entity_code || 'LE';
          break;

        case 'BUSINESS_UNIT':
          value = context.business_unit_code || 'BU';
          break;

        case 'DEPARTMENT':
          value = context.department_code || 'DEPT';
          break;

        case 'TYPE':
          value = context.employment_type || 'EMP';
          if (value === 'FULL_TIME') value = 'FT';
          if (value === 'PART_TIME') value = 'PT';
          if (value === 'CONTRACT') value = 'CT';
          break;

        case 'SEQUENCE':
          if (sequenceValue === null) {
            value = '00001'; // Placeholder
          } else {
            const padding = lengthSpec || 5;
            value = sequenceValue.toString().padStart(padding, '0');
          }
          break;

        case 'RANDOM':
          const randomLength = lengthSpec || 6;
          value = Math.random()
            .toString(36)
            .substring(2, 2 + randomLength)
            .toUpperCase();
          break;

        default:
          // Check custom token
          const tokenDef = await this.tokenRepo.findOne({
            where: { token_code: tokenCode },
          });
          if (tokenDef && tokenDef.resolution_logic) {
            value = this.executeTokenLogic(tokenDef.resolution_logic, context);
          }
      }

      tokenReplacements.push({ token: match[0], value });
    }

    // Apply replacements
    for (const replacement of tokenReplacements) {
      resolved = resolved.replace(replacement.token, replacement.value);
    }

    return resolved;
  }

  private executeTokenLogic(logic: string, context: Record<string, any>): string {
    // Simple custom token logic executor
    // In production, use a safe expression evaluator
    try {
      const func = new Function('context', `return ${logic}`);
      return func(context) || '';
    } catch (err) {
      return '';
    }
  }

  // ===== ID GENERATION =====

  async generateEmployeeID(dto: GenerateEmployeeIDDto): Promise<{
    employee_number: string;
    policy_id: string;
    generation_context: string;
    is_preview: boolean;
  }> {
    const policy = await this.getPolicyById(dto.policy_id);

    if (policy.status !== PolicyStatus.ACTIVE) {
      throw new BadRequestException('Policy is not active');
    }

    // Build scope key for sequence
    const scopeKey = this.buildScopeKey(policy, dto.context);

    // Get or create sequence
    let sequence = await this.sequenceRepo.findOne({
      where: {
        tenant_id: dto.tenant_id,
        policy_id: dto.policy_id,
        scope_key: scopeKey,
      },
    });

    if (!sequence) {
      sequence = await this.initializeSequence(policy, scopeKey);
    }

    // Check if sequence exhausted
    if (sequence.is_exhausted) {
      throw new BadRequestException(`Sequence for scope '${scopeKey}' is exhausted`);
    }

    // Acquire lock and get next sequence value
    const sequenceValue = dto.preview_only
      ? sequence.current_value + 1
      : await this.getNextSequenceValue(sequence);

    // Resolve ID pattern
    const employeeNumber = await this.resolvePattern(
      policy.id_pattern,
      dto.context,
      sequenceValue,
    );

    // Check collision
    const collision = await this.assignmentRepo.findOne({
      where: {
        tenant_id: dto.tenant_id,
        employee_number: employeeNumber,
      },
    });

    if (collision) {
      throw new ConflictException(`Employee ID '${employeeNumber}' already exists`);
    }

    // Audit
    if (!dto.preview_only) {
      await this.createAuditLog({
        tenant_id: dto.tenant_id,
        policy_id: policy.id,
        action: 'ID_GENERATE',
        performed_by: dto.context.generated_by || 'SYSTEM',
        changes: [
          {
            field: 'employee_number',
            old_value: null,
            new_value: employeeNumber,
          },
        ],
      });
    }

    return {
      employee_number: employeeNumber,
      policy_id: policy.id,
      generation_context: JSON.stringify(dto.context),
      is_preview: dto.preview_only || false,
    };
  }

  async assignEmployeeID(dto: AssignEmployeeIDDto): Promise<EmployeeIDAssignment> {
    // Check if employee already has active ID
    const existingActive = await this.assignmentRepo.findOne({
      where: {
        tenant_id: dto.tenant_id,
        employee_id: dto.employee_id,
        is_current: true,
      },
    });

    // Generate or use provided employee_number
    let employeeNumber = dto.employee_number;

    if (!employeeNumber) {
      const generated = await this.generateEmployeeID({
        tenant_id: dto.tenant_id,
        policy_id: dto.policy_id,
        context: dto.metadata || {},
        preview_only: false,
      });
      employeeNumber = generated.employee_number;
    }

    // Deactivate previous assignment if exists
    if (existingActive) {
      existingActive.is_current = false;
      existingActive.effective_to = dto.effective_from
        ? new Date(dto.effective_from)
        : new Date();
      await this.assignmentRepo.save(existingActive);
    }

    // Create new assignment
    const assignment = this.assignmentRepo.create({
      tenant_id: dto.tenant_id,
      employee_id: dto.employee_id,
      employee_number: employeeNumber,
      policy_id: dto.policy_id,
      assignment_type: dto.assignment_type || 'INITIAL',
      effective_from: dto.effective_from || new Date().toISOString(),
      is_current: true,
      is_primary: true,
      metadata: dto.metadata,
      generation_context: JSON.stringify(dto.metadata || {}),
      previous_assignment_id: existingActive?.id,
      assignment_sequence: existingActive ? existingActive.assignment_sequence + 1 : 1,
      assigned_by: dto.assigned_by,
    });

    const saved = await this.assignmentRepo.save(assignment);

    // Audit
    await this.createAuditLog({
      tenant_id: dto.tenant_id,
      policy_id: dto.policy_id,
      employee_id: dto.employee_id,
      assignment_id: saved.id,
      action: 'ID_ASSIGN',
      performed_by: dto.assigned_by,
      changes: [
        {
          field: 'employee_number',
          old_value: existingActive?.employee_number || null,
          new_value: employeeNumber,
        },
      ],
    });

    return saved;
  }

  async correctEmployeeID(dto: CorrectEmployeeIDDto): Promise<EmployeeIDAssignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: dto.assignment_id },
      relations: ['policy'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if policy allows correction
    if (!assignment.policy.allow_correction) {
      throw new BadRequestException('Policy does not allow ID correction');
    }

    // Check grace period
    if (assignment.policy.correction_grace_period_hours) {
      const assignedAt = new Date(assignment.assigned_at);
      const graceEndTime = new Date(
        assignedAt.getTime() +
          assignment.policy.correction_grace_period_hours * 60 * 60 * 1000,
      );

      if (new Date() > graceEndTime) {
        throw new BadRequestException('Correction grace period has expired');
      }
    }

    // Check if correction requires approval
    if (
      assignment.policy.correction_workflow &&
      assignment.policy.correction_workflow?.['require_approval'] &&
      !dto.approved_by
    ) {
      throw new BadRequestException('Correction requires approval');
    }

    // Mark old assignment as corrected
    assignment.is_corrected = true;
    assignment.corrected_at = new Date();
    assignment.correction_reason = dto.correction_reason;
    assignment.is_current = false;
    await this.assignmentRepo.save(assignment);

    // Create corrected assignment
    const corrected = this.assignmentRepo.create({
      tenant_id: assignment.tenant_id,
      employee_id: assignment.employee_id,
      employee_number: dto.new_employee_number,
      policy_id: assignment.policy_id,
      assignment_type: 'CORRECTION',
      effective_from: new Date().toISOString(),
      is_current: true,
      is_primary: true,
      metadata: assignment.metadata,
      generation_context: assignment.generation_context,
      previous_assignment_id: assignment.id,
      assignment_sequence: assignment.assignment_sequence,
      assigned_by: dto.corrected_by,
    });

    const saved = await this.assignmentRepo.save(corrected);

    // Link correction
    assignment.corrected_to_assignment_id = saved.id;
    await this.assignmentRepo.save(assignment);

    // Audit
    await this.createAuditLog({
      tenant_id: assignment.tenant_id,
      policy_id: assignment.policy_id,
      employee_id: assignment.employee_id,
      assignment_id: saved.id,
      action: 'ID_CORRECT',
      performed_by: dto.corrected_by,
      changes: [
        {
          field: 'employee_number',
          old_value: assignment.employee_number,
          new_value: dto.new_employee_number,
        },
        {
          field: 'correction_reason',
          old_value: null,
          new_value: dto.correction_reason,
        },
      ],
    });

    return saved;
  }

  // ===== RESERVATION =====

  async reserveEmployeeID(dto: ReserveEmployeeIDDto): Promise<EmployeeIDReservation[]> {
    const policy = await this.getPolicyById(dto.policy_id);

    if (!policy.allow_reservation) {
      throw new BadRequestException('Policy does not allow ID reservation');
    }

    const count = dto.count || 1;
    const reservations: EmployeeIDReservation[] = [];

    for (let i = 0; i < count; i++) {
      // Generate ID
      const generated = await this.generateEmployeeID({
        tenant_id: dto.tenant_id,
        policy_id: dto.policy_id,
        context: {},
        preview_only: false,
      });

      // Calculate expiry
      const expiryHours = policy.reservation_expiry_hours || 24;
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

      // Create reservation
      const reservation = this.reservationRepo.create({
        tenant_id: dto.tenant_id,
        policy_id: dto.policy_id,
        reserved_id: generated.employee_number,
        status: IDReservationStatus.RESERVED,
        reserved_for: dto.reserved_for,
        reserved_for_context: dto.reserved_for_context,
        reserved_by: dto.reserved_by,
        expires_at: expiresAt,
      });

      const saved = await this.reservationRepo.save(reservation);
      reservations.push(saved);
    }

    // Audit
    await this.createAuditLog({
      tenant_id: dto.tenant_id,
      policy_id: dto.policy_id,
      action: 'ID_RESERVE',
      performed_by: dto.reserved_by,
      changes: [
        {
          field: 'reserved_count',
          old_value: null,
          new_value: count,
        },
      ],
    });

    return reservations;
  }

  async cancelReservation(dto: CancelReservationDto): Promise<EmployeeIDReservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { id: dto.reservation_id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== IDReservationStatus.RESERVED) {
      throw new BadRequestException('Reservation is not active');
    }

    reservation.status = IDReservationStatus.CANCELLED;
    reservation.cancelled_at = new Date();
    reservation.cancellation_reason = dto.cancellation_reason;

    const updated = await this.reservationRepo.save(reservation);

    // Audit
    await this.createAuditLog({
      tenant_id: reservation.tenant_id,
      policy_id: reservation.policy_id,
      action: 'ID_CANCEL',
      performed_by: dto.cancelled_by,
      changes: [
        {
          field: 'reservation_status',
          old_value: IDReservationStatus.RESERVED,
          new_value: IDReservationStatus.CANCELLED,
        },
      ],
    });

    return updated;
  }

  // ===== SEQUENCE MANAGEMENT =====

  private async initializeSequence(
    policy: EmployeeIDPolicy,
    scopeKey?: string,
  ): Promise<EmployeeIDSequence> {
    const scope = scopeKey || policy.sequence_scope || 'GLOBAL';

    const sequence = this.sequenceRepo.create({
      tenant_id: policy.tenant_id,
      policy_id: policy.id,
      scope_key: scope,
      current_value: policy.sequence_start || 1,
      last_issued_value: 0,
      reserved_count: 0,
      issued_count: 0,
      is_exhausted: false,
    });

    return await this.sequenceRepo.save(sequence);
  }

  private async getNextSequenceValue(sequence: EmployeeIDSequence): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Acquire distributed lock
      if (sequence.policy?.use_distributed_lock) {
        const lockAcquired = await this.acquireDistributedLock(sequence);
        if (!lockAcquired) {
          throw new ConflictException('Failed to acquire sequence lock');
        }
      }

      // Optimistic locking
      const currentSequence = await queryRunner.manager.findOne(EmployeeIDSequence, {
        where: { id: sequence.id },
      });

      if (currentSequence.lock_version !== sequence.lock_version) {
        throw new ConflictException('Sequence was modified by another process');
      }

      // Calculate next value
      let nextValue = currentSequence.current_value + 1;

      // Check if exceeded
      const policy = await this.policyRepo.findOne({
        where: { id: currentSequence.policy_id },
      });

      if (
        policy?.sequence_end &&
        nextValue > policy.sequence_end
      ) {
        currentSequence.is_exhausted = true;
        currentSequence.exhausted_at = new Date();
        await queryRunner.manager.save(currentSequence);
        await queryRunner.commitTransaction();
        throw new BadRequestException('Sequence exhausted');
      }

      // Update sequence
      currentSequence.current_value = nextValue;
      currentSequence.last_issued_value = nextValue;
      currentSequence.issued_count += 1;
      currentSequence.lock_version += 1;
      currentSequence.last_issued_value = nextValue;

      await queryRunner.manager.save(currentSequence);
      await queryRunner.commitTransaction();

      return nextValue;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async acquireDistributedLock(sequence: EmployeeIDSequence): Promise<boolean> {
    // Simplified lock mechanism (production should use Redis)
    const lockTimeout = sequence.policy?.lock_timeout_ms || 5000;
    const maxRetries = sequence.policy?.max_retry_attempts || 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const locked = await this.sequenceRepo.findOne({
        where: {
          id: sequence.id,
          locked_by: IsNull(),
        },
      });

      if (locked) {
        locked.locked_by = sequence.id; // Use sequence ID as lock identifier
        locked.locked_at = new Date();
        await this.sequenceRepo.save(locked);
        return true;
      }

      // Check if lock expired
      const currentLock = await this.sequenceRepo.findOne({
        where: { id: sequence.id },
      });

      if (currentLock.locked_at) {
        const lockAge = Date.now() - currentLock.locked_at.getTime();
        if (lockAge > lockTimeout) {
          // Release expired lock
          currentLock.locked_by = null;
          currentLock.locked_at = null;
          await this.sequenceRepo.save(currentLock);
          continue;
        }
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return false;
  }

  async resetSequence(dto: ResetSequenceDto): Promise<EmployeeIDSequence> {
    const sequence = await this.sequenceRepo.findOne({
      where: {
        policy_id: dto.policy_id,
        scope_key: dto.scope_key || 'GLOBAL',
      },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    sequence.current_value = dto.reset_to_value;
    sequence.last_reset_at = new Date();
    sequence.is_exhausted = false;
    sequence.exhausted_at = null;

    const updated = await this.sequenceRepo.save(sequence);

    // Audit
    await this.createAuditLog({
      tenant_id: sequence.tenant_id,
      policy_id: sequence.policy_id,
      action: 'SEQUENCE_RESET',
      performed_by: dto.reset_by,
      changes: [
        {
          field: 'current_value',
          old_value: sequence.current_value,
          new_value: dto.reset_to_value,
        },
      ],
    });

    return updated;
  }

  // ===== HELPER METHODS =====

  private buildScopeKey(policy: EmployeeIDPolicy, context: Record<string, any>): string {
    // Build hierarchical scope key based on policy level
    switch (policy.policy_level) {
      case PolicyLevel.GLOBAL:
        return 'GLOBAL';
      case PolicyLevel.COUNTRY:
        return context.country_code || 'UNKNOWN';
      case PolicyLevel.LEGAL_ENTITY:
        return `${context.country_code}_${context.legal_entity_id || 'UNKNOWN'}`;
      case PolicyLevel.BUSINESS_UNIT:
        return `${context.country_code}_${context.legal_entity_id}_${context.business_unit_id || 'UNKNOWN'}`;
      case PolicyLevel.EMPLOYMENT_TYPE:
        return `${context.country_code}_${context.employment_type || 'UNKNOWN'}`;
      default:
        return 'GLOBAL';
    }
  }

  private requiresNewVersion(
    policy: EmployeeIDPolicy,
    updates: UpdateEmployeeIDPolicyDto,
  ): boolean {
    // Breaking changes that require new version
    const breakingFields = ['id_pattern', 'sequence_reset_frequency'];

    return breakingFields.some((field) => updates[field] !== undefined);
  }

  private async createNewVersion(
    policy: EmployeeIDPolicy,
    updates: UpdateEmployeeIDPolicyDto,
  ): Promise<EmployeeIDPolicy> {
    // Mark current as superseded
    policy.is_current_version = false;
    policy.effective_to = new Date();
    await this.policyRepo.save(policy);

    // Create new version
    const newVersion = this.policyRepo.create({
      ...policy,
      id: undefined,
      ...updates,
      version_number: policy.version_number + 1,
      previous_version_id: policy.id,
      is_current_version: true,
      effective_from: new Date().toISOString(),
      effective_to: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.policyRepo.save(newVersion);
  }

  private trackChanges(
    policy: EmployeeIDPolicy,
    updates: UpdateEmployeeIDPolicyDto,
  ): Array<{ field: string; old_value: any; new_value: any }> {
    const changes = [];

    for (const [key, value] of Object.entries(updates)) {
      if (policy[key] !== value && key !== 'updated_by') {
        changes.push({
          field: key,
          old_value: policy[key],
          new_value: value,
        });
      }
    }

    return changes;
  }

  private validatePolicyForActivation(policy: EmployeeIDPolicy): void {
    if (!policy.id_pattern) {
      throw new BadRequestException('ID pattern is required');
    }

    if (!policy.sequence_start) {
      throw new BadRequestException('Sequence start is required');
    }

    // Additional validation...
  }

  private async createAuditLog(data: {
    tenant_id: string;
    policy_id: string;
    employee_id?: string;
    assignment_id?: string;
    action: string;
    performed_by: string;
    changes: Array<{ field: string; old_value: any; new_value: any }>;
  }): Promise<void> {
    const audit = this.auditRepo.create({
      ...data,
      ip_address: '0.0.0.0', // Should get from request context
      user_agent: 'BackendService',
      performed_by_name: 'System',
    });

    await this.auditRepo.save(audit);
  }

  // ===== QUERY METHODS =====

  async getApplicablePolicy(dto: GetApplicablePolicyDto): Promise<EmployeeIDPolicy | null> {
    const effectiveDate = dto.effective_date || new Date().toISOString();

    // Priority order: EMPLOYMENT_TYPE > BUSINESS_UNIT > LEGAL_ENTITY > COUNTRY > GLOBAL
    const levels = [
      PolicyLevel.EMPLOYMENT_TYPE,
      PolicyLevel.BUSINESS_UNIT,
      PolicyLevel.LEGAL_ENTITY,
      PolicyLevel.COUNTRY,
      PolicyLevel.GLOBAL,
    ];

    for (const level of levels) {
      let levelValue = null;

      switch (level) {
        case PolicyLevel.EMPLOYMENT_TYPE:
          levelValue = dto.employment_type;
          break;
        case PolicyLevel.BUSINESS_UNIT:
          levelValue = dto.business_unit_id;
          break;
        case PolicyLevel.LEGAL_ENTITY:
          levelValue = dto.legal_entity_id;
          break;
        case PolicyLevel.COUNTRY:
          levelValue = dto.country_code;
          break;
        case PolicyLevel.GLOBAL:
          levelValue = null;
          break;
      }

      if (level !== PolicyLevel.GLOBAL && !levelValue) continue;

      const policy = await this.policyRepo.findOne({
        where: {
          tenant_id: dto.tenant_id,
          policy_level: level,
          level_value: levelValue,
          status: PolicyStatus.ACTIVE,
          is_current_version: true,
          effective_from: LessThan(new Date(effectiveDate)),
        },
        order: { priority: 'DESC' },
      });

      if (policy) {
        return policy;
      }
    }

    return null;
  }

  async searchAssignments(dto: EmployeeIDSearchDto): Promise<{
    data: EmployeeIDAssignment[];
    total: number;
  }> {
    const { page = 1, limit = 20, ...filters } = dto;
    const skip = (page - 1) * limit;

    const whereConditions: any = { tenant_id: dto.tenant_id };

    if (filters.employee_number)
      whereConditions.employee_number = filters.employee_number;
    if (filters.employee_id) whereConditions.employee_id = filters.employee_id;
    if (filters.is_current !== undefined) whereConditions.is_current = filters.is_current;

    const [data, total] = await this.assignmentRepo.findAndCount({
      where: whereConditions,
      relations: ['policy'],
      order: { assigned_at: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  // ===== ID TRANSITION METHODS =====

  async transitionEmployeeID(dto: TransitionEmployeeIDDto): Promise<EmployeeIDAssignment> {
    // Get current temporary/candidate assignment
    const currentAssignment = await this.assignmentRepo.findOne({
      where: { id: dto.assignment_id },
      relations: ['policy'],
    });

    if (!currentAssignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Verify it's a temporary or candidate ID
    if (currentAssignment.id_type === EmployeeIDType.MASTER) {
      throw new BadRequestException('Assignment is already a master ID');
    }

    // Check if already transitioned
    if (currentAssignment.transitioned_to_id) {
      throw new BadRequestException('Assignment has already been transitioned');
    }

    // Get master policy
    const masterPolicy = await this.getPolicyById(dto.master_policy_id);

    if (masterPolicy.id_type !== EmployeeIDType.MASTER) {
      throw new BadRequestException('Target policy must be a MASTER type policy');
    }

    // Check transition rules if configured
    if (currentAssignment.policy.transition_rules?.require_approval && !dto.approved_by) {
      throw new BadRequestException('Transition requires approval');
    }

    // Check pre-conditions
    if (currentAssignment.policy.transition_rules?.pre_conditions) {
      const preConditions = currentAssignment.policy.transition_rules.pre_conditions;
      // In production, validate these conditions against employee record
      // For now, we'll log them
      console.log('Pre-conditions to check:', preConditions);
    }

    // Generate master employee ID
    const generated = await this.generateEmployeeID({
      tenant_id: currentAssignment.tenant_id,
      policy_id: dto.master_policy_id,
      context: currentAssignment.metadata || {},
      preview_only: false,
    });

    // Create master ID assignment
    const masterAssignment = this.assignmentRepo.create({
      tenant_id: currentAssignment.tenant_id,
      employee_id: currentAssignment.employee_id,
      employee_number: generated.employee_number,
      policy_id: dto.master_policy_id,
      assignment_type: 'TRANSITION',
      effective_from: new Date().toISOString(),
      is_current: true,
      is_primary: true,
      id_type: EmployeeIDType.MASTER,
      is_temporary: false,
      transitioned_from_id: currentAssignment.id,
      transitioned_at: new Date(),
      transition_trigger_used: dto.trigger,
      transition_notes: dto.transition_notes,
      metadata: currentAssignment.metadata,
      generation_context: generated.generation_context,
      assignment_sequence: currentAssignment.assignment_sequence,
      assigned_by: dto.transitioned_by,
    });

    const savedMaster = await this.assignmentRepo.save(masterAssignment);

    // Update temporary/candidate assignment
    currentAssignment.is_current = false;
    currentAssignment.effective_to = new Date();
    currentAssignment.transitioned_to_id = savedMaster.id;
    currentAssignment.transitioned_at = new Date();
    currentAssignment.transition_trigger_used = dto.trigger;

    if (!currentAssignment.policy.retain_temporary_in_history) {
      // Mark as inactive but keep in database
      currentAssignment.is_primary = false;
    }

    await this.assignmentRepo.save(currentAssignment);

    // Create audit log
    await this.createAuditLog({
      tenant_id: currentAssignment.tenant_id,
      policy_id: dto.master_policy_id,
      employee_id: currentAssignment.employee_id,
      assignment_id: savedMaster.id,
      action: 'ID_TRANSITION',
      performed_by: dto.transitioned_by,
      changes: [
        {
          field: 'id_type',
          old_value: currentAssignment.id_type,
          new_value: EmployeeIDType.MASTER,
        },
        {
          field: 'employee_number',
          old_value: currentAssignment.employee_number,
          new_value: savedMaster.employee_number,
        },
        {
          field: 'transition_trigger',
          old_value: null,
          new_value: dto.trigger,
        },
      ],
    });

    // Send notification if configured
    if (currentAssignment.policy.notify_on_transition) {
      // In production, trigger notification service
      console.log(`Notification: Employee ${currentAssignment.employee_id} transitioned from ${currentAssignment.employee_number} to ${savedMaster.employee_number}`);
    }

    return savedMaster;
  }

  async checkTransitionEligibility(dto: CheckTransitionEligibilityDto): Promise<{
    eligible: boolean;
    reasons: string[];
    current_id_type: EmployeeIDType;
    days_until_expiry?: number;
  }> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: dto.assignment_id },
      relations: ['policy'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const reasons: string[] = [];
    let eligible = true;

    // Check if already master
    if (assignment.id_type === EmployeeIDType.MASTER) {
      eligible = false;
      reasons.push('ID is already a master ID');
    }

    // Check if already transitioned
    if (assignment.transitioned_to_id) {
      eligible = false;
      reasons.push('ID has already been transitioned');
    }

    // Check expiry
    let daysUntilExpiry: number | undefined;
    if (assignment.temporary_expires_at) {
      const expiryDate = new Date(assignment.temporary_expires_at);
      const today = new Date();
      daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        eligible = false;
        reasons.push('Temporary ID has expired');
      } else if (daysUntilExpiry < 7) {
        reasons.push(`Temporary ID expires in ${daysUntilExpiry} days`);
      }
    }

    // Check if master policy is configured
    if (!assignment.policy.master_policy_id) {
      eligible = false;
      reasons.push('No master policy configured for transition');
    }

    // Check pre-conditions
    if (assignment.policy.transition_rules?.pre_conditions) {
      const preConditions = assignment.policy.transition_rules.pre_conditions;
      // In production, validate against employee record
      reasons.push(`Pre-conditions required: ${preConditions.join(', ')}`);
    }

    return {
      eligible,
      reasons: reasons.length > 0 ? reasons : ['Eligible for transition'],
      current_id_type: assignment.id_type,
      days_until_expiry: daysUntilExpiry,
    };
  }

  async getIDsByType(dto: GetIDByTypeDto): Promise<{
    data: EmployeeIDAssignment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.assignmentRepo.findAndCount({
      where: {
        tenant_id: dto.tenant_id,
        id_type: dto.id_type,
        is_current: true,
      },
      relations: ['policy'],
      order: { assigned_at: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getExpiringSoonIDs(tenantId: string, daysThreshold: number = 30): Promise<EmployeeIDAssignment[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return await this.assignmentRepo.find({
      where: {
        tenant_id: tenantId,
        is_temporary: true,
        is_current: true,
      },
      relations: ['policy'],
      order: { temporary_expires_at: 'ASC' },
    });
  }
}

