import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ReportPermissionService,
  DataScopeEngine,
  ColumnSecurityEngine,
  ExportControlEngine,
  AuditLoggingService,
} from './services';
import { AuditAction, AuditResult } from './entities';

// In a real app, you would have authentication guards
// @UseGuards(JwtAuthGuard, RbacGuard)
@Controller('api/v1/report-permissions')
export class ReportPermissionController {
  constructor(
    private readonly reportPermissionService: ReportPermissionService,
    private readonly dataScopeEngine: DataScopeEngine,
    private readonly columnSecurityEngine: ColumnSecurityEngine,
    private readonly exportControlEngine: ExportControlEngine,
    private readonly auditLoggingService: AuditLoggingService,
  ) {}

  // ===== REPORT REGISTRY =====

  @Get('registry')
  async findAllReports(@Query() filters: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const reports = await this.reportPermissionService.findAllReports(tenantId, filters);
    return reports;
  }

  @Get('registry/:id')
  async findReportById(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.reportPermissionService.findReportById(id, tenantId);
  }

  @Post('registry')
  async createReport(@Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    
    const newReport = await this.reportPermissionService.createReport(tenantId, userId, data);
    
    // Audit log
    await this.auditLoggingService.logAccess({
      tenantId,
      reportId: newReport.id,
      reportName: newReport.reportName,
      userId,
      userEmail: req.user?.email || 'system',
      action: AuditAction.MODIFY,
      result: AuditResult.SUCCESS,
      ipAddress: req.ip,
      timestamp: new Date(),
    });
    
    return newReport;
  }

  @Put('registry/:id')
  async updateReport(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    
    const report = await this.reportPermissionService.updateReport(id, tenantId, userId, data);
    
    // Audit log
    await this.auditLoggingService.logAccess({
      tenantId,
      reportId: report.id,
      reportName: report.reportName,
      userId,
      userEmail: req.user?.email || 'system',
      action: AuditAction.MODIFY,
      result: AuditResult.SUCCESS,
      ipAddress: req.ip,
      timestamp: new Date(),
    });
    
    return report;
  }

  @Delete('registry/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReport(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    await this.reportPermissionService.deleteReport(id, tenantId);
  }

  // ===== REPORT CATEGORIES =====

  @Get('categories')
  async findAllCategories(@Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.reportPermissionService.findAllCategories(tenantId);
  }

  @Post('categories')
  async createCategory(@Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return await this.reportPermissionService.createCategory(tenantId, userId, data);
  }

  // ===== REPORT PERMISSIONS =====

  @Get(':reportId/permissions')
  async findReportPermissions(@Param('reportId') reportId: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.reportPermissionService.findReportPermissions(reportId, tenantId);
  }

  @Post('permissions')
  async createReportPermission(@Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return await this.reportPermissionService.createReportPermission(tenantId, userId, data);
  }

  @Put('permissions/:id')
  async updateReportPermission(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return await this.reportPermissionService.updateReportPermission(id, tenantId, userId, data);
  }

  @Delete('permissions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReportPermission(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    await this.reportPermissionService.deleteReportPermission(id, tenantId);
  }

  // ===== DATA SCOPES =====

