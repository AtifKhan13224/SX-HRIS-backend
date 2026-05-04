import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PositionService } from '../services/position.service';
import { CreatePositionDto, UpdatePositionDto } from '../dto/position.dto';

@Controller('organization-settings/positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  create(@Body() createDto: CreatePositionDto) {
    return this.positionService.create(createDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('positionStatus') positionStatus?: string,
  ) {
    return this.positionService.findAll(groupCompanyId, search, positionStatus);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.positionService.getStats(groupCompanyId);
  }

  @Get('headcount-summary')
  getHeadcountSummary(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.positionService.getHeadcountSummary(groupCompanyId);
  }

  @Get('budget-summary')
  getBudgetSummary(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.positionService.getBudgetSummary(groupCompanyId);
  }

  @Get('succession-risk')
  getSuccessionRisk(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.positionService.getSuccessionRisk(groupCompanyId);
  }

  @Get('recruitment-pipeline')
  getRecruitmentPipeline(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.positionService.getRecruitmentPipeline(groupCompanyId);
  }

  @Get('organizational-structure')
  getOrganizationalStructure(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.positionService.getOrganizationalStructure(groupCompanyId);
  }

  @Get('compliance-report')
  getComplianceReport(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.positionService.getComplianceReport(groupCompanyId);
  }

  @Get('market-analysis')
  getMarketAnalysis(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.positionService.getMarketAnalysis(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePositionDto) {
    return this.positionService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.positionService.remove(id);
    return { message: 'Position deleted successfully' };
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdatePositionDto }>) {
    return this.positionService.bulkUpdate(updates);
  }
}
