import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomRole } from '../entities/custom-role.entity';
import { RoleComposition } from '../entities/role-composition.entity';

export interface InheritanceTreeNode {
  role: {
    id: string;
    roleCode: string;
    roleName: string;
    category: string;
    sensitivityLevel: string;
  };
  parents: InheritanceTreeNode[];
  children: InheritanceTreeNode[];
  compositionType?: string;
  inheritanceStrategy?: string;
  priority: number;
  depth: number;
  permissionCount: number;
}

export interface InheritanceValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  circularDependencies: string[][];
  maxDepth: number;
}

@Injectable()
export class InheritanceResolver {
  private readonly logger = new Logger(InheritanceResolver.name);
  private readonly MAX_INHERITANCE_DEPTH = 10;

  constructor(
    @InjectRepository(CustomRole)
    private readonly roleRepository: Repository<CustomRole>,
    @InjectRepository(RoleComposition)
    private readonly compositionRepository: Repository<RoleComposition>,
  ) {}

  /**
   * Resolves complete role inheritance graph
   * Detects circular dependencies
   * Builds effective permission set
   */
  async resolveInheritance(roleId: string): Promise<InheritanceTreeNode> {
    this.logger.log(`Resolving inheritance for role ${roleId}`);

    const visited = new Set<string>();
    const graph = await this.buildInheritanceGraph(roleId, visited, 0);

    // Validate for cycles
    const validation = await this.validateInheritance(roleId);
    if (!validation.isValid) {
      throw new Error(`Invalid inheritance: ${validation.errors.join(', ')}`);
    }

    return graph;
  }

