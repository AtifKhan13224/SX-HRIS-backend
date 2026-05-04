import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportTemplate, ReportStatus, ReportType, ReportFormat } from './entities/report.entity';
import {
  CreateReportDto,
  UpdateReportDto,
  ReportQueryDto,
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  GenerateReportDto,
} from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(ReportTemplate)
    private templateRepository: Repository<ReportTemplate>,
  ) {}

  // Report Methods
  async create(createReportDto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create(createReportDto);
    return this.reportRepository.save(report);
  }

  async findAll(query: ReportQueryDto): Promise<{
    data: Report[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { reportType, status, generatedBy, page = 1, limit = 10 } = query;

    const queryBuilder = this.reportRepository.createQueryBuilder('report');

    if (reportType) {
      queryBuilder.andWhere('report.reportType = :reportType', { reportType });
    }

    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    if (generatedBy) {
      queryBuilder.andWhere('report.generatedBy = :generatedBy', { generatedBy });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.findOne(id);
    Object.assign(report, updateReportDto);

    if (updateReportDto.status === ReportStatus.COMPLETED) {
      report.generatedAt = new Date();
    }

    return this.reportRepository.save(report);
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
  }

  async generateReport(
    userId: string,
    generateReportDto: GenerateReportDto,
  ): Promise<Report> {
    const { templateId, reportType, format, filters, parameters } = generateReportDto;

    let reportName = `${reportType} Report`;
    let reportFilters = filters;
    let reportParams = parameters;

    // If template is provided, load template defaults
    if (templateId) {
      const template = await this.findOneTemplate(templateId);
      reportName = template.templateName;
      reportFilters = { ...template.defaultFilters, ...filters };
    }

    // Create report record directly with processing status
    const report = this.reportRepository.create({
      reportName,
      reportType,
      format: format || ReportFormat.PDF,
      filters: reportFilters,
      parameters: reportParams,
      generatedBy: userId,
      status: ReportStatus.PROCESSING,
    });
    
    const savedReport = await this.reportRepository.save(report);

    // In a real implementation, you would trigger background job to generate report
    // For now, we'll just simulate it
    setTimeout(async () => {
      try {
        // Simulate report generation
        await this.update(report.id, {
          status: ReportStatus.COMPLETED,
          filePath: `/reports/${report.id}.${format}`,
          fileUrl: `https://example.com/reports/${report.id}.${format}`,
          fileSize: 102400,
        });
      } catch (error) {
        await this.update(report.id, {
          status: ReportStatus.FAILED,
          errorMessage: error.message,
        });
      }
    }, 1000);

    return savedReport;
  }

  async downloadReport(id: string): Promise<{ filePath: string; fileUrl: string }> {
    const report = await this.findOne(id);

    if (report.status !== ReportStatus.COMPLETED) {
      throw new BadRequestException('Report is not ready for download');
    }

    if (!report.filePath || !report.fileUrl) {
      throw new NotFoundException('Report file not found');
    }

    return {
      filePath: report.filePath,
      fileUrl: report.fileUrl,
    };
  }

  // Template Methods
  async createTemplate(createTemplateDto: CreateReportTemplateDto): Promise<ReportTemplate> {
    const template = this.templateRepository.create(createTemplateDto);
    return this.templateRepository.save(template);
  }

  async findAllTemplates(reportType?: ReportType): Promise<ReportTemplate[]> {
    const query: any = { isActive: true };

    if (reportType) {
      query.reportType = reportType;
    }

    return this.templateRepository.find({ where: query });
  }

  async findOneTemplate(id: string): Promise<ReportTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });

    if (!template) {
      throw new NotFoundException(`Report template with ID ${id} not found`);
    }

    return template;
  }

  async updateTemplate(
    id: string,
    updateTemplateDto: UpdateReportTemplateDto,
  ): Promise<ReportTemplate> {
    const template = await this.findOneTemplate(id);
    Object.assign(template, updateTemplateDto);
    return this.templateRepository.save(template);
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.findOneTemplate(id);
    template.isActive = false;
    await this.templateRepository.save(template);
  }

  // Statistics
  async getReportStatistics(userId?: string): Promise<any> {
    const queryBuilder = this.reportRepository.createQueryBuilder('report');

    if (userId) {
      queryBuilder.where('report.generatedBy = :userId', { userId });
    }

    const total = await queryBuilder.getCount();
    const completed = await queryBuilder
      .where('report.status = :status', { status: ReportStatus.COMPLETED })
      .getCount();

    const byType = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.reportType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.reportType')
      .getRawMany();

    return {
      total,
      completed,
      processing: await queryBuilder
        .where('report.status = :status', { status: ReportStatus.PROCESSING })
        .getCount(),
      failed: await queryBuilder
        .where('report.status = :status', { status: ReportStatus.FAILED })
        .getCount(),
      byType,
    };
  }
}
