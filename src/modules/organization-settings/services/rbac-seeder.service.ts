import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RBACStandardRole } from '../entities/rbac-standard-role.entity';
import { RoleCategory, DataScopeLevel } from '../entities/rbac.enums';
import { RBACPermission } from '../entities/rbac-permission.entity';
import { RBACRolePermission } from '../entities/rbac-role-permission.entity';
import { RBACPermissionTemplate } from '../entities/rbac-permission-template.entity';
import { mapPermissionsForDB } from '../seeds/rbac-permissions-complete-seed.data';
import { RBAC_PERMISSION_TEMPLATES } from '../seeds/rbac-permission-templates-seed.data';

@Injectable()
export class RBACSeederService {
  private readonly logger = new Logger(RBACSeederService.name);

  constructor(
    @InjectRepository(RBACStandardRole)
    private readonly roleRepository: Repository<RBACStandardRole>,
    @InjectRepository(RBACPermission)
    private readonly permissionRepository: Repository<RBACPermission>,
    @InjectRepository(RBACRolePermission)
    private readonly rolePermissionRepository: Repository<RBACRolePermission>,
    @InjectRepository(RBACPermissionTemplate)
    private readonly templateRepository: Repository<RBACPermissionTemplate>,
  ) {}

  async seed() {
    try {
      this.logger.log('🌱 Starting RBAC seeding process...');

      // Step 1: Seed Permissions
      await this.seedPermissions();

      // Step 2: Seed Permission Templates
      await this.seedPermissionTemplates();

      // Step 3: Seed Sample Roles
      await this.seedSampleRoles();

      this.logger.log('✅ RBAC seeding completed successfully!');
      return { success: true, message: 'RBAC data seeded successfully' };
    } catch (error) {
      this.logger.error('❌ RBAC seeding failed:', error);
      throw error;
    }
  }

  private async seedPermissions() {
    this.logger.log('📝 Seeding permissions...');
    
    const permissions = mapPermissionsForDB();
    let created = 0;
    let skipped = 0;

    for (const permData of permissions) {
      const existing = await this.permissionRepository.findOne({
        where: { permissionCode: permData.permissionCode },
      });

      if (!existing) {
        await this.permissionRepository.save({
          ...permData,
          action: permData.action as any, // Cast to enum type
        });
        created++;
      } else {
        skipped++;
      }
    }

    this.logger.log(`✓ Permissions: ${created} created, ${skipped} skipped`);
  }

  private async seedPermissionTemplates() {
    this.logger.log('📋 Seeding permission templates...');
    
    let created = 0;
    let skipped = 0;

    for (const templateData of RBAC_PERMISSION_TEMPLATES) {
      const existing = await this.templateRepository.findOne({
        where: { templateCode: templateData.templateCode },
      });

      if (!existing) {
        await this.templateRepository.save(templateData);
        created++;
      } else {
        skipped++;
      }
    }

    this.logger.log(`✓ Templates: ${created} created, ${skipped} skipped`);
  }

