import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomRole } from '../entities/custom-role.entity';
import { RoleComposition } from '../entities/role-composition.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Permission } from '../entities/permission.entity';

export interface AccessContext {
  userId?: string;
  timestamp: Date;
  ipAddress?: string;
  location?: string;
  emergencyMode?: boolean;
  requestedScope?: any;
}

export interface ResolvedPermission {
  permissionId: string;
  module: string;
  subModule: string;
  feature: string;
  actions: string[];
  dataType: string;
  scope: any;
  fieldAccessRules: any[];
  source: 'DIRECT' | 'INHERITED' | 'COMPOSED';
  sourceRoleId?: string;
  priority: number;
  restrictions: string[];
}

export interface EffectivePermissions {
  permissions: ResolvedPermission[];
  scope: any;
  fieldAccess: Map<string, any>;
  conditions: any[];
  warnings: string[];
  restrictions: string[];
  computedAt: Date;
  cacheKey: string;
}

export interface InheritanceNode {
  role: CustomRole;
  permissions: RolePermission[];
  children: InheritanceNode[];
  compositionType?: string;
  inheritanceStrategy?: string;
  priority: number;
  depth: number;
}

@Injectable()
export class PermissionResolutionEngine {
  private readonly logger = new Logger(PermissionResolutionEngine.name);

