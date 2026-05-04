import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { SeparationReasonCategory } from '../../entities/separation-reason-category.entity';
import { SeparationReason } from '../../entities/separation-reason.entity';
import {
  CreateSeparationReasonCategoryDto,
  UpdateSeparationReasonCategoryDto,
  CreateSeparationReasonDto,
  UpdateSeparationReasonDto,
  DeactivateSeparationReasonDto,
} from '../../dto/separation-reason.dto';

@Injectable()
export class SeparationReasonService {
  constructor(
    @InjectRepository(SeparationReasonCategory)
    private categoryRepository: Repository<SeparationReasonCategory>,
    @InjectRepository(SeparationReason)
    private reasonRepository: Repository<SeparationReason>,
  ) {}

  // ==================== CATEGORY OPERATIONS ====================

  /**
   * Create a new separation reason category
   */
  async createCategory(dto: CreateSeparationReasonCategoryDto): Promise<SeparationReasonCategory> {
    // Check for duplicate category code
    const existing = await this.categoryRepository.findOne({
      where: { category_code: dto.category_code, tenant_id: dto.tenant_id },
    });

    if (existing) {
      throw new ConflictException(`Category code '${dto.category_code}' already exists for this tenant`);
    }

    const category = this.categoryRepository.create(dto);
    return await this.categoryRepository.save(category);
  }

  /**
   * Get all categories (optionally filtered by tenant/company)
   */
  async getAllCategories(tenantId?: string, companyId?: string, activeOnly: boolean = false): Promise<SeparationReasonCategory[]> {
    const query = this.categoryRepository.createQueryBuilder('category').leftJoinAndSelect('category.reasons', 'reasons').orderBy('category.display_order', 'ASC');

    if (tenantId) {
      query.andWhere('category.tenant_id = :tenantId', { tenantId });
    }

    if (companyId) {
      query.andWhere('category.company_id = :companyId', { companyId });
    }

    if (activeOnly) {
      query.andWhere('category.is_active = :active', { active: true });
    }

    return await query.getMany();
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<SeparationReasonCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['reasons'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    return category;
  }

  /**
   * Get category by code
   */
  async getCategoryByCode(categoryCode: string, tenantId: string): Promise<SeparationReasonCategory> {
    const category = await this.categoryRepository.findOne({
      where: { category_code: categoryCode, tenant_id: tenantId },
      relations: ['reasons'],
    });

    if (!category) {
      throw new NotFoundException(`Category with code '${categoryCode}' not found for this tenant`);
    }

    return category;
  }

  /**
   * Update category
   */
  async updateCategory(id: string, dto: UpdateSeparationReasonCategoryDto): Promise<SeparationReasonCategory> {
    const category = await this.getCategoryById(id);

    Object.assign(category, dto);
    return await this.categoryRepository.save(category);
  }

  /**
   * Delete category (soft delete by deactivating)
   */
  async deleteCategory(id: string): Promise<void> {
    const category = await this.getCategoryById(id);

    // Check if category is system-defined
    if (category.is_system_defined) {
      throw new BadRequestException('Cannot delete system-defined category');
    }

    // Check if category has active reasons
    const activeReasonCount = await this.reasonRepository.count({
      where: { category_id: id, is_active: true },
    });

    if (activeReasonCount > 0) {
      throw new BadRequestException(`Cannot delete category with ${activeReasonCount} active reason(s). Deactivate reasons first.`);
    }

    category.is_active = false;
    category.deactivated_at = new Date().toISOString();
    await this.categoryRepository.save(category);
  }

  /**
   * Toggle category status
   */
  async toggleCategoryStatus(id: string): Promise<SeparationReasonCategory> {
    const category = await this.getCategoryById(id);
    category.is_active = !category.is_active;

    if (!category.is_active) {
      category.deactivated_at = new Date().toISOString();
    } else {
      category.deactivated_at = null;
    }

    return await this.categoryRepository.save(category);
  }

  /**
   * Reorder categories
   */
  async reorderCategories(categoryOrders: { id: string; display_order: number }[]): Promise<void> {
    for (const order of categoryOrders) {
      await this.categoryRepository.update(order.id, { display_order: order.display_order });
    }
  }

  // ==================== REASON OPERATIONS ====================

  /**
   * Create a new separation reason
   */
  async createReason(dto: CreateSeparationReasonDto): Promise<SeparationReason> {
    // Validate category exists
    await this.getCategoryById(dto.category_id);

    // Check for duplicate reason code
    const existing = await this.reasonRepository.findOne({
      where: { reason_code: dto.reason_code, tenant_id: dto.tenant_id },
    });

    if (existing) {
      throw new ConflictException(`Reason code '${dto.reason_code}' already exists for this tenant`);
    }

    const reason = this.reasonRepository.create(dto);
    return await this.reasonRepository.save(reason);
  }

  /**
   * Get all reasons (with filters)
   */
  async getAllReasons(
    tenantId?: string,
    companyId?: string,
    categoryId?: string,
    activeOnly: boolean = false,
    includeCategory: boolean = true,
  ): Promise<SeparationReason[]> {
    const query = this.reasonRepository.createQueryBuilder('reason');

    if (includeCategory) {
      query.leftJoinAndSelect('reason.category', 'category');
    }

    if (tenantId) {
      query.andWhere('reason.tenant_id = :tenantId', { tenantId });
    }

    if (companyId) {
      query.andWhere('reason.company_id = :companyId', { companyId });
    }

    if (categoryId) {
      query.andWhere('reason.category_id = :categoryId', { categoryId });
    }

    if (activeOnly) {
      query.andWhere('reason.is_active = :active', { active: true });
    }

    query.orderBy('reason.display_order', 'ASC');

    return await query.getMany();
  }

  /**
   * Get reason by ID
   */
  async getReasonById(id: string): Promise<SeparationReason> {
    const reason = await this.reasonRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!reason) {
      throw new NotFoundException(`Reason with ID '${id}' not found`);
    }

    return reason;
  }

