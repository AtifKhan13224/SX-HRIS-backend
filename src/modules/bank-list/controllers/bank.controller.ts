import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BankService } from '../services/bank.service';
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
 * BANK LIST CONTROLLER
 * Enterprise-grade REST API for banking operations
 * Supports: Bank Master, Branches, Company Accounts, Validation, Compliance
 */
@ApiTags('Bank Management')
@Controller('api/banks')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
@ApiBearerAuth()
export class BankController {
  constructor(private readonly bankService: BankService) {}

  // ============================================================================
  // BANK MASTER ENDPOINTS
  // ============================================================================

  @Post('master')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new bank in the master list',
    description:
      'Add a new bank to the global bank master with country-specific validation and compliance rules',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bank successfully created',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bank with the same code already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async createBank(@Body() dto: CreateBankMasterDto) {
    const bank = await this.bankService.createBank(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Bank created successfully',
      data: bank,
    };
  }

  @Get('master')
  @ApiOperation({
    summary: 'Get all banks with filtering and pagination',
    description:
      'Retrieve banks with advanced filtering, search, and pagination support',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banks retrieved successfully',
  })
  async getBanks(@Query() query: BankMasterQueryDto) {
    const result = await this.bankService.getBanks(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Banks retrieved successfully',
      ...result,
    };
  }

  @Get('master/:id')
  @ApiOperation({
    summary: 'Get bank by ID',
    description: 'Retrieve detailed bank information including branches and accounts',
  })
  @ApiParam({ name: 'id', description: 'Bank UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bank not found',
  })
  async getBankById(@Param('id') id: string) {
    const bank = await this.bankService.getBankById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Bank retrieved successfully',
      data: bank,
    };
  }

  @Put('master/:id')
  @ApiOperation({
    summary: 'Update bank details',
    description: 'Update existing bank information with audit trail',
  })
  @ApiParam({ name: 'id', description: 'Bank UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bank not found',
  })
  async updateBank(
    @Param('id') id: string,
    @Body() dto: UpdateBankMasterDto,
  ) {
    const bank = await this.bankService.updateBank(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Bank updated successfully',
      data: bank,
    };
  }

  @Patch('master/:id/status')
  @ApiOperation({
    summary: 'Toggle bank active status',
    description: 'Activate or deactivate a bank',
  })
  @ApiParam({ name: 'id', description: 'Bank UUID' })
  @ApiQuery({ name: 'isActive', type: Boolean })
  @ApiQuery({ name: 'userId', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank status updated successfully',
  })
  async toggleBankStatus(
    @Param('id') id: string,
    @Query('isActive') isActive: boolean,
    @Query('userId') userId: string,
  ) {
    const bank = await this.bankService.toggleBankStatus(id, isActive, userId);
    return {
      statusCode: HttpStatus.OK,
      message: `Bank ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: bank,
    };
  }

  @Delete('master/:id')
  @ApiOperation({
    summary: 'Delete bank (soft delete)',
    description:
      'Soft delete a bank by marking it as inactive. Cannot delete if in use.',
  })
  @ApiParam({ name: 'id', description: 'Bank UUID' })
  @ApiQuery({ name: 'userId', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bank is in use and cannot be deleted',
  })
  async deleteBank(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    await this.bankService.deleteBank(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Bank deleted successfully',
    };
  }

  @Get('master/country/:countryCode')
  @ApiOperation({
    summary: 'Get banks by country',
    description: 'Retrieve all banks for a specific country',
  })
  @ApiParam({ name: 'countryCode', description: 'ISO 3166-1 alpha-3 country code' })
  @ApiQuery({ name: 'tenantId', type: String })
  @ApiQuery({ name: 'activeOnly', type: Boolean, required: false, description: 'Filter by active banks only (default: true)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Banks retrieved successfully',
  })
  async getBanksByCountry(
    @Param('countryCode') countryCode: string,
    @Query('tenantId') tenantId: string,
    @Query('activeOnly') activeOnly: boolean = true,
  ) {
    const banks = await this.bankService.getBanksByCountry(
      tenantId,
      countryCode,
      activeOnly,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Banks retrieved successfully',
      data: banks,
      count: banks.length,
    };
  }

  // ============================================================================
  // BANK BRANCH ENDPOINTS
  // ============================================================================

  @Post('branches')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new bank branch',
    description:
      'Add a new branch for a bank (required for countries like India with branch-specific codes)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Branch created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Branch with the same code already exists',
  })
  async createBranch(@Body() dto: CreateBankBranchDto) {
    const branch = await this.bankService.createBranch(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Branch created successfully',
      data: branch,
    };
  }

  @Put('branches/:id')
  @ApiOperation({
    summary: 'Update bank branch',
    description: 'Update existing branch information',
  })
  @ApiParam({ name: 'id', description: 'Branch UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Branch updated successfully',
  })
  async updateBranch(
    @Param('id') id: string,
    @Body() dto: UpdateBankBranchDto,
  ) {
    const branch = await this.bankService.updateBranch(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch updated successfully',
      data: branch,
    };
  }

  @Get('branches/bank/:bankId')
  @ApiOperation({
    summary: 'Get all branches for a bank',
    description: 'Retrieve all branches associated with a specific bank',
  })
  @ApiParam({ name: 'bankId', description: 'Bank UUID' })
  @ApiQuery({ name: 'activeOnly', type: Boolean, required: false, description: 'Filter by active branches only (default: true)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Branches retrieved successfully',
  })
  async getBranchesByBank(
    @Param('bankId') bankId: string,
    @Query('activeOnly') activeOnly: boolean = true,
  ) {
    const branches = await this.bankService.getBranchesByBank(
      bankId,
      activeOnly,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Branches retrieved successfully',
      data: branches,
      count: branches.length,
    };
  }

  @Get('branches/ifsc/:ifscCode')
  @ApiOperation({
    summary: 'Get branch by IFSC code (India)',
    description: 'Retrieve branch details using Indian Financial System Code (IFSC)',
  })
  @ApiParam({ name: 'ifscCode', description: '11-character IFSC code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Branch found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Branch not found',
  })
  async getBranchByIFSC(@Param('ifscCode') ifscCode: string) {
    const branch = await this.bankService.getBranchByIFSC(ifscCode);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch retrieved successfully',
      data: branch,
    };
  }

  // ============================================================================
  // COMPANY BANK ACCOUNT ENDPOINTS
  // ============================================================================

  @Post('company-accounts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create company bank account',
    description:
      'Configure a bank account for a legal entity to process payroll payments',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company account created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Account already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed',
  })
  async createCompanyAccount(@Body() dto: CreateCompanyBankAccountDto) {
    const account = await this.bankService.createCompanyAccount(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Company bank account created successfully',
      data: account,
    };
  }

  @Put('company-accounts/:id')
  @ApiOperation({
    summary: 'Update company bank account',
    description: 'Update existing company bank account details',
  })
  @ApiParam({ name: 'id', description: 'Account UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account updated successfully',
  })
  async updateCompanyAccount(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyBankAccountDto,
  ) {
    const account = await this.bankService.updateCompanyAccount(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Company bank account updated successfully',
      data: account,
    };
  }

  @Get('company-accounts/legal-entity/:legalEntityId')
  @ApiOperation({
    summary: 'Get company accounts by legal entity',
    description: 'Retrieve all bank accounts for a specific legal entity',
  })
  @ApiParam({ name: 'legalEntityId', description: 'Legal Entity UUID' })
  @ApiQuery({ name: 'tenantId', type: String })
  @ApiQuery({ name: 'activeOnly', type: Boolean, required: false, description: 'Filter by active accounts only (default: true)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Accounts retrieved successfully',
  })
  async getCompanyAccountsByLegalEntity(
    @Param('legalEntityId') legalEntityId: string,
    @Query('tenantId') tenantId: string,
    @Query('activeOnly') activeOnly: boolean = true,
  ) {
    const accounts = await this.bankService.getCompanyAccountsByLegalEntity(
      tenantId,
      legalEntityId,
      activeOnly,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Company accounts retrieved successfully',
      data: accounts,
      count: accounts.length,
    };
  }

  @Get('company-accounts/primary-payroll/:legalEntityId')
  @ApiOperation({
    summary: 'Get primary payroll account',
    description:
      'Retrieve the primary bank account used for payroll processing for a legal entity',
  })
  @ApiParam({ name: 'legalEntityId', description: 'Legal Entity UUID' })
  @ApiQuery({ name: 'tenantId', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Primary payroll account found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No primary payroll account configured',
  })
  async getPrimaryPayrollAccount(
    @Param('legalEntityId') legalEntityId: string,
    @Query('tenantId') tenantId: string,
  ) {
    const account = await this.bankService.getPrimaryPayrollAccount(
      tenantId,
      legalEntityId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Primary payroll account retrieved successfully',
      data: account,
    };
  }

  // ============================================================================
  // VALIDATION ENDPOINTS
  // ============================================================================

  @Post('validate/account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate bank account details',
    description:
      'Validate bank account number, IBAN, and other details against country-specific rules',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation completed',
  })
  async validateBankAccount(@Body() dto: ValidateBankAccountDto) {
    const result = await this.bankService.validateBankAccount(dto);
    return {
      statusCode: HttpStatus.OK,
      message: result.isValid
        ? 'Validation passed'
        : 'Validation failed',
      ...result,
    };
  }

  @Post('validate/iban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate IBAN',
    description: 'Validate International Bank Account Number (IBAN) format and checksum',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'IBAN validation completed',
  })
  async validateIBAN(@Body() dto: ValidateIBANDto) {
    const result = this.bankService.validateIBAN(dto.iban);
    return {
      statusCode: HttpStatus.OK,
      message: result.isValid ? 'Valid IBAN' : 'Invalid IBAN',
      ...result,
    };
  }

  @Get('country-rules/:countryCode')
  @ApiOperation({
    summary: 'Get country banking rules',
    description:
      'Retrieve banking compliance and validation rules for a specific country',
  })
  @ApiParam({ name: 'countryCode', description: 'ISO 3166-1 alpha-3 country code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Country rules retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No rules found for this country',
  })
  async getCountryBankingRules(@Param('countryCode') countryCode: string) {
    const rules = await this.bankService.getCountryBankingRules(countryCode);
    return {
      statusCode: HttpStatus.OK,
      message: rules
        ? 'Country rules retrieved successfully'
        : 'No rules found for this country',
      data: rules,
    };
  }

  // ============================================================================
  // AUDIT & HISTORY ENDPOINTS
  // ============================================================================

  @Get('audit/:entityType/:entityId')
  @ApiOperation({
    summary: 'Get audit history',
    description: 'Retrieve complete audit trail for a bank entity',
  })
  @ApiParam({
    name: 'entityType',
    description: 'Entity type (BANK_MASTER, BANK_BRANCH, COMPANY_ACCOUNT)',
  })
  @ApiParam({ name: 'entityId', description: 'Entity UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit history retrieved successfully',
  })
  async getAuditHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const history = await this.bankService.getAuditHistory(
      entityType,
      entityId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Audit history retrieved successfully',
      data: history,
      count: history.length,
    };
  }

  // ============================================================================
  // UTILITY ENDPOINTS
  // ============================================================================

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the bank service is running',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is healthy',
  })
  healthCheck() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Bank service is running',
      timestamp: new Date().toISOString(),
      service: 'bank-list',
      version: '1.0.0',
    };
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get banking statistics',
    description: 'Get overview statistics for banks, branches, and accounts',
  })
  @ApiQuery({ name: 'tenantId', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(@Query('tenantId') tenantId: string) {
    // This would be implemented in the service with actual queries
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: {
        totalBanks: 0,
        activeBanks: 0,
        totalBranches: 0,
        totalCompanyAccounts: 0,
        countriesSupported: 0,
        wpsEnabledBanks: 0,
      },
    };
  }
}
