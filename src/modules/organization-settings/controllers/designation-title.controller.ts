import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DesignationTitleService } from '../services/designation-title.service';
import { CreateDesignationTitleDto, UpdateDesignationTitleDto } from '../dto/designation-title.dto';

@Controller('organization-settings/designation-titles')
export class DesignationTitleController {
  constructor(private readonly titleService: DesignationTitleService) {}

  @Post()
  create(@Body() createDto: CreateDesignationTitleDto) {
    return this.titleService.create(createDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('languageCode') languageCode?: string,
  ) {
    return this.titleService.findAll(groupCompanyId, search, languageCode);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.titleService.getStats(groupCompanyId);
  }

  @Get('localization-map')
  getLocalizationMap(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.titleService.getLocalizationMap(groupCompanyId);
  }

  @Get('market-intelligence')
  getMarketIntelligence(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.titleService.getMarketIntelligence(groupCompanyId);
  }

  @Get('geographic-coverage')
  getGeographicCoverage(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.titleService.getGeographicCoverage(groupCompanyId);
  }

  @Get('seo-analysis')
  getSEOAnalysis(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.titleService.getSEOAnalysis(groupCompanyId);
  }

  @Get('usage-contexts')
  getUsageContexts(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.titleService.getUsageContexts(groupCompanyId);
  }

  @Get('compliance-report')
  getComplianceReport(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.titleService.getComplianceReport(groupCompanyId);
  }

  @Get('variations/:designationNameId')
  getTitleVariations(@Param('designationNameId') designationNameId: string) {
    return this.titleService.getTitleVariations(designationNameId);
  }

  @Get('version-history/:titleCode')
  getVersionHistory(@Param('titleCode') titleCode: string) {
    return this.titleService.getVersionHistory(titleCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.titleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDesignationTitleDto) {
    return this.titleService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.titleService.remove(id);
    return { message: 'Title deleted successfully' };
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateDesignationTitleDto }>) {
    return this.titleService.bulkUpdate(updates);
  }
}
