import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApplicationService } from '../services/application.service';
import { CreateApplicationDto, UpdateApplicationDto } from '../dto/application.dto';

@ApiTags('Recruitment')
@Controller('recruitment/applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  create(@Body() createDto: CreateApplicationDto) {
    return this.applicationService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  findAll(
    @Query('candidateId') candidateId?: string,
    @Query('jobOpeningId') jobOpeningId?: string,
    @Query('status') status?: string,
    @Query('currentStageId') currentStageId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.applicationService.findAll({
      candidateId,
      jobOpeningId,
      status,
      currentStageId,
      isActive,
      assignedTo,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  getStats(@Query('jobOpeningId') jobOpeningId?: string) {
    return this.applicationService.getStats(jobOpeningId);
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get pipeline statistics' })
  getPipelineStats() {
    return this.applicationService.getPipelineStats();
  }

  @Get('generate-number')
  @ApiOperation({ summary: 'Generate application number' })
  generateNumber() {
    return this.applicationService.generateApplicationNumber();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an application by ID' })
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an application' })
  update(@Param('id') id: string, @Body() updateDto: UpdateApplicationDto) {
    return this.applicationService.update(id, updateDto);
  }

  @Post(':id/move-stage')
  @ApiOperation({ summary: 'Move application to a stage' })
  moveToStage(
    @Param('id') id: string,
    @Body('stageId') stageId: string,
  ) {
    return this.applicationService.moveToStage(id, stageId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an application' })
  async remove(@Param('id') id: string) {
    await this.applicationService.remove(id);
    return { message: 'Application deleted successfully' };
  }
}
