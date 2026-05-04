import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AdditionalAssignmentType } from '../../entities/additional-assignment-type.entity';
import {
  CreateAdditionalAssignmentTypeDto,
  UpdateAdditionalAssignmentTypeDto,
  DeactivateAssignmentTypeDto,
  AssignmentTypeImpactDto,
} from '../../dto/additional-assignment.dto';

/**
 * Service for Additional Assignment Type Configuration Management
 * 
 * ARCHITECTURE: Configuration-only - No employee data or transactional records
 * PURPOSE: Define and manage additional assignment type policies and behavioral rules
 */
@Injectable()
export class AdditionalAssignmentService {
  constructor(
    @InjectRepository(AdditionalAssignmentType)
    private readonly assignmentTypeRepository: Repository<AdditionalAssignmentType>,
  ) {}

  // ==================== CREATE OPERATIONS ====================

  /**
   * Create a new assignment type configuration
   */
  async createAssignmentType(dto: CreateAdditionalAssignmentTypeDto): Promise<AdditionalAssignmentType> {
    // Validate unique assignment type code per tenant
    const existing = await this.assignmentTypeRepository.findOne({
      where: {
        tenant_id: dto.tenant_id,
        assignment_type_code: dto.assignment_type_code,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Assignment type code "${dto.assignment_type_code}" already exists for this tenant`
      );
    }

    // Validate date logic
    if (dto.effective_to && dto.effective_from > dto.effective_to) {
      throw new BadRequestException('effective_to must be after effective_from');
    }

    // Validate duration logic
    if (dto.minimum_duration_days && dto.maximum_duration_days) {
      if (dto.minimum_duration_days > dto.maximum_duration_days) {
        throw new BadRequestException('minimum_duration_days cannot exceed maximum_duration_days');
      }
    }

    const assignmentType = this.assignmentTypeRepository.create(dto);
    return await this.assignmentTypeRepository.save(assignmentType);
  }

  // ==================== READ OPERATIONS ====================

  /**
   * Get all assignment types with optional filters
   */
  async getAllAssignmentTypes(filters: {
    tenant_id?: string;
    company_id?: string;
    legal_entity_id?: string;
    assignment_category?: string;
    is_active?: boolean;
  }): Promise<AdditionalAssignmentType[]> {
    const queryBuilder = this.assignmentTypeRepository.createQueryBuilder('at');

    if (filters.tenant_id) {
      queryBuilder.andWhere('at.tenant_id = :tenant_id', { tenant_id: filters.tenant_id });
    }

    if (filters.company_id) {
      queryBuilder.andWhere('at.company_id = :company_id', { company_id: filters.company_id });
    }

    if (filters.legal_entity_id) {
      queryBuilder.andWhere('at.legal_entity_id = :legal_entity_id', { legal_entity_id: filters.legal_entity_id });
    }

    if (filters.assignment_category) {
      queryBuilder.andWhere('at.assignment_category = :assignment_category', {
        assignment_category: filters.assignment_category,
      });
    }

    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('at.is_active = :is_active', { is_active: filters.is_active });
    }

    queryBuilder.orderBy('at.display_order', 'ASC').addOrderBy('at.assignment_type_name', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Get assignment type by ID
   */
  async getAssignmentTypeById(id: string): Promise<AdditionalAssignmentType> {
    const assignmentType = await this.assignmentTypeRepository.findOne({ where: { id } });

    if (!assignmentType) {
      throw new NotFoundException(`Assignment type with ID "${id}" not found`);
    }

    return assignmentType;
  }

  /**
   * Get assignment type by code (tenant-scoped)
   */
  async getAssignmentTypeByCode(tenant_id: string, code: string): Promise<AdditionalAssignmentType> {
    const assignmentType = await this.assignmentTypeRepository.findOne({
      where: {
        tenant_id,
        assignment_type_code: code,
      },
    });

    if (!assignmentType) {
      throw new NotFoundException(`Assignment type with code "${code}" not found`);
    }

    return assignmentType;
  }

  // ==================== UPDATE OPERATIONS ====================

  /**
   * Update an assignment type configuration
   */
  async updateAssignmentType(id: string, dto: UpdateAdditionalAssignmentTypeDto): Promise<AdditionalAssignmentType> {
    const assignmentType = await this.getAssignmentTypeById(id);

    // Validate duration logic if being updated
    if (dto['minimum_duration_days'] || dto['maximum_duration_days']) {
      const minDuration = dto['minimum_duration_days'] ?? assignmentType.minimum_duration_days;
      const maxDuration = dto['maximum_duration_days'] ?? assignmentType.maximum_duration_days;

      if (minDuration && maxDuration && minDuration > maxDuration) {
        throw new BadRequestException('minimum_duration_days cannot exceed maximum_duration_days');
      }
    }

    Object.assign(assignmentType, dto);
    return await this.assignmentTypeRepository.save(assignmentType);
  }

  /**
   * Deactivate an assignment type with governance tracking
   */
  async deactivateAssignmentType(id: string, dto: DeactivateAssignmentTypeDto): Promise<AdditionalAssignmentType> {
    const assignmentType = await this.getAssignmentTypeById(id);

    if (!assignmentType.is_active) {
      throw new BadRequestException('Assignment type is already inactive');
    }

    // Check if there are active assignments (usage_count check)
    if (assignmentType.active_assignments_count > 0 && dto.active_assignments_action === 'AutoTerminate') {
      // In a real implementation, this would trigger a background job to terminate assignments
      // For now, we just log the intent
    }

    assignmentType.is_active = false;
    assignmentType.deactivation_reason = dto.deactivation_reason;
    assignmentType.deactivated_at = new Date();
    assignmentType.superseded_by = dto.superseded_by || null;

    return await this.assignmentTypeRepository.save(assignmentType);
  }

  /**
   * Delete an assignment type (hard delete)
   */
  async deleteAssignmentType(id: string): Promise<void> {
    const assignmentType = await this.getAssignmentTypeById(id);

    // Safety check: Don't delete if used or system-defined
    if (assignmentType.is_system_defined) {
      throw new BadRequestException('Cannot delete system-defined assignment types');
    }

    if (assignmentType.total_assignments_count > 0) {
      throw new BadRequestException(
        'Cannot delete assignment type that has been used. Consider deactivating instead.'
      );
    }

    await this.assignmentTypeRepository.remove(assignmentType);
  }

  /**
   * Toggle assignment type active status
   */
  async toggleStatus(id: string): Promise<AdditionalAssignmentType> {
    const assignmentType = await this.getAssignmentTypeById(id);
    assignmentType.is_active = !assignmentType.is_active;

    if (assignmentType.is_active) {
      assignmentType.deactivation_reason = null;
      assignmentType.deactivated_at = null;
    }

    return await this.assignmentTypeRepository.save(assignmentType);
  }

  /**
   * Reorder assignment types (bulk display_order update)
   */
  async reorderAssignmentTypes(orderedIds: string[]): Promise<void> {
    const updates = orderedIds.map((id, index) =>
      this.assignmentTypeRepository.update(id, { display_order: index + 1 })
    );

    await Promise.all(updates);
  }

  // ==================== QUERY & FILTERING OPERATIONS ====================

  /**
   * Get assignment types by category
   */
  async getAssignmentTypesByCategory(
    tenant_id: string,
    category: string,
    active_only: boolean = true
  ): Promise<AdditionalAssignmentType[]> {
    const where: any = { tenant_id, assignment_category: category };
    if (active_only) {
      where.is_active = true;
    }

    return await this.assignmentTypeRepository.find({
      where,
      order: { display_order: 'ASC', assignment_type_name: 'ASC' },
    });
  }

  /**
   * Get assignment types applicable for a specific country
   */
  async getAssignmentTypesByCountry(
    tenant_id: string,
    country_code: string,
    active_only: boolean = true
  ): Promise<AdditionalAssignmentType[]> {
    const queryBuilder = this.assignmentTypeRepository.createQueryBuilder('at');

    queryBuilder
      .where('at.tenant_id = :tenant_id', { tenant_id })
      .andWhere(
        '(at.applicable_country_code = :country_code OR :country_code = ANY(at.applicable_countries) OR at.applicable_country_code IS NULL)',
        { country_code }
      );

    if (active_only) {
      queryBuilder.andWhere('at.is_active = :is_active', { is_active: true });
    }

    queryBuilder.orderBy('at.display_order', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Get effective assignment types for a specific date
   */
  async getEffectiveAssignmentTypes(tenant_id: string, effective_date: string): Promise<AdditionalAssignmentType[]> {
    return await this.assignmentTypeRepository.find({
      where: {
        tenant_id,
        is_active: true,
        effective_from: LessThanOrEqual(effective_date),
        effective_to: MoreThanOrEqual(effective_date) || IsNull(),
      },
      order: { display_order: 'ASC' },
    });
  }

  /**
   * Get assignment types requiring specific approvals
   */
  async getAssignmentTypesRequiringApproval(
    tenant_id: string,
    approval_type: 'dual' | 'legal' | 'executive'
  ): Promise<AdditionalAssignmentType[]> {
    const where: any = { tenant_id, is_active: true };

    if (approval_type === 'dual') {
      where.dual_approval_required = true;
    } else if (approval_type === 'legal') {
      where.legal_approval_required = true;
    } else if (approval_type === 'executive') {
      where.executive_approval_required = true;
    }

    return await this.assignmentTypeRepository.find({ where, order: { display_order: 'ASC' } });
  }

  // ==================== ANALYTICS & STATISTICS ====================

  /**
   * Get assignment type usage statistics
   */
  async getAssignmentTypeStatistics(tenant_id: string): Promise<any> {
    const assignmentTypes = await this.getAllAssignmentTypes({ tenant_id });

    const totalTypes = assignmentTypes.length;
    const activeTypes = assignmentTypes.filter((at) => at.is_active).length;
    const inactiveTypes = totalTypes - activeTypes;
    const totalActiveAssignments = assignmentTypes.reduce((sum, at) => sum + at.active_assignments_count, 0);
    const totalHistoricalAssignments = assignmentTypes.reduce((sum, at) => sum + at.total_assignments_count, 0);

    const byCategory = assignmentTypes.reduce((acc, at) => {
      const category = at.assignment_category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, active: 0, total_usage: 0 };
      }
      acc[category].count++;
      if (at.is_active) acc[category].active++;
      acc[category].total_usage += at.total_assignments_count;
      return acc;
    }, {});

    return {
      totalTypes,
      activeTypes,
      inactiveTypes,
      totalActiveAssignments,
      totalHistoricalAssignments,
      byCategory,
    };
  }

  /**
   * Get most used assignment types
   */
  async getMostUsedAssignmentTypes(tenant_id: string, limit: number = 10): Promise<AdditionalAssignmentType[]> {
    return await this.assignmentTypeRepository.find({
      where: { tenant_id, is_active: true },
      order: { total_assignments_count: 'DESC' },
      take: limit,
    });
  }

  /**
   * Validate assignment type configuration
   */
  async validateConfiguration(id: string): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const assignmentType = await this.getAssignmentTypeById(id);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Duration validation
    if (assignmentType.minimum_duration_days && assignmentType.maximum_duration_days) {
      if (assignmentType.minimum_duration_days > assignmentType.maximum_duration_days) {
        errors.push('Minimum duration exceeds maximum duration');
      }
    }

    // Extension validation
    if (assignmentType.extension_allowed && !assignmentType.maximum_extensions_count) {
      warnings.push('Extensions allowed but no maximum count specified');
    }

    // Payroll validation
    if (assignmentType.allow_temporary_salary_uplift && !assignmentType.default_salary_uplift_percentage) {
      warnings.push('Salary uplift allowed but no default percentage specified');
    }

    // Authority validation
    if (assignmentType.financial_approval_limit_override && !assignmentType.financial_approval_limit_amount) {
      warnings.push('Financial approval override allowed but no limit amount specified');
    }

    // Approval validation
    if (assignmentType.mandatory_justification && !assignmentType.minimum_justification_length) {
      warnings.push('Mandatory justification enabled but no minimum length specified');
    }

    // Date validation
    if (assignmentType.effective_to && assignmentType.effective_from > assignmentType.effective_to) {
      errors.push('Effective end date is before start date');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ==================== IMPACT ANALYSIS ====================

  /**
   * Get deactivation impact analysis
   */
  async getDeactivationImpact(id: string): Promise<AssignmentTypeImpactDto> {
    const assignmentType = await this.getAssignmentTypeById(id);

    const affected_workflows: string[] = [];
    if (assignmentType.approval_workflow_required) affected_workflows.push('Approval Workflow');
    if (assignmentType.sync_to_payroll) affected_workflows.push('Payroll Integration');
    if (assignmentType.sync_to_time_attendance) affected_workflows.push('Time & Attendance');
    if (assignmentType.sync_to_access_control) affected_workflows.push('Access Control');

    const integration_dependencies: string[] = [];
    if (assignmentType.external_system_code) {
      integration_dependencies.push(`External System: ${assignmentType.external_system_code}`);
    }
    if (assignmentType.payroll_integration_code) {
      integration_dependencies.push(`Payroll: ${assignmentType.payroll_integration_code}`);
    }

    const can_deactivate_safely = assignmentType.active_assignments_count === 0;

    const warnings: string[] = [];
    if (assignmentType.active_assignments_count > 0) {
      warnings.push(`${assignmentType.active_assignments_count} active assignments will be affected`);
    }
    if (assignmentType.is_system_defined) {
      warnings.push('This is a system-defined type - deactivation not recommended');
    }
    if (affected_workflows.length > 0) {
      warnings.push('Integrated workflows will be affected');
    }

    return {
      assignment_type_id: assignmentType.id,
      assignment_type_code: assignmentType.assignment_type_code,
      active_assignments_count: assignmentType.active_assignments_count,
      affected_workflows,
      integration_dependencies,
      can_deactivate_safely,
      warnings,
    };
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk create assignment types from templates
   */
  async bulkCreateAssignmentTypes(dtos: CreateAdditionalAssignmentTypeDto[]): Promise<AdditionalAssignmentType[]> {
    const created: AdditionalAssignmentType[] = [];

    for (const dto of dtos) {
      try {
        const assignmentType = await this.createAssignmentType(dto);
        created.push(assignmentType);
      } catch (error) {
        // Log error but continue with other creations
        console.error(`Failed to create assignment type ${dto.assignment_type_code}:`, error.message);
      }
    }

    return created;
  }

  /**
   * Clone an assignment type to another tenant/company
   */
  async cloneAssignmentType(
    id: string,
    target_tenant_id: string,
    target_company_id?: string
  ): Promise<AdditionalAssignmentType> {
    const source = await this.getAssignmentTypeById(id);

    const cloneDto: CreateAdditionalAssignmentTypeDto = {
      ...source,
      tenant_id: target_tenant_id,
      company_id: target_company_id || source.company_id,
      assignment_type_code: `${source.assignment_type_code}_CLONE`,
    };

    // Remove fields that shouldn't be cloned
    delete cloneDto['id'];
    delete cloneDto['created_at'];
    delete cloneDto['updated_at'];
    delete cloneDto['active_assignments_count'];
    delete cloneDto['total_assignments_count'];
    delete cloneDto['last_used_at'];

    return await this.createAssignmentType(cloneDto);
  }

  // ==================== USAGE TRACKING (Transactional Counts Only) ====================

  /**
   * Increment active assignments count
   * Called by assignment transaction module when a new assignment is created
   */
  async incrementActiveAssignments(id: string): Promise<void> {
    await this.assignmentTypeRepository.increment({ id }, 'active_assignments_count', 1);
    await this.assignmentTypeRepository.increment({ id }, 'total_assignments_count', 1);
    await this.assignmentTypeRepository.update(id, { last_used_at: new Date() });
  }

  /**
   * Decrement active assignments count
   * Called by assignment transaction module when an assignment ends
   */
  async decrementActiveAssignments(id: string): Promise<void> {
    const assignmentType = await this.getAssignmentTypeById(id);
    if (assignmentType.active_assignments_count > 0) {
      await this.assignmentTypeRepository.decrement({ id }, 'active_assignments_count', 1);
    }
  }
}
