import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JDTemplateService } from '../services/jd-template.service';
import { CreateJDTemplateDto, UpdateJDTemplateDto } from '../dto/jd-template.dto';

@Controller('organization-settings/jd-templates')
export class JDTemplateController {
  constructor(private readonly templateService: JDTemplateService) {}

  @Post()
  create(@Body() createDto: CreateJDTemplateDto) {
    return this.templateService.create(createDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.templateService.findAll(groupCompanyId, search, category);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.templateService.getStats(groupCompanyId);
  }

  @Get('usage-analytics')
  getUsageAnalytics(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.templateService.getUsageAnalytics(groupCompanyId);
  }

  @Post('clone/:id')
  cloneTemplate(
    @Param('id') id: string,
    @Body() body: { newCode: string; newName: string },
  ) {
    return this.templateService.cloneTemplate(id, body.newCode, body.newName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateJDTemplateDto) {
    return this.templateService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.templateService.remove(id);
    return { message: 'Template deleted successfully' };
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateJDTemplateDto }>) {
    return this.templateService.bulkUpdate(updates);
  }
}
