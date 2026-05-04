import { Module } from '@nestjs/common';
import { CustomRbacModule } from '../../custom-rbac/custom-rbac.module';
import { StandardRBACModule } from '../../standard-rbac/standard-rbac.module';

/**
 * RolesPermissionsModule
 * 
 * This module serves as a unified interface for both custom and standard RBAC systems.
 * 
 * The actual implementation is split into two modules:
 * 1. CustomRbacModule (src/custom-rbac) - Custom role-based access control with granular permissions
 * 2. StandardRBACModule (src/standard-rbac) - Standard role-based access control
 * 
 * Features available through these modules:
 * - Role management (create, update, delete roles)
 * - Permission assignment and management
 * - User role assignment
 * - Permission checking and validation
 * - Role hierarchy management
 * - Custom permission creation
 * 
 * For role and permission management, use:
 * - CustomRbacModule for fine-grained permission control
 * - StandardRBACModule for predefined role-based control
 */
@Module({
  imports: [CustomRbacModule, StandardRBACModule],
  exports: [CustomRbacModule, StandardRBACModule],
})
export class RolesPermissionsModule {}
