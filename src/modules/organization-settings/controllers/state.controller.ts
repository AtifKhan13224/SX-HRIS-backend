import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StateService } from '../services/state.service';
import { CreateStateDto, UpdateStateDto } from '../dto/state.dto';

@Controller('organization-settings/states')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Post()
  create(@Body() createStateDto: CreateStateDto) {
    return this.stateService.create(createStateDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('countryId') countryId?: string,
    @Query('regionId') regionId?: string,
  ) {
    return this.stateService.findAll(groupCompanyId, search, countryId, regionId);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.stateService.getStats(groupCompanyId);
  }

  @Get('tax-information')
  getTaxInformation(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.stateService.getTaxInformation(groupCompanyId);
  }

  @Get('labor-laws')
  getLaborLaws(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.stateService.getLaborLaws(groupCompanyId);
  }

  @Get('payroll-requirements')
  getPayrollRequirements(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.stateService.getPayrollRequirements(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stateService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStateDto: UpdateStateDto) {
    return this.stateService.update(id, updateStateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stateService.remove(id);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateStateDto }>) {
    return this.stateService.bulkUpdate(updates);
  }
}
