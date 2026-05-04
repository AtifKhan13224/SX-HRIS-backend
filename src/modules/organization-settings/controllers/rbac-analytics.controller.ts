import {
  Controller,
  Get,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RBACAnalyticsService } from '../services/rbac-analytics.service';

@Controller('organization-settings/rbac/analytics')
export class RBACAnalyticsController {
  constructor(private readonly analyticsService: RBACAnalyticsService) {}

  /**
   * Get RBAC statistics dashboard data
   * GET /organization-settings/rbac/analytics/statistics
   */
  @Get('statistics')
  async getStatistics(@Query('tenantId') tenantId?: string) {
    const statistics = await this.analyticsService.getStatistics(tenantId);
    return {
      success: true,
      data: statistics,
    };
  }

  /**
   * Get role distribution by category
   * GET /organization-settings/rbac/analytics/role-distribution
   */
  @Get('role-distribution')
  async getRoleDistribution(@Query('tenantId') tenantId?: string) {
    const distribution = await this.analyticsService.getRoleDistribution(tenantId);
    return {
      success: true,
      data: distribution,
    };
  }

  /**
   * Get permission usage analytics
   * GET /organization-settings/rbac/analytics/permission-usage
   */
  @Get('permission-usage')
  async getPermissionUsage(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
  ) {
    const usage = await this.analyticsService.getPermissionUsage(
      tenantId,
      limit ? parseInt(limit, 10) : 20
    );
    return {
      success: true,
      data: usage,
    };
  }

  /**
   * Get recent audit activities
   * GET /organization-settings/rbac/analytics/recent-activities
   */
  @Get('recent-activities')
  async getRecentActivities(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
  ) {
    const activities = await this.analyticsService.getRecentActivities(
      tenantId,
      limit ? parseInt(limit, 10) : 50
    );
    return {
      success: true,
      data: activities,
    };
  }

  /**
   * Get role compliance report
   * GET /organization-settings/rbac/analytics/compliance
   */
  @Get('compliance')
  async getComplianceReport(@Query('tenantId') tenantId?: string) {
    const report = await this.analyticsService.getComplianceReport(tenantId);
    return {
      success: true,
      data: report,
    };
  }
}
