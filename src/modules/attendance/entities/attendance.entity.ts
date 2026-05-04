import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  HALF_DAY = 'half_day',
  LATE = 'late',
  ON_LEAVE = 'on_leave',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
}

export enum CheckType {
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
}

@Entity('attendances')
@Index(['employeeId', 'date'])
@Index(['date'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true, name: 'check_in_time' })
  checkInTime: string;

  @Column({ type: 'time', nullable: true, name: 'check_out_time' })
  checkOutTime: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'work_hours' })
  workHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'overtime_hours' })
  overtimeHours: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ name: 'is_manual', default: false })
  isManual: boolean;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true, name: 'device_info' })
  deviceInfo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
