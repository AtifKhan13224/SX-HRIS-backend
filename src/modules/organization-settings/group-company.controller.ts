import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GroupCompanyService } from './group-company.service';
import { CreateGroupCompanyDto } from './dto/create-group-company.dto';
import { UpdateGroupCompanyDto } from './dto/update-group-company.dto';

@Controller('group-companies')
export class GroupCompanyController {
  constructor(private readonly groupCompanyService: GroupCompanyService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.groupCompanyService.findAll(search, isActiveBool);
  }

  @Get('stats')
  async getStats() {
    return this.groupCompanyService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.groupCompanyService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateGroupCompanyDto) {
    return this.groupCompanyService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGroupCompanyDto,
  ) {
    return this.groupCompanyService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.groupCompanyService.remove(id);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return this.groupCompanyService.toggleStatus(id);
  }

  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    const base64Data = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
    return this.groupCompanyService.uploadLogo(id, dataUrl);
  }

  @Delete(':id/logo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLogo(@Param('id') id: string) {
    await this.groupCompanyService.deleteLogo(id);
  }
}
