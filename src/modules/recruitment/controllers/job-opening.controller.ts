import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JobOpeningService } from '../services/job-opening.service';
import { CreateJobOpeningDto, UpdateJobOpeningDto } from '../dto/job-opening.dto';

@ApiTags('Recruitment')
@Controller('recruitment/job-openings')
export class JobOpeningController {
  constructor(private readonly jobOpeningService: JobOpeningService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job opening' })
  create(@Body() createDto: CreateJobOpeningDto) {
    return this.jobOpeningService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all job openings' })
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
    @Query('employmentType') employmentType?: string,
    @Query('workMode') workMode?: string,
  ) {
    return this.jobOpeningService.findAll({
      groupCompanyId,
      departmentId,
      status,
      isActive,
      search,
      employmentType,
      workMode,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get job opening statistics' })
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.jobOpeningService.getStats(groupCompanyId);
  }

  @Get('top-positions')
  @ApiOperation({ summary: 'Get top hiring positions' })
  getTopPositions(@Query('limit') limit?: number) {
    return this.jobOpeningService.getTopPositions(limit || 5);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job opening by ID' })
  findOne(@Param('id') id: string) {
    return this.jobOpeningService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job opening' })
  update(@Param('id') id: string, @Body() updateDto: UpdateJobOpeningDto) {
    return this.jobOpeningService.update(id, updateDto);
  }

  @Post(':id/increment-view')
  @ApiOperation({ summary: 'Increment view count' })
  async incrementView(@Param('id') id: string) {
    await this.jobOpeningService.incrementViewCount(id);
    return { message: 'View count incremented' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job opening' })
  async remove(@Param('id') id: string) {
    await this.jobOpeningService.remove(id);
    return { message: 'Job opening deleted successfully' };
  }
}
