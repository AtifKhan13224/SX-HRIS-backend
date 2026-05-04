import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import {
  BankMaster,
  BankBranch,
  CompanyBankAccount,
  BankAuditLog,
  BankStatus,
} from '../entities/bank-master.entity';
import {
  CountryBankingRules,
  BankValidationLog,
} from '../entities/country-banking-rules.entity';
import {
  CreateBankMasterDto,
  UpdateBankMasterDto,
  CreateBankBranchDto,
  UpdateBankBranchDto,
  CreateCompanyBankAccountDto,
  UpdateCompanyBankAccountDto,
  BankMasterQueryDto,
  ValidateBankAccountDto,
  ValidateIBANDto,
} from '../dto/bank.dto';

/**
 * BANK SERVICE
 * Enterprise-grade banking service with comprehensive validation and audit
 */
@Injectable()
export class BankService {
  constructor(
    @InjectRepository(BankMaster)
    private readonly bankMasterRepository: Repository<BankMaster>,

    @InjectRepository(BankBranch)
    private readonly bankBranchRepository: Repository<BankBranch>,

    @InjectRepository(CompanyBankAccount)
    private readonly companyBankAccountRepository: Repository<CompanyBankAccount>,

    @InjectRepository(BankAuditLog)
    private readonly bankAuditLogRepository: Repository<BankAuditLog>,

    @InjectRepository(CountryBankingRules)
    private readonly countryBankingRulesRepository: Repository<CountryBankingRules>,

    @InjectRepository(BankValidationLog)
    private readonly bankValidationLogRepository: Repository<BankValidationLog>,
  ) {}

  // ============================================================================
  // BANK MASTER OPERATIONS
  // ============================================================================

  /**
   * Create a new bank in the master list
   */
  async createBank(dto: CreateBankMasterDto): Promise<BankMaster> {
    // Check for duplicate bank code within the same country
    const existingBank = await this.bankMasterRepository.findOne({
      where: {
        tenantId: dto.tenantId,
        countryId: dto.countryId,
        bankCode: dto.bankCode,
      },
    });

    if (existingBank) {
      throw new ConflictException(
        `Bank with code ${dto.bankCode} already exists for this country`,
      );
    }

    // Check for duplicate SWIFT code if provided
    if (dto.swiftCode) {
      const swiftExists = await this.bankMasterRepository.findOne({
        where: { swiftCode: dto.swiftCode },
      });

      if (swiftExists) {
        throw new ConflictException(
          `Bank with SWIFT code ${dto.swiftCode} already exists`,
        );
      }
    }

    // Validate against country banking rules
    const countryRules = await this.getCountryBankingRules(dto.countryCode);
    if (countryRules) {
      this.validateBankAgainstCountryRules(dto, countryRules);
    }

    // Create bank
    const bank = this.bankMasterRepository.create({
      ...dto,
      isActive: true,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
    });

    const savedBank = await this.bankMasterRepository.save(bank);

    // Audit log
    await this.createAuditLog({
      tenantId: dto.tenantId,
      entityType: 'BANK_MASTER',
      entityId: savedBank.id,
      action: 'CREATE',
      newValues: savedBank,
      performedBy: dto.createdBy,
      performedByName: 'System User',
    });

    return savedBank;
  }

  /**
   * Update an existing bank
   */
  async updateBank(
    id: string,
    dto: UpdateBankMasterDto,
  ): Promise<BankMaster> {
    const bank = await this.bankMasterRepository.findOne({ where: { id } });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    const oldValues = { ...bank };

    // Update fields
    Object.assign(bank, {
      ...dto,
      updatedBy: dto.updatedBy,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : bank.effectiveTo,
    });

    const updatedBank = await this.bankMasterRepository.save(bank);

    // Audit log
    await this.createAuditLog({
      tenantId: bank.tenantId,
      entityType: 'BANK_MASTER',
      entityId: bank.id,
      action: 'UPDATE',
      oldValues,
      newValues: updatedBank,
      performedBy: dto.updatedBy,
      performedByName: 'System User',
    });

    return updatedBank;
  }

