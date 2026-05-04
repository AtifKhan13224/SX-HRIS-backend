import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AuditLog, AuditEventType, AuditSeverity } from '../entities/audit-log.entity';
import { CreateAuditLogDto, QueryAuditLogDto } from '../dto/audit-log.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create audit log entry
   */
  async log(logDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...logDto,
      complianceRelevant: this.isComplianceRelevant(logDto.eventType, logDto.severity),
      isAnomaly: false, // Would be determined by anomaly detection system
      riskScore: this.calculateRiskScore(logDto.eventType, logDto.severity),
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Query audit logs
   */
  async query(queryDto: QueryAuditLogDto): Promise<AuditLog[]> {
    const where: any = {};

    if (queryDto.tenantId) where.tenantId = queryDto.tenantId;
    if (queryDto.userId) where.userId = queryDto.userId;
    if (queryDto.eventType) where.eventType = queryDto.eventType;
    if (queryDto.severity) where.severity = queryDto.severity;
    if (queryDto.roleId) where.roleId = queryDto.roleId;
    if (queryDto.permissionId) where.permissionId = queryDto.permissionId;
    if (queryDto.entityType) where.entityType = queryDto.entityType;
    if (queryDto.entityId) where.entityId = queryDto.entityId;

    // Date range filter
    if (queryDto.fromDate || queryDto.toDate) {
      where.createdAt = Between(
        queryDto.fromDate ? new Date(queryDto.fromDate) : new Date('2000-01-01'),
        queryDto.toDate ? new Date(queryDto.toDate) : new Date()
      );
    }

    return this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 1000, // Limit results
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit logs for a specific role
   */
  async getRoleAuditLogs(roleId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { roleId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get compliance-relevant audit logs
   */
  async getComplianceLogs(
    tenantId?: string,
    frameworks?: string[],
    fromDate?: string,
    toDate?: string
  ): Promise<AuditLog[]> {
    const where: any = { complianceRelevant: true };

    if (tenantId) where.tenantId = tenantId;

    if (fromDate || toDate) {
      where.createdAt = Between(
        fromDate ? new Date(fromDate) : new Date('2000-01-01'),
        toDate ? new Date(toDate) : new Date()
      );
    }

    const logs = await this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    // Filter by frameworks if specified
    if (frameworks && frameworks.length > 0) {
      return logs.filter(log =>
        log.complianceFrameworks?.some(f => frameworks.includes(f))
      );
    }

    return logs;
  }

  /**
   * Get high-risk audit logs
   */
  async getHighRiskLogs(tenantId?: string, limit: number = 100): Promise<AuditLog[]> {
    const where: any = {
      severity: In([AuditSeverity.HIGH, AuditSeverity.CRITICAL]),
    };

    if (tenantId) where.tenantId = tenantId;

    return this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get anomalous activities
   */
  async getAnomalies(tenantId?: string, limit: number = 100): Promise<AuditLog[]> {
    const where: any = { isAnomaly: true };

    if (tenantId) where.tenantId = tenantId;

    return this.auditLogRepository.find({
      where,
      order: { riskScore: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get logs requiring review
   */
  async getLogsRequiringReview(tenantId?: string): Promise<AuditLog[]> {
    const where: any = { requiresReview: true, reviewedBy: null };

    if (tenantId) where.tenantId = tenantId;

    return this.auditLogRepository.find({
      where,
      order: { severity: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Mark log as reviewed
   */
  async markAsReviewed(logId: string, reviewedBy: string): Promise<void> {
    await this.auditLogRepository.update(logId, {
      requiresReview: false,
      reviewedBy,
      reviewedAt: new Date(),
    });
  }

  /**
   * Get audit statistics
   */
  async getStatistics(
    tenantId?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<any> {
    const where: any = {};

    if (tenantId) where.tenantId = tenantId;

    if (fromDate || toDate) {
      where.createdAt = Between(
        fromDate ? new Date(fromDate) : new Date('2000-01-01'),
        toDate ? new Date(toDate) : new Date()
      );
    }

    const logs = await this.auditLogRepository.find({ where });

    const stats = {
      total: logs.length,
      byEventType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      complianceRelevant: 0,
      anomalies: 0,
      requiresReview: 0,
      avgRiskScore: 0,
      uniqueUsers: new Set<string>(),
      uniqueRoles: new Set<string>(),
    };

    let totalRiskScore = 0;

    logs.forEach(log => {
      // Count by event type
      const eventType = log.eventType;
      stats.byEventType[eventType] = (stats.byEventType[eventType] || 0) + 1;

      // Count by severity
      const severity = log.severity;
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;

      // Count special flags
      if (log.complianceRelevant) stats.complianceRelevant++;
      if (log.isAnomaly) stats.anomalies++;
      if (log.requiresReview) stats.requiresReview++;

      // Track risk score
      if (log.riskScore) totalRiskScore += log.riskScore;

      // Track unique users and roles
      if (log.userId) stats.uniqueUsers.add(log.userId);
      if (log.roleId) stats.uniqueRoles.add(log.roleId);
    });

    // Calculate average risk score
    stats.avgRiskScore = logs.length > 0 ? Math.round(totalRiskScore / logs.length * 100) / 100 : 0;

    return {
      ...stats,
      uniqueUsers: stats.uniqueUsers.size,
      uniqueRoles: stats.uniqueRoles.size,
    };
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(
    userId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<AuditLog[]> {
    const where: any = { userId };

    if (fromDate || toDate) {
      where.createdAt = Between(
        fromDate ? new Date(fromDate) : new Date('2000-01-01'),
        toDate ? new Date(toDate) : new Date()
      );
    }

    return this.auditLogRepository.find({
      where,
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Export audit logs for compliance
   */
  async exportComplianceLogs(
    framework: string,
    tenantId?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<AuditLog[]> {
    const logs = await this.getComplianceLogs(tenantId, [framework], fromDate, toDate);

    // Additional processing for specific frameworks
    // This could include formatting, redaction, etc.

    return logs;
  }

  /**
   * Private helper methods
   */

  private isComplianceRelevant(eventType: AuditEventType, severity: AuditSeverity): boolean {
    const complianceEvents = [
      AuditEventType.ROLE_ASSIGNED,
      AuditEventType.ROLE_REVOKED,
      AuditEventType.PERMISSION_GRANTED,
      AuditEventType.CONFIGURATION_CHANGE,
      AuditEventType.SOD_VIOLATION,
      AuditEventType.SOD_EXCEPTION_GRANTED,
      AuditEventType.PRIVILEGE_ESCALATION,
      AuditEventType.BREAK_GLASS_ACTIVATED,
    ];

    return complianceEvents.includes(eventType) || severity === AuditSeverity.CRITICAL;
  }

  private calculateRiskScore(eventType: AuditEventType, severity: AuditSeverity): number {
    let score = 0;

    // Base score from severity
    switch (severity) {
      case AuditSeverity.CRITICAL:
        score += 10;
        break;
      case AuditSeverity.HIGH:
        score += 7;
        break;
      case AuditSeverity.MEDIUM:
        score += 4;
        break;
      case AuditSeverity.LOW:
        score += 2;
        break;
      case AuditSeverity.INFO:
        score += 0;
        break;
    }

    // Add score based on event type
    const highRiskEvents = [
      AuditEventType.SOD_VIOLATION,
      AuditEventType.PRIVILEGE_ESCALATION,
      AuditEventType.BREAK_GLASS_ACTIVATED,
      AuditEventType.SCOPE_VIOLATION,
    ];

    if (highRiskEvents.includes(eventType)) {
      score += 5;
    }

    return score;
  }
}
