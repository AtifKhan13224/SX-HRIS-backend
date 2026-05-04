import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RecruitmentService, RecruitmentConfigService } from './services';

/**
 * Recruitment Controller
 * Comprehensive REST API for recruitment module
 * Enterprise-grade recruitment management endpoints
 */
@Controller('recruitment')
export class RecruitmentController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly recruitmentConfigService: RecruitmentConfigService,
  ) {}

  // ==================== CONFIGURATION ====================
  
  @Get('config')
  async getConfigurations(@Query('companyId') companyId: string) {
    return await this.recruitmentConfigService.findAll(companyId);
  }

  @Get('config/default')
  async getDefaultConfiguration(@Query('companyId') companyId: string) {
    return await this.recruitmentConfigService.findDefault(companyId);
  }

  @Get('config/:id')
  async getConfiguration(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.recruitmentConfigService.findOne(id, companyId);
  }

  @Post('config')
  async createConfiguration(@Body() createDto: any) {
    return await this.recruitmentConfigService.create(createDto);
  }

  @Put('config/:id')
  async updateConfiguration(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() updateDto: any,
  ) {
    return await this.recruitmentConfigService.update(id, companyId, updateDto);
  }

  @Delete('config/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConfiguration(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.recruitmentConfigService.delete(id, companyId);
  }

  // ==================== JOB REQUISITIONS ====================
  
  @Get('requisitions')
  async getRequisitions(
    @Query('companyId') companyId: string,
    @Query() filters: any,
  ) {
    return await this.recruitmentService.findRequisitions(companyId, filters);
  }

  @Get('requisitions/:id')
  async getRequisition(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.recruitmentService.findRequisitionById(id, companyId);
  }

  @Post('requisitions')
  async createRequisition(@Body() createDto: any) {
    return await this.recruitmentService.createRequisition(createDto);
  }

  @Put('requisitions/:id')
  async updateRequisition(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() updateDto: any,
  ) {
    return await this.recruitmentService.updateRequisition(id, companyId, updateDto);
  }

  @Post('requisitions/:id/approve')
  async approveRequisition(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() approvalDto: { approverId: string; comments?: string },
  ) {
    return await this.recruitmentService.approveRequisition(
      id,
      companyId,
      approvalDto.approverId,
      approvalDto.comments,
    );
  }

  // ==================== JOB POSTINGS ====================
  
  @Get('postings')
  async getPostings(
    @Query('companyId') companyId: string,
    @Query() filters: any,
  ) {
    return await this.recruitmentService.findPostings(companyId, filters);
  }

  @Get('postings/:id')
  async getPosting(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.recruitmentService.findPostingById(id, companyId);
  }

  @Post('postings')
  async createPosting(@Body() createDto: any) {
    return await this.recruitmentService.createPosting(createDto);
  }

  @Post('postings/:id/publish')
  async publishPosting(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.recruitmentService.publishPosting(id, companyId);
  }

  // ==================== CANDIDATES ====================
  
  @Get('candidates')
  async getCandidates(
    @Query('companyId') companyId: string,
    @Query() filters: any,
  ) {
    return await this.recruitmentService.findCandidates(companyId, filters);
  }

  @Get('candidates/:id')
  async getCandidate(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.recruitmentService.findCandidateById(id, companyId);
  }

  @Post('candidates')
  async createCandidate(@Body() createDto: any) {
    return await this.recruitmentService.createCandidate(createDto);
  }

  // ==================== JOB APPLICATIONS ====================
  
  @Get('applications')
  async getApplications(
    @Query('companyId') companyId: string,
    @Query() filters: any,
  ) {
    return await this.recruitmentService.findApplications(companyId, filters);
  }

  @Get('applications/:id')
  async getApplication(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.recruitmentService.findApplicationById(id, companyId);
  }

  @Post('applications')
  async createApplication(@Body() createDto: any) {
    return await this.recruitmentService.createApplication(createDto);
  }

  @Post('applications/:id/move-stage')
  async moveApplicationStage(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() moveDto: { stageId: string; movedBy: string; reason?: string },
  ) {
    return await this.recruitmentService.moveApplicationToStage(
      id,
      companyId,
      moveDto.stageId,
      moveDto.movedBy,
      moveDto.reason,
    );
  }

  // ==================== INTERVIEWS ====================
  
  @Get('interviews')
  async getInterviews(
    @Query('companyId') companyId: string,
    @Query() filters: any,
  ) {
    return await this.recruitmentService.findInterviews(companyId, filters);
  }

  @Post('interviews')
  async scheduleInterview(@Body() createDto: any) {
    return await this.recruitmentService.scheduleInterview(createDto);
  }

  // ==================== OFFERS ====================
  
  @Get('offers')
  async getOffers(
    @Query('companyId') companyId: string,
    @Query() filters: any,
  ) {
    return await this.recruitmentService.findOffers(companyId, filters);
  }

  @Post('offers')
  async createOffer(@Body() createDto: any) {
    return await this.recruitmentService.createOffer(createDto);
  }

  // ==================== ANALYTICS ====================
  
  @Get('analytics')
  async getAnalytics(
    @Query('companyId') companyId: string,
    @Query('periodType') periodType: string,
    @Query('periodStart') periodStart: string,
    @Query('periodEnd') periodEnd: string,
  ) {
    return await this.recruitmentService.getRecruitmentAnalytics(
      companyId,
      periodType,
      new Date(periodStart),
      new Date(periodEnd),
    );
  }

  // ==================== DASHBOARD ====================
  
  @Get('dashboard/stats')
  async getDashboardStats(@Query('companyId') companyId: string) {
    return await this.recruitmentService.getDashboardStats(companyId);
  }
}
