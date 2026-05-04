import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CountryLaborLaw,
  LaborLawComplianceRule,
  ComplianceValidationLog,
  ComplianceRuleType,
  ValidationSeverity,
} from '../entities/labor-law-compliance.entity';
import {
  WeeklyOffPolicy,
  WeeklyOffPattern,
} from '../entities/weekly-off-policy.entity';
import { ComplianceValidationResponseDto, ComplianceViolationDto, ComplianceWarningDto } from '../dto/weekly-off.dto';

@Injectable()
export class LaborLawComplianceService {
  private readonly logger = new Logger(LaborLawComplianceService.name);

  constructor(
    @InjectRepository(CountryLaborLaw)
    private readonly laborLawRepository: Repository<CountryLaborLaw>,
    @InjectRepository(LaborLawComplianceRule)
    private readonly complianceRuleRepository: Repository<LaborLawComplianceRule>,
    @InjectRepository(ComplianceValidationLog)
    private readonly validationLogRepository: Repository<ComplianceValidationLog>,
  ) {}

  /**
   * Validate weekly off policy against country labor laws
   */
  async validatePolicy(
    tenantId: string,
    policy: WeeklyOffPolicy,
    patterns: WeeklyOffPattern[],
    employeeId?: string,
  ): Promise<ComplianceValidationResponseDto> {
    this.logger.log(`Validating policy ${policy.id} for tenant ${tenantId}`);

    try {
      // Get applicable labor law
      const laborLaw = await this.getApplicableLaborLaw(
        policy.countryId,
        policy.effectiveFrom,
      );

      if (!laborLaw) {
        return this.createValidationResponse(true, [], [], 0);
      }

      // Get all active compliance rules for this labor law
      const rules = await this.getComplianceRules(laborLaw.id);

      const violations: ComplianceViolationDto[] = [];
      const warnings: ComplianceWarningDto[] = [];

      // Execute each compliance rule
      for (const rule of rules) {
        const result = await this.executeRule(rule, policy, patterns, laborLaw);
        
        if (result.isViolation) {
          if (rule.severity === ValidationSeverity.BLOCKING) {
            violations.push({
              ruleCode: rule.ruleCode,
              ruleName: rule.ruleName,
              severity: rule.severity,
              message: rule.errorMessage,
              details: result.details,
            });
          } else if (rule.severity === ValidationSeverity.WARNING) {
            warnings.push({
              ruleCode: rule.ruleCode,
              ruleName: rule.ruleName,
              message: rule.errorMessage,
              recommendation: result.recommendation || '',
            });
          }
        }
      }

      const isValid = violations.length === 0;

      // Log validation result
      await this.logValidation(tenantId, policy.id, employeeId, policy.countryId, isValid, rules, violations, warnings);

      return this.createValidationResponse(isValid, violations, warnings, rules.length);
    } catch (error) {
      this.logger.error(`Validation error for policy ${policy.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a single compliance rule
   */
  private async executeRule(
    rule: LaborLawComplianceRule,
    policy: WeeklyOffPolicy,
    patterns: WeeklyOffPattern[],
    laborLaw: CountryLaborLaw,
  ): Promise<{ isViolation: boolean; details?: any; recommendation?: string }> {
    switch (rule.ruleType) {
      case ComplianceRuleType.MINIMUM_REST_DAYS:
        return this.checkMinimumRestDays(patterns, laborLaw, rule);

      case ComplianceRuleType.MAXIMUM_CONSECUTIVE_DAYS:
        return this.checkMaximumConsecutiveDays(patterns, laborLaw, rule);

      case ComplianceRuleType.MINIMUM_REST_HOURS:
        return this.checkMinimumRestHours(patterns, laborLaw, rule);

      case ComplianceRuleType.PAID_WEEKLY_OFF:
        return this.checkPaidWeeklyOff(patterns, laborLaw, rule);

      case ComplianceRuleType.WEEKLY_OFF_COMPENSATION:
        return this.checkWeeklyOffCompensation(policy, laborLaw, rule);

      case ComplianceRuleType.OVERTIME_MULTIPLIER:
        return this.checkOvertimeMultiplier(policy, laborLaw, rule);

      default:
        return { isViolation: false };
    }
  }

  /**
   * Check minimum rest days per week
   */
  private checkMinimumRestDays(
    patterns: WeeklyOffPattern[],
    laborLaw: CountryLaborLaw,
    rule: LaborLawComplianceRule,
  ): { isViolation: boolean; details?: any; recommendation?: string } {
    const minimumRequired = laborLaw.minimumRestDaysPerWeek;

    for (const pattern of patterns) {
      if (!pattern.isActive) continue;

      let offDaysCount = 0;

      if (pattern.offDays && Array.isArray(pattern.offDays)) {
        offDaysCount = pattern.offDays.length;
      } else if (pattern.offDaysCycle) {
        offDaysCount = pattern.offDaysCycle;
      }

      if (offDaysCount < minimumRequired) {
        return {
          isViolation: true,
          details: {
            patternName: pattern.patternName,
            configuredOffDays: offDaysCount,
            minimumRequired,
            countryRequirement: `${laborLaw.countryName} requires minimum ${minimumRequired} rest day(s) per week`,
          },
          recommendation: `Increase weekly off days to at least ${minimumRequired} day(s)`,
        };
      }
    }

    return { isViolation: false };
  }

  /**
   * Check maximum consecutive working days
   */
  private checkMaximumConsecutiveDays(
    patterns: WeeklyOffPattern[],
    laborLaw: CountryLaborLaw,
    rule: LaborLawComplianceRule,
  ): { isViolation: boolean; details?: any; recommendation?: string } {
    const maximumAllowed = laborLaw.maximumConsecutiveWorkingDays;

    for (const pattern of patterns) {
      if (!pattern.isActive) continue;

      let consecutiveDays = 0;

      if (pattern.workingDaysCycle) {
        consecutiveDays = pattern.workingDaysCycle;
      } else if (pattern.offDays && Array.isArray(pattern.offDays)) {
        // For fixed weekly off, calculate max consecutive days
        consecutiveDays = 7 - pattern.offDays.length;
      }

      if (consecutiveDays > maximumAllowed) {
        return {
          isViolation: true,
          details: {
            patternName: pattern.patternName,
            consecutiveWorkingDays: consecutiveDays,
            maximumAllowed,
            countryRequirement: `${laborLaw.countryName} allows maximum ${maximumAllowed} consecutive working day(s)`,
          },
          recommendation: `Reduce consecutive working days to maximum ${maximumAllowed} day(s)`,
        };
      }
    }

    return { isViolation: false };
  }

  /**
   * Check minimum rest hours between shifts
   */
  private checkMinimumRestHours(
    patterns: WeeklyOffPattern[],
    laborLaw: CountryLaborLaw,
    rule: LaborLawComplianceRule,
  ): { isViolation: boolean; details?: any; recommendation?: string } {
    const minimumRestHours = laborLaw.minimumRestHours;

    for (const pattern of patterns) {
      if (!pattern.isActive) continue;

      // For compressed work weeks, check if daily hours leave sufficient rest
      if (pattern.hoursPerDay) {
        const restHours = 24 - pattern.hoursPerDay;
        
        if (restHours < minimumRestHours) {
          return {
            isViolation: true,
            details: {
              patternName: pattern.patternName,
              hoursPerDay: pattern.hoursPerDay,
              restHours,
              minimumRestHours,
              countryRequirement: `${laborLaw.countryName} requires minimum ${minimumRestHours} rest hours`,
            },
            recommendation: `Adjust daily hours to ensure at least ${minimumRestHours} hours of rest`,
          };
        }
      }
    }

    return { isViolation: false };
  }

  /**
   * Check if weekly off is paid as per labor law
   */
  private checkPaidWeeklyOff(
    patterns: WeeklyOffPattern[],
    laborLaw: CountryLaborLaw,
    rule: LaborLawComplianceRule,
  ): { isViolation: boolean; details?: any; recommendation?: string } {
    if (!laborLaw.isWeeklyOffPaid) {
      return { isViolation: false };
    }

    for (const pattern of patterns) {
      if (!pattern.isActive) continue;

      if (!pattern.isPaid) {
        return {
          isViolation: true,
          details: {
            patternName: pattern.patternName,
            isPaid: pattern.isPaid,
            countryRequirement: `${laborLaw.countryName} requires weekly off to be paid`,
          },
          recommendation: 'Mark weekly off as paid to comply with labor law',
        };
      }
    }

    return { isViolation: false };
  }

  /**
   * Check weekly off compensation requirements
   */
  private checkWeeklyOffCompensation(
    policy: WeeklyOffPolicy,
    laborLaw: CountryLaborLaw,
    rule: LaborLawComplianceRule,
  ): { isViolation: boolean; details?: any; recommendation?: string } {
    // This would be validated when creating overrides for working on weekly off
    // For policy level, just check if compensation rules are defined
    
    if (laborLaw.requiresCompOff) {
      // Policy should have compensation mechanism defined
      // This is more of a warning than blocking
      return {
        isViolation: false,
        details: {
          countryRequirement: `${laborLaw.countryName} requires compensatory off when working on weekly off`,
        },
        recommendation: 'Ensure compensation mechanism is configured when employees work on weekly off',
      };
    }

    return { isViolation: false };
  }

  /**
   * Check overtime multiplier configuration
   */
  private checkOvertimeMultiplier(
    policy: WeeklyOffPolicy,
    laborLaw: CountryLaborLaw,
    rule: LaborLawComplianceRule,
  ): { isViolation: boolean; details?: any; recommendation?: string } {
    const requiredMultiplier = laborLaw.weeklyOffOtMultiplier;

    // This check would be more relevant for payroll configuration
    // Policy level just needs awareness

    return {
      isViolation: false,
      details: {
        countryRequirement: `${laborLaw.countryName} requires ${requiredMultiplier}x multiplier for weekly off work`,
      },
      recommendation: `Ensure payroll is configured with ${requiredMultiplier}x multiplier`,
    };
  }

  /**
   * Get applicable labor law for country and date
   */
  private async getApplicableLaborLaw(
    countryId: string,
    effectiveDate: Date,
  ): Promise<CountryLaborLaw | null> {
    if (!countryId) return null;

    return await this.laborLawRepository
      .createQueryBuilder('law')
      .where('law.countryId = :countryId', { countryId })
      .andWhere('law.isActive = :isActive', { isActive: true })
      .andWhere('law.effectiveFrom <= :date', { date: effectiveDate })
      .andWhere('(law.effectiveTo IS NULL OR law.effectiveTo >= :date)', { date: effectiveDate })
      .orderBy('law.effectiveFrom', 'DESC')
      .getOne();
  }

  /**
   * Get compliance rules for labor law
   */
  private async getComplianceRules(
    laborLawId: string,
  ): Promise<LaborLawComplianceRule[]> {
    return await this.complianceRuleRepository
      .createQueryBuilder('rule')
      .where('rule.laborLawId = :laborLawId', { laborLawId })
      .andWhere('rule.isActive = :isActive', { isActive: true })
      .andWhere('rule.effectiveFrom <= :now', { now: new Date() })
      .andWhere('(rule.effectiveTo IS NULL OR rule.effectiveTo >= :now)', { now: new Date() })
      .orderBy('rule.priority', 'ASC')
      .getMany();
  }

  /**
   * Log validation result
   */
  private async logValidation(
    tenantId: string,
    policyId: string,
    employeeId: string,
    countryId: string,
    isValid: boolean,
    rulesExecuted: LaborLawComplianceRule[],
    violations: ComplianceViolationDto[],
    warnings: ComplianceWarningDto[],
  ): Promise<void> {
    try {
      const log = this.validationLogRepository.create({
        tenantId,
        policyId,
        employeeId,
        countryId,
        validationStatus: isValid ? 'COMPLIANT' : 'NON_COMPLIANT',
        rulesExecuted: rulesExecuted.map(r => ({
          ruleCode: r.ruleCode,
          ruleName: r.ruleName,
          ruleType: r.ruleType,
        })),
        violationsFound: violations.length > 0 ? violations : null,
        warnings: warnings.length > 0 ? warnings : null,
        validationContext: {
          totalRulesChecked: rulesExecuted.length,
          violationsCount: violations.length,
          warningsCount: warnings.length,
        },
      });

      await this.validationLogRepository.save(log);
    } catch (error) {
      this.logger.error(`Failed to log validation: ${error.message}`);
    }
  }

  /**
   * Create validation response
   */
  private createValidationResponse(
    isValid: boolean,
    violations: ComplianceViolationDto[],
    warnings: ComplianceWarningDto[],
    totalRules: number,
  ): ComplianceValidationResponseDto {
    return {
      isValid,
      status: isValid ? 'COMPLIANT' : 'NON_COMPLIANT',
      violations,
      warnings,
      summary: {
        totalRulesChecked: totalRules,
        violationsCount: violations.length,
        warningsCount: warnings.length,
        validationDate: new Date(),
      },
    };
  }

  /**
   * Initialize default labor laws for common countries
   */
  async initializeDefaultLaborLaws(tenantId: string): Promise<void> {
    const defaultLaws = this.getDefaultLaborLaws(tenantId);

    for (const lawData of defaultLaws) {
      const exists = await this.laborLawRepository.findOne({
        where: {
          countryCode: lawData.countryCode,
          isActive: true,
        },
      });

      if (!exists) {
        const law = this.laborLawRepository.create(lawData);
        await this.laborLawRepository.save(law);
        
        // Create default compliance rules for this law
        await this.createDefaultComplianceRules(law.id, lawData.countryCode);
      }
    }
  }

  /**
   * Get default labor law configurations
   */
  private getDefaultLaborLaws(tenantId: string): Partial<CountryLaborLaw>[] {
    return [
      {
        tenantId,
        countryCode: 'UAE',
        countryName: 'United Arab Emirates',
        lawVersion: '2022',
        effectiveFrom: new Date('2022-01-01'),
        minimumRestDaysPerWeek: 1,
        maximumConsecutiveWorkingDays: 6,
        minimumRestHours: 12,
        standardWorkingHoursPerWeek: 48,
        maximumWorkingHoursPerWeek: 48,
        isWeeklyOffPaid: true,
        weeklyOffOtMultiplier: 1.5,
        requiresCompOff: false,
        isActive: true,
      },
      {
        tenantId,
        countryCode: 'IND',
        countryName: 'India',
        lawVersion: '2023',
        effectiveFrom: new Date('2023-01-01'),
        minimumRestDaysPerWeek: 1,
        maximumConsecutiveWorkingDays: 10,
        minimumRestHours: 11,
        standardWorkingHoursPerWeek: 48,
        maximumWorkingHoursPerWeek: 60,
        isWeeklyOffPaid: true,
        weeklyOffOtMultiplier: 2.0,
        requiresCompOff: true,
        isActive: true,
      },
      {
        tenantId,
        countryCode: 'USA',
        countryName: 'United States',
        lawVersion: '2024',
        effectiveFrom: new Date('2024-01-01'),
        minimumRestDaysPerWeek: 0,
        maximumConsecutiveWorkingDays: 14,
        minimumRestHours: 8,
        standardWorkingHoursPerWeek: 40,
        maximumWorkingHoursPerWeek: 60,
        isWeeklyOffPaid: false,
        weeklyOffOtMultiplier: 1.5,
        requiresCompOff: false,
        isActive: true,
      },
      {
        tenantId,
        countryCode: 'GBR',
        countryName: 'United Kingdom',
        lawVersion: '2024',
        effectiveFrom: new Date('2024-01-01'),
        minimumRestDaysPerWeek: 1,
        maximumConsecutiveWorkingDays: 7,
        minimumRestHours: 11,
        standardWorkingHoursPerWeek: 40,
        maximumWorkingHoursPerWeek: 48,
        isWeeklyOffPaid: true,
        weeklyOffOtMultiplier: 1.5,
        requiresCompOff: false,
        isActive: true,
      },
      {
        tenantId,
        countryCode: 'SAU',
        countryName: 'Saudi Arabia',
        lawVersion: '2024',
        effectiveFrom: new Date('2024-01-01'),
        minimumRestDaysPerWeek: 1,
        maximumConsecutiveWorkingDays: 6,
        minimumRestHours: 12,
        standardWorkingHoursPerWeek: 48,
        maximumWorkingHoursPerWeek: 48,
        isWeeklyOffPaid: true,
        weeklyOffOtMultiplier: 1.5,
        requiresCompOff: false,
        isActive: true,
      },
    ];
  }

  /**
   * Create default compliance rules for a labor law
   */
  private async createDefaultComplianceRules(
    laborLawId: string,
    countryCode: string,
  ): Promise<void> {
    const rules: Partial<LaborLawComplianceRule>[] = [
      {
        laborLawId,
        ruleCode: `${countryCode}_MIN_REST_DAYS`,
        ruleName: 'Minimum Rest Days Validation',
        ruleType: ComplianceRuleType.MINIMUM_REST_DAYS,
        description: 'Validates minimum weekly rest days requirement',
        ruleDefinition: { type: 'minimum_rest_days' },
        severity: ValidationSeverity.BLOCKING,
        errorMessage: 'Weekly off configuration does not meet minimum rest days requirement',
        priority: 10,
        isActive: true,
        effectiveFrom: new Date(),
      },
      {
        laborLawId,
        ruleCode: `${countryCode}_MAX_CONSECUTIVE`,
        ruleName: 'Maximum Consecutive Days Validation',
        ruleType: ComplianceRuleType.MAXIMUM_CONSECUTIVE_DAYS,
        description: 'Validates maximum consecutive working days',
        ruleDefinition: { type: 'max_consecutive_days' },
        severity: ValidationSeverity.BLOCKING,
        errorMessage: 'Configuration exceeds maximum consecutive working days allowed',
        priority: 20,
        isActive: true,
        effectiveFrom: new Date(),
      },
      {
        laborLawId,
        ruleCode: `${countryCode}_MIN_REST_HOURS`,
        ruleName: 'Minimum Rest Hours Validation',
        ruleType: ComplianceRuleType.MINIMUM_REST_HOURS,
        description: 'Validates minimum rest hours between shifts',
        ruleDefinition: { type: 'minimum_rest_hours' },
        severity: ValidationSeverity.WARNING,
        errorMessage: 'Daily hours may not provide sufficient rest time',
        priority: 30,
        isActive: true,
        effectiveFrom: new Date(),
      },
      {
        laborLawId,
        ruleCode: `${countryCode}_PAID_OFF`,
        ruleName: 'Paid Weekly Off Validation',
        ruleType: ComplianceRuleType.PAID_WEEKLY_OFF,
        description: 'Validates if weekly off is marked as paid',
        ruleDefinition: { type: 'paid_weekly_off' },
        severity: ValidationSeverity.BLOCKING,
        errorMessage: 'Weekly off must be marked as paid per labor law',
        priority: 40,
        isActive: true,
        effectiveFrom: new Date(),
      },
    ];

    for (const ruleData of rules) {
      const rule = this.complianceRuleRepository.create(ruleData);
      await this.complianceRuleRepository.save(rule);
    }
  }
}
