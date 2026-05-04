import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OfferLetterService } from '../services/offer-letter.service';
import { CreateOfferLetterDto, UpdateOfferLetterDto } from '../dto/offer-letter.dto';

@ApiTags('Recruitment')
@Controller('recruitment/offer-letters')
export class OfferLetterController {
  constructor(private readonly offerLetterService: OfferLetterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new offer letter' })
  create(@Body() createDto: CreateOfferLetterDto) {
    return this.offerLetterService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all offer letters' })
  findAll(
    @Query('candidateId') candidateId?: string,
    @Query('jobOpeningId') jobOpeningId?: string,
    @Query('applicationId') applicationId?: string,
    @Query('status') status?: string,
    @Query('approvalStatus') approvalStatus?: string,
  ) {
    return this.offerLetterService.findAll({
      candidateId,
      jobOpeningId,
      applicationId,
      status,
      approvalStatus,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get offer letter statistics' })
  getStats() {
    return this.offerLetterService.getStats();
  }

  @Get('generate-number')
  @ApiOperation({ summary: 'Generate offer number' })
  generateNumber() {
    return this.offerLetterService.generateOfferNumber();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an offer letter by ID' })
  findOne(@Param('id') id: string) {
    return this.offerLetterService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an offer letter' })
  update(@Param('id') id: string, @Body() updateDto: UpdateOfferLetterDto) {
    return this.offerLetterService.update(id, updateDto);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send offer letter' })
  send(@Param('id') id: string, @Body('sentBy') sentBy: string) {
    return this.offerLetterService.sendOffer(id, sentBy);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept offer letter' })
  accept(@Param('id') id: string) {
    return this.offerLetterService.acceptOffer(id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject offer letter' })
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.offerLetterService.rejectOffer(id, reason);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw offer letter' })
  withdraw(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('withdrawnBy') withdrawnBy: string,
  ) {
    return this.offerLetterService.withdrawOffer(id, reason, withdrawnBy);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Record candidate joining' })
  recordJoining(
    @Param('id') id: string,
    @Body('actualJoiningDate') actualJoiningDate: Date,
    @Body('employeeId') employeeId: string,
  ) {
    return this.offerLetterService.recordJoining(id, actualJoiningDate, employeeId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer letter' })
  async remove(@Param('id') id: string) {
    await this.offerLetterService.remove(id);
    return { message: 'Offer letter deleted successfully' };
  }
}
