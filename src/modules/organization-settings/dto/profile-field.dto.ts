import { IsString, IsBoolean, IsOptional, IsArray, IsObject, IsInt, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileFieldDefinitionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  fieldKey: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  fieldName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty()
  @IsString()
  @IsEnum(['single_select', 'multi_select', 'text', 'number', 'date', 'boolean'])
  fieldType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  validationRules?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  uiConfig?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  translations?: any;
}

export class UpdateProfileFieldDefinitionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fieldName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  validationRules?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  uiConfig?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  translations?: any;
}

export class CreateProfileFieldOptionDto {
  @ApiProperty()
  @IsString()
  fieldDefinitionId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  displayValue: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  alias?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  applicableFor?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  translations?: any;
}

export class UpdateProfileFieldOptionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  applicableFor?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  translations?: any;
}

export class BulkUpdateOptionsOrderDto {
  @ApiProperty()
  @IsArray()
  options: Array<{
    id: string;
    sortOrder: number;
  }>;
}

export class QueryProfileFieldsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
