import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { FieldSecurityEngine } from '../services/field-security.engine';
import { FieldSecurityService } from '../services/field-security.service';
import { FieldLevelSecurity } from '../entities/field-level-security.entity';

@Controller('api/rbac/field-security')
export class FieldSecurityController {
  constructor(
    private readonly fieldSecurityEngine: FieldSecurityEngine,
    private readonly fieldSecurityService: FieldSecurityService,
  ) {}

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  async applyFieldSecurity(
    @Body() body: {
      data: Record<string, any>;
      permissionId: string;
      tenantId?: string;
      countryCode?: string;
      context?: Record<string, any>;
    }
  ): Promise<Record<string, any>> {
    const fieldRules = await this.fieldSecurityEngine.resolveFieldSecurity(
      body.permissionId,
      body.tenantId,
      body.countryCode
    );
    return this.fieldSecurityEngine.applyFieldSecurity(body.data, fieldRules, body.context);
  }

  @Post('apply-bulk')
  @HttpCode(HttpStatus.OK)
  async applyFieldSecurityBulk(
    @Body() body: {
      dataArray: Record<string, any>[];
      permissionId: string;
      tenantId?: string;
      countryCode?: string;
      context?: Record<string, any>;
    }
  ): Promise<Record<string, any>[]> {
    const fieldRules = await this.fieldSecurityEngine.resolveFieldSecurity(
      body.permissionId,
      body.tenantId,
      body.countryCode
    );
    return this.fieldSecurityEngine.applyFieldSecurityBulk(
      body.dataArray,
      fieldRules,
      body.context
    );
  }

  @Get('can-export')
  async canExport(
    @Query('permissionId') permissionId: string,
    @Query('fieldName') fieldName: string,
    @Query('tenantId') tenantId?: string
  ): Promise<{ canExport: boolean }> {
    const canExport = await this.fieldSecurityEngine.canExportField(
      permissionId,
      fieldName,
      tenantId
    );
    return { canExport };
  }

  @Get('can-print')
  async canPrint(
    @Query('permissionId') permissionId: string,
    @Query('fieldName') fieldName: string,
    @Query('tenantId') tenantId?: string
  ): Promise<{ canPrint: boolean }> {
    const canPrint = await this.fieldSecurityEngine.canPrintField(
      permissionId,
      fieldName,
      tenantId
    );
    return { canPrint };
  }

  @Get('approval-required-fields')
  async getApprovalRequiredFields(
    @Query('permissionId') permissionId: string,
    @Query('tenantId') tenantId?: string
  ): Promise<{ fields: string[] }> {
    const fields = await this.fieldSecurityEngine.getApprovalRequiredFields(
      permissionId,
      tenantId
    );
    return { fields };
  }

  @Get('audit-required-fields')
  async getAuditRequiredFields(
    @Query('permissionId') permissionId: string,
    @Query('tenantId') tenantId?: string
  ): Promise<{ fields: string[] }> {
    const fields = await this.fieldSecurityEngine.getAuditRequiredFields(permissionId, tenantId);
    return { fields };
  }

  // ========== CRUD Operations ==========

  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  async createRule(
    @Body() data: Partial<FieldLevelSecurity>,
    @Query('createdBy') createdBy: string,
    @Query('tenantId') tenantId?: string
  ): Promise<FieldLevelSecurity> {
    return this.fieldSecurityService.createRule(data, createdBy, tenantId);
  }

  @Get('rules')
  async getAllRules(
    @Query('entityType') entityType?: string,
    @Query('permissionId') permissionId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('countryCode') countryCode?: string,
    @Query('securityAction') securityAction?: string,
    @Query('isActive') isActive?: string,
    @Query('searchTerm') searchTerm?: string
  ): Promise<FieldLevelSecurity[]> {
    return this.fieldSecurityService.findAll({
      entityType,
      permissionId,
      tenantId,
      countryCode,
      securityAction: securityAction as any,
      isActive: isActive === 'true',
      searchTerm,
    });
  }

