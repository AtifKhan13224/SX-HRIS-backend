import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  WeeklyOffPolicy,
  WeeklyOffPattern,
  WeeklyOffAssignment,
  WeeklyOffAudit,
} from './entities/weekly-off-policy.entity';
import {
  CountryLaborLaw,
  LaborLawComplianceRule,
  ComplianceValidationLog,
} from './entities/labor-law-compliance.entity';
import {
  EmployeeWorkCalendar,
  WeeklyOffOverride,
  CalendarResolutionRule,
} from './entities/work-calendar.entity';

// Services
import { WeeklyOffService } from './services/weekly-off.service';
import { LaborLawComplianceService } from './services/labor-law-compliance.service';
import { WorkCalendarService } from './services/work-calendar.service';

// Controllers
import { WeeklyOffController } from './controllers/weekly-off.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Policy entities
      WeeklyOffPolicy,
      WeeklyOffPattern,
      WeeklyOffAssignment,
      WeeklyOffAudit,
      // Compliance entities
      CountryLaborLaw,
      LaborLawComplianceRule,
      ComplianceValidationLog,
      // Calendar entities
      EmployeeWorkCalendar,
      WeeklyOffOverride,
      CalendarResolutionRule,
    ]),
  ],
  controllers: [WeeklyOffController],
  providers: [
    WeeklyOffService,
    LaborLawComplianceService,
    WorkCalendarService,
  ],
  exports: [
    WeeklyOffService,
    LaborLawComplianceService,
    WorkCalendarService,
  ],
})
export class WeeklyOffModule {}
