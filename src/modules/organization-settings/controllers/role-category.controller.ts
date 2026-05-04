import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoleCategoryService } from '../services/role-category.service';
import { CreateRoleCategoryDto, UpdateRoleCategoryDto } from '../dto/role-category.dto';
import { RoleCategory } from '../entities/role-category.entity';

@Controller('organization-settings/role-categories')
export class RoleCategoryController {
  constructor(private readonly roleCategoryService: RoleCategoryService) {}

  @Post()
  async create(@Body() createRoleCategoryDto: CreateRoleCategoryDto): Promise<RoleCategory> {
    return await this.roleCategoryService.create(createRoleCategoryDto);
  }

  @Get()
  async findAll(@Query('groupCompanyId') groupCompanyId?: string): Promise<RoleCategory[]> {
    return await this.roleCategoryService.findAll(groupCompanyId);
  }

  @Get('stats')
  async getStats(@Query('groupCompanyId') groupCompanyId?: string): Promise<any> {
    return await this.roleCategoryService.getStats(groupCompanyId);
  }

  @Get('hierarchy')
  async getHierarchy(@Query('groupCompanyId') groupCompanyId?: string): Promise<any[]> {
    return await this.roleCategoryService.getHierarchy(groupCompanyId);
  }

  @Get('compensation-analysis')
  async getCompensationAnalysis(@Query('groupCompanyId') groupCompanyId?: string): Promise<any[]> {
    return await this.roleCategoryService.getCompensationAnalysis(groupCompanyId);
  }

  @Get('talent-analytics')
  async getTalentAnalytics(@Query('groupCompanyId') groupCompanyId?: string): Promise<any> {
    return await this.roleCategoryService.getTalentAnalytics(groupCompanyId);
  }

  @Get('workforce-distribution')
  async getWorkforceDistribution(@Query('groupCompanyId') groupCompanyId?: string): Promise<any> {
    return await this.roleCategoryService.getWorkforceDistribution(groupCompanyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RoleCategory> {
    return await this.roleCategoryService.findOne(id);
  }

  @Get(':id/career-path')
  async getCareerPath(@Param('id') id: string): Promise<any> {
    return await this.roleCategoryService.getCareerPath(id);
  }

  @Get(':id/succession-plan')
  async getSuccessionPlan(@Param('id') id: string): Promise<any> {
    return await this.roleCategoryService.getSuccessionPlan(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleCategoryDto: UpdateRoleCategoryDto,
  ): Promise<RoleCategory> {
    return await this.roleCategoryService.update(id, updateRoleCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.roleCategoryService.remove(id);
  }

  @Post('bulk-update')
  async bulkUpdate(
    @Body() updates: Array<{ id: string; data: UpdateRoleCategoryDto }>,
  ): Promise<RoleCategory[]> {
    return await this.roleCategoryService.bulkUpdate(updates);
  }
}
