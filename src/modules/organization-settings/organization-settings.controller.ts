import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrganizationSettingsService } from './organization-settings.service';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { Request } from 'express';

interface AuditContext {
  userId: string;
  ipAddress: string;
  userAgent: string;
}

@Controller('company-profile')
export class OrganizationSettingsController {
  constructor(
    private readonly organizationSettingsService: OrganizationSettingsService,
  ) {}

  private extractAuditContext(req: Request): AuditContext {
    return {
      userId: (req as any).user?.id || (req as any).user?.sub || 'system',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    };
  }

  @Get()
  async getCompanyProfile() {
    return this.organizationSettingsService.getCompanyProfile();
  }

  @Put()
  async updateCompanyProfile(
    @Body() updateDto: UpdateCompanyProfileDto,
    @Req() req: Request,
  ) {
    const context = this.extractAuditContext(req);
    return this.organizationSettingsService.updateCompanyProfile(updateDto, context);
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(@UploadedFile() file: any, @Req() req: Request) {
    const base64Data = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
    const context = this.extractAuditContext(req);
    return this.organizationSettingsService.uploadLogo(dataUrl, context);
  }

  @Post('background')
  @UseInterceptors(FileInterceptor('background'))
  async uploadBackground(@UploadedFile() file: any, @Req() req: Request) {
    const base64Data = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
    const context = this.extractAuditContext(req);
    return this.organizationSettingsService.uploadBackground(dataUrl, context);
  }

  @Delete('logo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLogo(@Req() req: Request) {
    const context = this.extractAuditContext(req);
    await this.organizationSettingsService.deleteLogo(context);
  }

  @Delete('background')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBackground(@Req() req: Request) {
    const context = this.extractAuditContext(req);
    await this.organizationSettingsService.deleteBackground(context);
  }

  @Get('audit-logs')
  async getAuditLogs(@Query('limit') limit?: number) {
    return this.organizationSettingsService.getAuditLogs(undefined, limit || 100);
  }

  @Get('export')
  async exportProfile() {
    return this.organizationSettingsService.exportProfile();
  }

  @Post('import')
  async importProfile(@Body() importData: any, @Req() req: Request) {
    const context = this.extractAuditContext(req);
    return this.organizationSettingsService.importProfile(importData, context);
  }
}

@Controller('organization-settings')
export class OrganizationSettingsCategoriesController {
  constructor(
    private readonly organizationSettingsService: OrganizationSettingsService,
  ) {}

  @Get('categories')
  async getCategories() {
    return this.organizationSettingsService.getCategories();
  }
}

@Controller('company-profiles')
export class CompanyProfilesController {
  constructor(
    private readonly organizationSettingsService: OrganizationSettingsService,
  ) {}

  private extractAuditContext(req: Request): AuditContext {
    return {
      userId: (req as any).user?.id || (req as any).user?.sub || 'system',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    };
  }

  @Get()
  async getAllProfiles() {
    return this.organizationSettingsService.getAllCompanyProfiles();
  }

  @Get(':id')
  async getProfileById(@Req() req: Request) {
    const id = (req.params as any).id;
    return this.organizationSettingsService.getCompanyProfileById(id);
  }

  @Post()
  async createProfile(@Body() createDto: any, @Req() req: Request) {
    const context = this.extractAuditContext(req);
    return this.organizationSettingsService.createCompanyProfile(createDto, context);
  }

  @Put(':id')
  async updateProfile(
    @Body() updateDto: any,
    @Req() req: Request,
  ) {
    const context = this.extractAuditContext(req);
    const id = (req.params as any).id;
    return this.organizationSettingsService.updateCompanyProfileById(id, updateDto, context);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Req() req: Request) {
    const context = this.extractAuditContext(req);
    const id = (req.params as any).id;
    await this.organizationSettingsService.deleteCompanyProfile(id, context);
  }
}
