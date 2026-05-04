import {
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PayrollStatus, PaymentMethod } from '../entities/payroll.entity';

export class CreatePayrollDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Pay period start date', example: '2026-02-01' })
  @IsDateString()
  payPeriodStart: string;

  @ApiProperty({ description: 'Pay period end date', example: '2026-02-28' })
  @IsDateString()
  payPeriodEnd: string;

  @ApiProperty({ description: 'Payroll date', example: '2026-03-05' })
  @IsDateString()
  payrollDate: string;

  @ApiProperty({ description: 'Basic salary' })
  @IsNumber()
  @Min(0)
  basicSalary: number;

  @ApiProperty({ description: 'Allowances', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  allowances?: number;

  @ApiProperty({ description: 'Bonuses', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bonuses?: number;

  @ApiProperty({ description: 'Overtime pay', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  overtimePay?: number;

  @ApiProperty({ description: 'Deductions', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deductions?: number;

  @ApiProperty({ description: 'Tax amount', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ description: 'Allowances breakdown', required: false })
  @IsOptional()
  @IsObject()
  allowancesBreakdown?: Record<string, number>;

  @ApiProperty({ description: 'Deductions breakdown', required: false })
  @IsOptional()
  @IsObject()
  deductionsBreakdown?: Record<string, number>;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePayrollDto extends PartialType(CreatePayrollDto) {}

export class ProcessPayrollDto {
  @ApiProperty({ description: 'Processed by user ID' })
  @IsString()
  processedBy: string;

  @ApiProperty({ description: 'Payment reference', required: false })
  @IsOptional()
  @IsString()
  paymentReference?: string;
}

export class ApprovePayrollDto {
  @ApiProperty({ description: 'Approver ID' })
  @IsString()
  approvedBy: string;
}

export class PayrollQueryDto {
  @ApiProperty({ description: 'Employee ID', required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ enum: PayrollStatus, required: false })
  @IsOptional()
  @IsEnum(PayrollStatus)
  status?: PayrollStatus;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreatePayrollComponentDto {
  @ApiProperty({ description: 'Component name' })
  @IsString()
  componentName: string;

  @ApiProperty({ description: 'Component code' })
  @IsString()
  componentCode: string;

  @ApiProperty({ enum: ['earning', 'deduction'] })
  @IsEnum(['earning', 'deduction'])
  type: string;

  @ApiProperty({ description: 'Is taxable', default: false })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiProperty({ description: 'Is fixed amount', default: false })
  @IsOptional()
  @IsBoolean()
  isFixed?: boolean;

  @ApiProperty({ description: 'Fixed amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedAmount?: number;

  @ApiProperty({ description: 'Percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage?: number;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePayrollComponentDto extends PartialType(CreatePayrollComponentDto) {}

export class CreateEmployeeSalaryStructureDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Effective from date', example: '2026-02-01' })
  @IsDateString()
  effectiveFrom: string;

  @ApiProperty({ description: 'Effective to date', required: false })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiProperty({ description: 'Basic salary' })
  @IsNumber()
  @Min(0)
  basicSalary: number;

  @ApiProperty({ description: 'Salary components', required: false })
  @IsOptional()
  @IsObject()
  salaryComponents?: Record<string, number>;

  @ApiProperty({ description: 'Total CTC' })
  @IsNumber()
  @Min(0)
  totalCTC: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateEmployeeSalaryStructureDto extends PartialType(CreateEmployeeSalaryStructureDto) {}
