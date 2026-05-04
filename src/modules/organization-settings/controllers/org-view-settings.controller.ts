import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  Query,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrgViewSettingsService } from '../services/org-view-settings.service';
import { UpdateOrgViewSettingsDto, SearchAnalyticsQueryDto } from '../dto/org-view-settings.dto';

@ApiTags('Organization View Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organization-settings/org-view')
export class OrgViewSettingsController {
  constructor(private readonly orgViewSettingsService: OrgViewSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get organization view settings' })
  async getSettings(@Req() req: any) {
    const tenantId = req.user?.tenantId || 'default';
    return await this.orgViewSettingsService.getSettings(tenantId);
  }

  @Put()
  @ApiOperation({ summary: 'Update organization view settings' })
  async updateSettings(
    @Req() req: any,
    @Body() updateDto: UpdateOrgViewSettingsDto,
  ) {
    const tenantId = req.user?.tenantId || 'default';
    const userId = req.user?.id || req.user?.sub;
    return await this.orgViewSettingsService.updateSettings(tenantId, updateDto, userId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get search analytics data' })
  async getAnalytics(
    @Req() req: any,
    @Query() query: SearchAnalyticsQueryDto,
  ) {
    const tenantId = req.user?.tenantId || 'default';
    return await this.orgViewSettingsService.getSearchAnalytics(
      tenantId,
      query.startDate,
      query.endDate,
    );
  }

  @Get('performance-metrics')
  @ApiOperation({ summary: 'Get real-time performance metrics' })
  async getPerformanceMetrics(@Req() req: any) {
    const tenantId = req.user?.tenantId || 'default';
    return await this.orgViewSettingsService.getPerformanceMetrics(tenantId);
  }

  @Post('log-search')
  @ApiOperation({ summary: 'Log a search query for analytics' })
  async logSearch(
    @Req() req: any,
    @Body() body: {
      searchQuery: string;
      resultsCount: number;
      responseTime: number;
      searchEngine: string;
    },
  ) {
    const tenantId = req.user?.tenantId || 'default';
    const userId = req.user?.id || req.user?.sub;
    await this.orgViewSettingsService.logSearchQuery(
      tenantId,
      userId,
      body.searchQuery,
      body.resultsCount,
      body.responseTime,
      body.searchEngine,
    );
    return { success: true };
  }
}
