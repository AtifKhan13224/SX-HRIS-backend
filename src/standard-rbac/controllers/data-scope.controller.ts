import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { DataScopeResolutionEngine } from '../services/data-scope-resolution.engine';
import { DataScopeService } from '../services/data-scope.service';
import { CreateDataScopeDto, UpdateDataScopeDto, ResolveScopeDto } from '../dto/data-scope.dto';
import { ScopeType } from '../entities/data-scope-config.entity';

@Controller('api/rbac/data-scopes')
export class DataScopeController {
  constructor(
    private readonly dataScopeEngine: DataScopeResolutionEngine,
    private readonly dataScopeService: DataScopeService,
  ) {}

  // ========== CRUD Operations ==========

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createScope(
    @Body() createDto: CreateDataScopeDto,
    @Query('createdBy') createdBy: string
  ): Promise<any> {
    return this.dataScopeService.createScope(createDto, createdBy);
  }

  @Get()
  async getAllScopes(
    @Query('scopeType') scopeType?: ScopeType,
    @Query('tenantId') tenantId?: string,
    @Query('isActive') isActive?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('isHierarchical') isHierarchical?: string
  ): Promise<any> {
    const filters: any = {};
    if (scopeType) filters.scopeType = scopeType;
    if (tenantId) filters.tenantId = tenantId;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (searchTerm) filters.searchTerm = searchTerm;
    if (isHierarchical !== undefined) filters.isHierarchical = isHierarchical === 'true';

    return this.dataScopeService.findAll(filters);
  }

  @Get('statistics')
  async getStatistics(): Promise<any> {
    return this.dataScopeService.getStatistics();
  }

  @Get('templates')
  async getTemplates(): Promise<any> {
    return this.dataScopeService.getTemplates();
  }

  @Get('type/:scopeType')
  async getScopesByType(@Param('scopeType') scopeType: ScopeType): Promise<any> {
    return this.dataScopeService.getScopesByType(scopeType);
  }

  @Get('hierarchical')
  async getHierarchicalScopes(): Promise<any> {
    return this.dataScopeService.getHierarchicalScopes();
  }

  @Get('layered')
  async getLayeredScopes(): Promise<any> {
    return this.dataScopeService.getLayeredScopes();
  }

  @Get('dynamic')
  async getDynamicScopes(): Promise<any> {
    return this.dataScopeService.getDynamicScopes();
  }

  @Get(':id')
  async getScopeById(@Param('id') id: string): Promise<any> {
    return this.dataScopeService.findById(id);
  }

  @Get('code/:code')
  async getScopeByCode(@Param('code') code: string): Promise<any> {
    return this.dataScopeService.findByCode(code);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateScope(
    @Param('id') id: string,
    @Body() updateDto: UpdateDataScopeDto,
    @Query('modifiedBy') modifiedBy: string
  ): Promise<any> {
    return this.dataScopeService.updateScope(id, updateDto, modifiedBy);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteScope(
    @Param('id') id: string,
    @Query('deletedBy') deletedBy: string,
    @Query('hard') hard?: string
  ): Promise<void> {
    if (hard === 'true') {
      return this.dataScopeService.hardDeleteScope(id, deletedBy);
    } else {
      return this.dataScopeService.deleteScope(id, deletedBy);
    }
  }

  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  async cloneScope(
    @Param('id') id: string,
    @Body() body: { newScopeCode: string; newScopeName: string; clonedBy: string }
  ): Promise<any> {
    return this.dataScopeService.cloneScope(id, body.newScopeCode, body.newScopeName, body.clonedBy);
  }

  @Post('bulk-update-status')
  @HttpCode(HttpStatus.OK)
  async bulkUpdateStatus(
    @Body() body: { scopeIds: string[]; isActive: boolean; modifiedBy: string }
  ): Promise<any> {
    return this.dataScopeService.bulkUpdateStatus(body.scopeIds, body.isActive, body.modifiedBy);
  }

  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  async validateScopeConfig(@Param('id') id: string): Promise<any> {
    return this.dataScopeService.validateScopeConfig(id);
  }

  // ========== Resolution & Access Operations ==========

  @Post('resolve')
  @HttpCode(HttpStatus.OK)
  async resolveScope(@Body() resolveDto: ResolveScopeDto): Promise<any> {
    return this.dataScopeEngine.resolveScope(
      resolveDto.scopeConfigId,
      resolveDto.userId,
      resolveDto.context
    );
  }

  @Post('check-access')
  @HttpCode(HttpStatus.OK)
  async checkAccess(
    @Body() body: {
      scopeConfigId: string;
      userId: string;
      entityId: string;
      context?: Record<string, any>;
    }
  ): Promise<{ hasAccess: boolean }> {
    const hasAccess = await this.dataScopeEngine.hasAccessToEntity(
      body.scopeConfigId,
      body.userId,
      body.entityId,
      body.context
    );
    return { hasAccess };
  }

  @Post('get-filter')
  @HttpCode(HttpStatus.OK)
  async getScopeFilter(
    @Body() body: {
      scopeConfigId: string;
      userId: string;
      context?: Record<string, any>;
    }
  ): Promise<any> {
    return this.dataScopeEngine.getScopeFilter(
      body.scopeConfigId,
      body.userId,
      body.context
    );
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateScope(@Body() body: { scopeConfigId: string; userId: string }): Promise<any> {
    try {
      const resolved = await this.dataScopeEngine.resolveScope(body.scopeConfigId, body.userId);
      return {
        valid: true,
        resolvedValues: resolved.allowedValues.length,
        isUnrestricted: resolved.isUnrestricted,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}
