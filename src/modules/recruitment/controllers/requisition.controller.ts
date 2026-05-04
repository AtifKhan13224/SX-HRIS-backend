import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequisitionService } from '../services/requisition.service';
import { CreateRequisitionDto, UpdateRequisitionDto } from '../dto/requisition.dto';

@ApiTags('Recruitment')
@Controller('recruitment/requisitions')
export class RequisitionController {
  constructor(private readonly requisitionService: RequisitionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new requisition' })
  create(@Body() createDto: CreateRequisitionDto) {
    return this.requisitionService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requisitions' })
  findAll(
    @Query('groupCompanyId') groupCompanyId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('approvalStatus') approvalStatus?: string,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ) {
    return this.requisitionService.findAll({
      groupCompanyId,
      departmentId,
      status,
      approvalStatus,
      isActive,
      search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get requisition statistics' })
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.requisitionService.getStats(groupCompanyId);
  }

  @Get('generate-number')
  @ApiOperation({ summary: 'Generate requisition number' })
  generateNumber() {
    return this.requisitionService.generateRequisitionNumber();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a requisition by ID' })
  findOne(@Param('id') id: string) {
    return this.requisitionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a requisition' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRequisitionDto) {
    return this.requisitionService.update(id, updateDto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a requisition' })
  approve(
    @Param('id') id: string,
    @Body('approverId') approverId: string,
    @Body('comments') comments?: string,
  ) {
    return this.requisitionService.approve(id, approverId, comments);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a requisition' })
  reject(
    @Param('id') id: string,
    @Body('approverId') approverId: string,
    @Body('reason') reason: string,
  ) {
    return this.requisitionService.reject(id, approverId, reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a requisition' })
  async remove(@Param('id') id: string) {
    await this.requisitionService.remove(id);
    return { message: 'Requisition deleted successfully' };
  }
}