  @Get(':reportId/data-scopes')
  async findDataScopes(
    @Param('reportId') reportId: string,
    @Query('roleId') roleId: string,
    @Request() req: any,
  ) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.dataScopeEngine.findDataScopes(reportId, roleId, tenantId);
  }

  @Post('data-scopes')
  async createDataScope(@Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return await this.dataScopeEngine.createDataScope(tenantId, userId, data);
  }

  @Put('data-scopes/:id')
  async updateDataScope(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return await this.dataScopeEngine.updateDataScope(id, tenantId, userId, data);
  }

  @Delete('data-scopes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDataScope(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    await this.dataScopeEngine.deleteDataScope(id, tenantId);
  }

  // ===== COLUMN SECURITY =====

  @Get(':reportId/column-security')
  async findColumnSecurityRules(
    @Param('reportId') reportId: string,
    @Query('roleId') roleId: string,
    @Request() req: any,
  ) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.columnSecurityEngine.findColumnSecurityRules(reportId, roleId, tenantId);
  }

  @Post('column-security')
  async createColumnSecurity(@Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return await this.columnSecurityEngine.createColumnSecurity(tenantId, userId, data);
  }

  @Put('column-security/:id')
  async updateColumnSecurity(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return await this.columnSecurityEngine.updateColumnSecurity(id, tenantId, userId, data);
  }

  @Delete('column-security/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteColumnSecurity(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    await this.columnSecurityEngine.deleteColumnSecurity(id, tenantId);
  }

  @Get(':reportId/pii-columns')
  async getPiiColumns(@Param('reportId') reportId: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.columnSecurityEngine.getPiiColumns(reportId, tenantId);
  }

  @Get(':reportId/financial-columns')
  async getFinancialColumns(@Param('reportId') reportId: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.columnSecurityEngine.getFinancialColumns(reportId, tenantId);
  }

  // ===== EXPORT CONTROLS =====

  @Get(':reportId/export-controls')
  async findExportControls(
    @Param('reportId') reportId: string,
    @Query('roleId') roleId: string,
    @Request() req: any,
  ) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.exportControlEngine.findExportControls(reportId, roleId, tenantId);
  }

  @Post('export-controls')
  async createExportControl(@Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return await this.exportControlEngine.createExportControl(tenantId, userId, data);
  }

  @Put('export-controls/:id')
  async updateExportControl(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    return await this.exportControlEngine.updateExportControl(id, tenantId, userId, data);
  }

  @Delete('export-controls/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExportControl(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    await this.exportControlEngine.deleteExportControl(id, tenantId);
  }

  @Post('validate-export')
  async validateExport(@Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    
    const validation = await this.exportControlEngine.validateExport(
      data.reportId,
      data.roleId,
      tenantId,
      {
        format: data.format,
        rowCount: data.rowCount,
        userId,
        reportId: data.reportId,
        justification: data.justification,
      },
    );
    
    // Audit log
    await this.auditLoggingService.logAccess({
      tenantId,
      reportId: data.reportId,
      reportName: data.reportName || 'Unknown',
      userId,
      userEmail: req.user?.email || 'system',
      action: AuditAction.EXPORT,
      result: validation.allowed ? AuditResult.SUCCESS : AuditResult.DENIED,
      denialReason: validation.reason,
      exportFormat: data.format,
      exportRowCount: data.rowCount,
      businessJustification: data.justification,
      ipAddress: req.ip,
      timestamp: new Date(),
    });
    
    return validation;
  }

  // ===== AUDIT LOGS =====

  @Get('audit-logs')
  async findAuditLogs(@Query() filters: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.auditLoggingService.findAuditLogs(tenantId, filters);
  }

  @Get('audit-logs/anomalies')
  async findAnomalies(@Query('limit') limit: number, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.auditLoggingService.findAnomalies(tenantId, limit || 50);
  }

  @Get('audit-logs/statistics')
  async getAuditStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.auditLoggingService.getAuditStatistics(
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('audit-logs/user/:userId')
  async getUserAccessHistory(
    @Param('userId') userId: string,
    @Query('limit') limit: number,
    @Request() req: any,
  ) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.auditLoggingService.getUserAccessHistory(userId, tenantId, limit || 50);
  }

  @Get('audit-logs/report/:reportId')
  async getReportAccessHistory(
    @Param('reportId') reportId: string,
    @Query('limit') limit: number,
    @Request() req: any,
  ) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.auditLoggingService.getReportAccessHistory(reportId, tenantId, limit || 50);
  }

  @Get('audit-logs/user/:userId/patterns')
  async getUserAccessPatterns(
    @Param('userId') userId: string,
    @Query('days') days: number,
    @Request() req: any,
  ) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.auditLoggingService.getAccessPatterns(userId, tenantId, days || 30);
  }

  // ===== PERMISSION EVALUATION =====

  @Post('evaluate-access')
  async evaluateAccess(@Body() data: any, @Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    const userId = req.user?.id || data.userId || '00000000-0000-0000-0000-000000000000';
    
    const evaluation = await this.reportPermissionService.evaluateAccess(
      data.reportId,
      userId,
      data.roleId,
      tenantId,
      data.action,
    );
    
    // Audit log
    await this.auditLoggingService.logAccess({
      tenantId,
      reportId: data.reportId,
      reportName: data.reportName || 'Unknown',
      userId,
      userEmail: req.user?.email || 'system',
      roleId: data.roleId,
      action: data.action,
      result: evaluation.allowed ? AuditResult.SUCCESS : AuditResult.DENIED,
      denialReason: evaluation.reason,
      ipAddress: req.ip,
      timestamp: new Date(),
    });
    
    return evaluation;
  }

  // ===== STATISTICS =====

  @Get('statistics')
  async getReportStatistics(@Request() req: any) {
    const tenantId = req.user?.tenantId || '00000000-0000-0000-0000-000000000000';
    return await this.reportPermissionService.getReportStatistics(tenantId);
  }
}
