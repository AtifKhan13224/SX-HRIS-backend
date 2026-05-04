import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  CheckInOutDto,
  AttendanceQueryDto,
} from './dto/attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create attendance record' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records with filters' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findAll(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Get('employee/:employeeId/date/:date')
  @ApiOperation({ summary: 'Get attendance by employee and date' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  findByEmployeeAndDate(
    @Param('employeeId') employeeId: string,
    @Param('date') date: string,
  ) {
    return this.attendanceService.findByEmployeeAndDate(employeeId, date);
  }

  @Post('check')
  @ApiOperation({ summary: 'Check in or check out' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  checkInOut(@Body() checkInOutDto: CheckInOutDto) {
    return this.attendanceService.checkInOut(checkInOutDto);
  }

  @Get('summary/:employeeId')
  @ApiOperation({ summary: 'Get attendance summary for an employee' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  getAttendanceSummary(
    @Param('employeeId') employeeId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.attendanceService.getAttendanceSummary(employeeId, month, year);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attendance record' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve attendance record' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  approveAttendance(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.attendanceService.approveAttendance(id, approvedBy);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create attendance records' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  bulkCreate(@Body() attendances: CreateAttendanceDto[]) {
    return this.attendanceService.bulkCreate(attendances);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attendance record' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
