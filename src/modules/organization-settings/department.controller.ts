import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  ParseUUIDPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('organization-settings/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('parentDivisionId') parentDivisionId?: string,
    @Query('parentDepartmentId') parentDepartmentId?: string,
  ) {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.departmentService.findAll(search, isActiveBoolean, parentDivisionId, parentDepartmentId);
  }

  @Get('stats')
  getStats() {
    return this.departmentService.getStats();
  }

  @Get('by-division/:divisionId')
  getByParentDivision(@Param('divisionId', ParseUUIDPipe) divisionId: string) {
    return this.departmentService.getByParentDivision(divisionId);
  }

  @Get('by-parent/:parentDepartmentId')
  getByParentDepartment(@Param('parentDepartmentId', ParseUUIDPipe) parentDepartmentId: string) {
    return this.departmentService.getByParentDepartment(parentDepartmentId);
  }

  @Get('top-level')
  getTopLevelDepartments() {
    return this.departmentService.getTopLevelDepartments();
  }

  @Get(':id/hierarchy')
  getDepartmentHierarchy(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.getDepartmentHierarchy(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.findOne(id);
  }

  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.remove(id);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.toggleStatus(id);
  }

  @Patch(':id/toggle-auto-numbering')
  toggleAutoNumbering(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.toggleAutoNumbering(id);
  }

  @Patch(':id/toggle-core')
  toggleCore(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.toggleCore(id);
  }
}
