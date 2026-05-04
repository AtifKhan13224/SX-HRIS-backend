import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { CustomRole } from './entities/custom-role.entity';
import { RoleComposition } from './entities/role-composition.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { SoDPolicy } from './entities/sod-policy.entity';
import { RoleApprovalWorkflow } from './entities/role-approval-workflow.entity';
import { RoleChangeRequest } from './entities/role-change-request.entity';
import { RoleVersion } from './entities/role-version.entity';
import { ContextEvaluationRule } from './entities/context-evaluation-rule.entity';

// Services
import { CustomRoleService } from './services/custom-role.service';
import { PermissionResolutionEngine } from './services/permission-resolution.engine';
import { InheritanceResolver } from './services/inheritance-resolver.service';
import { SoDEngine } from './services/sod-engine.service';
import { RiskScoringEngine } from './services/risk-scoring.engine';
import { ContextEvaluationEngine } from './services/context-evaluation.engine';
import { GovernanceWorkflowService } from './services/governance-workflow.service';

// Controllers
import { CustomRoleController } from './controllers/custom-role.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomRole,
      RoleComposition,
      Permission,
      RolePermission,
      SoDPolicy,
      RoleApprovalWorkflow,
      RoleChangeRequest,
      RoleVersion,
      ContextEvaluationRule,
    ]),
  ],
  controllers: [
    CustomRoleController,
  ],
  providers: [
    CustomRoleService,
    PermissionResolutionEngine,
    InheritanceResolver,
    SoDEngine,
    RiskScoringEngine,
    ContextEvaluationEngine,
    GovernanceWorkflowService,
  ],
  exports: [
    CustomRoleService,
    PermissionResolutionEngine,
    InheritanceResolver,
    SoDEngine,
    RiskScoringEngine,
    ContextEvaluationEngine,
    GovernanceWorkflowService,
  ],
})
export class CustomRbacModule {}
