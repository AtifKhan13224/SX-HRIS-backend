import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BankPolicyMaster,
  BankPolicySchedule,
  BankPolicyException,
  BankPolicyAuditLog,
  CountryPolicyTemplate,
} from './entities/bank-policy.entity';
import { BankPolicyService } from './services/bank-policy.service';
import { BankPolicyController } from './controllers/bank-policy.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BankPolicyMaster,
      BankPolicySchedule,
      BankPolicyException,
      BankPolicyAuditLog,
      CountryPolicyTemplate,
    ]),
  ],
  controllers: [BankPolicyController],
  providers: [BankPolicyService],
  exports: [BankPolicyService], // Export for use in Payroll and Employee modules
})
export class BankPolicyModule {}
