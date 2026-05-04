import { IsString, IsNotEmpty, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldDefinitionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  dataType: string;

  @ApiProperty()
  @IsNotEmpty()
  enabled: boolean;

  @ApiProperty()
  @IsNotEmpty()
  visible: boolean;

  @ApiProperty()
  @IsNotEmpty()
  required: boolean;

  @ApiProperty()
  order: number;

  @ApiPropertyOptional()
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional()
  @IsOptional()
  validation?: any;

  @ApiPropertyOptional()
  @IsOptional()
  permissions?: any;
}

export class BlockDefinitionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  visible: boolean;

  @ApiProperty()
  collapsible: boolean;

  @ApiProperty()
  defaultExpanded: boolean;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: [FieldDefinitionDto] })
  @ValidateNested({ each: true })
  @Type(() => FieldDefinitionDto)
  fields: FieldDefinitionDto[];
}

export class PortletDefinitionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiPropertyOptional()
  @IsOptional()
  icon?: string;

  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  visible: boolean;

  @ApiProperty()
  order: number;

  @ApiProperty()
  @IsString()
  layout: string;

  @ApiProperty({ type: [BlockDefinitionDto] })
  @ValidateNested({ each: true })
  @Type(() => BlockDefinitionDto)
  blocks: BlockDefinitionDto[];
}

export class ObjectDefinitionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  objectType: string;

  @ApiProperty()
  @IsString()
  objectName: string;

  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  version: number;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsString()
  updatedAt: string;

  @ApiProperty({ type: [PortletDefinitionDto] })
  @ValidateNested({ each: true })
  @Type(() => PortletDefinitionDto)
  portlets: PortletDefinitionDto[];
}

export class SaveObjectDefinitionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  objectType: string;

  @ApiProperty({ type: ObjectDefinitionDto })
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ObjectDefinitionDto)
  definition: ObjectDefinitionDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modifiedBy?: string;
}

export class UpdateFieldStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fieldId: string;

  @ApiPropertyOptional()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  visible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  required?: boolean;
}
