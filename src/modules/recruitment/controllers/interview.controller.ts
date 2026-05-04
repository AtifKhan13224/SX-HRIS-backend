import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InterviewService } from '../services/interview.service';
import { CreateInterviewDto, UpdateInterviewDto } from '../dto/interview.dto';

@ApiTags('Recruitment')
@Controller('recruitment/interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new interview' })
  create(@Body() createDto: CreateInterviewDto) {
    return this.interviewService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all interviews' })
  findAll(
    @Query('applicationId') applicationId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('interviewerId') interviewerId?: string,
  ) {
    return this.interviewService.findAll({
      applicationId,
      status,
      type,
      startDate,
      endDate,
      interviewerId,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get interview statistics' })
  getStats() {
    return this.interviewService.getStats();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming interviews' })
  getUpcoming(@Query('days') days?: number) {
    return this.interviewService.getUpcoming(days ? Number(days) : 7);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an interview by ID' })
  findOne(@Param('id') id: string) {
    return this.interviewService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an interview' })
  update(@Param('id') id: string, @Body() updateDto: UpdateInterviewDto) {
    return this.interviewService.update(id, updateDto);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule an interview' })
  reschedule(
    @Param('id') id: string,
    @Body('newDate') newDate: Date,
    @Body('reason') reason: string,
  ) {
    return this.interviewService.reschedule(id, newDate, reason);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an interview' })
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('cancelledBy') cancelledBy: string,
  ) {
    return this.interviewService.cancel(id, reason, cancelledBy);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit interview feedback' })
  submitFeedback(
    @Param('id') id: string,
    @Body('feedback') feedback: any,
    @Body('rating') rating: number,
    @Body('recommendation') recommendation: string,
  ) {
    return this.interviewService.submitFeedback(id, feedback, rating, recommendation);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an interview' })
  async remove(@Param('id') id: string) {
    await this.interviewService.remove(id);
    return { message: 'Interview deleted successfully' };
  }
}
