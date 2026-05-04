import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CapabilityService } from './capability.service';
import { CreateCapabilityDto, UpdateCapabilityDto } from './dto/capability.dto';

@Controller('capabilities')
export class CapabilityController {
  constructor(private readonly capabilityService: CapabilityService) {}

  @Post()
  create(@Body() createCapabilityDto: CreateCapabilityDto) {
    return this.capabilityService.create(createCapabilityDto);
  }

  @Get()
  findAll(
    @Query('capabilityType') capabilityType?: string,
    @Query('capabilityCategory') capabilityCategory?: string,
    @Query('domain') domain?: string,
    @Query('strategicImportance') strategicImportance?: string,
    @Query('isCore') isCore?: string,
    @Query('isStrategic') isStrategic?: string,
    @Query('isActive') isActive?: string,
    @Query('lifecycleStage') lifecycleStage?: string,
  ) {
    return this.capabilityService.findAll({
      capabilityType,
      capabilityCategory,
      domain,
      strategicImportance,
      isCore: isCore === 'true',
      isStrategic: isStrategic === 'true',
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      lifecycleStage,
    });
  }

  @Get('stats')
  getStats() {
    return this.capabilityService.getStats();
  }

  @Get('top-level')
  getTopLevelCapabilities() {
    return this.capabilityService.getTopLevelCapabilities();
  }

  @Get('analysis/maturity-gap')
  getMaturityGapAnalysis() {
    return this.capabilityService.getMaturityGapAnalysis();
  }

  @Get('analysis/headcount-gap')
  getHeadcountGapAnalysis() {
    return this.capabilityService.getHeadcountGapAnalysis();
  }

  @Get('analysis/risk')
  getRiskAnalysis() {
    return this.capabilityService.getRiskAnalysis();
  }

  @Get('analysis/investment-priorities')
  getInvestmentPriorities() {
    return this.capabilityService.getInvestmentPriorities();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capabilityService.findOne(id);
  }

  @Get(':id/hierarchy')
  getCapabilityHierarchy(@Param('id') id: string) {
    return this.capabilityService.getCapabilityHierarchy(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCapabilityDto: UpdateCapabilityDto) {
    return this.capabilityService.update(id, updateCapabilityDto);
  }

  @Patch(':id/toggle-core')
  toggleCore(@Param('id') id: string) {
    return this.capabilityService.toggleCore(id);
  }

  @Patch(':id/toggle-strategic')
  toggleStrategic(@Param('id') id: string) {
    return this.capabilityService.toggleStrategic(id);
  }

  @Patch(':id/toggle-future-critical')
  toggleFutureCritical(@Param('id') id: string) {
    return this.capabilityService.toggleFutureCritical(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.capabilityService.remove(id);
  }
}
