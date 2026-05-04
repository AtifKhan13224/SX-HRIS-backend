import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BandService } from '../services/band.service';
import { CreateBandDto, UpdateBandDto } from '../dto/band.dto';

@Controller('organization-settings/bands')
export class BandController {
  constructor(private readonly bandService: BandService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBandDto: CreateBandDto) {
    return this.bandService.create(createBandDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.bandService.findAll(groupCompanyId, search, isActiveBool);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.bandService.getStats(groupCompanyId);
  }

  @Get('competency-matrix')
  getCompetencyMatrix(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.bandService.getCompetencyMatrix(groupCompanyId);
  }

  @Get('career-pathways')
  getCareerPathways(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.bandService.getCareerPathways(groupCompanyId);
  }

  @Get('development-plans')
  getDevelopmentPlans(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.bandService.getDevelopmentPlans(groupCompanyId);
  }

  @Get('workforce-analytics')
  getWorkforceAnalytics(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.bandService.getWorkforceAnalytics(groupCompanyId);
  }

  @Get('succession-analysis')
  getSuccessionAnalysis(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.bandService.getSuccessionAnalysis(groupCompanyId);
  }

  @Get('market-intelligence')
  getMarketIntelligence(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.bandService.getMarketIntelligence(groupCompanyId);
  }

  @Get('compliance-matrix')
  getComplianceMatrix(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.bandService.getComplianceMatrix(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bandService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBandDto: UpdateBandDto) {
    return this.bandService.update(id, updateBandDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.bandService.remove(id);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateBandDto }>) {
    return this.bandService.bulkUpdate(updates);
  }
}
