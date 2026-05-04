import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Activity Entities
import {
  ProjectActivity,
  ActivityScopeMapping,
  ActivityVersion,
  ActivityDependencyLink,
  ActivityAuditLog,
} from './entities/project-activity.entity';

// Sub-Activity Entities
import {
  ProjectSubActivity,
  SubActivityScopeMapping,
  SubActivityVersion,
  SubActivityDependencyLink,
  SubActivityAuditLog,
} from './entities/project-sub-activity.entity';

// Project Role Entities
import {
  ProjectRole,
  ProjectRoleHierarchy,
  ProjectRoleScopeMapping,
  ProjectRoleVersion,
  ProjectRoleDependencyLink,
  ProjectRoleAuditLog,
} from './entities/project-role.entity';

// Project Configuration Entities
import {
  ProjectType,
  ProjectResourceAllocationSettings,
  ProjectBillingCostSettings,
  ProjectLifecycleTemplate,
  ProjectLifecycleStage,
  ProjectGovernanceRule,
  ProjectGovernanceRuleMapping,
  ProjectStructureTemplate,
  ProjectStructureLevel,
  ProjectConfigurationVersion,
  ProjectConfigurationDependency,
  ProjectConfigurationAuditLog,
  ProjectConfigurationScopeMapping,
} from './entities/project-config.entity';

// Services
import { ProjectActivityService } from './services/project-activity.service';
import { ProjectSubActivityService } from './services/project-sub-activity.service';
import { ProjectRoleService } from './services/project-role.service';
import { ProjectTypeService } from './services/project-type.service';
import { ProjectConfigurationService } from './services/project-configuration.service';
import { LifecycleManagementService } from './services/lifecycle-management.service';
import { GovernanceManagementService } from './services/governance-management.service';
import { StructureManagementService } from './services/structure-management.service';

// Controllers
import { ProjectActivityController } from './controllers/project-activity.controller';
import { ProjectSubActivityController } from './controllers/project-sub-activity.controller';
import { ProjectRoleController } from './controllers/project-role.controller';
import { ProjectTypeController } from './controllers/project-type.controller';
import { ProjectConfigurationController } from './controllers/project-configuration.controller';
import { LifecycleManagementController } from './controllers/lifecycle-management.controller';
import { GovernanceManagementController } from './controllers/governance-management.controller';
import { StructureManagementController } from './controllers/structure-management.controller';

/**
 * PROJECT MANAGEMENT MODULE
 * Enterprise-grade project activity configuration management
 * 
 * Features:
 * - Activity configuration registry
 * - Multi-tenant isolation
 * - Organizational scope control
 * - Version history and audit trail
 * - Dependency validation
 * - Governance workflow support
 * - Effective dating for configuration changes
 * 
 * This module provides the foundation for:
 * - Project planning
 * - Resource allocation
 * - Timesheet management
 * - Rate card configuration
 * - Billing rules
 * 
 * Architecture:
 * - Configuration-driven (no hardcoded values)
 * - Multi-tenant safe
 * - RBAC integrated
 * - Audit-ready
 * - Production-grade scalability
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Activity Entities
      ProjectActivity,
      ActivityScopeMapping,
      ActivityVersion,
      ActivityDependencyLink,
      ActivityAuditLog,
      // Sub-Activity Entities
      ProjectSubActivity,
      SubActivityScopeMapping,
      SubActivityVersion,
      SubActivityDependencyLink,
      SubActivityAuditLog,
      // Project Role Entities
      ProjectRole,
      ProjectRoleHierarchy,
      ProjectRoleScopeMapping,
      ProjectRoleVersion,
      ProjectRoleDependencyLink,
      ProjectRoleAuditLog,
      // Project Configuration Entities
      ProjectType,
      ProjectResourceAllocationSettings,
      ProjectBillingCostSettings,
      ProjectLifecycleTemplate,
      ProjectLifecycleStage,
      ProjectGovernanceRule,
      ProjectGovernanceRuleMapping,
      ProjectStructureTemplate,
      ProjectStructureLevel,
      ProjectConfigurationVersion,
      ProjectConfigurationDependency,
      ProjectConfigurationAuditLog,
      ProjectConfigurationScopeMapping,
    ]),
  ],
  controllers: [
    ProjectActivityController,
    ProjectSubActivityController,
    ProjectRoleController,
    ProjectTypeController,
    ProjectConfigurationController,
    LifecycleManagementController,
    GovernanceManagementController,
    StructureManagementController,
  ],
  providers: [
    ProjectActivityService,
    ProjectSubActivityService,
    ProjectRoleService,
    ProjectTypeService,
    ProjectConfigurationService,
    LifecycleManagementService,
    GovernanceManagementService,
    StructureManagementService,
  ],
  exports: [
    ProjectActivityService,
    ProjectSubActivityService,
    ProjectRoleService,
    ProjectTypeService,
    ProjectConfigurationService,
    LifecycleManagementService,
    GovernanceManagementService,
    StructureManagementService, // Export for use in other modules (e.g., Rate Cards)
  ],
})
export class ProjectManagementModule {}
