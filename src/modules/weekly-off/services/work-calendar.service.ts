import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  EmployeeWorkCalendar,
  CalendarDayType,
  WeeklyOffOverride,
  CalendarResolutionRule,
} from '../entities/work-calendar.entity';
import {
  WeeklyOffPolicy,
  WeeklyOffPattern,
  WeeklyOffAssignment,
  WeeklyOffType,
  ConfigurationLevel,
} from '../entities/weekly-off-policy.entity';
import { EmployeeWorkCalendarResponseDto } from '../dto/weekly-off.dto';

export interface CalendarResolutionPriority {
  [key: string]: number;
}

@Injectable()
export class WorkCalendarService {
  private readonly logger = new Logger(WorkCalendarService.name);

  // Default calendar resolution priority (lower number = higher priority)
  private readonly DEFAULT_PRIORITY: CalendarResolutionPriority = {
    [CalendarDayType.PAID_LEAVE]: 1,
    [CalendarDayType.UNPAID_LEAVE]: 2,
    [CalendarDayType.PUBLIC_HOLIDAY]: 3,
    [CalendarDayType.COMP_OFF]: 4,
    [CalendarDayType.WEEKLY_OFF]: 5,
    [CalendarDayType.REST_DAY]: 6,
    [CalendarDayType.ATTENDANCE_EXCEPTION]: 7,
    [CalendarDayType.WORKING_DAY]: 8,
  };

  constructor(
    @InjectRepository(EmployeeWorkCalendar)
    private readonly calendarRepository: Repository<EmployeeWorkCalendar>,
    @InjectRepository(WeeklyOffOverride)
    private readonly overrideRepository: Repository<WeeklyOffOverride>,
    @InjectRepository(CalendarResolutionRule)
    private readonly resolutionRuleRepository: Repository<CalendarResolutionRule>,
  ) {}

