import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportPermissionController } from './report-permission.controller';
import {
  ReportPermissionService,
  DataScopeEngine,
  ColumnSecurityEngine,
  ExportControlEngine,
  AuditLoggingService,
} from './services';
import {
  ReportRegistry,
  ReportCategory,
  ReportPermission,
  ReportDataScope,
  ReportColumnSecurity,
  ReportExportControl,
  ReportAccessApproval,
  ReportAuditLog,
  ReportSensitivityFlag,
  ReportComplianceSnapshot,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportRegistry,
      ReportCategory,
      ReportPermission,
      ReportDataScope,
      ReportColumnSecurity,
      ReportExportControl,
      ReportAccessApproval,
      ReportAuditLog,
      ReportSensitivityFlag,
      ReportComplianceSnapshot,
    ]),
  ],
  controllers: [ReportPermissionController],
  providers: [
    ReportPermissionService,
    DataScopeEngine,
    ColumnSecurityEngine,
    ExportControlEngine,
    AuditLoggingService,
  ],
  exports: [
    ReportPermissionService,
    DataScopeEngine,
    ColumnSecurityEngine,
    ExportControlEngine,
    AuditLoggingService,
  ],
})
export class ReportPermissionsModule {}
