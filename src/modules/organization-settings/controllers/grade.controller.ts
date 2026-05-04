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
import { GradeService } from '../services/grade.service';
import { CreateGradeDto, UpdateGradeDto } from '../dto/grade.dto';

@Controller('organization-settings/grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradeService.create(createGradeDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.gradeService.findAll(groupCompanyId, search, isActiveBool);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.gradeService.getStats(groupCompanyId);
  }

  @Get('salary-structure')
  getSalaryStructure(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.gradeService.getSalaryStructure(groupCompanyId);
  }

  @Get('compensation-analysis')
  getCompensationAnalysis(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.gradeService.getCompensationAnalysis(groupCompanyId);
  }

  @Get('career-progression')
  getCareerProgression(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.gradeService.getCareerProgression(groupCompanyId);
  }

  @Get('workforce-plan')
  getWorkforcePlan(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.gradeService.getWorkforcePlan(groupCompanyId);
  }

  @Get('talent-analytics')
  getTalentAnalytics(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.gradeService.getTalentAnalytics(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gradeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradeService.update(id, updateGradeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.gradeService.remove(id);
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateGradeDto }>) {
    return this.gradeService.bulkUpdate(updates);
  }
}