  /**
   * Generate work calendar for an employee
   */
  async generateEmployeeCalendar(
    tenantId: string,
    employeeId: string,
    startDate: Date,
    endDate: Date,
    policy: WeeklyOffPolicy,
    pattern: WeeklyOffPattern,
  ): Promise<void> {
    this.logger.log(`Generating calendar for employee ${employeeId} from ${startDate} to ${endDate}`);

    const calendarDays: Partial<EmployeeWorkCalendar>[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const isWeeklyOff = this.isWeeklyOffDay(currentDate, pattern);
      
      const calendarDay: Partial<EmployeeWorkCalendar> = {
        tenantId,
        employeeId,
        calendarDate: new Date(currentDate),
        dayType: isWeeklyOff ? CalendarDayType.WEEKLY_OFF : CalendarDayType.WORKING_DAY,
        isWorkingDay: !isWeeklyOff,
        isPaidDay: isWeeklyOff ? pattern.isPaid : true,
        sourcePolicyId: policy.id,
        sourceType: 'WEEKLY_OFF_POLICY',
        plannedHours: isWeeklyOff ? 0 : (pattern.hoursPerDay || 8),
        resolutionPriority: this.DEFAULT_PRIORITY[isWeeklyOff ? CalendarDayType.WEEKLY_OFF : CalendarDayType.WORKING_DAY],
        hasConflicts: false,
        isOverride: false,
        generatedAt: new Date(),
      };

      calendarDays.push(calendarDay);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Batch insert or update
    await this.upsertCalendarDays(calendarDays);
  }

  /**
   * Check if a date is a weekly off day based on pattern
   */
  private isWeeklyOffDay(date: Date, pattern: WeeklyOffPattern): boolean {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    if (pattern.offDays && Array.isArray(pattern.offDays)) {
      // For fixed weekly off
      return pattern.offDays.includes(dayOfWeek);
    }

    if (pattern.workingDaysCycle && pattern.offDaysCycle && pattern.rotationStartDate) {
      // For rotational weekly off
      return this.isRotationalOffDay(date, pattern);
    }

    return false;
  }

  /**
   * Check if date is off day in rotational pattern
   */
  private isRotationalOffDay(date: Date, pattern: WeeklyOffPattern): boolean {
    const startDate = new Date(pattern.rotationStartDate);
    const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return false;

    const cycleLength = pattern.workingDaysCycle + pattern.offDaysCycle;
    const positionInCycle = daysDiff % cycleLength;

    // If position is in the off days portion of the cycle
    return positionInCycle >= pattern.workingDaysCycle;
  }

  /**
   * Get employee work calendar for a date range
   */
  async getEmployeeCalendar(
    tenantId: string,
    employeeId: string,
    startDate: Date,
    endDate: Date,
    includeMetadata: boolean = false,
  ): Promise<EmployeeWorkCalendarResponseDto[]> {
    const calendars = await this.calendarRepository.find({
      where: {
        tenantId,
        employeeId,
        calendarDate: Between(startDate, endDate),
      },
      order: {
        calendarDate: 'ASC',
      },
    });

    return calendars.map(cal => this.mapToResponseDto(cal, includeMetadata));
  }

  /**
   * Resolve calendar conflicts and apply priority
   */
  async resolveCalendarConflicts(
    tenantId: string,
    employeeId: string,
    date: Date,
    conflictingDayTypes: Array<{ dayType: CalendarDayType; source: string; priority: number }>,
  ): Promise<CalendarDayType> {
    // Get tenant-specific resolution rules
    const resolutionRule = await this.getResolutionRule(tenantId);
    const priority = resolutionRule?.dayTypePriority || this.DEFAULT_PRIORITY;

    // Sort by priority (lower number = higher priority)
    conflictingDayTypes.sort((a, b) => {
      const priorityA = priority[a.dayType] || 999;
      const priorityB = priority[b.dayType] || 999;
      return priorityA - priorityB;
    });

    // Return the highest priority day type
    return conflictingDayTypes[0].dayType;
  }

  /**
   * Apply weekly off override
   */
  async applyOverride(
    tenantId: string,
    override: WeeklyOffOverride,
  ): Promise<void> {
    const calendar = await this.calendarRepository.findOne({
      where: {
        tenantId,
        employeeId: override.employeeId,
        calendarDate: override.overrideDate,
      },
    });

    if (calendar) {
      calendar.dayType = override.newDayType as CalendarDayType;
      calendar.isWorkingDay = override.newDayType === 'WORKING_DAY';
      calendar.isOverride = true;
      calendar.overrideReason = override.reason;
      calendar.overrideApprovedBy = override.approvedBy;
      calendar.overrideApprovedAt = override.approvedAt;
      calendar.lastRecalculatedAt = new Date();

      await this.calendarRepository.save(calendar);
    }
  }

  /**
   * Recalculate calendar for employees
   */
  async recalculateCalendar(
    tenantId: string,
    employeeIds: string[],
    startDate: Date,
    endDate: Date,
    forceRecalculation: boolean = false,
  ): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    for (const employeeId of employeeIds) {
      try {
        // Get active weekly off policy for employee
        const policy = await this.getEmployeeActivePolicy(tenantId, employeeId, startDate);
        
        if (policy && policy.patterns && policy.patterns.length > 0) {
          const pattern = policy.patterns[0]; // Get first active pattern
          await this.generateEmployeeCalendar(tenantId, employeeId, startDate, endDate, policy, pattern);
          processed++;
        }
      } catch (error) {
        this.logger.error(`Failed to recalculate calendar for employee ${employeeId}: ${error.message}`);
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * Get active weekly off policy for employee
   */
  private async getEmployeeActivePolicy(
    tenantId: string,
    employeeId: string,
    effectiveDate: Date,
  ): Promise<WeeklyOffPolicy | null> {
    // This would typically query the WeeklyOffAssignment table
    // and resolve the policy based on hierarchy
    // For now, returning null as placeholder
    return null;
  }

  /**
   * Upsert calendar days
   */
  private async upsertCalendarDays(
    calendarDays: Partial<EmployeeWorkCalendar>[],
  ): Promise<void> {
    for (const day of calendarDays) {
      await this.calendarRepository.upsert(day, ['tenantId', 'employeeId', 'calendarDate']);
    }
  }

  /**
   * Get resolution rule for tenant
   */
  private async getResolutionRule(tenantId: string): Promise<CalendarResolutionRule | null> {
    return await this.resolutionRuleRepository.findOne({
      where: {
        tenantId,
        isActive: true,
      },
      order: {
        effectiveFrom: 'DESC',
      },
    });
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(
    calendar: EmployeeWorkCalendar,
    includeMetadata: boolean,
  ): EmployeeWorkCalendarResponseDto {
    const dto: EmployeeWorkCalendarResponseDto = {
      employeeId: calendar.employeeId,
      calendarDate: calendar.calendarDate,
      dayType: calendar.dayType,
      isWorkingDay: calendar.isWorkingDay,
      isPaidDay: calendar.isPaidDay,
      plannedHours: calendar.plannedHours,
      actualHours: calendar.actualHours,
      shiftId: calendar.shiftId,
      shiftStartTime: calendar.shiftStartTime,
      shiftEndTime: calendar.shiftEndTime,
      hasConflicts: calendar.hasConflicts,
      conflictDetails: calendar.conflictDetails,
      isOverride: calendar.isOverride,
      metadata: includeMetadata ? calendar.metadata : null,
    };

    return dto;
  }

  /**
   * Get weekly off statistics for reporting
   */
  async getWeeklyOffStatistics(
    tenantId: string,
    employeeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const statistics = await this.calendarRepository
      .createQueryBuilder('calendar')
      .select('calendar.employeeId', 'employeeId')
      .addSelect('COUNT(*)', 'totalDays')
      .addSelect('SUM(CASE WHEN calendar.dayType = :weeklyOff THEN 1 ELSE 0 END)', 'weeklyOffDays')
      .addSelect('SUM(CASE WHEN calendar.isWorkingDay = true THEN 1 ELSE 0 END)', 'workingDays')
      .addSelect('SUM(CASE WHEN calendar.isOverride = true THEN 1 ELSE 0 END)', 'overrideDays')
      .addSelect('SUM(calendar.plannedHours)', 'totalPlannedHours')
      .addSelect('SUM(calendar.actualHours)', 'totalActualHours')
      .where('calendar.tenantId = :tenantId', { tenantId })
      .andWhere('calendar.employeeId IN (:...employeeIds)', { employeeIds })
      .andWhere('calendar.calendarDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .setParameter('weeklyOff', CalendarDayType.WEEKLY_OFF)
      .groupBy('calendar.employeeId')
      .getRawMany();

    return statistics;
  }

  /**
   * Check for calendar conflicts
   */
  async detectConflicts(
    tenantId: string,
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const calendars = await this.calendarRepository.find({
      where: {
        tenantId,
        employeeId,
        calendarDate: Between(startDate, endDate),
        hasConflicts: true,
      },
      order: {
        calendarDate: 'ASC',
      },
    });

    return calendars.map(cal => ({
      date: cal.calendarDate,
      currentDayType: cal.dayType,
      conflicts: cal.conflictDetails,
      resolutionNeeded: true,
    }));
  }
}
