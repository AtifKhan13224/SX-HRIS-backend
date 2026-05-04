import { Module } from '@nestjs/common';
import { OrganizationSettingsModule } from '../organization-settings/organization-settings.module';

/**
 * DepartmentsModule
 * 
 * This module serves as a reference to the full department functionality
 * which is implemented in the OrganizationSettingsModule.
 * 
 * For department management, use the OrganizationSettingsModule which includes:
 * - Department controller and service
 * - Division management
 * - Business units
 * - Capabilities
 * - Job families
 * - Group companies
 */
@Module({
  imports: [OrganizationSettingsModule],
  exports: [OrganizationSettingsModule],
})
export class DepartmentsModule {}
