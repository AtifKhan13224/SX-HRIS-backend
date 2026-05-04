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
import { LevelWithinBandService } from '../services/level-within-band.service';
import { CreateLevelWithinBandDto, UpdateLevelWithinBandDto } from '../dto/level-within-band.dto';

@Controller('organization-settings/level-within-bands')
export class LevelWithinBandController {
  constructor(private readonly levelWithinBandService: LevelWithinBandService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLevelDto: CreateLevelWithinBandDto) {
    return this.levelWithinBandService.create(createLevelDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('bandId') bandId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.levelWithinBandService.findAll(groupCompanyId, bandId, search, isActiveBool);
  }

  @Get('stats')
  getStats(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('bandId') bandId?: string,
  ) {
    return this.levelWithinBandService.getStats(groupCompanyId, bandId);
  }

  @Get('competency-profile')
  getCompetencyProfile(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('bandId') bandId?: string,
  ) {
    return this.levelWithinBandService.getCompetencyProfile(groupCompanyId, bandId);
  }

  @Get('career-ladder')
  getCareerLadder(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('bandId') bandId?: string,
  ) {
    return this.levelWithinBandService.getCareerLadder(groupCompanyId, bandId);
  }

  @Get('development-plans')
  getDevelopmentPlans(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('bandId') bandId?: string,
  ) {
    return this.levelWithinBandService.getDevelopmentPlans(groupCompanyId, bandId);
  }

  @Get('compensation-benchmark')
  getCompensationBenchmark(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('bandId') bandId?: string,
  ) {
    return this.levelWithinBandService.getCompensationBenchmark(groupCompanyId, bandId);
  }

  @Get('workforce-analytics')
  getWorkforceAnalytics(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('bandId') bandId?: string,
  ) {
    return this.levelWithinBandService.getWorkforceAnalytics(groupCompanyId, bandId);
  }

  @Get('succession-pipeline')
  getSuccessionPipeline(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('bandId') bandId?: string,
  ) {
    return this.levelWithinBandService.getSuccessionPipeline(groupCompanyId, bandId);
  }

  @Get('performance-standards')
  getPerformanceStandards(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('bandId') bandId?: string,
  ) {
    return this.levelWithinBandService.getPerformanceStandards(groupCompanyId, bandId);
  }

  @Get('compliance-matrix')
  getComplianceMatrix(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('bandId') bandId?: string,
  ) {
    return this.levelWithinBandService.getComplianceMatrix(groupCompanyId, bandId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.levelWithinBandService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelWithinBandDto) {
    return this.levelWithinBandService.update(id, updateLevelDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.levelWithinBandService.remove(id);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateLevelWithinBandDto }>) {
    return this.levelWithinBandService.bulkUpdate(updates);
  }
}
