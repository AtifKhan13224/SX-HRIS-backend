import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { DivisionService } from './division.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';

@Controller('divisions')
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('parentBusinessUnitId') parentBusinessUnitId?: string,
  ) {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return await this.divisionService.findAll(search, isActiveBoolean, parentBusinessUnitId);
  }

  @Get('stats')
  async getStats() {
    return await this.divisionService.getStats();
  }

  @Get('by-business-unit/:businessUnitId')
  async getByParentBusinessUnit(@Param('businessUnitId') businessUnitId: string) {
    return await this.divisionService.getByParentBusinessUnit(businessUnitId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.divisionService.findOne(id);
  }

  @Post()
  async create(@Body() createDivisionDto: CreateDivisionDto) {
    return await this.divisionService.create(createDivisionDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDivisionDto: UpdateDivisionDto) {
    return await this.divisionService.update(id, updateDivisionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.divisionService.remove(id);
    return { message: 'Division deleted successfully' };
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return await this.divisionService.toggleStatus(id);
  }

  @Patch(':id/toggle-auto-numbering')
  async toggleAutoNumbering(@Param('id') id: string) {
    return await this.divisionService.toggleAutoNumbering(id);
  }

  @Patch(':id/toggle-strategic')
  async toggleStrategic(@Param('id') id: string) {
    return await this.divisionService.toggleStrategic(id);
  }
}