  /**
   * Get bank by ID with relationships
   */
  async getBankById(id: string): Promise<BankMaster> {
    const bank = await this.bankMasterRepository.findOne({
      where: { id },
      relations: ['branches', 'companyAccounts'],
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    return bank;
  }

  /**
   * Get all banks with filtering and pagination
   */
  async getBanks(query: BankMasterQueryDto): Promise<{
    data: BankMaster[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      tenantId,
      countryCode,
      status,
      isActive = true,
      search,
      page = 1,
      limit = 20,
    } = query;

    const queryBuilder = this.bankMasterRepository.createQueryBuilder('bank');

    // Apply filters
    if (tenantId) {
      queryBuilder.andWhere('bank.tenantId = :tenantId', { tenantId });
    }

    if (countryCode) {
      queryBuilder.andWhere('bank.countryCode = :countryCode', { countryCode });
    }

    if (status) {
      queryBuilder.andWhere('bank.status = :status', { status });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('bank.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(bank.bankName ILIKE :search OR bank.bankCode ILIKE :search OR bank.swiftCode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by
    queryBuilder.orderBy('bank.bankName', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get banks by country
   */
  async getBanksByCountry(
    tenantId: string,
    countryCode: string,
    activeOnly: boolean = true,
  ): Promise<BankMaster[]> {
    const where: any = { tenantId, countryCode };

    if (activeOnly) {
      where.isActive = true;
      where.status = BankStatus.ACTIVE;
    }

    return this.bankMasterRepository.find({
      where,
      order: { bankName: 'ASC' },
    });
  }

  /**
   * Activate/Deactivate bank
   */
  async toggleBankStatus(
    id: string,
    isActive: boolean,
    userId: string,
  ): Promise<BankMaster> {
    const bank = await this.getBankById(id);

    bank.isActive = isActive;
    bank.updatedBy = userId;

    const updatedBank = await this.bankMasterRepository.save(bank);

    await this.createAuditLog({
      tenantId: bank.tenantId,
      entityType: 'BANK_MASTER',
      entityId: bank.id,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
      performedBy: userId,
      performedByName: 'System User',
    });

    return updatedBank;
  }

  /**
   * Delete bank (soft delete by marking as inactive)
   */
  async deleteBank(id: string, userId: string): Promise<void> {
    const bank = await this.getBankById(id);

    // Check if bank is being used in company accounts
    const accountsCount = await this.companyBankAccountRepository.count({
      where: { bankId: id },
    });

    if (accountsCount > 0) {
      throw new BadRequestException(
        `Cannot delete bank. It is being used by ${accountsCount} company account(s)`,
      );
    }

    bank.isActive = false;
    bank.status = BankStatus.CLOSED;
    bank.effectiveTo = new Date();
    bank.updatedBy = userId;

    await this.bankMasterRepository.save(bank);

    await this.createAuditLog({
      tenantId: bank.tenantId,
      entityType: 'BANK_MASTER',
      entityId: bank.id,
      action: 'DELETE',
      performedBy: userId,
      performedByName: 'System User',
    });
  }

  // ============================================================================
  // BANK BRANCH OPERATIONS
  // ============================================================================

  /**
   * Create a new bank branch
   */
  async createBranch(dto: CreateBankBranchDto): Promise<BankBranch> {
    // Verify bank exists
    const bank = await this.getBankById(dto.bankId);

    // Check for duplicate branch code
    const existingBranch = await this.bankBranchRepository.findOne({
      where: {
        bankId: dto.bankId,
        branchCode: dto.branchCode,
      },
    });

    if (existingBranch) {
      throw new ConflictException(
        `Branch with code ${dto.branchCode} already exists for this bank`,
      );
    }

    const branch = this.bankBranchRepository.create({
      ...dto,
      isActive: true,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
    });

    const savedBranch = await this.bankBranchRepository.save(branch);

    await this.createAuditLog({
      tenantId: dto.tenantId,
      entityType: 'BANK_BRANCH',
      entityId: savedBranch.id,
      action: 'CREATE',
      newValues: savedBranch,
      performedBy: dto.createdBy,
      performedByName: 'System User',
    });

    return savedBranch;
  }

  /**
   * Update bank branch
   */
  async updateBranch(
    id: string,
    dto: UpdateBankBranchDto,
  ): Promise<BankBranch> {
    const branch = await this.bankBranchRepository.findOne({ where: { id } });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    const oldValues = { ...branch };

    Object.assign(branch, {
      ...dto,
      updatedBy: dto.updatedBy,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : branch.effectiveTo,
    });

    const updatedBranch = await this.bankBranchRepository.save(branch);

    await this.createAuditLog({
      tenantId: branch.tenantId,
      entityType: 'BANK_BRANCH',
      entityId: branch.id,
      action: 'UPDATE',
      oldValues,
      newValues: updatedBranch,
      performedBy: dto.updatedBy,
      performedByName: 'System User',
    });

    return updatedBranch;
  }

  /**
   * Get branches by bank
   */
  async getBranchesByBank(
    bankId: string,
    activeOnly: boolean = true,
  ): Promise<BankBranch[]> {
    const where: any = { bankId };

    if (activeOnly) {
      where.isActive = true;
    }

    return this.bankBranchRepository.find({
      where,
      order: { branchName: 'ASC' },
    });
  }

  /**
   * Get branch by IFSC code (India-specific)
   */
  async getBranchByIFSC(ifscCode: string): Promise<BankBranch> {
    const branch = await this.bankBranchRepository.findOne({
      where: { ifscCode },
      relations: ['bank'],
    });

    if (!branch) {
      throw new NotFoundException(`Branch with IFSC code ${ifscCode} not found`);
    }

    return branch;
  }

  // ============================================================================
  // COMPANY BANK ACCOUNT OPERATIONS
  // ============================================================================

  /**
   * Create company bank account
   */
  async createCompanyAccount(
    dto: CreateCompanyBankAccountDto,
  ): Promise<CompanyBankAccount> {
    // Verify bank exists
    await this.getBankById(dto.bankId);

    // Verify branch if provided
    if (dto.branchId) {
      const branch = await this.bankBranchRepository.findOne({
        where: { id: dto.branchId },
      });

      if (!branch) {
        throw new NotFoundException(`Branch with ID ${dto.branchId} not found`);
      }
    }

    // Validate account details
    const bank = await this.getBankById(dto.bankId);
    await this.validateCompanyBankAccount(dto, bank);

    // Check for duplicate account number
    const existingAccount = await this.companyBankAccountRepository.findOne({
      where: {
        tenantId: dto.tenantId,
        legalEntityId: dto.legalEntityId,
        bankId: dto.bankId,
        accountNumber: dto.accountNumber,
      },
    });

    if (existingAccount) {
      throw new ConflictException(
        `Account number ${dto.accountNumber} already exists for this legal entity and bank`,
      );
    }

    // Handle primary payroll account logic
    if (dto.isPrimaryPayrollAccount) {
      // Unset any existing primary account for this legal entity
      await this.companyBankAccountRepository.update(
        {
          tenantId: dto.tenantId,
          legalEntityId: dto.legalEntityId,
          isPrimaryPayrollAccount: true,
        },
        { isPrimaryPayrollAccount: false },
      );
    }

    const account = this.companyBankAccountRepository.create({
      ...dto,
      isActive: true,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
    });

    const savedAccount = await this.companyBankAccountRepository.save(account);

    await this.createAuditLog({
      tenantId: dto.tenantId,
      entityType: 'COMPANY_ACCOUNT',
      entityId: savedAccount.id,
      action: 'CREATE',
      newValues: savedAccount,
      performedBy: dto.createdBy,
      performedByName: 'System User',
    });

    return savedAccount;
  }

  /**
   * Update company bank account
   */
  async updateCompanyAccount(
    id: string,
    dto: UpdateCompanyBankAccountDto,
  ): Promise<CompanyBankAccount> {
    const account = await this.companyBankAccountRepository.findOne({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException(`Company account with ID ${id} not found`);
    }

    const oldValues = { ...account };

    // Handle primary payroll account logic
    if (dto.isPrimaryPayrollAccount === true) {
      await this.companyBankAccountRepository.update(
        {
          tenantId: account.tenantId,
          legalEntityId: account.legalEntityId,
          isPrimaryPayrollAccount: true,
        },
        { isPrimaryPayrollAccount: false },
      );
    }

    Object.assign(account, {
      ...dto,
      updatedBy: dto.updatedBy,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : account.effectiveTo,
    });

    const updatedAccount = await this.companyBankAccountRepository.save(account);

    await this.createAuditLog({
      tenantId: account.tenantId,
      entityType: 'COMPANY_ACCOUNT',
      entityId: account.id,
      action: 'UPDATE',
      oldValues,
      newValues: updatedAccount,
      performedBy: dto.updatedBy,
      performedByName: 'System User',
    });

    return updatedAccount;
  }

  /**
   * Get company accounts by legal entity
   */
  async getCompanyAccountsByLegalEntity(
    tenantId: string,
    legalEntityId: string,
    activeOnly: boolean = true,
  ): Promise<CompanyBankAccount[]> {
    const where: any = { tenantId, legalEntityId };

    if (activeOnly) {
      where.isActive = true;
    }

    return this.companyBankAccountRepository.find({
      where,
      relations: ['bank', 'branch'],
      order: { isPrimaryPayrollAccount: 'DESC', accountName: 'ASC' },
    });
  }

  /**
   * Get primary payroll account
   */
  async getPrimaryPayrollAccount(
    tenantId: string,
    legalEntityId: string,
  ): Promise<CompanyBankAccount> {
    const account = await this.companyBankAccountRepository.findOne({
      where: {
        tenantId,
        legalEntityId,
        isPrimaryPayrollAccount: true,
        isActive: true,
      },
      relations: ['bank', 'branch'],
    });

    if (!account) {
      throw new NotFoundException(
        `No primary payroll account found for legal entity ${legalEntityId}`,
      );
    }

    return account;
  }

  // ============================================================================
  // VALIDATION OPERATIONS
  // ============================================================================

  /**
   * Validate bank account details against country rules
   */
  async validateBankAccount(
    dto: ValidateBankAccountDto,
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get country banking rules
    const countryRules = await this.getCountryBankingRules(dto.countryCode);

    if (!countryRules) {
      warnings.push(`No validation rules found for country ${dto.countryCode}`);
      return { isValid: true, errors, warnings };
    }

    // Validate account number format
    if (countryRules.accountNumberFormat) {
      const regex = new RegExp(countryRules.accountNumberFormat);
      if (!regex.test(dto.accountNumber)) {
        errors.push(
          `Invalid account number format. Expected: ${countryRules.accountNumberExample}`,
        );
      }
    }

    // Validate account number length
    if (
      dto.accountNumber.length < countryRules.accountNumberMinLength ||
      dto.accountNumber.length > countryRules.accountNumberMaxLength
    ) {
      errors.push(
        `Account number length must be between ${countryRules.accountNumberMinLength} and ${countryRules.accountNumberMaxLength} characters`,
      );
    }

    // Validate IBAN if required
    if (countryRules.ibanRequired && !dto.iban) {
      errors.push('IBAN is required for this country');
    }

    if (dto.iban) {
      const ibanValidation = this.validateIBAN(dto.iban);
      if (!ibanValidation.isValid) {
        errors.push(...ibanValidation.errors);
      }
    }

    // Validate branch code if required
    if (countryRules.branchCodeRequired && !dto.branchCode) {
      errors.push('Branch code is required for this country');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate IBAN
   */
  validateIBAN(iban: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();

    // Check format
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIban)) {
      errors.push('Invalid IBAN format');
      return { isValid: false, errors };
    }

    // Check length (between 15 and 34 characters)
    if (cleanIban.length < 15 || cleanIban.length > 34) {
      errors.push('IBAN length must be between 15 and 34 characters');
      return { isValid: false, errors };
    }

    // MOD-97 checksum validation
    const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
    const numericIban = rearranged.replace(/[A-Z]/g, (char) =>
      (char.charCodeAt(0) - 55).toString(),
    );

    // Calculate mod 97
    let remainder = numericIban;
    while (remainder.length > 2) {
      const block = remainder.slice(0, 9);
      remainder = (parseInt(block, 10) % 97) + remainder.slice(block.length);
    }

    if (parseInt(remainder, 10) % 97 !== 1) {
      errors.push('IBAN checksum validation failed');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get country banking rules
   */
  async getCountryBankingRules(
    countryCode: string,
  ): Promise<CountryBankingRules | null> {
    return this.countryBankingRulesRepository.findOne({
      where: { countryCode, isActive: true },
    });
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Validate bank details against country rules
   */
  private validateBankAgainstCountryRules(
    dto: CreateBankMasterDto,
    rules: CountryBankingRules,
  ): void {
    // Bank code format validation
    if (rules.bankCodeFormat) {
      const regex = new RegExp(rules.bankCodeFormat);
      if (!regex.test(dto.bankCode)) {
        throw new BadRequestException(
          `Invalid bank code format. Expected format: ${rules.bankCodeExample}`,
        );
      }
    }

    // SWIFT code requirement
    if (rules.swiftCodeRequired && !dto.swiftCode) {
      throw new BadRequestException('SWIFT code is required for this country');
    }

    // IBAN requirement
    if (rules.ibanRequired && !dto.ibanPrefix) {
      throw new BadRequestException(
        'IBAN prefix is required for banks in this country',
      );
    }
  }

  /**
   * Validate company bank account details
   */
  private async validateCompanyBankAccount(
    dto: CreateCompanyBankAccountDto,
    bank: BankMaster,
  ): Promise<void> {
    // Validate account number format against bank rules
    if (bank.accountNumberFormat) {
      const regex = new RegExp(bank.accountNumberFormat);
      if (!regex.test(dto.accountNumber)) {
        throw new BadRequestException(
          `Invalid account number format for this bank`,
        );
      }
    }

    // Validate account number length
    if (
      bank.accountNumberMinLength &&
      dto.accountNumber.length < bank.accountNumberMinLength
    ) {
      throw new BadRequestException(
        `Account number must be at least ${bank.accountNumberMinLength} characters`,
      );
    }

    if (
      bank.accountNumberMaxLength &&
      dto.accountNumber.length > bank.accountNumberMaxLength
    ) {
      throw new BadRequestException(
        `Account number must not exceed ${bank.accountNumberMaxLength} characters`,
      );
    }

    // Validate IBAN if required
    if (bank.ibanRequired && !dto.iban) {
      throw new BadRequestException('IBAN is required for this bank');
    }

    // Validate branch if required
    if (bank.branchCodeRequired && !dto.branchId) {
      throw new BadRequestException('Branch is required for this bank');
    }
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(data: {
    tenantId: string;
    entityType: string;
    entityId: string;
    action: string;
    oldValues?: any;
    newValues?: any;
    performedBy: string;
    performedByName: string;
  }): Promise<void> {
    const changedFields = [];

    if (data.oldValues && data.newValues) {
      // Detect changed fields
      for (const key of Object.keys(data.newValues)) {
        if (data.oldValues[key] !== data.newValues[key]) {
          changedFields.push(key);
        }
      }
    }

    const auditLog = this.bankAuditLogRepository.create({
      ...data,
      changedFields,
    });

    await this.bankAuditLogRepository.save(auditLog);
  }

  /**
   * Get audit history for an entity
   */
  async getAuditHistory(
    entityType: string,
    entityId: string,
  ): Promise<BankAuditLog[]> {
    return this.bankAuditLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }
}
