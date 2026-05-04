import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import {
  ReportRegistry,
  ReportPermission,
  ReportDataScope,
  ReportColumnSecurity,
  ReportExportControl,
  ReportAccessApproval,
  ReportAuditLog,
  ReportSensitivityFlag,
  ReportComplianceSnapshot,
  ReportCategory,
} from '../entities';

@Injectable()
export class ReportPermissionService {
  constructor(
    @InjectRepository(ReportRegistry)
    private reportRegistryRepo: Repository<ReportRegistry>,
    @InjectRepository(ReportPermission)
    private reportPermissionRepo: Repository<ReportPermission>,
    @InjectRepository(ReportCategory)
    private reportCategoryRepo: Repository<ReportCategory>,
    @InjectRepository(ReportAuditLog)
    private auditLogRepo: Repository<ReportAuditLog>,
  ) {}

  // ===== REPORT REGISTRY CRUD =====

  async findAllReports(tenantId: string, filters?: any) {
    const query = this.reportRegistryRepo.createQueryBuilder('report');
    
    query.where('report.tenantId = :tenantId', { tenantId });

    if (filters?.moduleSource) {
      query.andWhere('report.moduleSource = :moduleSource', { moduleSource: filters.moduleSource });
    }

    if (filters?.sensitivityLevel) {
      query.andWhere('report.sensitivityLevel = :sensitivityLevel', { 
        sensitivityLevel: filters.sensitivityLevel 
      });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('report.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.reportType) {
      query.andWhere('report.reportType = :reportType', { reportType: filters.reportType });
    }

    if (filters?.search) {
      query.andWhere(
        '(report.reportName ILIKE :search OR report.reportCode ILIKE :search OR report.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    query.orderBy('report.createdAt', 'DESC');

    const reports = await query.getMany();
    return reports;
  }

  async findReportById(id: string, tenantId: string) {
    const report = await this.reportRegistryRepo.findOne({
      where: { id, tenantId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async createReport(tenantId: string, userId: string, data: any): Promise<ReportRegistry> {
    // Check for duplicate report code
    const existing = await this.reportRegistryRepo.findOne({
      where: { reportCode: data.reportCode, tenantId },
    });

    if (existing) {
      throw new BadRequestException(`Report with code ${data.reportCode} already exists`);
    }

    const newReport = this.reportRegistryRepo.create({
      ...data,
      tenantId,
      createdBy: userId,
    });

    const savedReport = await this.reportRegistryRepo.save(newReport) as unknown as ReportRegistry;
    return savedReport;
  }

  async updateReport(id: string, tenantId: string, userId: string, data: any) {
    const report = await this.findReportById(id, tenantId);

    // Check for duplicate report code if changing
    if (data.reportCode && data.reportCode !== report.reportCode) {
      const existing = await this.reportRegistryRepo.findOne({
        where: { reportCode: data.reportCode, tenantId },
      });

      if (existing) {
        throw new BadRequestException(`Report with code ${data.reportCode} already exists`);
      }
    }

    Object.assign(report, {
      ...data,
      updatedBy: userId,
    });

    return await this.reportRegistryRepo.save(report);
  }

  async deleteReport(id: string, tenantId: string) {
    const report = await this.findReportById(id, tenantId);
    
    // Soft delete - just mark as inactive
    report.isActive = false;
    return await this.reportRegistryRepo.save(report);
  }

  // ===== REPORT CATEGORIES =====

  async findAllCategories(tenantId: string) {
    return await this.reportCategoryRepo.find({
      where: { tenantId, isActive: true },
      order: { sortOrder: 'ASC', categoryName: 'ASC' },
    });
  }

  async createCategory(tenantId: string, userId: string, data: any) {
    const category = this.reportCategoryRepo.create({
      ...data,
      tenantId,
      createdBy: userId,
    });

    return await this.reportCategoryRepo.save(category);
  }

  // ===== REPORT PERMISSIONS =====

  async findReportPermissions(reportId: string, tenantId: string) {
    return await this.reportPermissionRepo.find({
      where: { reportId, tenantId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async createReportPermission(tenantId: string, userId: string, data: any) {
    // Check for duplicate
    const existing = await this.reportPermissionRepo.findOne({
      where: {
        reportId: data.reportId,
        roleId: data.roleId,
        tenantId,
      },
    });

    if (existing) {
      throw new BadRequestException('Permission already exists for this report and role');
    }

    const permission = this.reportPermissionRepo.create({
      ...data,
      tenantId,
      createdBy: userId,
    });

    return await this.reportPermissionRepo.save(permission);
  }

  async updateReportPermission(id: string, tenantId: string, userId: string, data: any) {
    const permission = await this.reportPermissionRepo.findOne({
      where: { id, tenantId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    Object.assign(permission, {
      ...data,
      updatedBy: userId,
    });

    return await this.reportPermissionRepo.save(permission);
  }

  async deleteReportPermission(id: string, tenantId: string) {
    const permission = await this.reportPermissionRepo.findOne({
      where: { id, tenantId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    permission.isActive = false;
    return await this.reportPermissionRepo.save(permission);
  }

  // ===== STATISTICS =====

  async getReportStatistics(tenantId: string) {
    const [
      totalReports,
      activeReports,
      restrictedReports,
      highSensitivityReports,
    ] = await Promise.all([
      this.reportRegistryRepo.count({ where: { tenantId } }),
      this.reportRegistryRepo.count({ where: { tenantId, isActive: true } }),
      this.reportRegistryRepo.count({ 
        where: { tenantId, sensitivityLevel: 'RESTRICTED' as any } 
      }),
      this.reportRegistryRepo.count({ 
        where: { tenantId, sensitivityLevel: In(['HIGH', 'RESTRICTED']) } 
      }),
    ]);

    return {
      totalReports,
      activeReports,
      restrictedReports,
      highSensitivityReports,
    };
  }

  // ===== AUDIT LOGGING =====

  async logAccess(data: Partial<ReportAuditLog>) {
    const log = this.auditLogRepo.create(data);
    return await this.auditLogRepo.save(log);
  }

  async findAuditLogs(tenantId: string, filters?: any) {
    const query = this.auditLogRepo.createQueryBuilder('log');
    
    query.where('log.tenantId = :tenantId', { tenantId });

    if (filters?.reportId) {
      query.andWhere('log.reportId = :reportId', { reportId: filters.reportId });
    }

    if (filters?.userId) {
      query.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters?.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters?.riskLevel) {
      query.andWhere('log.riskLevel = :riskLevel', { riskLevel: filters.riskLevel });
    }

    if (filters?.isAnomaly) {
      query.andWhere('log.isAnomaly = :isAnomaly', { isAnomaly: filters.isAnomaly });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('log.timestamp BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    query.orderBy('log.timestamp', 'DESC');
    query.limit(filters?.limit || 100);

    return await query.getMany();
  }

  async findAnomalies(tenantId: string, limit = 50) {
    return await this.auditLogRepo.find({
      where: { tenantId, isAnomaly: true },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  // ===== PERMISSION EVALUATION =====

  async evaluateAccess(
    reportId: string,
    userId: string,
    roleId: string,
    tenantId: string,
    action: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Get report
    const report = await this.findReportById(reportId, tenantId);
    
    if (!report.isActive) {
      return { allowed: false, reason: 'Report is inactive' };
    }

    // Get permissions
    const permission = await this.reportPermissionRepo.findOne({
      where: { reportId, roleId, tenantId, isActive: true },
    });

    if (!permission) {
      return { allowed: false, reason: 'No permissions configured for this role' };
    }

    // Check specific permission based on action
    const permissionMap = {
      VIEW: permission.canView,
      RUN: permission.canRun,
      EXPORT: permission.canExport,
      SCHEDULE: permission.canSchedule,
      SHARE: permission.canShare,
      API_EXTRACT: permission.canApiExtract,
    };

    if (!permissionMap[action]) {
      return { allowed: false, reason: `Action ${action} not permitted` };
    }

    // Check time-bound access
    if (permission.validFrom || permission.validUntil) {
      const now = new Date();
      if (permission.validFrom && now < permission.validFrom) {
        return { allowed: false, reason: 'Access not yet valid' };
      }
      if (permission.validUntil && now > permission.validUntil) {
        return { allowed: false, reason: 'Access has expired' };
      }
    }

    // Check if approval is required
    if (permission.requiresApproval || permission.requiresDualApproval) {
      // Would need to check approval status here
      // For now, we'll assume approval handling is separate
    }

    return { allowed: true };
  }
}
