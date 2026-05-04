import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { SoDEngine } from '../services/sod-engine.service';
import { SoDPolicyService } from '../services/sod-policy.service';
import { CheckSoDViolationDto, RequestSoDExceptionDto } from '../dto/sod-policy.dto';
import { SoDPolicy } from '../entities/sod-policy.entity';

@Controller('api/rbac/sod')
export class SoDController {
  constructor(
    private readonly sodEngine: SoDEngine,
    private readonly sodPolicyService: SoDPolicyService,
  ) {}

  @Post('check-violations')
  @HttpCode(HttpStatus.OK)
  async checkViolations(@Body() checkDto: CheckSoDViolationDto): Promise<any> {
    return this.sodEngine.checkViolations(checkDto.userId, checkDto.roleIds, []);
  }

  @Post('analyze-risk')
  @HttpCode(HttpStatus.OK)
  async analyzeRisk(@Body() body: { roleIds: string[] }): Promise<any> {
    return this.sodEngine.analyzeRiskProfile(body.roleIds);
  }

  @Post('request-exception')
  @HttpCode(HttpStatus.CREATED)
  async requestException(@Body() requestDto: RequestSoDExceptionDto): Promise<any> {
    return this.sodEngine.createException(
      requestDto.policyId,
      requestDto.userId,
      requestDto.requestorId,
      requestDto.justification,
      requestDto.durationDays
    );
  }

  @Get('policies/roles')
  async getPoliciesForRoles(@Query('roleIds') roleIds: string): Promise<any[]> {
    const roleIdArray = roleIds.split(',');
    return this.sodEngine.getPoliciesForRoles(roleIdArray);
  }

  @Get('policies/requiring-review')
  async getPoliciesRequiringReview(): Promise<any[]> {
    return this.sodEngine.getPoliciesRequiringReview();
  }

  @Post('policies/:id/mark-reviewed')
  @HttpCode(HttpStatus.OK)
  async markPolicyReviewed(
    @Param('id') policyId: string,
    @Body() body: { reviewedBy: string }
  ): Promise<{ success: boolean }> {
    await this.sodEngine.markPolicyReviewed(policyId, body.reviewedBy);
    return { success: true };
  }

  @Get('compliance-report')
  async getComplianceReport(@Query('tenantId') tenantId?: string): Promise<any> {
    return this.sodEngine.getComplianceReport(tenantId);
  }

  // ========== CRUD Operations for SoD Policies ==========

  @Post('policies')
  @HttpCode(HttpStatus.CREATED)
  async createPolicy(
    @Body() data: Partial<SoDPolicy>,
    @Query('createdBy') createdBy: string,
    @Query('tenantId') tenantId?: string
  ): Promise<SoDPolicy> {
    return this.sodPolicyService.createPolicy(data, createdBy, tenantId);
  }

  @Get('policies')
  async getAllPolicies(
    @Query('conflictSeverity') conflictSeverity?: string,
    @Query('conflictAction') conflictAction?: string,
    @Query('tenantId') tenantId?: string,
    @Query('isActive') isActive?: string,
    @Query('isEnforced') isEnforced?: string,
    @Query('regulatoryFramework') regulatoryFramework?: string,
    @Query('searchTerm') searchTerm?: string
  ): Promise<SoDPolicy[]> {
    return this.sodPolicyService.findAll({
      conflictSeverity: conflictSeverity as any,
      conflictAction: conflictAction as any,
      tenantId,
      isActive: isActive === 'true',
      isEnforced: isEnforced === 'true',
      regulatoryFramework,
      searchTerm,
    });
  }

  @Get('policies/:id')
  async getPolicyById(@Param('id') id: string): Promise<SoDPolicy> {
    return this.sodPolicyService.findById(id);
  }

  @Get('policies/code/:code')
  async getPolicyByCode(@Param('code') code: string): Promise<SoDPolicy> {
    return this.sodPolicyService.findByCode(code);
  }

  @Get('policies/roles/:roleIds')
  async getPoliciesForRoleIds(
    @Param('roleIds') roleIds: string,
    @Query('tenantId') tenantId?: string
  ): Promise<SoDPolicy[]> {
    const roleIdArray = roleIds.split(',');
    return this.sodPolicyService.findPoliciesForRoles(roleIdArray, tenantId);
  }

  @Get('policies/review/required')
  async getPoliciesRequiringPeriodicReview(): Promise<SoDPolicy[]> {
    return this.sodPolicyService.getPoliciesRequiringReview();
  }

  @Put('policies/:id')
  async updatePolicy(
    @Param('id') id: string,
    @Body() data: Partial<SoDPolicy>,
    @Query('modifiedBy') modifiedBy: string,
    @Query('tenantId') tenantId?: string
  ): Promise<SoDPolicy> {
    return this.sodPolicyService.updatePolicy(id, data, modifiedBy, tenantId);
  }

  @Delete('policies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePolicy(
    @Param('id') id: string,
    @Query('deletedBy') deletedBy: string,
    @Query('hard') hard?: string,
    @Query('tenantId') tenantId?: string
  ): Promise<void> {
    if (hard === 'true') {
      await this.sodPolicyService.hardDeletePolicy(id, deletedBy, tenantId);
    } else {
      await this.sodPolicyService.deletePolicy(id, deletedBy, tenantId);
    }
  }

  @Post('policies/:id/mark-reviewed')
  @HttpCode(HttpStatus.OK)
  async markPolicyReviewedNew(
    @Param('id') id: string,
    @Body() body: { reviewedBy: string; tenantId?: string }
  ): Promise<SoDPolicy> {
    return this.sodPolicyService.markPolicyReviewed(id, body.reviewedBy, body.tenantId);
  }

  // ========== Statistics & Templates ==========

  @Get('policies/statistics')
  async getStatistics(@Query('tenantId') tenantId?: string) {
    return this.sodPolicyService.getStatistics(tenantId);
  }

  @Get('policies/templates')
  async getTemplates() {
    return this.sodPolicyService.getTemplates();
  }

  // ========== Clone & Bulk Operations ==========

  @Post('policies/:id/clone')
  @HttpCode(HttpStatus.CREATED)
  async clonePolicy(
    @Param('id') id: string,
    @Body() body: { newPolicyCode: string; newPolicyName: string; clonedBy: string; tenantId?: string }
  ): Promise<SoDPolicy> {
    return this.sodPolicyService.clonePolicy(
      id,
      body.newPolicyCode,
      body.newPolicyName,
      body.clonedBy,
      body.tenantId
    );
  }

  @Post('policies/bulk-update-enforcement')
  @HttpCode(HttpStatus.OK)
  async bulkUpdateEnforcement(
    @Body() body: { policyIds: string[]; isEnforced: boolean; modifiedBy: string; tenantId?: string }
  ): Promise<{ updated: number; failed: string[] }> {
    return this.sodPolicyService.bulkUpdateEnforcement(
      body.policyIds,
      body.isEnforced,
      body.modifiedBy,
      body.tenantId
    );
  }

  @Post('policies/:id/validate')
  @HttpCode(HttpStatus.OK)
  async validateConfiguration(@Param('id') id: string) {
    return this.sodPolicyService.validateConfiguration(id);
  }

  @Post('policies/apply-template')
  @HttpCode(HttpStatus.CREATED)
  async applyTemplate(
    @Body() body: { templateName: string; appliedBy: string; tenantId?: string }
  ): Promise<SoDPolicy[]> {
    return this.sodPolicyService.applyTemplate(body.templateName, body.appliedBy, body.tenantId);
  }
}