  private async seedSampleRoles() {
    this.logger.log('👥 Seeding sample roles...');

    const sampleRoles = [
      {
        roleCode: 'ROLE_SYSTEM_ADMIN',
        roleName: 'System Administrator',
        roleDescription: 'Full system access with all permissions',
        roleCategory: RoleCategory.SYSTEM_ADMIN,
        defaultDataScope: DataScopeLevel.GLOBAL,
        isSystemOwned: true,
        isModifiable: false,
        canAccessSensitiveData: true,
        canExportData: true,
        canApproveTransactions: true,
        permissionCodes: ['*'], // All permissions
      },
      {
        roleCode: 'ROLE_HR_ADMIN',
        roleName: 'HR Administrator',
        roleDescription: 'Complete HR management access',
        roleCategory: RoleCategory.HR_ADMIN,
        defaultDataScope: DataScopeLevel.GLOBAL,
        isSystemOwned: true,
        isModifiable: true,
        canAccessSensitiveData: true,
        canExportData: true,
        canApproveTransactions: true,
        permissionCodes: [
          'EC_PERSONAL_VIEW', 'EC_PERSONAL_EDIT', 'EC_PERSONAL_EXPORT',
          'EC_EMPLOYMENT_VIEW', 'EC_EMPLOYMENT_EDIT', 'EC_EMPLOYMENT_APPROVE',
          'EC_JOB_VIEW', 'EC_JOB_EDIT', 'EC_JOB_APPROVE',
          'REC_JOBPOST_VIEW', 'REC_JOBPOST_CREATE', 'REC_JOBPOST_APPROVE',
          'REC_CANDIDATE_VIEW', 'REC_CANDIDATE_EDIT',
          'PERF_GOAL_VIEW', 'PERF_GOAL_APPROVE',
          'PERF_REVIEW_VIEW', 'PERF_REVIEW_APPROVE',
          'ANALYTICS_HR_VIEW', 'ANALYTICS_HR_EXPORT',
        ],
      },
      {
        roleCode: 'ROLE_LINE_MANAGER',
        roleName: 'Line Manager',
        roleDescription: 'Manage direct reports and team operations',
        roleCategory: RoleCategory.LINE_MANAGER,
        defaultDataScope: DataScopeLevel.DIRECT_REPORTS,
        isSystemOwned: true,
        isModifiable: true,
        canAccessSensitiveData: false,
        canExportData: false,
        canApproveTransactions: true,
        permissionCodes: [
          'EC_PERSONAL_VIEW', 'EC_EMPLOYMENT_VIEW', 'EC_JOB_VIEW',
          'PERF_GOAL_VIEW', 'PERF_GOAL_APPROVE',
          'PERF_REVIEW_VIEW', 'PERF_REVIEW_CREATE', 'PERF_REVIEW_EDIT',
          'TIME_OFF_VIEW', 'TIME_OFF_APPROVE', 'TIME_OFF_REJECT',
          'TIMESHEET_VIEW', 'TIMESHEET_APPROVE',
        ],
      },
      {
        roleCode: 'ROLE_EMPLOYEE',
        roleName: 'Employee Self-Service',
        roleDescription: 'Basic employee permissions for self-service',
        roleCategory: RoleCategory.EMPLOYEE_SELF_SERVICE,
        defaultDataScope: DataScopeLevel.OWN_DATA_ONLY,
        isSystemOwned: true,
        isModifiable: false,
        canAccessSensitiveData: false,
        canExportData: false,
        canApproveTransactions: false,
        permissionCodes: [
          'EC_PERSONAL_VIEW', 'EC_PERSONAL_EDIT',
          'EC_EMPLOYMENT_VIEW', 'EC_JOB_VIEW',
          'COMP_PAYSLIP_VIEW', 'COMP_PAYSLIP_DOWNLOAD',
          'PERF_GOAL_VIEW', 'PERF_GOAL_CREATE', 'PERF_GOAL_EDIT',
          'PERF_REVIEW_VIEW',
          'TIME_OFF_VIEW', 'TIME_OFF_CREATE', 'TIME_OFF_EDIT',
          'TIMESHEET_VIEW', 'TIMESHEET_CREATE', 'TIMESHEET_EDIT',
          'LEARN_COURSE_VIEW', 'LEARN_COURSE_ENROLL',
        ],
      },
      {
        roleCode: 'ROLE_PAYROLL_ADMIN',
        roleName: 'Payroll Administrator',
        roleDescription: 'Full payroll processing and compensation management',
        roleCategory: RoleCategory.PAYROLL_ADMIN,
        defaultDataScope: DataScopeLevel.GLOBAL,
        isSystemOwned: true,
        isModifiable: true,
        canAccessSensitiveData: true,
        canExportData: true,
        canApproveTransactions: true,
        permissionCodes: [
          'COMP_PAYROLL_VIEW', 'COMP_PAYROLL_PROCESS', 'COMP_PAYROLL_APPROVE', 'COMP_PAYROLL_EXPORT',
          'COMP_SALARY_VIEW', 'COMP_SALARY_EDIT', 'COMP_SALARY_APPROVE',
          'COMP_PAYSLIP_VIEW', 'COMP_PAYSLIP_GENERATE', 'COMP_PAYSLIP_EXPORT',
          'EC_EMPLOYMENT_VIEW',
          'ANALYTICS_COMPENSATION_VIEW', 'ANALYTICS_COMPENSATION_EXPORT',
        ],
      },
      {
        roleCode: 'ROLE_RECRUITER',
        roleName: 'Recruiter',
        roleDescription: 'Recruiting and candidate management',
        roleCategory: RoleCategory.RECRUITER,
        defaultDataScope: DataScopeLevel.BUSINESS_UNIT,
        isSystemOwned: true,
        isModifiable: true,
        canAccessSensitiveData: true,
        canExportData: true,
        canApproveTransactions: false,
        permissionCodes: [
          'REC_JOBPOST_VIEW', 'REC_JOBPOST_CREATE', 'REC_JOBPOST_EDIT',
          'REC_CANDIDATE_VIEW', 'REC_CANDIDATE_CREATE', 'REC_CANDIDATE_EDIT', 'REC_CANDIDATE_EXPORT',
          'REC_APPLICATION_VIEW', 'REC_APPLICATION_REVIEW',
          'REC_INTERVIEW_VIEW', 'REC_INTERVIEW_CREATE', 'REC_INTERVIEW_EDIT',
          'REC_OFFER_VIEW', 'REC_OFFER_CREATE', 'REC_OFFER_EDIT',
        ],
      },
      {
        roleCode: 'ROLE_AUDITOR',
        roleName: 'System Auditor',
        roleDescription: 'Read-only access for compliance and audit',
        roleCategory: RoleCategory.AUDITOR,
        defaultDataScope: DataScopeLevel.GLOBAL,
        isSystemOwned: true,
        isModifiable: false,
        canAccessSensitiveData: true,
        canExportData: true,
        canApproveTransactions: false,
        permissionCodes: [
          'EC_PERSONAL_VIEW', 'EC_EMPLOYMENT_VIEW', 'EC_AUDIT_VIEW',
          'COMP_PAYROLL_VIEW', 'COMP_SALARY_VIEW', 'COMP_AUDIT_VIEW',
          'TIME_OFF_VIEW', 'TIMESHEET_VIEW', 'TIME_AUDIT_VIEW',
          'ADMIN_AUDIT_VIEW', 'ADMIN_AUDIT_EXPORT',
          'ADMIN_RBAC_VIEW', 'ADMIN_RBAC_AUDIT',
          'ANALYTICS_VIEW', 'ANALYTICS_EXPORT',
        ],
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const roleData of sampleRoles) {
      const existing = await this.roleRepository.findOne({
        where: { roleCode: roleData.roleCode },
      });

      if (!existing) {
        const { permissionCodes, ...roleFields } = roleData;
        const role = await this.roleRepository.save({
          ...roleFields,
          isActive: true,
          displayOrder: created,
          roleVersion: 1,
          approvalStatus: 'APPROVED' as any,
          createdBy: 'system',
          updatedBy: 'system',
        });

        // Assign permissions
        if (permissionCodes[0] === '*') {
          // Assign all permissions for system admin
          const allPermissions = await this.permissionRepository.find();
          for (const permission of allPermissions) {
            await this.rolePermissionRepository.save({
              roleId: role.id,
              permissionId: permission.id,
              dataScope: role.defaultDataScope,
              isActive: true,
            });
          }
        } else {
          // Assign specific permissions
          for (const permCode of permissionCodes) {
            const permission = await this.permissionRepository.findOne({
              where: { permissionCode: permCode },
            });
            if (permission) {
              await this.rolePermissionRepository.save({
                roleId: role.id,
                permissionId: permission.id,
                dataScope: role.defaultDataScope,
                isActive: true,
              });
            }
          }
        }

        created++;
      } else {
        skipped++;
      }
    }

    this.logger.log(`✓ Roles: ${created} created, ${skipped} skipped`);
  }

  async reset() {
    this.logger.warn('🗑️  Resetting RBAC data...');
    await this.rolePermissionRepository.delete({});
    await this.roleRepository.delete({});
    await this.templateRepository.delete({});
    await this.permissionRepository.delete({});
    this.logger.log('✓ RBAC data reset complete');
  }
}
