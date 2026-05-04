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
import { FunctionalAreaService } from '../services/functional-area.service';
import { CreateFunctionalAreaDto, UpdateFunctionalAreaDto } from '../dto/functional-area.dto';

@Controller('organization-settings/functional-areas')
export class FunctionalAreaController {
  constructor(private readonly functionalAreaService: FunctionalAreaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFunctionalAreaDto: CreateFunctionalAreaDto) {
    return this.functionalAreaService.create(createFunctionalAreaDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.functionalAreaService.findAll(groupCompanyId, search, isActiveBool);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.functionalAreaService.getStats(groupCompanyId);
  }

  @Get('hierarchy')
  getHierarchy(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.functionalAreaService.getHierarchy(groupCompanyId);
  }

  @Get('performance-analysis')
  getPerformanceAnalysis(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.functionalAreaService.getPerformanceAnalysis(groupCompanyId);
  }

  @Get('capability-matrix')
  getCapabilityMatrix(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.functionalAreaService.getCapabilityMatrix(groupCompanyId);
  }

  @Get('digital-transformation')
  getDigitalTransformation(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.functionalAreaService.getDigitalTransformation(groupCompanyId);
  }

  @Get('risk-compliance')
  getRiskCompliance(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.functionalAreaService.getRiskCompliance(groupCompanyId);
  }

  @Get('cost-analysis')
  getCostAnalysis(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.functionalAreaService.getCostAnalysis(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.functionalAreaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFunctionalAreaDto: UpdateFunctionalAreaDto) {
    return this.functionalAreaService.update(id, updateFunctionalAreaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.functionalAreaService.remove(id);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateFunctionalAreaDto }>) {
    return this.functionalAreaService.bulkUpdate(updates);
  }
}
