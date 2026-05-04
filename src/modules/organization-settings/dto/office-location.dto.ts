import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, Min, Max, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOfficeLocationDto {
  @IsString()
  groupCompanyId: string;

  @IsString()
  officeCode: string;

  @IsString()
  officeName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  officeType?: string;

  @IsString()
  address: string;

  // All other fields as optional
  [key: string]: any;
}

export class UpdateOfficeLocationDto extends PartialType(CreateOfficeLocationDto) {}

export class CreateWorkLocationDto {
  @IsString()
  groupCompanyId: string;

  @IsString()
  locationCode: string;

  @IsString()
  locationName: string;

  @IsString()
  locationType: string;

  @IsString()
  @IsOptional()
  workArrangement?: string;

  [key: string]: any;
}

export class UpdateWorkLocationDto extends PartialType(CreateWorkLocationDto) {}

export class CreateLocationHierarchyDto {
  @IsString()
  groupCompanyId: string;

  @IsString()
  hierarchyCode: string;

  @IsString()
  hierarchyName: string;

  @IsString()
  locationType: string;

  @IsString()
  locationId: string;

  @IsString()
  locationName: string;

  [key: string]: any;
}

export class UpdateLocationHierarchyDto extends PartialType(CreateLocationHierarchyDto) {}
