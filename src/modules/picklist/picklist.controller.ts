import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PicklistService } from './picklist.service';
import {
  CreatePicklistDto,
  UpdatePicklistDto,
  CreatePicklistValueDto,
  UpdatePicklistValueDto,
  PicklistFilterDto,
  CreatePicklistDependencyDto,
  CreatePicklistVersionDto,
  BulkPicklistOperationDto,
  ReorderPicklistValuesDto,
  ExportPicklistDto,
  ImportPicklistDto,
  PicklistAnalyticsQueryDto,
  ValidatePicklistDto,
  ValidatePicklistValuesDto,
} from './dto/picklist.dto';

@ApiTags('Picklists')
@Controller('picklists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PicklistController {
  constructor(private readonly picklistService: PicklistService) {}

  // ==================== PICKLIST CRUD ====================

  @Get()
  @ApiOperation({
    summary: 'Get all picklists',
    description: 'Retrieve all picklists with filtering, searching, and pagination',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name/description' })
  @ApiQuery({ name: 'type', required: false, enum: ['standard', 'custom', 'system'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'draft', 'deprecated'] })
  @ApiQuery({ name: 'isHierarchical', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({ status: 200, description: 'Picklists retrieved successfully' })
  async findAll(@Query() filter: PicklistFilterDto) {
    return this.picklistService.findAll(filter);
  }

  @Get('initialize-standard')
  @ApiOperation({
    summary: 'Initialize standard picklists',
    description: 'Create predefined standard picklists (Country, Employment Type)',
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Standard picklists initialized' })
  async initializeStandard(@Request() req) {
    return this.picklistService.initializeStandardPicklists(req.user.userId || 'system');
  }

  @Get('by-name/:name')
  @ApiOperation({
    summary: 'Get picklist by internal name',
    description: 'Retrieve a specific picklist by its internal name',
  })
  @ApiParam({ name: 'name', description: 'Internal name of the picklist', example: 'country' })
  @ApiResponse({ status: 200, description: 'Picklist found' })
  @ApiResponse({ status: 404, description: 'Picklist not found' })
  async findByName(@Param('name') name: string) {
    return this.picklistService.findByName(name);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get picklist by ID',
    description: 'Retrieve a specific picklist with all its values and relationships',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @ApiResponse({ status: 200, description: 'Picklist found' })
  @ApiResponse({ status: 404, description: 'Picklist not found' })
  async findOne(@Param('id') id: string) {
    return this.picklistService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new picklist',
    description: 'Create a new picklist with optional initial values',
  })
  @ApiBody({ type: CreatePicklistDto })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Picklist created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Picklist with this name already exists' })
  async create(@Body() createDto: CreatePicklistDto, @Request() req) {
    return this.picklistService.create(createDto, req.user.userId || 'system');
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update picklist',
    description: 'Update picklist configuration (not the values)',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @ApiBody({ type: UpdatePicklistDto })
  @ApiResponse({ status: 200, description: 'Picklist updated successfully' })
  @ApiResponse({ status: 404, description: 'Picklist not found' })
  @ApiResponse({ status: 400, description: 'System picklists cannot be modified' })
  async update(@Param('id') id: string, @Body() updateDto: UpdatePicklistDto, @Request() req) {
    return this.picklistService.update(id, updateDto, req.user.userId || 'system');
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete picklist',
    description: 'Delete a picklist (cannot delete system picklists or picklists in use)',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Picklist deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete picklist' })
  @ApiResponse({ status: 404, description: 'Picklist not found' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.picklistService.remove(id, req.user.userId || 'system');
  }

  // ==================== PICKLIST VALUES ====================

  @Get(':id/values')
  @ApiOperation({
    summary: 'Get picklist values',
    description: 'Retrieve all values for a specific picklist',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @ApiQuery({ name: 'parentValue', required: false, description: 'Filter by parent value (for hierarchical)' })
  @ApiResponse({ status: 200, description: 'Values retrieved successfully' })
  async getValues(@Param('id') id: string, @Query('parentValue') parentValue?: string) {
    return this.picklistService.getValues(id, parentValue);
  }

  @Post(':id/values')
  @ApiOperation({
    summary: 'Add value to picklist',
    description: 'Add a new value to an existing picklist',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @ApiBody({ type: CreatePicklistValueDto })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Value added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or max values reached' })
  @ApiResponse({ status: 409, description: 'Value already exists' })
  async addValue(
    @Param('id') id: string,
    @Body() createValueDto: CreatePicklistValueDto,
    @Request() req,
  ) {
    return this.picklistService.addValue(id, createValueDto, req.user.userId || 'system');
  }

  @Put(':id/values/:valueId')
  @ApiOperation({
    summary: 'Update picklist value',
    description: 'Update an existing value in a picklist',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @ApiParam({ name: 'valueId', description: 'Value UUID' })
  @ApiBody({ type: UpdatePicklistValueDto })
  @ApiResponse({ status: 200, description: 'Value updated successfully' })
  @ApiResponse({ status: 404, description: 'Value not found' })
  async updateValue(
    @Param('id') id: string,
    @Param('valueId') valueId: string,
    @Body() updateValueDto: UpdatePicklistValueDto,
    @Request() req,
  ) {
    return this.picklistService.updateValue(id, valueId, updateValueDto, req.user.userId || 'system');
  }

  @Delete(':id/values/:valueId')
  @ApiOperation({
    summary: 'Delete picklist value',
    description: 'Delete a value from a picklist (cannot delete if in use)',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @ApiParam({ name: 'valueId', description: 'Value UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Value deleted successfully' })
  @ApiResponse({ status: 400, description: 'Value is in use' })
  @ApiResponse({ status: 404, description: 'Value not found' })
  async deleteValue(
    @Param('id') id: string,
    @Param('valueId') valueId: string,
    @Request() req,
  ) {
    await this.picklistService.deleteValue(id, valueId, req.user.userId || 'system');
  }

  @Post(':id/values/reorder')
  @ApiOperation({
    summary: 'Reorder picklist values',
    description: 'Change the display order of picklist values',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @ApiBody({ type: ReorderPicklistValuesDto })
  @ApiResponse({ status: 200, description: 'Values reordered successfully' })
  async reorderValues(
    @Param('id') id: string,
    @Body() reorderDto: ReorderPicklistValuesDto,
    @Request() req,
  ) {
    return this.picklistService.reorderValues(id, reorderDto, req.user.userId || 'system');
  }

  // ==================== DEPENDENCIES ====================

  @Get(':id/dependencies')
  @ApiOperation({
    summary: 'Get picklist dependencies',
    description: 'Retrieve all parent-child relationships for a picklist',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @ApiResponse({ status: 200, description: 'Dependencies retrieved successfully' })
  async getDependencies(@Param('id') id: string) {
    return this.picklistService.getDependencies(id);
  }

  @Post('dependencies')
  @ApiOperation({
    summary: 'Create picklist dependency',
    description: 'Create a parent-child relationship between two picklists',
  })
  @ApiBody({ type: CreatePicklistDependencyDto })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Dependency created successfully' })
  @ApiResponse({ status: 409, description: 'Dependency already exists' })
  async createDependency(@Body() createDto: CreatePicklistDependencyDto, @Request() req) {
    return this.picklistService.createDependency(createDto, req.user.userId || 'system');
  }

  @Delete('dependencies/:id')
  @ApiOperation({
    summary: 'Delete picklist dependency',
    description: 'Remove a parent-child relationship',
  })
  @ApiParam({ name: 'id', description: 'Dependency UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Dependency deleted successfully' })
  async deleteDependency(@Param('id') id: string) {
    await this.picklistService.deleteDependency(id);
  }

  // ==================== VERSIONING ====================

  @Post('versions')
  @ApiOperation({
    summary: 'Create picklist version',
    description: 'Create a snapshot version of a picklist',
  })
  @ApiBody({ type: CreatePicklistVersionDto })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Version created successfully' })
  async createVersion(@Body() createDto: CreatePicklistVersionDto, @Request() req) {
    return this.picklistService.createVersion(createDto, req.user.userId || 'system');
  }

  @Get(':id/versions')
  @ApiOperation({
    summary: 'Get picklist versions',
    description: 'Retrieve version history for a picklist',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @ApiResponse({ status: 200, description: 'Versions retrieved successfully' })
  async getVersions(@Param('id') id: string) {
    return this.picklistService.getVersions(id);
  }

  // ==================== ANALYTICS ====================

  @Post('analytics')
  @ApiOperation({
    summary: 'Get picklist analytics',
    description: 'Retrieve usage statistics and analytics for a picklist',
  })
  @ApiBody({ type: PicklistAnalyticsQueryDto })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(@Body() query: PicklistAnalyticsQueryDto) {
    return this.picklistService.getAnalytics(query);
  }

  // ==================== EXPORT/IMPORT ====================

  @Post('export')
  @ApiOperation({
    summary: 'Export picklist',
    description: 'Export picklist data in JSON or CSV format',
  })
  @ApiBody({ type: ExportPicklistDto })
  @ApiResponse({ status: 200, description: 'Picklist exported successfully' })
  async exportPicklist(@Body() exportDto: ExportPicklistDto) {
    return this.picklistService.exportPicklist(exportDto);
  }

  @Post('import')
  @ApiOperation({
    summary: 'Import picklist',
    description: 'Import picklist data from JSON or CSV',
  })
  @ApiBody({ type: ImportPicklistDto })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Picklist imported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid import data' })
  @ApiResponse({ status: 409, description: 'Picklist already exists (use overwrite)' })
  async importPicklist(@Body() importDto: ImportPicklistDto, @Request() req) {
    return this.picklistService.importPicklist(importDto, req.user.userId || 'system');
  }

  // ==================== BULK OPERATIONS ====================

  @Post('bulk-operation')
  @ApiOperation({
    summary: 'Bulk picklist operation',
    description: 'Perform bulk operations on multiple picklists (activate, deactivate, delete, export)',
  })
  @ApiBody({ type: BulkPicklistOperationDto })
  @ApiResponse({ status: 200, description: 'Bulk operation completed' })
  async bulkOperation(@Body() operationDto: BulkPicklistOperationDto, @Request() req) {
    return this.picklistService.bulkOperation(operationDto, req.user.userId || 'system');
  }

  // ==================== VALIDATION ====================

  @Post('validate')
  @ApiOperation({
    summary: 'Validate picklist value',
    description: 'Check if a value is valid for a specific picklist',
  })
  @ApiBody({ type: ValidatePicklistDto })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateValue(@Body() validateDto: ValidatePicklistDto) {
    return this.picklistService.validateValue(validateDto);
  }

  @Post('validate-multiple')
  @ApiOperation({
    summary: 'Validate multiple picklist values',
    description: 'Check if multiple values are valid for a specific picklist',
  })
  @ApiBody({ type: ValidatePicklistValuesDto })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateValues(@Body() validateDto: ValidatePicklistValuesDto) {
    return this.picklistService.validateValues(validateDto);
  }

  // ==================== USAGE TRACKING ====================

  @Post(':id/usage')
  @ApiOperation({
    summary: 'Log picklist usage',
    description: 'Track when a picklist value is used',
  })
  @ApiParam({ name: 'id', description: 'Picklist UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        valueId: { type: 'string', description: 'Value UUID' },
        fieldName: { type: 'string', description: 'Field where value was used' },
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Usage logged successfully' })
  async logUsage(
    @Param('id') id: string,
    @Body() body: { valueId: string; fieldName: string },
    @Request() req,
  ) {
    await this.picklistService.logUsage(
      id,
      body.valueId,
      body.fieldName,
      req.user.userId || 'system',
    );
  }
}
