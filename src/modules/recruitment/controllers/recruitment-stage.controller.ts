import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecruitmentStageService } from '../services/recruitment-stage.service';
import { CreateRecruitmentStageDto, UpdateRecruitmentStageDto } from '../dto/recruitment-stage.dto';

@ApiTags('Recruitment')
@Controller('recruitment/stages')
export class RecruitmentStageController {
  constructor(private readonly stageService: RecruitmentStageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recruitment stage' })
  create(@Body() createDto: CreateRecruitmentStageDto) {
    return this.stageService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recruitment stages' })
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.stageService.findAll(groupCompanyId, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recruitment stage by ID' })
  findOne(@Param('id') id: string) {
    return this.stageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recruitment stage' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRecruitmentStageDto) {
    return this.stageService.update(id, updateDto);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder recruitment stages' })
  async reorder(@Body('stageIds') stageIds: string[]) {
    await this.stageService.reorderStages(stageIds);
    return { message: 'Stages reordered successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recruitment stage' })
  async remove(@Param('id') id: string) {
    await this.stageService.remove(id);
    return { message: 'Recruitment stage deleted successfully' };
  }
}
