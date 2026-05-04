import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DesignationService } from '../services/designation.service';
import { CreateDesignationDto, UpdateDesignationDto } from '../dto/designation.dto';

@Controller('organization-settings/designations')
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @Post()
  create(@Body() createDto: CreateDesignationDto) {
    return this.designationService.create(createDto);
  }

  @Get()
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.designationService.findAll(groupCompanyId, search, status);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationService.getStats(groupCompanyId);
  }

  @Get('reporting-structure')
  getReportingStructure(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationService.getReportingStructure(groupCompanyId);
  }

  @Get('compensation-summary')
  getCompensationSummary(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationService.getCompensationSummary(groupCompanyId);
  }

  @Get('performance-metrics')
  getPerformanceMetrics(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationService.getPerformanceMetrics(groupCompanyId);
  }

  @Get('career-progression')
  getCareerProgression(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationService.getCareerProgression(groupCompanyId);
  }

  @Get('compliance-status')
  getComplianceStatus(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationService.getComplianceStatus(groupCompanyId);
  }

  @Get('work-location-matrix')
  getWorkLocationMatrix(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationService.getWorkLocationMatrix(groupCompanyId);
  }

  @Get('approval-workflow')
  getApprovalWorkflow(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.designationService.getApprovalWorkflow(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDesignationDto) {
    return this.designationService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.designationService.remove(id);
    return { message: 'Designation deleted successfully' };
  }

  @Post('bulk-update')
  bulkUpdate(@Body() updates: Array<{ id: string; data: UpdateDesignationDto }>) {
    return this.designationService.bulkUpdate(updates);
  }

  @Post('bulk-assign')
  bulkAssign(@Body() assignments: Array<{ id: string; employeeId: string }>) {
    return this.designationService.bulkAssign(assignments);
  }
}
