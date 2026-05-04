import { IsObject, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrgViewSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  coreConfig?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  visibilityRules?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  hierarchyConfig?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  searchConfig?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  filterTemplates?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  filterGroups?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  searchableFields?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  performanceConfig?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  cachingConfig?: any;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class SearchAnalyticsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  limit?: number;
}
