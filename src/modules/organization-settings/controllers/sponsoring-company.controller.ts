import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SponsoringCompanyService } from '../services/sponsoring-company.service';
import { CreateSponsoringCompanyDto, UpdateSponsoringCompanyDto } from '../dto/sponsoring-company.dto';

@Controller('organization-settings/sponsoring-companies')
export class SponsoringCompanyController {
  constructor(private readonly companyService: SponsoringCompanyService) {}

  @Post()
  create(@Body() createDto: CreateSponsoringCompanyDto) {
    return this.companyService.create(createDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
  ) {
    return this.companyService.findAll(groupCompanyId, search);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.companyService.getStats(groupCompanyId);
  }

  @Get('visa-capacity')
  getVisaCapacity(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.companyService.getVisaCapacity(groupCompanyId);
  }

  @Get('compliance-status')
  getComplianceStatus(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.companyService.getComplianceStatus(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSponsoringCompanyDto) {
    return this.companyService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.companyService.remove(id);
    return { message: 'Company deleted successfully' };
  }
}
