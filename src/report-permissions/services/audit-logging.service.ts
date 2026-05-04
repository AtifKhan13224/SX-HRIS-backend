import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { ReportAuditLog, AuditAction, AuditResult, RiskLevel } from '../entities';

interface AnomalyScore {
  score: number;
  reasons: string[];
  isAnomaly: boolean;
}

@Injectable()
export class AuditLoggingService {
  constructor(
    @InjectRepository(ReportAuditLog)
    private auditLogRepo: Repository<ReportAuditLog>,
  ) {}

  /**
   * Create an audit log entry
   */
  async logAccess(data: Partial<ReportAuditLog>): Promise<ReportAuditLog> {
    // Calculate risk level and anomaly score
    const anomalyScore = await this.calculateAnomalyScore(data);
    
    const log = this.auditLogRepo.create({
      ...data,
      isAnomaly: anomalyScore.isAnomaly,
      anomalyScore: anomalyScore.score,
      anomalyReasons: anomalyScore.reasons,
      riskLevel: this.determineRiskLevel(data, anomalyScore),
    });

    return await this.auditLogRepo.save(log);
  }

  /**
   * Find audit logs with filters
   */
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
      if (Array.isArray(filters.action)) {
        query.andWhere('log.action IN (:...actions)', { actions: filters.action });
      } else {
        query.andWhere('log.action = :action', { action: filters.action });
      }
    }

    if (filters?.result) {
      query.andWhere('log.result = :result', { result: filters.result });
    }

    if (filters?.riskLevel) {
      query.andWhere('log.riskLevel = :riskLevel', { riskLevel: filters.riskLevel });
    }

    if (filters?.isAnomaly !== undefined) {
      query.andWhere('log.isAnomaly = :isAnomaly', { isAnomaly: filters.isAnomaly });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('log.timestamp BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters?.ipAddress) {
      query.andWhere('log.ipAddress = :ipAddress', { ipAddress: filters.ipAddress });
    }

    query.orderBy('log.timestamp', 'DESC');
    query.limit(filters?.limit || 100);
    query.skip(filters?.offset || 0);

    return await query.getMany();
  }

  /**
   * Find anomalies
   */
  async findAnomalies(tenantId: string, limit = 50) {
    return await this.auditLogRepo.find({
      where: { tenantId, isAnomaly: true },
      order: { timestamp: 'DESC', anomalyScore: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(tenantId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = { tenantId };
    
    if (startDate && endDate) {
      whereClause.timestamp = Between(startDate, endDate);
    }

    const [
      totalAccess,
      successfulAccess,
      deniedAccess,
      totalExports,
      anomaliesDetected,
      highRiskEvents,
    ] = await Promise.all([
      this.auditLogRepo.count({ where: whereClause }),
      this.auditLogRepo.count({ 
        where: { ...whereClause, result: AuditResult.SUCCESS } 
      }),
      this.auditLogRepo.count({ 
        where: { ...whereClause, result: AuditResult.DENIED } 
      }),
      this.auditLogRepo.count({ 
        where: { ...whereClause, action: AuditAction.EXPORT } 
      }),
      this.auditLogRepo.count({ 
        where: { ...whereClause, isAnomaly: true } 
      }),
      this.auditLogRepo.count({ 
        where: { ...whereClause, riskLevel: In([RiskLevel.HIGH, RiskLevel.CRITICAL]) } 
      }),
    ]);

    return {
      totalAccess,
      successfulAccess,
      deniedAccess,
      totalExports,
      anomaliesDetected,
      highRiskEvents,
    };
  }

  /**
   * Get user access history
   */
  async getUserAccessHistory(userId: string, tenantId: string, limit = 50) {
    return await this.auditLogRepo.find({
      where: { userId, tenantId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get report access history
   */
  async getReportAccessHistory(reportId: string, tenantId: string, limit = 50) {
    return await this.auditLogRepo.find({
      where: { reportId, tenantId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Calculate anomaly score
   */
  private async calculateAnomalyScore(data: Partial<ReportAuditLog>): Promise<AnomalyScore> {
    let score = 0;
    const reasons: string[] = [];

    // Check for after-hours access (outside 6 AM - 10 PM)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      score += 20;
      reasons.push('After-hours access');
      data.isAfterHours = true;
    }

    // Check for high-frequency access (would need to query recent logs)
    const recentAccessCount = await this.getRecentAccessCount(
      data.userId,
      data.reportId,
      data.tenantId,
      15, // last 15 minutes
    );

    if (recentAccessCount > 10) {
      score += 30;
      reasons.push('High-frequency access');
      data.isHighFrequency = true;
    }

    // Check for large exports
    if (data.action === AuditAction.EXPORT && data.exportRowCount > 10000) {
      score += 25;
      reasons.push('Large export volume');
    }

    // Check for unusual location (simplified - would need geolocation service)
    if (data.countryCode && await this.isUnusualLocation(data.userId, data.countryCode, data.tenantId)) {
      score += 25;
      reasons.push('Unusual location');
      data.isUnusualLocation = true;
    }

    // Check for denied access attempts
    if (data.result === AuditResult.DENIED) {
      score += 15;
      reasons.push('Access denied');
    }

    // Check for sensitive actions
    if ([AuditAction.EXPORT, AuditAction.API_EXTRACT, AuditAction.SHARE].includes(data.action as AuditAction)) {
      score += 10;
    }

    return {
      score,
      reasons,
      isAnomaly: score >= 50, // Threshold for anomaly
    };
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(data: Partial<ReportAuditLog>, anomaly: AnomalyScore): RiskLevel {
    // Critical risk conditions
    if (
      anomaly.score >= 70 ||
      (data.result === AuditResult.DENIED && data.action === AuditAction.EXPORT) ||
      (anomaly.isAnomaly && data.exportRowCount > 50000)
    ) {
      return RiskLevel.CRITICAL;
    }

    // High risk conditions
    if (
      anomaly.score >= 50 ||
      data.isAfterHours ||
      data.isUnusualLocation ||
      (data.action === AuditAction.EXPORT && data.exportRowCount > 10000)
    ) {
      return RiskLevel.HIGH;
    }

    // Medium risk conditions
    if (
      anomaly.score >= 30 ||
      data.isHighFrequency ||
      data.action === AuditAction.API_EXTRACT
    ) {
      return RiskLevel.MEDIUM;
    }

    return RiskLevel.LOW;
  }

  /**
   * Get recent access count
   */
  private async getRecentAccessCount(
    userId: string,
    reportId: string,
    tenantId: string,
    minutes: number,
  ): Promise<number> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - minutes);

    return await this.auditLogRepo.count({
      where: {
        userId,
        reportId,
        tenantId,
        timestamp: Between(since, new Date()),
      },
    });
  }

  /**
   * Check if location is unusual for user
   */
  private async isUnusualLocation(
    userId: string,
    countryCode: string,
    tenantId: string,
  ): Promise<boolean> {
    // Get user's typical locations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = await this.auditLogRepo.find({
      where: {
        userId,
        tenantId,
        timestamp: Between(thirtyDaysAgo, new Date()),
      },
      select: ['countryCode'],
    });

    // Get unique countries
    const usualCountries = [...new Set(recentLogs.map(log => log.countryCode).filter(Boolean))];

    // If country not in usual list, it's unusual
    return usualCountries.length > 0 && !usualCountries.includes(countryCode);
  }

  /**
   * Get access patterns
   */
  async getAccessPatterns(userId: string, tenantId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.auditLogRepo.find({
      where: {
        userId,
        tenantId,
        timestamp: Between(since, new Date()),
      },
      select: ['timestamp', 'action', 'reportId'],
    });

    // Analyze patterns
    const hourlyDistribution = new Array(24).fill(0);
    const dailyDistribution = new Array(7).fill(0);
    const actionCounts: Record<string, number> = {};
    const reportCounts: Record<string, number> = {};

    for (const log of logs) {
      const date = new Date(log.timestamp);
      
      // Hour distribution
      hourlyDistribution[date.getHours()]++;
      
      // Day distribution (0 = Sunday)
      dailyDistribution[date.getDay()]++;
      
      // Action counts
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      
      // Report counts
      reportCounts[log.reportId] = (reportCounts[log.reportId] || 0) + 1;
    }

    return {
      totalAccess: logs.length,
      hourlyDistribution,
      dailyDistribution,
      actionCounts,
      reportCounts,
      peakHour: hourlyDistribution.indexOf(Math.max(...hourlyDistribution)),
      mostAccessedReport: Object.keys(reportCounts).reduce((a, b) => 
        reportCounts[a] > reportCounts[b] ? a : b
      , ''),
    };
  }
}
