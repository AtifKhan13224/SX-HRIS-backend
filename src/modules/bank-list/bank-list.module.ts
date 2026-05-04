import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  BankMaster,
  BankBranch,
  CompanyBankAccount,
  BankAuditLog,
} from './entities/bank-master.entity';
import {
  CountryBankingRules,
  BankValidationLog,
} from './entities/country-banking-rules.entity';

// Services
import { BankService } from './services/bank.service';

// Controllers
import { BankController } from './controllers/bank.controller';

/**
 * BANK LIST MODULE
 * Enterprise-grade banking and payroll account management
 * 
 * Features:
 * - Global bank master with country-specific validation
 * - Bank branch management
 * - Company payroll bank accounts
 * - WPS, SEPA, ACH, SWIFT integration support
 * - IBAN validation and compliance
 * - Complete audit trail
 * - Country-specific banking rules engine
 * 
 * Supports:
 * - Multi-country operations
 * - Multi-company/legal entity structures
 * - Multiple bank accounts per entity
 * - Effective dating for retroactive payroll
 * - Comprehensive validation and compliance
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Bank Master entities
      BankMaster,
      BankBranch,
      CompanyBankAccount,
      BankAuditLog,
      // Country compliance entities
      CountryBankingRules,
      BankValidationLog,
    ]),
  ],
  controllers: [BankController],
  providers: [BankService],
  exports: [BankService], // Export for use in other modules (e.g., Payroll)
})
export class BankListModule {}
