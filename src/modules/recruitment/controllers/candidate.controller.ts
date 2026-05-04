import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CandidateService } from '../services/candidate.service';
import { CreateCandidateDto, UpdateCandidateDto } from '../dto/candidate.dto';

@ApiTags('Recruitment')
@Controller('recruitment/candidates')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new candidate' })
  create(@Body() createDto: CreateCandidateDto) {
    return this.candidateService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all candidates' })
  findAll(
    @Query('status') status?: string,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
    @Query('sourceId') sourceId?: string,
    @Query('minExperience') minExperience?: number,
    @Query('maxExperience') maxExperience?: number,
    @Query('skills') skills?: string,
  ) {
    return this.candidateService.findAll({
      status,
      isActive,
      search,
      sourceId,
      minExperience,
      maxExperience,
      skills,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get candidate statistics' })
  getStats() {
    return this.candidateService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a candidate by ID' })
  findOne(@Param('id') id: string) {
    return this.candidateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a candidate' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCandidateDto) {
    return this.candidateService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a candidate' })
  async remove(@Param('id') id: string) {
    await this.candidateService.remove(id);
    return { message: 'Candidate deleted successfully' };
  }
}
