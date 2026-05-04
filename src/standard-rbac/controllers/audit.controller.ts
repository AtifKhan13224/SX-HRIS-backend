import { Controller, Get, Post, Put, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import { CreateAuditLogDto, QueryAuditLogDto } from '../dto/audit-log.dto';
import { AuditLog } from '../entities/audit-log.entity';

@Controller('api/rbac/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('log')
  @HttpCode(HttpStatus.CREATED)
  async createLog(@Body() logDto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditService.log(logDto);
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  async queryLogs(@Body() queryDto: QueryAuditLogDto): Promise<AuditLog[]> {
    return this.auditService.query(queryDto);
  }

  @Get('user/:userId')
  async getUserAuditLogs(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ): Promise<AuditLog[]> {
    return this.auditService.getUserAuditLogs(userId, limit ? parseInt(limit.toString()) : 100);
  }

  @Get('role/:roleId')
  async getRoleAuditLogs(
    @Param('roleId') roleId: string,
    @Query('limit') limit?: number
  ): Promise<AuditLog[]> {
    return this.auditService.getRoleAuditLogs(roleId, limit ? parseInt(limit.toString()) : 100);
  }

  @Get('compliance')
  async getComplianceLogs(
    @Query('tenantId') tenantId?: string,
    @Query('frameworks') frameworks?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ): Promise<AuditLog[]> {
    const frameworkArray = frameworks ? frameworks.split(',') : undefined;
    return this.auditService.getComplianceLogs(tenantId, frameworkArray, fromDate, toDate);
  }

  @Get('high-risk')
  async getHighRiskLogs(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: number
  ): Promise<AuditLog[]> {
    return this.auditService.getHighRiskLogs(tenantId, limit ? parseInt(limit.toString()) : 100);
  }

  @Get('anomalies')
  async getAnomalies(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: number
  ): Promise<AuditLog[]> {
    return this.auditService.getAnomalies(tenantId, limit ? parseInt(limit.toString()) : 100);
  }

  @Get('requiring-review')
  async getLogsRequiringReview(@Query('tenantId') tenantId?: string): Promise<AuditLog[]> {
    return this.auditService.getLogsRequiringReview(tenantId);
  }

  @Put(':id/mark-reviewed')
  async markAsReviewed(
    @Param('id') id: string,
    @Body() body: { reviewedBy: string }
  ): Promise<{ success: boolean }> {
    await this.auditService.markAsReviewed(id, body.reviewedBy);
    return { success: true };
  }

  @Get('statistics')
  async getStatistics(
    @Query('tenantId') tenantId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ): Promise<any> {
    return this.auditService.getStatistics(tenantId, fromDate, toDate);
  }

  @Get('user/:userId/timeline')
  async getUserActivityTimeline(
    @Param('userId') userId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ): Promise<AuditLog[]> {
    return this.auditService.getUserActivityTimeline(userId, fromDate, toDate);
  }

  @Get('export/compliance/:framework')
  async exportComplianceLogs(
    @Param('framework') framework: string,
    @Query('tenantId') tenantId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ): Promise<AuditLog[]> {
    return this.auditService.exportComplianceLogs(framework, tenantId, fromDate, toDate);
  }
}
