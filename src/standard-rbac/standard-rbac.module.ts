import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { SystemRole } from './entities/system-role.entity';
import { PermissionRegistry } from './entities/permission-registry.entity';
import { SystemRolePermission } from './entities/system-role-permission.entity';
import { DataScopeConfig } from './entities/data-scope-config.entity';
import { FieldLevelSecurity } from './entities/field-level-security.entity';
import { SoDPolicy } from './entities/sod-policy.entity';
import { GovernanceWorkflow } from './entities/governance-workflow.entity';
import { SystemRoleVersion } from './entities/system-role-version.entity';
import { AuditLog } from './entities/audit-log.entity';

// Services
import { SystemRoleService } from './services/system-role.service';
import { PermissionService } from './services/permission.service';
import { PermissionResolutionEngine } from './services/permission-resolution.engine';
import { DataScopeResolutionEngine } from './services/data-scope-resolution.engine';
import { DataScopeService } from './services/data-scope.service';
import { FieldSecurityEngine } from './services/field-security.engine';
import { FieldSecurityService } from './services/field-security.service';
import { SoDEngine } from './services/sod-engine.service';
import { SoDPolicyService } from './services/sod-policy.service';
import { GovernanceWorkflowService } from './services/governance-workflow.service';
import { AuditService } from './services/audit.service';

// Controllers
import { SystemRoleController } from './controllers/system-role.controller';
import { PermissionController } from './controllers/permission.controller';
import { DataScopeController } from './controllers/data-scope.controller';
import { FieldSecurityController } from './controllers/field-security.controller';
import { SoDController } from './controllers/sod.controller';
import { GovernanceWorkflowController } from './controllers/governance-workflow.controller';
import { AuditController } from './controllers/audit.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core Entities
      SystemRole,
      PermissionRegistry,
      SystemRolePermission,
      DataScopeConfig,
      FieldLevelSecurity,
      SoDPolicy,
      GovernanceWorkflow,
      SystemRoleVersion,
      AuditLog,
    ]),
  ],
  controllers: [
    SystemRoleController,
    PermissionController,
    DataScopeController,
    FieldSecurityController,
    SoDController,
    GovernanceWorkflowController,
    AuditController,
  ],
  providers: [
    // Core Services
    SystemRoleService,
    PermissionService,
    DataScopeService,
    FieldSecurityService,
    SoDPolicyService,
    AuditService,
    
    // Engine Services
    PermissionResolutionEngine,
    DataScopeResolutionEngine,
    FieldSecurityEngine,
    SoDEngine,
    GovernanceWorkflowService,
  ],
  exports: [
    // Export services for use in other modules
    SystemRoleService,
    PermissionService,
    DataScopeService,
    FieldSecurityService,
    SoDPolicyService,
    PermissionResolutionEngine,
    DataScopeResolutionEngine,
    FieldSecurityEngine,
    SoDEngine,
    GovernanceWorkflowService,
    AuditService,
  ],
})
export class StandardRBACModule {}
