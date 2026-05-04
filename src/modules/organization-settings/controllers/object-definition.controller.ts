import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ObjectDefinitionService } from '../services/object-definition.service';
import {
  SaveObjectDefinitionDto,
  UpdateFieldStatusDto,
  ObjectDefinitionDto,
} from '../dto/object-definition.dto';

@ApiTags('Object Definitions')
@Controller('object-definitions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ObjectDefinitionController {
  constructor(private readonly objectDefinitionService: ObjectDefinitionService) {}

  /**
   * Get all configured object types
   */
  @Get('configured')
  @ApiOperation({
    summary: 'Get all configured object types',
    description: 'Returns a list of all object types that have been configured',
  })
  @ApiResponse({
    status: 200,
    description: 'List of configured object types',
    type: [String],
  })
  async getConfiguredObjects(): Promise<string[]> {
    return this.objectDefinitionService.getConfiguredObjects();
  }

  /**
   * Get object definition by type
   */
  @Get(':objectType')
  @ApiOperation({
    summary: 'Get object definition configuration',
    description: 'Retrieves the complete object definition configuration for a specific object type',
  })
  @ApiParam({
    name: 'objectType',
    description: 'Object type (e.g., company-profile, group-company, business-unit)',
    example: 'company-profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Object definition retrieved successfully',
    type: ObjectDefinitionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Object definition not found',
  })
  async getObjectDefinition(@Param('objectType') objectType: string): Promise<any> {
    return this.objectDefinitionService.getObjectDefinition(objectType);
  }

  /**
   * Get configuration metadata
   */
  @Get(':objectType/metadata')
  @ApiOperation({
    summary: 'Get configuration metadata',
    description: 'Retrieves metadata about the object definition configuration',
  })
  @ApiParam({
    name: 'objectType',
    description: 'Object type',
    example: 'company-profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Metadata retrieved successfully',
  })
  async getConfigurationMetadata(@Param('objectType') objectType: string): Promise<any> {
    return this.objectDefinitionService.getConfigurationMetadata(objectType);
  }

  /**
   * Get enabled fields only
   */
  @Get(':objectType/enabled-fields')
  @ApiOperation({
    summary: 'Get enabled fields for an object type',
    description: 'Returns only the fields that are enabled and visible for use in forms',
  })
  @ApiParam({
    name: 'objectType',
    description: 'Object type',
    example: 'company-profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Enabled fields retrieved successfully',
  })
  async getEnabledFields(@Param('objectType') objectType: string): Promise<any[]> {
    return this.objectDefinitionService.getEnabledFields(objectType);
  }

  /**
   * Save object definition
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Save object definition configuration',
    description: 'Creates or updates an object definition configuration',
  })
  @ApiBody({
    type: SaveObjectDefinitionDto,
    description: 'Object definition configuration to save',
  })
  @ApiResponse({
    status: 200,
    description: 'Object definition saved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration data',
  })
  async saveObjectDefinition(@Body() dto: SaveObjectDefinitionDto): Promise<any> {
    return this.objectDefinitionService.saveObjectDefinition(dto);
  }

  /**
   * Update field visibility
   */
  @Put(':objectType/fields/:fieldId/visibility')
  @ApiOperation({
    summary: 'Update field visibility',
    description: 'Toggles the visibility of a specific field',
  })
  @ApiParam({ name: 'objectType', description: 'Object type' })
  @ApiParam({ name: 'fieldId', description: 'Field ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        visible: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Field visibility updated successfully',
  })
  async updateFieldVisibility(
    @Param('objectType') objectType: string,
    @Param('fieldId') fieldId: string,
    @Body('visible') visible: boolean,
  ): Promise<any> {
    return this.objectDefinitionService.updateFieldVisibility(objectType, fieldId, visible);
  }

  /**
   * Update field enabled status
   */
  @Put(':objectType/fields/:fieldId/enabled')
  @ApiOperation({
    summary: 'Update field enabled status',
    description: 'Enables or disables a specific field',
  })
  @ApiParam({ name: 'objectType', description: 'Object type' })
  @ApiParam({ name: 'fieldId', description: 'Field ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Field enabled status updated successfully',
  })
  async updateFieldEnabled(
    @Param('objectType') objectType: string,
    @Param('fieldId') fieldId: string,
    @Body('enabled') enabled: boolean,
  ): Promise<any> {
    return this.objectDefinitionService.updateFieldEnabled(objectType, fieldId, enabled);
  }

  /**
   * Update field required status
   */
  @Put(':objectType/fields/:fieldId/required')
  @ApiOperation({
    summary: 'Update field required status',
    description: 'Marks a field as required or optional',
  })
  @ApiParam({ name: 'objectType', description: 'Object type' })
  @ApiParam({ name: 'fieldId', description: 'Field ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        required: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Field required status updated successfully',
  })
  async updateFieldRequired(
    @Param('objectType') objectType: string,
    @Param('fieldId') fieldId: string,
    @Body('required') required: boolean,
  ): Promise<any> {
    return this.objectDefinitionService.updateFieldRequired(objectType, fieldId, required);
  }

  /**
   * Export object definition
   */
  @Get(':objectType/export')
  @ApiOperation({
    summary: 'Export object definition',
    description: 'Exports the object definition configuration as JSON',
  })
  @ApiParam({ name: 'objectType', description: 'Object type' })
  @ApiResponse({
    status: 200,
    description: 'Object definition exported successfully',
  })
  async exportObjectDefinition(@Param('objectType') objectType: string): Promise<any> {
    return this.objectDefinitionService.exportObjectDefinition(objectType);
  }

  /**
   * Import object definition
   */
  @Post(':objectType/import')
  @ApiOperation({
    summary: 'Import object definition',
    description: 'Imports an object definition configuration from JSON',
  })
  @ApiParam({ name: 'objectType', description: 'Object type' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        definition: { type: 'object', description: 'Complete object definition structure' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Object definition imported successfully',
  })
  async importObjectDefinition(
    @Param('objectType') objectType: string,
    @Body() data: any,
  ): Promise<any> {
    return this.objectDefinitionService.importObjectDefinition(objectType, data);
  }

  /**
   * Reset object definition to default
   */
  @Delete(':objectType/reset')
  @ApiOperation({
    summary: 'Reset object definition to default',
    description: 'Deletes the custom configuration and reverts to default settings',
  })
  @ApiParam({ name: 'objectType', description: 'Object type' })
  @ApiResponse({
    status: 200,
    description: 'Object definition reset successfully',
  })
  async resetObjectDefinition(@Param('objectType') objectType: string): Promise<any> {
    return this.objectDefinitionService.resetObjectDefinition(objectType);
  }
}
