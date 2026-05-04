import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  CreateReportDto,
  UpdateReportDto,
  ReportQueryDto,
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  GenerateReportDto,
} from './dto/report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ReportType } from './entities/report.entity';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Report Endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new report' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  generateReport(@Req() req: any, @Body() generateReportDto: GenerateReportDto) {
    const userId = req.user.userId; // Assuming user info is in request
    return this.reportsService.generateReport(userId, generateReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports with filters' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findAll(@Query() query: ReportQueryDto) {
    return this.reportsService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get report statistics' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  getReportStatistics(@Query('userId') userId?: string) {
    return this.reportsService.getReportStatistics(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download report' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  downloadReport(@Param('id') id: string) {
    return this.reportsService.downloadReport(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }

  // Template Endpoints
  @Post('templates')
  @ApiOperation({ summary: 'Create report template' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  createTemplate(@Body() createTemplateDto: CreateReportTemplateDto) {
    return this.reportsService.createTemplate(createTemplateDto);
  }

  @Get('templates/all')
  @ApiOperation({ summary: 'Get all report templates' })
  @ApiQuery({ name: 'reportType', required: false, enum: ReportType })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findAllTemplates(@Query('reportType') reportType?: ReportType) {
    return this.reportsService.findAllTemplates(reportType);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get report template by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findOneTemplate(@Param('id') id: string) {
    return this.reportsService.findOneTemplate(id);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update report template' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  updateTemplate(@Param('id') id: string, @Body() updateTemplateDto: UpdateReportTemplateDto) {
    return this.reportsService.updateTemplate(id, updateTemplateDto);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete report template' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  deleteTemplate(@Param('id') id: string) {
    return this.reportsService.deleteTemplate(id);
  }
}
