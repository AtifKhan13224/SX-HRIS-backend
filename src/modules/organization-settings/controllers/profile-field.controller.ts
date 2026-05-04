import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProfileFieldService } from '../services/profile-field.service';
import {
  CreateProfileFieldDefinitionDto,
  UpdateProfileFieldDefinitionDto,
  CreateProfileFieldOptionDto,
  UpdateProfileFieldOptionDto,
  BulkUpdateOptionsOrderDto,
  QueryProfileFieldsDto,
} from '../dto/profile-field.dto';

@ApiTags('Profile Field Options')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organization-settings/profile-fields')
export class ProfileFieldController {
  constructor(private readonly profileFieldService: ProfileFieldService) {}

  // ============ Field Definitions ============

  @Get()
  @ApiOperation({ summary: 'Get all profile field definitions' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getAllFields(@Req() req: any, @Query() query: QueryProfileFieldsDto) {
    const tenantId = req.user?.tenantId || 'default';
    return await this.profileFieldService.getAllFieldDefinitions(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get field definition by ID' })
  async getFieldById(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || 'default';
    return await this.profileFieldService.getFieldDefinitionById(tenantId, id);
  }

  @Get('by-key/:fieldKey')
  @ApiOperation({ summary: 'Get field definition by key' })
  async getFieldByKey(@Req() req: any, @Param('fieldKey') fieldKey: string) {
    const tenantId = req.user?.tenantId || 'default';
    return await this.profileFieldService.getFieldDefinitionByKey(tenantId, fieldKey);
  }

  @Post()
  @ApiOperation({ summary: 'Create new field definition' })
  async createField(@Req() req: any, @Body() dto: CreateProfileFieldDefinitionDto) {
    const tenantId = req.user?.tenantId || 'default';
    const userId = req.user?.id || req.user?.sub;
    return await this.profileFieldService.createFieldDefinition(tenantId, dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update field definition' })
  async updateField(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProfileFieldDefinitionDto,
  ) {
    const tenantId = req.user?.tenantId || 'default';
    const userId = req.user?.id || req.user?.sub;
    return await this.profileFieldService.updateFieldDefinition(tenantId, id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete field definition' })
  async deleteField(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || 'default';
    await this.profileFieldService.deleteFieldDefinition(tenantId, id);
  }

  // ============ Field Options ============

  @Get(':fieldId/options')
  @ApiOperation({ summary: 'Get all options for a field' })
  async getFieldOptions(@Req() req: any, @Param('fieldId') fieldId: string) {
    const tenantId = req.user?.tenantId || 'default';
    return await this.profileFieldService.getFieldOptions(tenantId, fieldId);
  }

  @Get('options/:optionId')
  @ApiOperation({ summary: 'Get option by ID' })
  async getOptionById(@Req() req: any, @Param('optionId') optionId: string) {
    const tenantId = req.user?.tenantId || 'default';
    return await this.profileFieldService.getOptionById(tenantId, optionId);
  }

  @Post('options')
  @ApiOperation({ summary: 'Create new field option' })
  async createOption(@Req() req: any, @Body() dto: CreateProfileFieldOptionDto) {
    const tenantId = req.user?.tenantId || 'default';
    const userId = req.user?.id || req.user?.sub;
    return await this.profileFieldService.createFieldOption(tenantId, dto, userId);
  }

  @Put('options/:optionId')
  @ApiOperation({ summary: 'Update field option' })
  async updateOption(
    @Req() req: any,
    @Param('optionId') optionId: string,
    @Body() dto: UpdateProfileFieldOptionDto,
  ) {
    const tenantId = req.user?.tenantId || 'default';
    const userId = req.user?.id || req.user?.sub;
    return await this.profileFieldService.updateFieldOption(tenantId, optionId, dto, userId);
  }

  @Delete('options/:optionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete field option' })
  async deleteOption(@Req() req: any, @Param('optionId') optionId: string) {
    const tenantId = req.user?.tenantId || 'default';
    await this.profileFieldService.deleteFieldOption(tenantId, optionId);
  }

  @Post(':fieldId/options/reorder')
  @ApiOperation({ summary: 'Bulk update options order' })
  async reorderOptions(
    @Req() req: any,
    @Param('fieldId') fieldId: string,
    @Body() dto: BulkUpdateOptionsOrderDto,
  ) {
    const tenantId = req.user?.tenantId || 'default';
    return await this.profileFieldService.bulkUpdateOptionsOrder(tenantId, fieldId, dto);
  }

  @Post('options/:optionId/duplicate')
  @ApiOperation({ summary: 'Duplicate an option' })
  async duplicateOption(@Req() req: any, @Param('optionId') optionId: string) {
    const tenantId = req.user?.tenantId || 'default';
    const userId = req.user?.id || req.user?.sub;
    return await this.profileFieldService.duplicateFieldOption(tenantId, optionId, userId);
  }

  @Post('seed-system-fields')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed system fields (Gender, Marital Status, etc.)' })
  async seedSystemFields(@Req() req: any) {
    const tenantId = req.user?.tenantId || 'default';
    await this.profileFieldService.seedSystemFields(tenantId);
    return { message: 'System fields seeded successfully' };
  }
}
