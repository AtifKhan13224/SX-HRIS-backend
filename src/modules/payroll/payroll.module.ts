import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { Payroll, PayrollComponent, EmployeeSalaryStructure } from './entities/payroll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll, PayrollComponent, EmployeeSalaryStructure])],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