  /**
   * Builds inheritance graph recursively
   */
  private async buildInheritanceGraph(
    roleId: string,
    visited: Set<string>,
    depth: number
  ): Promise<InheritanceTreeNode> {
    // Check depth limit
    if (depth > this.MAX_INHERITANCE_DEPTH) {
      throw new Error(`Maximum inheritance depth (${this.MAX_INHERITANCE_DEPTH}) exceeded`);
    }

    // Mark as visited for cycle detection
    if (visited.has(roleId)) {
      throw new Error(`Circular inheritance detected at role ${roleId}`);
    }

    visited.add(roleId);

    // Get role
    const role = await this.roleRepository.findOne({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    // Get parent compositions
    const parentCompositions = await this.compositionRepository.find({
      where: { roleId, isActive: true },
      order: { priority: 'DESC' }
    });

    // Get child compositions
    const childCompositions = await this.compositionRepository.find({
      where: { parentRoleId: roleId, isActive: true },
      order: { priority: 'DESC' }
    });

    // Recursively build parent nodes
    const parents: InheritanceTreeNode[] = [];
    for (const comp of parentCompositions) {
      try {
        const parentNode = await this.buildInheritanceGraph(
          comp.parentRoleId,
          new Set(visited),
          depth + 1
        );
        parents.push({
          ...parentNode,
          compositionType: comp.compositionType,
          inheritanceStrategy: comp.inheritanceStrategy,
          priority: comp.priority
        });
      } catch (error) {
        this.logger.error(`Error building parent node: ${error.message}`);
        throw error;
      }
    }

    // Recursively build child nodes
    const children: InheritanceTreeNode[] = [];
    for (const comp of childCompositions) {
      try {
        const childNode = await this.buildInheritanceGraph(
          comp.roleId,
          new Set(visited),
          depth + 1
        );
        children.push({
          ...childNode,
          compositionType: comp.compositionType,
          inheritanceStrategy: comp.inheritanceStrategy,
          priority: comp.priority
        });
      } catch (error) {
        this.logger.error(`Error building child node: ${error.message}`);
        // Continue with other children
      }
    }

    return {
      role: {
        id: role.id,
        roleCode: role.roleCode,
        roleName: role.roleName,
        category: role.category,
        sensitivityLevel: role.sensitivityLevel
      },
      parents,
      children,
      priority: 0,
      depth,
      permissionCount: 0 // Will be computed later
    };
  }

  /**
   * Validates inheritance structure
   */
  async validateInheritance(roleId: string): Promise<InheritanceValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const circularDeps: string[][] = [];

    try {
      // Check for circular dependencies
      const cycles = await this.detectCycles(roleId);
      if (cycles.length > 0) {
        errors.push('Circular inheritance detected');
        circularDeps.push(...cycles);
      }

      // Check depth
      const maxDepth = await this.calculateMaxDepth(roleId);
      if (maxDepth > this.MAX_INHERITANCE_DEPTH) {
        errors.push(`Inheritance depth (${maxDepth}) exceeds maximum (${this.MAX_INHERITANCE_DEPTH})`);
      } else if (maxDepth > 5) {
        warnings.push(`Inheritance depth (${maxDepth}) is quite deep - consider simplifying`);
      }

      // Check for inheritance conflicts
      const conflicts = await this.detectInheritanceConflicts(roleId);
      if (conflicts.length > 0) {
        warnings.push(`Found ${conflicts.length} potential permission conflicts`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        circularDependencies: circularDeps,
        maxDepth
      };
    } catch (error) {
      errors.push(error.message);
      return {
        isValid: false,
        errors,
        warnings,
        circularDependencies: circularDeps,
        maxDepth: 0
      };
    }
  }

  /**
   * Detects circular dependencies using DFS
   */
  private async detectCycles(roleId: string): Promise<string[][]> {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack: string[] = [];

    const dfs = async (currentId: string): Promise<void> => {
      if (stack.includes(currentId)) {
        // Found a cycle
        const cycleStart = stack.indexOf(currentId);
        cycles.push(stack.slice(cycleStart).concat(currentId));
        return;
      }

      if (visited.has(currentId)) {
        return;
      }

      visited.add(currentId);
      stack.push(currentId);

      const compositions = await this.compositionRepository.find({
        where: { roleId: currentId, isActive: true }
      });

      for (const comp of compositions) {
        await dfs(comp.parentRoleId);
      }

      stack.pop();
    };

    await dfs(roleId);
    return cycles;
  }

  /**
   * Calculates maximum inheritance depth
   */
  private async calculateMaxDepth(roleId: string): Promise<number> {
    let maxDepth = 0;

    const calculateDepth = async (currentId: string, depth: number): Promise<void> => {
      if (depth > maxDepth) {
        maxDepth = depth;
      }

      const compositions = await this.compositionRepository.find({
        where: { roleId: currentId, isActive: true }
      });

      for (const comp of compositions) {
        await calculateDepth(comp.parentRoleId, depth + 1);
      }
    };

    await calculateDepth(roleId, 0);
    return maxDepth;
  }

  /**
   * Detects potential permission conflicts in inheritance
   */
  private async detectInheritanceConflicts(roleId: string): Promise<any[]> {
    // Placeholder: implement conflict detection logic
    // Check for overlapping permissions with different scopes
    return [];
  }

  /**
   * Flattens inheritance tree into a linear list
   */
  flattenInheritanceTree(tree: InheritanceTreeNode): any[] {
    const flattened: any[] = [];

    const flatten = (node: InheritanceTreeNode): void => {
      flattened.push({
        roleId: node.role.id,
        roleCode: node.role.roleCode,
        roleName: node.role.roleName,
        depth: node.depth,
        priority: node.priority
      });

      for (const parent of node.parents) {
        flatten(parent);
      }
    };

    flatten(tree);
    return flattened;
  }

  /**
   * Checks if adding a composition would create a cycle
   */
  async wouldCreateCycle(roleId: string, parentRoleId: string): Promise<boolean> {
    // Check if parentRoleId inherits from roleId (directly or indirectly)
    const ancestors = await this.getAncestors(parentRoleId);
    return ancestors.includes(roleId);
  }

  /**
   * Gets all ancestor roles (parents, grandparents, etc.)
   */
  private async getAncestors(roleId: string): Promise<string[]> {
    const ancestors: string[] = [];
    const visited = new Set<string>();

    const collect = async (currentId: string): Promise<void> => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const compositions = await this.compositionRepository.find({
        where: { roleId: currentId, isActive: true }
      });

      for (const comp of compositions) {
        ancestors.push(comp.parentRoleId);
        await collect(comp.parentRoleId);
      }
    };

    await collect(roleId);
    return ancestors;
  }
}
