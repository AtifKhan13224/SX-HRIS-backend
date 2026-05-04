import { IsString, IsEnum, IsBoolean, IsOptional, IsArray, IsNumber, IsObject } from 'class-validator';
import { ScopeType, ScopeLogic } from '../entities/data-scope-config.entity';

export class CreateDataScopeDto {
  @IsString()
  scopeCode: string;

  @IsString()
  scopeName: string;

  @IsOptional()
  @IsString()
  scopeDescription?: string;

  @IsEnum(ScopeType)
  scopeType: ScopeType;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsBoolean()
  isHierarchical: boolean;

  @IsBoolean()
  includeChildren: boolean;

  @IsOptional()
  @IsNumber()
  hierarchyDepth?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopeValues?: string[];

  @IsEnum(ScopeLogic)
  scopeLogic: ScopeLogic;

  @IsOptional()
  @IsArray()
  layeredScopes?: Array<{
    scopeType: ScopeType;
    scopeValues: string[];
    logic: ScopeLogic;
  }>;

  @IsBoolean()
  dynamicResolution: boolean;

  @IsOptional()
  @IsString()
  resolutionRule?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsObject()
  reportingLineConfig?: {
    directReports: boolean;
    indirectReports: boolean;
    maxLevels: number;
    includeMatrix: boolean;
  };

  @IsOptional()
  @IsObject()
  geographicScope?: {
    countries: string[];
    regions: string[];
    includeSubRegions: boolean;
  };

  @IsOptional()
  @IsObject()
  temporalScope?: {
    allowHistorical: boolean;
    allowFuture: boolean;
    maxHistoricalDays: number;
    maxFutureDays: number;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsString()
  createdBy: string;
}

export class UpdateDataScopeDto {
  @IsOptional()
  @IsString()
  scopeName?: string;

  @IsOptional()
  @IsString()
  scopeDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isHierarchical?: boolean;

  @IsOptional()
  @IsBoolean()
  includeChildren?: boolean;

  @IsOptional()
  @IsNumber()
  hierarchyDepth?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopeValues?: string[];

  @IsOptional()
  @IsEnum(ScopeLogic)
  scopeLogic?: ScopeLogic;

  @IsOptional()
  @IsArray()
  layeredScopes?: Array<{
    scopeType: ScopeType;
    scopeValues: string[];
    logic: ScopeLogic;
  }>;

  @IsOptional()
  @IsBoolean()
  dynamicResolution?: boolean;

  @IsOptional()
  @IsString()
  resolutionRule?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsObject()
  reportingLineConfig?: {
    directReports: boolean;
    indirectReports: boolean;
    maxLevels: number;
    includeMatrix: boolean;
  };

  @IsOptional()
  @IsObject()
  geographicScope?: {
    countries: string[];
    regions: string[];
    includeSubRegions: boolean;
  };

  @IsOptional()
  @IsObject()
  temporalScope?: {
    allowHistorical: boolean;
    allowFuture: boolean;
    maxHistoricalDays: number;
    maxFutureDays: number;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ResolveScopeDto {
  @IsString()
  scopeConfigId: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}