  /**
   * Get reason by code
   */
  async getReasonByCode(reasonCode: string, tenantId: string): Promise<SeparationReason> {
    const reason = await this.reasonRepository.findOne({
      where: { reason_code: reasonCode, tenant_id: tenantId },
      relations: ['category'],
    });

    if (!reason) {
      throw new NotFoundException(`Reason with code '${reasonCode}' not found for this tenant`);
    }

    return reason;
  }

  /**
   * Update reason
   */
  async updateReason(id: string, dto: UpdateSeparationReasonDto): Promise<SeparationReason> {
    const reason = await this.getReasonById(id);

    // If category is being changed, validate new category exists
    if (dto.category_id && dto.category_id !== reason.category_id) {
      await this.getCategoryById(dto.category_id);
    }

    Object.assign(reason, dto);
    return await this.reasonRepository.save(reason);
  }

  /**
   * Deactivate reason (with governance)
   */
  async deactivateReason(id: string, dto: DeactivateSeparationReasonDto): Promise<SeparationReason> {
    const reason = await this.getReasonById(id);

    if (reason.is_system_defined) {
      throw new BadRequestException('Cannot deactivate system-defined reason');
    }

    reason.is_active = false;
    reason.is_historical = true;
    reason.deactivation_reason = dto.deactivation_reason;
    reason.deactivated_at = new Date().toISOString();

    if (dto.superseded_by) {
      // Validate replacement reason exists
      await this.getReasonById(dto.superseded_by);
      reason.superseded_by = dto.superseded_by;
    }

    return await this.reasonRepository.save(reason);
  }

  /**
   * Delete reason (hard delete - use cautiously)
   */
  async deleteReason(id: string): Promise<void> {
    const reason = await this.getReasonById(id);

    if (reason.is_system_defined) {
      throw new BadRequestException('Cannot delete system-defined reason');
    }

    if (reason.usage_count > 0) {
      throw new BadRequestException(`Cannot delete reason that has been used ${reason.usage_count} time(s). Deactivate instead.`);
    }

    await this.reasonRepository.delete(id);
  }

  /**
   * Toggle reason status
   */
  async toggleReasonStatus(id: string): Promise<SeparationReason> {
    const reason = await this.getReasonById(id);
    reason.is_active = !reason.is_active;

    if (!reason.is_active) {
      reason.deactivated_at = new Date().toISOString();
      reason.is_historical = true;
    } else {
      reason.deactivated_at = null;
      reason.is_historical = false;
    }

    return await this.reasonRepository.save(reason);
  }

