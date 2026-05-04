import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecruitmentSourceService } from '../services/recruitment-source.service';
import { CreateRecruitmentSourceDto, UpdateRecruitmentSourceDto } from '../dto/recruitment-source.dto';

@ApiTags('Recruitment')
@Controller('recruitment/sources')
export class RecruitmentSourceController {
  constructor(private readonly sourceService: RecruitmentSourceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recruitment source' })
  create(@Body() createDto: CreateRecruitmentSourceDto) {
    return this.sourceService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recruitment sources' })
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.sourceService.findAll(groupCompanyId, isActive);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get source statistics' })
  getStats() {
    return this.sourceService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recruitment source by ID' })
  findOne(@Param('id') id: string) {
    return this.sourceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recruitment source' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRecruitmentSourceDto) {
    return this.sourceService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recruitment source' })
  async remove(@Param('id') id: string) {
    await this.sourceService.remove(id);
    return { message: 'Recruitment source deleted successfully' };
  }
}
