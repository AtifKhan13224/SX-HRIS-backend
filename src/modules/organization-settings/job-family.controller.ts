import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobFamilyService } from './job-family.service';
import { CreateJobFamilyDto, UpdateJobFamilyDto } from './dto/job-family.dto';

@Controller('job-families')
export class JobFamilyController {
  constructor(private readonly jobFamilyService: JobFamilyService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('functionalAreaId') functionalAreaId?: string,
    @Query('classification') classification?: string,
    @Query('criticalityRating') criticalityRating?: string,
  ) {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return await this.jobFamilyService.findAll(
      search,
      isActiveBoolean,
      groupCompanyId,
      functionalAreaId,
      classification,
      criticalityRating,
    );
  }

  @Get('stats')
  async getStats() {
    return await this.jobFamilyService.getStats();
  }

  @Get('hierarchy')
  async getHierarchy() {
    return await this.jobFamilyService.getHierarchy();
  }

  @Get('export')
  async export() {
    return await this.jobFamilyService.export();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.jobFamilyService.findOne(id);
  }

  @Get(':id/career-path')
  async getCareerPath(@Param('id') id: string) {
    return await this.jobFamilyService.getCareerPath(id);
  }

  @Get(':id/compensation-benchmark')
  async getCompensationBenchmark(@Param('id') id: string) {
    return await this.jobFamilyService.getCompensationBenchmark(id);
  }

  @Get(':id/succession-plan')
  async getSuccessionPlan(@Param('id') id: string) {
    return await this.jobFamilyService.getSuccessionPlan(id);
  }

  @Get(':id/skills-gap')
  async getSkillsGap(@Param('id') id: string) {
    return await this.jobFamilyService.getSkillsGap(id);
  }

  @Get(':id/talent-analytics')
  async getTalentAnalytics(@Param('id') id: string) {
    return await this.jobFamilyService.getTalentAnalytics(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateJobFamilyDto) {
    return await this.jobFamilyService.create(createDto);
  }

  @Post('bulk-update')
  @HttpCode(HttpStatus.OK)
  async bulkUpdate(
    @Body() body: { ids: string[]; updateDto: Partial<UpdateJobFamilyDto> },
  ) {
    return await this.jobFamilyService.bulkUpdate(body.ids, body.updateDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateJobFamilyDto) {
    return await this.jobFamilyService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return await this.jobFamilyService.delete(id);
  }
}
