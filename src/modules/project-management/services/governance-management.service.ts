import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProjectGovernanceRule,
  ProjectGovernanceRuleMapping,
} from '../entities/project-config.entity';
import {
  CreateGovernanceRuleDto,
  UpdateGovernanceRuleDto,
  ApplyGovernanceRuleDto,
} from '../dto/project-config.dto';
import { ProjectConfigurationService } from './project-configuration.service';

/**
 * GOVERNANCE MANAGEMENT SERVICE
 * Manages governance rules and their application to project types
 */
@Injectable()
export class GovernanceManagementService {
  constructor(
    @InjectRepository(ProjectGovernanceRule)
    private readonly ruleRepository: Repository<ProjectGovernanceRule>,
    @InjectRepository(ProjectGovernanceRuleMapping)
    private readonly mappingRepository: Repository<ProjectGovernanceRuleMapping>,
    private readonly configService: ProjectConfigurationService,
  ) {}

  // ==========================================
  // GOVERNANCE RULE METHODS
  // ==========================================

  async createRule(
    dto: CreateGovernanceRuleDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectGovernanceRule> {
    const existing = await this.ruleRepository.findOne({
      where: { tenantId, ruleCode: dto.ruleCode, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException(`Governance rule with code '${dto.ruleCode}' already exists`);
    }

    const rule = this.ruleRepository.create({
      ...dto,
      tenantId,
      effectiveStartDate: new Date(dto.effectiveStartDate),
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.ruleRepository.save(rule);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'GOVERNANCE_RULE',
      configurationId: saved.id,
      configurationCode: saved.ruleCode,
      actionType: 'CREATE',
      actionDescription: `Created governance rule: ${saved.ruleName}`,
      afterState: saved,
      performedBy: userId,
    });

    return saved;
  }

  async findAllRules(tenantId: string): Promise<ProjectGovernanceRule[]> {
    return this.ruleRepository.find({
      where: { tenantId, isDeleted: false },
      relations: ['projectTypeMappings'],
      order: { ruleName: 'ASC' },
    });
  }

  async findRuleById(id: string, tenantId: string): Promise<ProjectGovernanceRule> {
    const rule = await this.ruleRepository.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['projectTypeMappings'],
    });

    if (!rule) {
      throw new NotFoundException(`Governance rule with ID '${id}' not found`);
    }

    return rule;
  }

  async updateRule(
    id: string,
    dto: UpdateGovernanceRuleDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectGovernanceRule> {
    const rule = await this.findRuleById(id, tenantId);
    const beforeState = { ...rule };

    Object.assign(rule, {
      ...dto,
      version: rule.version + 1,
      updatedBy: userId,
    });

    const saved = await this.ruleRepository.save(rule);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'GOVERNANCE_RULE',
      configurationId: saved.id,
      configurationCode: saved.ruleCode,
      actionType: 'UPDATE',
      actionDescription: `Updated governance rule: ${dto.changeReason}`,
      beforeState,
      afterState: saved,
      performedBy: userId,
      changeReason: dto.changeReason,
    });

    return saved;
  }

  async deleteRule(
    id: string,
    changeReason: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    const rule = await this.findRuleById(id, tenantId);

    // Check if rule is applied to any project types
    const mappings = await this.mappingRepository.find({
      where: { governanceRuleId: id, tenantId },
    });

    if (mappings.length > 0) {
      throw new BadRequestException(
        `Cannot delete governance rule. It is applied to ${mappings.length} project type(s). Remove mappings first.`,
      );
    }

    rule.isDeleted = true;
    rule.deletedAt = new Date();
    rule.deletedBy = userId;

    await this.ruleRepository.save(rule);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'GOVERNANCE_RULE',
      configurationId: id,
      configurationCode: rule.ruleCode,
      actionType: 'DELETE',
      actionDescription: `Deleted governance rule: ${changeReason}`,
      beforeState: rule,
      performedBy: userId,
      changeReason,
    });
  }

  // ==========================================
  // GOVERNANCE RULE MAPPING METHODS
  // ==========================================

  async applyRuleToProjectType(
    dto: ApplyGovernanceRuleDto,
    tenantId: string,
    userId: string,
  ): Promise<ProjectGovernanceRuleMapping> {
    // Verify rule exists
    await this.findRuleById(dto.governanceRuleId, tenantId);

    // Check if mapping already exists
    const existing = await this.mappingRepository.findOne({
      where: {
        tenantId,
        projectTypeId: dto.projectTypeId,
        governanceRuleId: dto.governanceRuleId,
      },
    });

    if (existing) {
      throw new ConflictException('This governance rule is already applied to this project type');
    }

    const mapping = this.mappingRepository.create({
      ...dto,
      tenantId,
      effectiveStartDate: new Date(dto.effectiveStartDate),
      createdBy: userId,
    });

    const saved = await this.mappingRepository.save(mapping);

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'GOVERNANCE_RULE_MAPPING',
      configurationId: saved.id,
      actionType: 'CREATE',
      actionDescription: `Applied governance rule to project type`,
      afterState: saved,
      performedBy: userId,
    });

    return saved;
  }

  async getRulesByProjectType(
    projectTypeId: string,
    tenantId: string,
  ): Promise<ProjectGovernanceRuleMapping[]> {
    return this.mappingRepository.find({
      where: { projectTypeId, tenantId },
      relations: ['governanceRule'],
    });
  }

  async removeRuleMapping(
    mappingId: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    const mapping = await this.mappingRepository.findOne({
      where: { id: mappingId, tenantId },
    });

    if (!mapping) {
      throw new NotFoundException('Governance rule mapping not found');
    }

    await this.mappingRepository.delete({ id: mappingId, tenantId });

    await this.configService.createAuditLog({
      tenantId,
      configurationType: 'GOVERNANCE_RULE_MAPPING',
      configurationId: mappingId,
      actionType: 'DELETE',
      actionDescription: `Removed governance rule mapping`,
      beforeState: mapping,
      performedBy: userId,
    });
  }

  /**
   * Validate governance rule logic
   */
  async validateRule(
    ruleId: string,
    testData: any,
    tenantId: string,
  ): Promise<{ valid: boolean; message: string }> {
    const rule = await this.findRuleById(ruleId, tenantId);

    try {
      // This is a placeholder for actual validation logic
      // In production, you would implement proper rule engine evaluation
      
      // Check applies_when_condition
      if (rule.appliesWhenCondition) {
        // Evaluate condition against testData
        // This would typically use a rule engine or expression evaluator
      }

      // Check validation_logic
      if (rule.validationLogic) {
        // Execute validation logic
      }

      return {
        valid: true,
        message: 'Rule validation successful',
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message,
      };
    }
  }

  /**
   * Check if rule would be violated
   */
  async checkViolation(
    ruleId: string,
    contextData: any,
    tenantId: string,
  ): Promise<{ violated: boolean; message?: string }> {
    const rule = await this.findRuleById(ruleId, tenantId);

    // Placeholder for actual violation checking logic
    // Would implement based on rule's validation_logic and enforcement_level

    return {
      violated: false,
      message: null,
    };
  }

  /**
   * Get rules by category
   */
  async getRulesByCategory(
    category: string,
    tenantId: string,
  ): Promise<ProjectGovernanceRule[]> {
    return this.ruleRepository.find({
      where: {
        tenantId,
        ruleCategory: category,
        isDeleted: false,
        isActive: true,
      },
      order: { ruleName: 'ASC' },
    });
  }
}
