import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RBACStandardRole } from '../entities/rbac-standard-role.entity';
import { RoleCategory } from '../entities/rbac.enums';
import { RBACPermission } from '../entities/rbac-permission.entity';
import { RBACRolePermission } from '../entities/rbac-role-permission.entity';
import { RBACRoleAuditLog } from '../entities/rbac-role-audit-log.entity';
import { RBACPermissionTemplate } from '../entities/rbac-permission-template.entity';

@Injectable()
export class RBACAnalyticsService {
  constructor(
    @InjectRepository(RBACStandardRole)
    private readonly roleRepository: Repository<RBACStandardRole>,
    @InjectRepository(RBACPermission)
    private readonly permissionRepository: Repository<RBACPermission>,
    @InjectRepository(RBACRolePermission)
    private readonly rolePermissionRepository: Repository<RBACRolePermission>,
    @InjectRepository(RBACRoleAuditLog)
    private readonly auditLogRepository: Repository<RBACRoleAuditLog>,
    @InjectRepository(RBACPermissionTemplate)
    private readonly templateRepository: Repository<RBACPermissionTemplate>,
  ) {}

  /**
   * Get overall RBAC statistics
   */
  async getStatistics(tenantId?: string) {
    const roleQuery = this.roleRepository.createQueryBuilder('role')
      .where('role.isDeleted = :isDeleted', { isDeleted: false });

    if (tenantId) {
      roleQuery.andWhere('(role.tenantId = :tenantId OR role.tenantId IS NULL)', { tenantId });
    }

    // Total roles
    const totalRoles = await roleQuery.getCount();

    // Active roles
    const activeRoles = await roleQuery.clone()
      .andWhere('role.isActive = :isActive', { isActive: true })
      .getCount();

    // System roles
    const systemRoles = await roleQuery.clone()
      .andWhere('role.isSystemOwned = :isSystemOwned', { isSystemOwned: true })
      .getCount();

    // Custom roles
    const customRoles = await roleQuery.clone()
      .andWhere('role.isSystemOwned = :isSystemOwned', { isSystemOwned: false })
      .getCount();

    // Total permissions
    const totalPermissions = await this.permissionRepository.count({
      where: { isActive: true },
    });

    // Total permission assignments
    const totalAssignments = await this.rolePermissionRepository.count();

    // Total templates
    const totalTemplates = await this.templateRepository.count({
      where: { isDeleted: false, isActive: true },
    });

    // Recent changes (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentChanges = await this.auditLogRepository.count({
      where: {
        createdAt: thirtyDaysAgo as any, // TypeORM will handle >= comparison
      },
    });

    // Roles pending approval
    const pendingApproval = await roleQuery.clone()
      .andWhere('role.approvalStatus = :status', { status: 'PENDING' })
      .getCount();

    return {
      overview: {
        totalRoles,
        activeRoles,
        inactiveRoles: totalRoles - activeRoles,
        systemRoles,
        customRoles,
      },
      permissions: {
        totalPermissions,
        totalAssignments,
        averagePermissionsPerRole: totalRoles > 0 ? Math.round(totalAssignments / totalRoles) : 0,
      },
      templates: {
        totalTemplates,
      },
      activity: {
        recentChanges,
        pendingApproval,
      },
    };
  }

  /**
   * Get role distribution by category
   */
  async getRoleDistribution(tenantId?: string) {
    const query = this.roleRepository.createQueryBuilder('role')
      .select('role.roleCategory', 'category')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(CASE WHEN role.isActive = true THEN 1 ELSE 0 END)', 'active')
      .where('role.isDeleted = :isDeleted', { isDeleted: false });

    if (tenantId) {
      query.andWhere('(role.tenantId = :tenantId OR role.tenantId IS NULL)', { tenantId });
    }

    query.groupBy('role.roleCategory')
      .orderBy('count', 'DESC');

    const results = await query.getRawMany();

    return results.map(result => ({
      category: result.category,
      total: parseInt(result.count, 10),
      active: parseInt(result.active, 10),
      inactive: parseInt(result.count, 10) - parseInt(result.active, 10),
    }));
  }

  /**
   * Get permission usage analytics
   */
  async getPermissionUsage(tenantId?: string, limit: number = 20) {
    const query = this.rolePermissionRepository.createQueryBuilder('rp')
      .leftJoinAndSelect('rp.permission', 'permission')
      .leftJoin('rp.role', 'role')
      .select('permission.permissionCode', 'permissionCode')
      .addSelect('permission.permissionName', 'permissionName')
      .addSelect('permission.module', 'module')
      .addSelect('permission.action', 'action')
      .addSelect('COUNT(*)', 'usageCount')
      .where('role.isDeleted = :isDeleted', { isDeleted: false });

    if (tenantId) {
      query.andWhere('(role.tenantId = :tenantId OR role.tenantId IS NULL)', { tenantId });
    }

    query.groupBy('permission.id')
      .addGroupBy('permission.permissionCode')
      .addGroupBy('permission.permissionName')
      .addGroupBy('permission.module')
      .addGroupBy('permission.action')
      .orderBy('usageCount', 'DESC')
      .limit(limit);

    const results = await query.getRawMany();

    return results.map(result => ({
      permissionCode: result.permissionCode,
      permissionName: result.permissionName,
      module: result.module,
      action: result.action,
      usageCount: parseInt(result.usageCount, 10),
    }));
  }

  /**
   * Get recent audit activities
   */
  async getRecentActivities(tenantId?: string, limit: number = 50) {
    const query = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.role', 'role')
      .orderBy('audit.createdAt', 'DESC')
      .limit(limit);

    if (tenantId) {
      query.where('role.tenantId = :tenantId OR role.tenantId IS NULL', { tenantId });
    }

    return await query.getMany();
  }

  /**
   * Get role compliance report
   */
  async getComplianceReport(tenantId?: string) {
    const roleQuery = this.roleRepository.createQueryBuilder('role')
      .where('role.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('role.isActive = :isActive', { isActive: true });

    if (tenantId) {
      roleQuery.andWhere('(role.tenantId = :tenantId OR role.tenantId IS NULL)', { tenantId });
    }

    // Roles requiring dual approval
    const rolesDualApproval = await roleQuery.clone()
      .andWhere('role.requiresDualApproval = :requiresDualApproval', { requiresDualApproval: true })
      .getCount();

    // Roles with SOD conflicts defined
    const rolesWithSOD = await roleQuery.clone()
      .andWhere('role.conflictingRoles IS NOT NULL')
      .andWhere("jsonb_array_length(role.conflictingRoles) > 0")
      .getCount();

    // Emergency access roles
    const emergencyRoles = await roleQuery.clone()
      .andWhere('role.isEmergencyAccessRole = :isEmergency', { isEmergency: true })
      .getCount();

    // Roles with audit logging
    const rolesWithAudit = await roleQuery.clone()
      .andWhere('role.auditLogRetentionDays > :days', { days: 0 })
      .getCount();

    // Roles requiring periodic review
    const rolesRequiringReview = await roleQuery.clone()
      .andWhere('role.requiresPeriodicReview = :requiresReview', { requiresReview: true })
      .getCount();

    // Note: Roles overdue for review calculation requires complex date logic
    // This would need custom implementation based on reviewFrequencyDays per role
    const rolesOverdueReview = 0; // Placeholder - implement based on business logic

    const totalRoles = await roleQuery.getCount();

    return {
      overview: {
        totalActiveRoles: totalRoles,
        complianceScore: Math.round((rolesWithAudit / totalRoles) * 100),
      },
      security: {
        rolesDualApproval,
        rolesWithSOD,
        emergencyRoles,
        percentageSecured: Math.round((rolesDualApproval / totalRoles) * 100),
      },
      audit: {
        rolesWithAudit,
        auditCoverage: Math.round((rolesWithAudit / totalRoles) * 100),
      },
      governance: {
        rolesRequiringReview,
        rolesOverdueReview,
        complianceRate: rolesRequiringReview > 0 
          ? Math.round(((rolesRequiringReview - rolesOverdueReview) / rolesRequiringReview) * 100)
          : 100,
      },
    };
  }
}