  /**
   * Reorder reasons within a category
   */
  async reorderReasons(reasonOrders: { id: string; display_order: number }[]): Promise<void> {
    for (const order of reasonOrders) {
      await this.reasonRepository.update(order.id, { display_order: order.display_order });
    }
  }

  /**
   * Increment usage count (called by separation transaction module)
   */
  async incrementUsageCount(id: string): Promise<void> {
    const reason = await this.getReasonById(id);
    reason.usage_count += 1;
    reason.last_used_at = new Date().toISOString();
    await this.reasonRepository.save(reason);
  }

  // ==================== QUERY & FILTERING ====================

  /**
   * Get reasons by visibility (for role-based access)
   */
  async getReasonsByVisibility(
    tenantId: string,
    userRole: 'employee' | 'manager' | 'hr',
    companyId?: string,
  ): Promise<SeparationReason[]> {
    const query = this.reasonRepository
      .createQueryBuilder('reason')
      .leftJoinAndSelect('reason.category', 'category')
      .where('reason.tenant_id = :tenantId', { tenantId })
      .andWhere('reason.is_active = :active', { active: true });

    if (companyId) {
      query.andWhere('reason.company_id = :companyId', { companyId });
    }

    // Apply visibility filters based on role
    if (userRole === 'employee') {
      query.andWhere('reason.employee_self_service_allowed = :allowed', { allowed: true });
      query.andWhere('reason.hr_only = :hrOnly', { hrOnly: false });
    } else if (userRole === 'manager') {
      query.andWhere('reason.manager_visible = :visible', { visible: true });
      query.andWhere('reason.hr_only = :hrOnly', { hrOnly: false });
    }
    // HR sees all

    query.orderBy('category.display_order', 'ASC').addOrderBy('reason.display_order', 'ASC');

    return await query.getMany();
  }

  /**
   * Get reasons by classification (voluntary, involuntary, etc.)
   */
  async getReasonsByClassification(tenantId: string, classification: string): Promise<SeparationReason[]> {
    return await this.reasonRepository.find({
      where: {
        tenant_id: tenantId,
        voluntary_classification: classification,
        is_active: true,
      },
      relations: ['category'],
      order: { display_order: 'ASC' },
    });
  }

  /**
   * Get reasons by country
   */
  async getReasonsByCountry(tenantId: string, countryCode: string): Promise<SeparationReason[]> {
    const query = this.reasonRepository
      .createQueryBuilder('reason')
      .leftJoinAndSelect('reason.category', 'category')
      .where('reason.tenant_id = :tenantId', { tenantId })
      .andWhere('reason.is_active = :active', { active: true })
      .andWhere(
        '(reason.applicable_country_code = :countryCode OR :countryCode = ANY(reason.applicable_countries) OR reason.applicable_country_code IS NULL)',
        { countryCode },
      )
      .orderBy('reason.display_order', 'ASC');

    return await query.getMany();
  }

  /**
   * Get effective reasons (within date range)
   */
  async getEffectiveReasons(tenantId: string, effectiveDate: string = new Date().toISOString().split('T')[0]): Promise<SeparationReason[]> {
    const query = this.reasonRepository
      .createQueryBuilder('reason')
      .leftJoinAndSelect('reason.category', 'category')
      .where('reason.tenant_id = :tenantId', { tenantId })
      .andWhere('reason.is_active = :active', { active: true })
      .andWhere('reason.effective_from <= :effectiveDate', { effectiveDate })
      .andWhere('(reason.effective_to IS NULL OR reason.effective_to >= :effectiveDate)', { effectiveDate })
      .orderBy('reason.display_order', 'ASC');

    return await query.getMany();
  }

  // ==================== ANALYTICS & REPORTING ====================

