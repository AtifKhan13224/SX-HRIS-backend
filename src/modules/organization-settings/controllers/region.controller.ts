import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RegionService } from '../services/region.service';
import { CreateRegionDto, UpdateRegionDto } from '../dto/region.dto';

@Controller('organization-settings/regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionService.create(createRegionDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('regionType') regionType?: string,
  ) {
    return this.regionService.findAll(groupCompanyId, search, regionType);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.regionService.getStats(groupCompanyId);
  }

  @Get('hierarchy')
  getHierarchy(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.regionService.getHierarchy(groupCompanyId);
  }

  @Get('economic-profile')
  getEconomicProfile(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.regionService.getEconomicProfile(groupCompanyId);
  }

  @Get('performance-metrics')
  getPerformanceMetrics(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.regionService.getPerformanceMetrics(groupCompanyId);
  }

  @Get('compliance-overview')
  getComplianceOverview(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.regionService.getComplianceOverview(groupCompanyId);
  }

  @Get('talent-analysis')
  getTalentAnalysis(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.regionService.getTalentAnalysis(groupCompanyId);
  }

  @Get('risk-assessment')
  getRiskAssessment(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.regionService.getRiskAssessment(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
    return this.regionService.update(id, updateRegionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regionService.remove(id);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateRegionDto }>) {
    return this.regionService.bulkUpdate(updates);
  }
}
