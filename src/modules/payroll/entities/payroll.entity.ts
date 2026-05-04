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

export enum PayrollStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHEQUE = 'cheque',
  MOBILE_MONEY = 'mobile_money',
}

@Entity('payrolls')
@Index(['employeeId', 'payPeriodStart', 'payPeriodEnd'])
@Index(['status', 'payrollDate'])
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'date', name: 'pay_period_start' })
  payPeriodStart: Date;

  @Column({ type: 'date', name: 'pay_period_end' })
  payPeriodEnd: Date;

  @Column({ type: 'date', name: 'payroll_date' })
  payrollDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'basic_salary' })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  allowances: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bonuses: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'overtime_pay' })
  overtimePay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'gross_salary' })
  grossSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deductions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'tax_amount' })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'net_salary' })
  netSalary: number;

  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
  })
  status: PayrollStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
    name: 'payment_method',
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true, name: 'payment_reference' })
  paymentReference: string;

  @Column({ name: 'processed_by', nullable: true })
  processedBy: string;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'allowances_breakdown' })
  allowancesBreakdown: Record<string, number>;

  @Column({ type: 'jsonb', nullable: true, name: 'deductions_breakdown' })
  deductionsBreakdown: Record<string, number>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('payroll_components')
export class PayrollComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'component_name' })
  componentName: string;

  @Column({ name: 'component_code', unique: true })
  componentCode: string;

  @Column({
    type: 'enum',
    enum: ['earning', 'deduction'],
  })
  type: string;

  @Column({ name: 'is_taxable', default: false })
  isTaxable: boolean;

  @Column({ name: 'is_fixed', default: false })
  isFixed: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'fixed_amount' })
  fixedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('employee_salary_structures')
@Index(['employeeId', 'effectiveFrom'])
export class EmployeeSalaryStructure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'date', name: 'effective_from' })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true, name: 'effective_to' })
  effectiveTo: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'basic_salary' })
  basicSalary: number;

  @Column({ type: 'jsonb', nullable: true, name: 'salary_components' })
  salaryComponents: Record<string, number>;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_ctc' })
  totalCTC: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
