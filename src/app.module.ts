import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveManagementModule } from './modules/leave-management/leave-management.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { RolesPermissionsModule } from './modules/roles-permissions/roles-permissions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrganizationSettingsModule } from './modules/organization-settings/organization-settings.module';
import { WeeklyOffModule } from './modules/weekly-off/weekly-off.module';
import { BankListModule } from './modules/bank-list/bank-list.module';
import { BankPolicyModule } from './modules/bank-policy/bank-policy.module';
import { EmployeeIDModule } from './modules/employee-id/employee-id.module';
import { StandardRBACModule } from './standard-rbac/standard-rbac.module';
import { PicklistModule } from './modules/picklist/picklist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
        ssl: configService.get('DB_SSL', 'false') === 'true' ? {
          rejectUnauthorized: false,
        } : false,
        retryAttempts: 5,
        retryDelay: 3000,
      }),
    }),
    AuthModule,
    UsersModule,
    EmployeesModule,
    DepartmentsModule,
    AttendanceModule,
    LeaveManagementModule,
    PayrollModule,
    PerformanceModule,
    RecruitmentModule,
    RolesPermissionsModule,
    ReportsModule,
    NotificationsModule,
    OrganizationSettingsModule,
    WeeklyOffModule,
    BankListModule,
    BankPolicyModule,
    EmployeeIDModule,
    StandardRBACModule,
    PicklistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
