import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectConfigurationService } from '../services/project-configuration.service';

/**
 * PROJECT CONFIGURATION CONTROLLER
 * REST API for cross-cutting configuration operations
 * 
 * Endpoints: 9+ operations
 * - Version management
 * - Dependency tracking
 * - Audit logging
 * - Scope mapping
 */
@ApiTags('Project Configuration - Cross-Cutting Operations')
@Controller('project-management/configurations')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
@ApiBearerAuth()
export class ProjectConfigurationController {
  constructor(private readonly configService: ProjectConfigurationService) {}

  // VERSION MANAGEMENT ENDPOINTS

  @Post('versions')
  @ApiOperation({ summary: 'Create configuration version snapshot' })
  @ApiResponse({ status: 201, description: 'Version created successfully' })
  async createVersion(
    @Body() body: {
      configurationType: string;
      configurationId: string;
      versionNumber: number;
      changeType: string;
      changeDescription?: string;
      configurationSnapshot: any;
      changedFields?: any;
      effectiveFrom: Date;
      effectiveTo?: Date;
      changeReason?: string;
      approvedBy?: string;
      approvedAt?: Date;
    },
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.configService.createVersion({
      ...body,
      tenantId,
      changedBy: userId,
    });
  }

  @Get(':configType/:configId/versions')
  @ApiOperation({ summary: 'Get version history for configuration' })
  @ApiParam({ name: 'configType', description: 'Configuration type (project_type, lifecycle_template, etc.)' })
  @ApiParam({ name: 'configId', description: 'Configuration UUID' })
  @ApiResponse({ status: 200, description: 'Version history retrieved successfully' })
  async getVersionHistory(
    @Param('configType') configurationType: string,
    @Param('configId') configurationId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.configService.getVersionHistory(configurationType, configurationId, tenantId);
  }

  // ==========================================
  // DEPENDENCY TRACKING ENDPOINTS
  // ==========================================

  @Post('dependencies')
  @ApiOperation({ summary: 'Create configuration dependency relationship' })
  @ApiResponse({ status: 201, description: 'Dependency created successfully' })
  async createDependency(
    @Body() body: {
      sourceConfigType: string;
      sourceConfigId: string;
      dependentEntityType: string;
      dependentEntityId: string;
      dependentEntityName?: string;
      dependencyType?: string;
      isBlocking?: boolean;
      dependencyMetadata?: any;
    },
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.configService.createDependency({
      ...body,
      tenantId,
      createdBy: userId,
    });
  }

  @Get(':configType/:configId/dependencies')
  @ApiOperation({ summary: 'Check dependencies for configuration' })
  @ApiParam({ name: 'configType', description: 'Configuration type' })
  @ApiParam({ name: 'configId', description: 'Configuration UUID' })
  @ApiResponse({ status: 200, description: 'Dependencies retrieved successfully' })
  async checkDependencies(
    @Param('configType') configurationType: string,
    @Param('configId') configurationId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.configService.checkDependencies(configurationType, configurationId, tenantId);
  }

  @Delete('dependencies/:dependencyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove dependency relationship' })
  @ApiParam({ name: 'dependencyId', description: 'Dependency UUID' })
  @ApiResponse({ status: 204, description: 'Dependency removed successfully' })
  async removeDependency(
    @Param('dependencyId') dependencyId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    await this.configService.removeDependency(dependencyId, tenantId);
  }

  // ==========================================
  // AUDIT LOG ENDPOINTS
  // ==========================================

  @Get(':configType/:configId/audit-logs')
  @ApiOperation({ summary: 'Get audit log history for configuration' })
  @ApiParam({ name: 'configType', description: 'Configuration type' })
  @ApiParam({ name: 'configId', description: 'Configuration UUID' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getAuditLogs(
    @Param('configType') configurationType: string,
    @Param('configId') configurationId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.configService.getAuditLogs(configurationType, configurationId, tenantId);
  }

  // ==========================================
  // SCOPE MAPPING ENDPOINTS
  // ==========================================

  @Post('scopes')
  @ApiOperation({ summary: 'Create scope mapping for configuration' })
  @ApiResponse({ status: 201, description: 'Scope mapping created successfully' })
  async createScopeMapping(
    @Body() body: {
      configurationType: string;
      configurationId: string;
      scopeType: string;
      scopeEntityId: string;
      scopeEntityName?: string;
      isPrimary?: boolean;
      effectiveStartDate: Date;
      effectiveEndDate?: Date;
    },
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.configService.createScopeMapping({
      ...body,
      tenantId,
      createdBy: userId,
    });
  }

  @Get(':configType/:configId/scopes')
  @ApiOperation({ summary: 'Get scope mappings for configuration' })
  @ApiParam({ name: 'configType', description: 'Configuration type' })
  @ApiParam({ name: 'configId', description: 'Configuration UUID' })
  @ApiResponse({ status: 200, description: 'Scope mappings retrieved successfully' })
  async getScopeMappings(
    @Param('configType') configurationType: string,
    @Param('configId') configurationId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.configService.getScopeMappings(configurationType, configurationId, tenantId);
  }
}
