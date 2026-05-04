import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Attendance, AttendanceStatus, CheckType } from './entities/attendance.entity';
import { CreateAttendanceDto, UpdateAttendanceDto, CheckInOutDto, AttendanceQueryDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    // Check if attendance already exists for this employee on this date
    const existing = await this.attendanceRepository.findOne({
      where: {
        employeeId: createAttendanceDto.employeeId,
        date: new Date(createAttendanceDto.date),
      },
    });

    if (existing) {
      throw new ConflictException('Attendance record already exists for this date');
    }

    const attendance = this.attendanceRepository.create(createAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async findAll(query: AttendanceQueryDto): Promise<{
    data: Attendance[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { startDate, endDate, employeeId, status, page = 1, limit = 10 } = query;

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee');

    if (startDate && endDate) {
      queryBuilder.andWhere('attendance.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('attendance.date >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('attendance.date <= :endDate', { endDate });
    }

    if (employeeId) {
      queryBuilder.andWhere('attendance.employeeId = :employeeId', { employeeId });
    }

    if (status) {
      queryBuilder.andWhere('attendance.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy('attendance.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async findByEmployeeAndDate(employeeId: string, date: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: {
        employeeId,
        date: new Date(date),
      },
      relations: ['employee'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, updateAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async checkInOut(checkInOutDto: CheckInOutDto): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];
    const { employeeId, type, latitude, longitude, deviceInfo } = checkInOutDto;

    let attendance = await this.attendanceRepository.findOne({
      where: {
        employeeId,
        date: new Date(today),
      },
    });

    const currentTime = new Date().toTimeString().split(' ')[0];

    if (type === CheckType.CHECK_IN) {
      if (attendance && attendance.checkInTime) {
        throw new ConflictException('Already checked in today');
      }

      if (!attendance) {
        attendance = this.attendanceRepository.create({
          employeeId,
          date: new Date(today),
          checkInTime: currentTime,
          status: AttendanceStatus.PRESENT,
          latitude,
          longitude,
          deviceInfo,
        });
      } else {
        attendance.checkInTime = currentTime;
        attendance.status = AttendanceStatus.PRESENT;
        attendance.latitude = latitude;
        attendance.longitude = longitude;
        attendance.deviceInfo = deviceInfo;
      }
    } else {
      // CHECK_OUT
      if (!attendance) {
        throw new BadRequestException('No check-in record found for today');
      }

      if (!attendance.checkInTime) {
        throw new BadRequestException('Must check in before checking out');
      }

      if (attendance.checkOutTime) {
        throw new ConflictException('Already checked out today');
      }

      attendance.checkOutTime = currentTime;

      // Calculate work hours
      const checkIn = new Date(`1970-01-01T${attendance.checkInTime}`);
      const checkOut = new Date(`1970-01-01T${currentTime}`);
      const diffMs = checkOut.getTime() - checkIn.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      attendance.workHours = Math.round(hours * 100) / 100;

      // Calculate overtime (assuming 8 hours standard)
      if (hours > 8) {
        attendance.overtimeHours = Math.round((hours - 8) * 100) / 100;
      }
    }

    return this.attendanceRepository.save(attendance);
  }

  async getAttendanceSummary(employeeId: string, month: number, year: number): Promise<{
    totalDays: number;
    present: number;
    absent: number;
    halfDay: number;
    late: number;
    onLeave: number;
    totalWorkHours: number;
    totalOvertimeHours: number;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await this.attendanceRepository.find({
      where: {
        employeeId,
        date: Between(startDate, endDate),
      },
    });

    const summary = {
      totalDays: attendances.length,
      present: 0,
      absent: 0,
      halfDay: 0,
      late: 0,
      onLeave: 0,
      totalWorkHours: 0,
      totalOvertimeHours: 0,
    };

    attendances.forEach((att) => {
      switch (att.status) {
        case AttendanceStatus.PRESENT:
          summary.present++;
          break;
        case AttendanceStatus.ABSENT:
          summary.absent++;
          break;
        case AttendanceStatus.HALF_DAY:
          summary.halfDay++;
          break;
        case AttendanceStatus.LATE:
          summary.late++;
          break;
        case AttendanceStatus.ON_LEAVE:
          summary.onLeave++;
          break;
      }

      summary.totalWorkHours += Number(att.workHours) || 0;
      summary.totalOvertimeHours += Number(att.overtimeHours) || 0;
    });

    return summary;
  }

  async bulkCreate(attendances: CreateAttendanceDto[]): Promise<Attendance[]> {
    const created = this.attendanceRepository.create(attendances);
    return this.attendanceRepository.save(created);
  }

  async approveAttendance(id: string, approvedBy: string): Promise<Attendance> {
    const attendance = await this.findOne(id);
    attendance.approvedBy = approvedBy;
    attendance.approvedAt = new Date();
    return this.attendanceRepository.save(attendance);
  }
}