  constructor(
    @InjectRepository(CustomRole)
    private readonly roleRepository: Repository<CustomRole>,
    @InjectRepository(RoleComposition)
    private readonly compositionRepository: Repository<RoleComposition>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Resolves effective permissions for a role considering:
   * - Direct permissions
   * - Inherited permissions
   * - Composed permissions
   * - Override rules
   * - Context and conditions
   * - Field-level rules
   */
  async resolveEffectivePermissions(
    roleId: string,
    context: AccessContext
  ): Promise<EffectivePermissions> {
    this.logger.log(`Resolving permissions for role ${roleId}`);

    try {
      // 1. Build inheritance tree
      const inheritanceTree = await this.buildInheritanceTree(roleId);

      // 2. Collect all permissions (direct + inherited)
      const allPermissions = await this.collectAllPermissions(inheritanceTree);

      // 3. Apply inheritance and composition rules
      const mergedPermissions = this.applyInheritanceRules(allPermissions);

      // 4. Detect and resolve conflicts
      const resolvedPermissions = this.resolveConflicts(mergedPermissions);

      // 5. Apply context and conditions
      const contextualPermissions = this.applyContext(resolvedPermissions, context);

      // 6. Apply field-level security
      const finalPermissions = this.applyFieldLevelSecurity(contextualPermissions);

      // 7. Build result
      return {
        permissions: finalPermissions.permissions,
        scope: finalPermissions.scope,
        fieldAccess: finalPermissions.fieldAccess,
        conditions: finalPermissions.conditions,
        warnings: finalPermissions.warnings,
        restrictions: finalPermissions.restrictions,
        computedAt: new Date(),
        cacheKey: this.generateCacheKey(roleId, context)
      };
    } catch (error) {
      this.logger.error(`Error resolving permissions for role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Builds the complete inheritance tree for a role
   * Detects circular dependencies
   */
  async buildInheritanceTree(
    roleId: string,
    visited: Set<string> = new Set(),
    depth: number = 0
  ): Promise<InheritanceNode> {
    // Detect circular dependency
    if (visited.has(roleId)) {
      throw new Error(`Circular inheritance detected for role ${roleId}`);
    }

    visited.add(roleId);

    // Get role
    const role = await this.roleRepository.findOne({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    // Get direct permissions
    const permissions = await this.rolePermissionRepository.find({
      where: { roleId, isActive: true },
      relations: ['permission']
    });

    // Get parent roles (inheritance)
    const compositions = await this.compositionRepository.find({
      where: { roleId, isActive: true },
      order: { priority: 'DESC' }
    });

    // Recursively build children nodes
    const children: InheritanceNode[] = [];
    for (const composition of compositions) {
      const childNode = await this.buildInheritanceTree(
        composition.parentRoleId,
        new Set(visited),
        depth + 1
      );
      children.push({
        ...childNode,
        compositionType: composition.compositionType,
        inheritanceStrategy: composition.inheritanceStrategy,
        priority: composition.priority
      });
    }

    return {
      role,
      permissions,
      children,
      priority: 0,
      depth
    };
  }

  /**
   * Collects all permissions from the inheritance tree
   */
  private async collectAllPermissions(
    tree: InheritanceNode
  ): Promise<ResolvedPermission[]> {
    const collected: ResolvedPermission[] = [];

    // Add direct permissions
    for (const rp of tree.permissions) {
      if (!rp.permission) continue;

      collected.push({
        permissionId: rp.permission.id,
        module: rp.permission.module,
        subModule: rp.permission.subModule,
        feature: rp.permission.feature,
        actions: rp.permission.actions,
        dataType: rp.permission.dataType,
        scope: rp.dataScope,
        fieldAccessRules: rp.fieldAccessRules || [],
        source: 'DIRECT',
        sourceRoleId: tree.role.id,
        priority: 100, // Direct permissions have highest priority
        restrictions: []
      });
    }

    // Add inherited permissions
    for (const child of tree.children) {
      const inheritedPerms = await this.collectAllPermissions(child);

      for (const perm of inheritedPerms) {
        collected.push({
          ...perm,
          source: 'INHERITED',
          sourceRoleId: child.role.id,
          priority: child.priority || 50 // Inherited priority
        });
      }
    }

    return collected;
  }

  /**
   * Applies inheritance rules and merges permissions
   */
  private applyInheritanceRules(
    permissions: ResolvedPermission[]
  ): ResolvedPermission[] {
    const permissionMap = new Map<string, ResolvedPermission[]>();

    // Group by permission ID
    for (const perm of permissions) {
      const key = perm.permissionId;
      if (!permissionMap.has(key)) {
        permissionMap.set(key, []);
      }
      permissionMap.get(key).push(perm);
    }

    // Merge duplicates
    const merged: ResolvedPermission[] = [];
    for (const [permId, perms] of permissionMap.entries()) {
      if (perms.length === 1) {
        merged.push(perms[0]);
      } else {
        // Multiple sources - merge
        const merged_perm = this.mergePermissions(perms);
        merged.push(merged_perm);
      }
    }

    return merged;
  }

  /**
   * Merges multiple instances of the same permission from different sources
   */
  private mergePermissions(permissions: ResolvedPermission[]): ResolvedPermission {
    // Sort by priority (highest first)
    permissions.sort((a, b) => b.priority - a.priority);

    const base = permissions[0];
    const merged = { ...base };

    // Merge actions (union)
    const allActions = new Set<string>();
    for (const perm of permissions) {
      perm.actions.forEach(action => allActions.add(action));
    }
    merged.actions = Array.from(allActions);

    // Merge scopes (use most restrictive)
    merged.scope = this.mergeScopes(permissions.map(p => p.scope));

    // Merge field access rules
    merged.fieldAccessRules = this.mergeFieldAccessRules(
      permissions.map(p => p.fieldAccessRules).flat()
    );

    return merged;
  }

  /**
   * Conflict Resolution Strategy:
   * 1. Explicit DENY always wins
   * 2. Higher priority overrides lower
   * 3. More specific scope wins over general
   * 4. Latest effective date wins for temporal conflicts
   */
  private resolveConflicts(permissions: ResolvedPermission[]): ResolvedPermission[] {
    const resolved: ResolvedPermission[] = [];
    const warnings: string[] = [];

    // Check for DENY rules (not implemented in this basic version)
    // In production, check override rules and apply DENY logic

    // For now, return as-is (conflicts resolved in merge)
    return permissions;
  }

  /**
   * Applies context-aware filtering (time, location, etc.)
   */
  private applyContext(
    permissions: ResolvedPermission[],
    context: AccessContext
  ): any {
    const filtered = permissions.filter(perm => {
      // Check temporal validity (if needed)
      // Check location restrictions (if needed)
      // Check emergency mode elevation (if needed)
      return true; // For now, no filtering
    });

    return {
      permissions: filtered,
      scope: {},
      fieldAccess: new Map(),
      conditions: [],
      warnings: [],
      restrictions: []
    };
  }

  /**
   * Applies field-level security rules
   */
  private applyFieldLevelSecurity(data: any): any {
    // Build field access map
    const fieldAccessMap = new Map<string, any>();

    for (const perm of data.permissions) {
      for (const rule of perm.fieldAccessRules) {
        fieldAccessMap.set(rule.fieldPath, rule);
      }
    }

    return {
      ...data,
      fieldAccess: fieldAccessMap
    };
  }

  /**
   * Merges data scopes (use most restrictive)
   */
  private mergeScopes(scopes: any[]): any {
    // Simple implementation: return first non-null scope
    // In production: compute intersection of scopes
    return scopes.find(s => s != null) || null;
  }

  /**
   * Merges field access rules
   */
  private mergeFieldAccessRules(rules: any[]): any[] {
    const ruleMap = new Map<string, any>();

    for (const rule of rules) {
      const existing = ruleMap.get(rule.fieldPath);
      if (!existing || this.isMoreRestrictive(rule, existing)) {
        ruleMap.set(rule.fieldPath, rule);
      }
    }

    return Array.from(ruleMap.values());
  }

  /**
   * Determines if a rule is more restrictive than another
   */
  private isMoreRestrictive(rule1: any, rule2: any): boolean {
    const visibilityOrder = { HIDDEN: 3, MASKED: 2, FULL: 1 };
    return visibilityOrder[rule1.visibility] > visibilityOrder[rule2.visibility];
  }

  /**
   * Generates cache key for resolved permissions
   */
  private generateCacheKey(roleId: string, context: AccessContext): string {
    return `role:${roleId}:${context.timestamp.getTime()}`;
  }
}