  @Get('rules/:id')
  async getRuleById(@Param('id') id: string): Promise<FieldLevelSecurity> {
    return this.fieldSecurityService.findById(id);
  }

  @Get('rules/permission/:permissionId')
  async getRulesByPermission(
    @Param('permissionId') permissionId: string,
    @Query('tenantId') tenantId?: string
  ): Promise<FieldLevelSecurity[]> {
    return this.fieldSecurityService.findByPermission(permissionId, tenantId);
  }

  @Get('rules/entity/:entityType')
  async getRulesByEntityType(
    @Param('entityType') entityType: string,
    @Query('tenantId') tenantId?: string
  ): Promise<FieldLevelSecurity[]> {
    return this.fieldSecurityService.findByEntityType(entityType, tenantId);
  }

  @Get('rules/sensitive')
  async getSensitiveFields(
    @Query('entityType') entityType?: string,
    @Query('tenantId') tenantId?: string
  ): Promise<FieldLevelSecurity[]> {
    return this.fieldSecurityService.getSensitiveFields(entityType, tenantId);
  }

  @Put('rules/:id')
  async updateRule(
    @Param('id') id: string,
    @Body() data: Partial<FieldLevelSecurity>,
    @Query('modifiedBy') modifiedBy: string,
    @Query('tenantId') tenantId?: string
  ): Promise<FieldLevelSecurity> {
    return this.fieldSecurityService.updateRule(id, data, modifiedBy, tenantId);
  }

  @Delete('rules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRule(
    @Param('id') id: string,
    @Query('deletedBy') deletedBy: string,
    @Query('hard') hard?: string,
    @Query('tenantId') tenantId?: string
  ): Promise<void> {
    if (hard === 'true') {
      await this.fieldSecurityService.hardDeleteRule(id, deletedBy, tenantId);
    } else {
      await this.fieldSecurityService.deleteRule(id, deletedBy, tenantId);
    }
  }

  // ========== Statistics & Templates ==========

  @Get('statistics')
  async getStatistics(@Query('tenantId') tenantId?: string) {
    return this.fieldSecurityService.getStatistics(tenantId);
  }

  @Get('templates')
  async getTemplates() {
    return this.fieldSecurityService.getTemplates();
  }

  // ========== Clone & Bulk Operations ==========

  @Post('rules/:id/clone')
  @HttpCode(HttpStatus.CREATED)
  async cloneRule(
    @Param('id') id: string,
    @Body() body: { newPermissionId: string; clonedBy: string; tenantId?: string }
  ): Promise<FieldLevelSecurity> {
    return this.fieldSecurityService.cloneRule(
      id,
      body.newPermissionId,
      body.clonedBy,
      body.tenantId
    );
  }

  @Post('rules/bulk-update-status')
  @HttpCode(HttpStatus.OK)
  async bulkUpdateStatus(
    @Body() body: { ruleIds: string[]; isActive: boolean; modifiedBy: string; tenantId?: string }
  ): Promise<{ updated: number; failed: string[] }> {
    return this.fieldSecurityService.bulkUpdateStatus(
      body.ruleIds,
      body.isActive,
      body.modifiedBy,
      body.tenantId
    );
  }

  @Post('rules/:id/validate')
  @HttpCode(HttpStatus.OK)
  async validateConfiguration(@Param('id') id: string) {
    return this.fieldSecurityService.validateConfiguration(id);
  }

  @Post('rules/apply-template')
  @HttpCode(HttpStatus.CREATED)
  async applyTemplate(
    @Body() body: {
      templateName: string;
      permissionId: string;
      entityType: string;
      appliedBy: string;
      tenantId?: string;
    }
  ): Promise<FieldLevelSecurity[]> {
    return this.fieldSecurityService.applyTemplate(
      body.templateName,
      body.permissionId,
      body.entityType,
      body.appliedBy,
      body.tenantId
    );
  }
}
