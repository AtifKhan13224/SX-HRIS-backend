import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OfficeLocationService, WorkLocationService, LocationHierarchyService } from '../services/office-location.service';
import { CreateOfficeLocationDto, UpdateOfficeLocationDto, CreateWorkLocationDto, UpdateWorkLocationDto, CreateLocationHierarchyDto, UpdateLocationHierarchyDto } from '../dto/office-location.dto';

@Controller('organization-settings/office-locations')
export class OfficeLocationController {
  constructor(private readonly service: OfficeLocationService) {}

  @Post()
  create(@Body() createDto: CreateOfficeLocationDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query('groupCompanyId') groupCompanyId?: string, @Query('search') search?: string) {
    return this.service.findAll(groupCompanyId, search);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.service.getStats(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateOfficeLocationDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

@Controller('organization-settings/work-locations')
export class WorkLocationController {
  constructor(private readonly service: WorkLocationService) {}

  @Post()
  create(@Body() createDto: CreateWorkLocationDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query('groupCompanyId') groupCompanyId?: string, @Query('search') search?: string) {
    return this.service.findAll(groupCompanyId, search);
  }

  @Get('stats')
  getStats(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.service.getStats(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateWorkLocationDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

@Controller('organization-settings/location-hierarchies')
export class LocationHierarchyController {
  constructor(private readonly service: LocationHierarchyService) {}

  @Post()
  create(@Body() createDto: CreateLocationHierarchyDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query('groupCompanyId') groupCompanyId?: string, @Query('locationType') locationType?: string) {
    return this.service.findAll(groupCompanyId, locationType);
  }

  @Get('tree')
  getTree(@Query('groupCompanyId') groupCompanyId?: string) {
    return this.service.getTree(groupCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateLocationHierarchyDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
