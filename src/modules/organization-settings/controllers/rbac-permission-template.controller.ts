import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Request,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { RBACPermissionTemplateService } from '../services/rbac-permission-template.service';
import {
  CreatePermissionTemplateDto,
  UpdatePermissionTemplateDto,
  ApplyTemplateToRoleDto,
} from '../dto/rbac-permission-template.dto';

@Controller('organization-settings/rbac/templates')
export class RBACPermissionTemplateController {
  constructor(private readonly templateService: RBACPermissionTemplateService) {}

  /**
   * Create a new permission template
   * POST /organization-settings/rbac/templates
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createDto: CreatePermissionTemplateDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    const template = await this.templateService.create(createDto, userId);
    return {
      success: true,
      message: 'Permission template created successfully',
      data: template,
    };
  }

  /**
   * Get all permission templates with filtering
   * GET /organization-settings/rbac/templates
   */
  @Get()
  async findAll(
    @Query('templateCategory') templateCategory?: string,
    @Query('isActive') isActive?: string,
    @Query('isRecommended') isRecommended?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      templateCategory,
      isActive: isActive ? isActive === 'true' : undefined,
      isRecommended: isRecommended ? isRecommended === 'true' : undefined,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    };

    const result = await this.templateService.findAll(filters);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get recommended templates
   * GET /organization-settings/rbac/templates/recommended
   */
  @Get('recommended')
  async getRecommended(@Query('category') category?: string) {
    const templates = await this.templateService.getRecommended(category);
    return {
      success: true,
      data: templates,
    };
  }

  /**
   * Get a single template by ID
   * GET /organization-settings/rbac/templates/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const template = await this.templateService.findOne(id);
    return {
      success: true,
      data: template,
    };
  }

  /**
   * Get template by code
   * GET /organization-settings/rbac/templates/by-code/:code
   */
  @Get('by-code/:code')
  async findByCode(@Param('code') code: string) {
    const template = await this.templateService.findByCode(code);
    return {
      success: true,
      data: template,
    };
  }

  /**
   * Update a template
   * PUT /organization-settings/rbac/templates/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdatePermissionTemplateDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 'system';
    const template = await this.templateService.update(id, updateDto, userId);
    return {
      success: true,
      message: 'Template updated successfully',
      data: template,
    };
  }

  /**
   * Delete a template
   * DELETE /organization-settings/rbac/templates/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user?.id || 'system';
    await this.templateService.remove(id, userId);
    return {
      success: true,
      message: 'Template deleted successfully',
    };
  }

  /**
   * Apply template to a role
   * POST /organization-settings/rbac/templates/apply
   */
  @Post('apply')
  async applyToRole(@Body(ValidationPipe) applyDto: ApplyTemplateToRoleDto, @Request() req: any) {
    const userId = req.user?.id || 'system';
    const role = await this.templateService.applyToRole(applyDto, userId);
    return {
      success: true,
      message: 'Template applied to role successfully',
      data: role,
    };
  }
}
