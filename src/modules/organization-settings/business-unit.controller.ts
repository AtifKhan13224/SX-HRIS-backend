import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { BusinessUnitService } from './business-unit.service';
import { CreateBusinessUnitDto } from './dto/create-business-unit.dto';
import { UpdateBusinessUnitDto } from './dto/update-business-unit.dto';

@Controller('business-units')
export class BusinessUnitController {
  constructor(private readonly businessUnitService: BusinessUnitService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('parentGroupCompanyId') parentGroupCompanyId?: string,
  ) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.businessUnitService.findAll(search, isActiveBool, parentGroupCompanyId);
  }

  @Get('stats')
  async getStats() {
    return this.businessUnitService.getStats();
  }

  @Get('by-parent/:parentGroupCompanyId')
  async getByParentCompany(@Param('parentGroupCompanyId') parentGroupCompanyId: string) {
    return this.businessUnitService.getByParentCompany(parentGroupCompanyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.businessUnitService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateBusinessUnitDto) {
    return this.businessUnitService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBusinessUnitDto,
  ) {
    return this.businessUnitService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.businessUnitService.remove(id);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return this.businessUnitService.toggleStatus(id);
  }

  @Patch(':id/toggle-auto-numbering')
  async toggleAutoNumbering(@Param('id') id: string) {
    return this.businessUnitService.toggleAutoNumbering(id);
  }
}
