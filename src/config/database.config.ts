import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Employee } from '../modules/employees/entities/employee.entity';
import { CompanyProfile } from '../modules/organization-settings/entities/company-profile.entity';
import { CompanyProfileAuditLog } from '../modules/organization-settings/entities/company-profile-audit.entity';
import { GroupCompany } from '../modules/organization-settings/entities/group-company.entity';
import { BusinessUnit } from '../modules/organization-settings/entities/business-unit.entity';
import { Division } from '../modules/organization-settings/entities/division.entity';
import { Department } from '../modules/organization-settings/entities/department.entity';
export const databaseConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const isSSL = configService.get('DB_SSL', 'false') === 'true';
  
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'password'),
    database: configService.get('DB_NAME', 'sx_hris_db'),
    entities: [User, Employee, CompanyProfile, CompanyProfileAuditLog, GroupCompany, BusinessUnit, Division, Department],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: configService.get('DB_SYNCHRONIZE', true),
    logging: configService.get('DB_LOGGING', false),
    retryAttempts: 5,
    retryDelay: 3000,
    // SSL support for Supabase and other cloud PostgreSQL providers
    extra: isSSL ? {
      ssl: {
        rejectUnauthorized: false,
      },
    } : {},
  };
};
