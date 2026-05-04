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

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  CASUAL = 'casual',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  UNPAID = 'unpaid',
  COMPENSATORY = 'compensatory',
  BEREAVEMENT = 'bereavement',
  STUDY = 'study',
  SABBATICAL = 'sabbatical',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('leave_requests')
@Index(['employeeId', 'status'])
@Index(['startDate', 'endDate'])
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  leaveType: LeaveType;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'total_days' })
  totalDays: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true, name: 'attachment_url' })
  attachmentUrl: string;

  @Column({ name: 'is_half_day', default: false })
  isHalfDay: boolean;

  @Column({ type: 'text', nullable: true, name: 'manager_notes' })
  managerNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('leave_balances')
@Index(['employeeId', 'leaveType'])
export class LeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  leaveType: LeaveType;

  @Column({ type: 'integer', default: 0 })
  year: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'total_allocated' })
  totalAllocated: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'used_leaves' })
  usedLeaves: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'pending_leaves' })
  pendingLeaves: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'available_leaves' })
  availableLeaves: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'carried_forward' })
  carriedForward: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('leave_policies')
export class LeavePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'policy_name' })
  policyName: string;

  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  leaveType: LeaveType;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'annual_allocation' })
  annualAllocation: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'max_carry_forward' })
  maxCarryForward: number;

  @Column({ type: 'integer', default: 0, name: 'min_notice_days' })
  minNoticeDays: number;

  @Column({ type: 'integer', default: 0, name: 'max_consecutive_days' })
  maxConsecutiveDays: number;

  @Column({ name: 'requires_approval', default: true })
  requiresApproval: boolean;

  @Column({ name: 'requires_attachment', default: false })
  requiresAttachment: boolean;

  @Column({ name: 'allow_half_day', default: false })
  allowHalfDay: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
