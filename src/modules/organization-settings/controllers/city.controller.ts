import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CityService } from '../services/city.service';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';

@Controller('organization-settings/cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  create(@Body() createCityDto: CreateCityDto) {
    return this.cityService.create(createCityDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('stateId') stateId?: string,
    @Query('countryId') countryId?: string,
    @Query('regionId') regionId?: string,
  ) {
    return this.cityService.findAll(groupCompanyId, search, stateId, countryId, regionId);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.cityService.getStats(groupCompanyId);
  }

  @Get('cost-of-living')
  getCostOfLiving(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.cityService.getCostOfLiving(groupCompanyId);
  }

  @Get('quality-of-life')
  getQualityOfLife(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.cityService.getQualityOfLife(groupCompanyId);
  }

  @Get('business-hubs')
  getBusinessHubs(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.cityService.getBusinessHubs(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cityService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.cityService.update(id, updateCityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cityService.remove(id);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateCityDto }>) {
    return this.cityService.bulkUpdate(updates);
  }
}