  /**
   * Get category statistics
   */
  async getCategoryStatistics(tenantId: string): Promise<any[]> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.reasons', 'reason')
      .select('category.id', 'category_id')
      .addSelect('category.category_name', 'category_name')
      .addSelect('category.category_code', 'category_code')
      .addSelect('COUNT(reason.id)', 'total_reasons')
      .addSelect('SUM(CASE WHEN reason.is_active = true THEN 1 ELSE 0 END)', 'active_reasons')
      .addSelect('SUM(reason.usage_count)', 'total_usage')
      .where('category.tenant_id = :tenantId', { tenantId })
      .groupBy('category.id')
      .orderBy('category.display_order', 'ASC')
      .getRawMany();
  }

  /**
   * Get most used reasons
   */
  async getMostUsedReasons(tenantId: string, limit: number = 10): Promise<SeparationReason[]> {
    return await this.reasonRepository.find({
      where: { tenant_id: tenantId, is_active: true },
      relations: ['category'],
      order: { usage_count: 'DESC' },
      take: limit,
    });
  }

  /**
   * Validate reason configuration
   */
  async validateReasonConfiguration(id: string): Promise<{ valid: boolean; warnings: string[]; errors: string[] }> {
    const reason = await this.getReasonById(id);
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check if category is active
    if (!reason.category.is_active) {
      errors.push('Reason belongs to inactive category');
    }

    // Check effective dates
    if (reason.effective_to && new Date(reason.effective_to) < new Date()) {
      warnings.push('Reason has expired');
    }

    // Check notice period logic
    if (reason.notice_period_required && !reason.minimum_notice_days) {
      warnings.push('Notice period required but no minimum days specified');
    }

    // Check rehire logic
    if (!reason.eligible_for_rehire && reason.rehire_waiting_period_months) {
      warnings.push('Rehire waiting period set but employee not eligible for rehire');
    }

    // Check visibility conflicts
    if (reason.hr_only && reason.employee_self_service_allowed) {
      errors.push('Cannot be both HR-only and employee self-service allowed');
    }

    // Check approval logic
    if (reason.requires_dual_approval && !reason.approval_authority_level) {
      warnings.push('Dual approval required but no authority level specified');
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }

  // ==================== IMPACT ANALYSIS ====================

  /**
   * Get impact preview for deactivating a reason
   */
  async getDeactivationImpact(id: string): Promise<any> {
    const reason = await this.getReasonById(id);

    return {
      reason_code: reason.reason_code,
      reason_name: reason.reason_name,
      usage_count: reason.usage_count,
      last_used_at: reason.last_used_at,
      affected_workflows: this.getAffectedWorkflows(reason),
      has_active_cases: reason.usage_count > 0, // In real system, check transactional data
      recommended_action: reason.usage_count > 0 ? 'Deactivate (keep historical)' : 'Safe to delete',
    };
  }

  /**
   * Get workflows affected by a reason
   */
  private getAffectedWorkflows(reason: SeparationReason): string[] {
    const workflows: string[] = [];

    if (reason.triggers_clearance_process) workflows.push('Clearance Process');
    if (reason.triggers_payroll_settlement) workflows.push('Payroll Settlement');
    if (reason.triggers_asset_recovery) workflows.push('Asset Recovery');
    if (reason.triggers_access_deactivation) workflows.push('Access Deactivation');
    if (reason.triggers_legal_workflow) workflows.push('Legal Review');
    if (reason.triggers_investigation_workflow) workflows.push('Investigation');

    if (reason.custom_workflow_triggers?.length > 0) {
      workflows.push(...reason.custom_workflow_triggers);
    }

    return workflows;
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk create reasons from template
   */
  async bulkCreateReasons(reasons: CreateSeparationReasonDto[]): Promise<SeparationReason[]> {
    const created: SeparationReason[] = [];

    for (const dto of reasons) {
      try {
        const reason = await this.createReason(dto);
        created.push(reason);
      } catch (error) {
        // Log error but continue with other reasons
        console.error(`Failed to create reason ${dto.reason_code}:`, error.message);
      }
    }

    return created;
  }

  /**
   * Clone reason for different tenant/company
   */
  async cloneReason(id: string, newTenantId: string, newCompanyId?: string, newCode?: string): Promise<SeparationReason> {
    const source = await this.getReasonById(id);

    const cloned = this.reasonRepository.create({
      ...source,
      id: undefined, // Let DB generate new ID
      tenant_id: newTenantId,
      company_id: newCompanyId,
      reason_code: newCode || `${source.reason_code}_CLONE`,
      usage_count: 0,
      last_used_at: null,
      created_at: undefined,
      updated_at: undefined,
    });

    return await this.reasonRepository.save(cloned);
  }
}
