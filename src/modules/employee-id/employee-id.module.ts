import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EmployeeIDPolicy,
  EmployeeIDSequence,
  EmployeeIDReservation,
  EmployeeIDAssignment,
  EmployeeIDAuditLog,
  EmployeeIDToken,
} from './entities/employee-id.entity';
import { EmployeeIDService } from './services/employee-id.service';
import { EmployeeIDController } from './controllers/employee-id.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeIDPolicy,
      EmployeeIDSequence,
      EmployeeIDReservation,
      EmployeeIDAssignment,
      EmployeeIDAuditLog,
      EmployeeIDToken,
    ]),
  ],
  controllers: [EmployeeIDController],
  providers: [EmployeeIDService],
  exports: [EmployeeIDService],
})
export class EmployeeIDModule {}
