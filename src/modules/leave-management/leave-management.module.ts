import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveManagementService } from './leave-management.service';
import { LeaveManagementController } from './leave-management.controller';
import { LeaveRequest, LeaveBalance, LeavePolicy } from './entities/leave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, LeaveBalance, LeavePolicy])],
  controllers: [LeaveManagementController],
  providers: [LeaveManagementService],
  exports: [LeaveManagementService],
})
export class LeaveManagementModule {}
