import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DesignationNameService } from '../services/designation-name.service';
import { CreateDesignationNameDto, UpdateDesignationNameDto } from '../dto/designation-name.dto';

@Controller('organization-settings/designation-names')
export class DesignationNameController {
  constructor(private readonly designationNameService: DesignationNameService) {}

  @Post()
  create(@Body() createDto: CreateDesignationNameDto) {
    return this.designationNameService.create(createDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.designationNameService.findAll(groupCompanyId, search, active);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationNameService.getStats(groupCompanyId);
  }

  @Get('hierarchy')
  getHierarchy(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationNameService.getHierarchy(groupCompanyId);
  }

  @Get('career-paths')
  getCareerPaths(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationNameService.getCareerPaths(groupCompanyId);
  }

  @Get('market-intelligence')
  getMarketIntelligence(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationNameService.getMarketIntelligence(groupCompanyId);
  }

  @Get('usage-analytics')
  getUsageAnalytics(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationNameService.getUsageAnalytics(groupCompanyId);
  }

  @Get('competency-profile')
  getCompetencyProfile(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationNameService.getCompetencyProfile(groupCompanyId);
  }

  @Get('geographic-coverage')
  getGeographicCoverage(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationNameService.getGeographicCoverage(groupCompanyId);
  }

  @Get('title-variations')
  getTitleVariations(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationNameService.getTitleVariations(groupCompanyId);
  }

  @Get('compliance-matrix')
  getComplianceMatrix(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationNameService.getComplianceMatrix(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designationNameService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDesignationNameDto) {
    return this.designationNameService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.designationNameService.remove(id);
    return { message: 'Designation deleted successfully' };
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateDesignationNameDto }>) {
    return this.designationNameService.bulkUpdate(updates);
  }
}
