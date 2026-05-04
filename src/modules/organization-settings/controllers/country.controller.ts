import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CountryService } from '../services/country.service';
import { CreateCountryDto, UpdateCountryDto } from '../dto/country.dto';

@Controller('organization-settings/countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('continent') continent?: string,
    @Query('region') region?: string,
  ) {
    return this.countryService.findAll(groupCompanyId, search, continent, region);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.countryService.getStats(groupCompanyId);
  }

  @Get('economic-profile')
  getEconomicProfile(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.countryService.getEconomicProfile(groupCompanyId);
  }

  @Get('labor-laws')
  getLaborLaws(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.countryService.getLaborLaws(groupCompanyId);
  }

  @Get('immigration-info')
  getImmigrationInfo(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.countryService.getImmigrationInfo(groupCompanyId);
  }

  @Get('compliance-matrix')
  getComplianceMatrix(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.countryService.getComplianceMatrix(groupCompanyId);
  }

  @Get('cost-of-living')
  getCostOfLiving(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.countryService.getCostOfLiving(groupCompanyId);
  }

  @Get('payroll-requirements')
  getPayrollRequirements(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.countryService.getPayrollRequirements(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countryService.update(id, updateCountryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.countryService.remove(id);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateCountryDto }>) {
    return this.countryService.bulkUpdate(updates);
  }
}
