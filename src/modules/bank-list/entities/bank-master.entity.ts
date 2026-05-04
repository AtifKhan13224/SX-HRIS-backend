import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';

/**
 * GLOBAL BANK MASTER ENTITY
 * Enterprise-grade bank master data with multi-country support
 * Supports: WPS, SEPA, ACH, SWIFT, IBAN, and local payment systems
 */

export enum BankStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  MERGED = 'MERGED',
  CLOSED = 'CLOSED',
}

export enum BankType {
  COMMERCIAL = 'COMMERCIAL',
  INVESTMENT = 'INVESTMENT',
  RETAIL = 'RETAIL',
  COOPERATIVE = 'COOPERATIVE',
  CENTRAL = 'CENTRAL',
  ISLAMIC = 'ISLAMIC',
  DEVELOPMENT = 'DEVELOPMENT',
  SAVINGS = 'SAVINGS',
}

export enum PayrollIntegrationType {
  WPS_UAE = 'WPS_UAE', // Wage Protection System (UAE)
  WPS_SAUDI = 'WPS_SAUDI', // GOSI (Saudi Arabia)
  WPS_BAHRAIN = 'WPS_BAHRAIN',
  WPS_QATAR = 'WPS_QATAR',
  WPS_KUWAIT = 'WPS_KUWAIT',
  WPS_OMAN = 'WPS_OMAN',
  SEPA = 'SEPA', // Single Euro Payments Area
  ACH = 'ACH', // Automated Clearing House (USA)
  BACS = 'BACS', // UK
  SWIFT = 'SWIFT', // International
  RTGS = 'RTGS', // Real Time Gross Settlement
  NEFT = 'NEFT', // National Electronic Funds Transfer (India)
  IMPS = 'IMPS', // Immediate Payment Service (India)
  GIRO = 'GIRO', // Singapore
  FAST = 'FAST', // Fast and Secure Transfers (Singapore)
  OTHER = 'OTHER',
}

@Entity('bank_master')
@Index(['tenantId', 'isActive'])
@Index(['countryId', 'bankCode'])
@Index(['swiftCode'])
@Unique(['tenantId', 'countryId', 'bankCode'])
export class BankMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Bank Identification
  @Column({ name: 'bank_name', length: 255 })
  bankName: string;

  @Column({ name: 'bank_code', length: 50 })
  @Index()
  bankCode: string; // National bank code (e.g., IFSC, Routing Number, Sort Code)

  @Column({ name: 'bank_short_name', length: 100, nullable: true })
  bankShortName: string;

  @Column({ name: 'bank_local_name', length: 255, nullable: true })
  bankLocalName: string; // For non-English countries

  // Country & Region
  @Column({ name: 'country_id', type: 'uuid' })
  @Index()
  countryId: string;

  @Column({ name: 'country_code', length: 3 })
  countryCode: string; // ISO 3166-1 alpha-3

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string; // ISO 4217

  @Column({ name: 'region', length: 100, nullable: true })
  region: string; // Geographic region for compliance

  // International Codes
  @Column({ name: 'swift_code', length: 11, nullable: true, unique: true })
  @Index()
  swiftCode: string; // BIC/SWIFT code

  @Column({ name: 'iban_prefix', length: 10, nullable: true })
  ibanPrefix: string; // Country-specific IBAN prefix

  @Column({ name: 'routing_number', length: 20, nullable: true })
  routingNumber: string; // USA ABA routing number

  @Column({ name: 'sort_code', length: 10, nullable: true })
  sortCode: string; // UK sort code

  @Column({ name: 'ifsc_prefix', length: 10, nullable: true })
  ifscPrefix: string; // India IFSC prefix

  @Column({ name: 'bsb_code', length: 10, nullable: true })
  bsbCode: string; // Australia BSB code

  // Bank Classification
  @Column({
    name: 'bank_type',
    type: 'enum',
    enum: BankType,
    default: BankType.COMMERCIAL,
  })
  bankType: BankType;

  @Column({ name: 'is_islamic_banking', type: 'boolean', default: false })
  isIslamicBanking: boolean;

  @Column({ name: 'is_central_bank', type: 'boolean', default: false })
  isCentralBank: boolean;

  // Payroll Integration
  @Column({
    name: 'payroll_integration_types',
    type: 'simple-array',
    nullable: true,
  })
  payrollIntegrationTypes: PayrollIntegrationType[]; // Multiple supported types

  @Column({ name: 'wps_enabled', type: 'boolean', default: false })
  wpsEnabled: boolean; // Wage Protection System enabled

  @Column({ name: 'wps_routing_code', length: 50, nullable: true })
  wpsRoutingCode: string; // WPS-specific routing

  @Column({ name: 'wps_employer_id_format', type: 'text', nullable: true })
  wpsEmployerIdFormat: string; // Regex pattern for employer ID validation

  // Validation Rules
  @Column({ name: 'account_number_format', type: 'text', nullable: true })
  accountNumberFormat: string; // Regex pattern for account number

  @Column({ name: 'account_number_min_length', type: 'int', nullable: true })
  accountNumberMinLength: number;

  @Column({ name: 'account_number_max_length', type: 'int', nullable: true })
  accountNumberMaxLength: number;

  @Column({ name: 'iban_required', type: 'boolean', default: false })
  ibanRequired: boolean;

  @Column({ name: 'iban_format', type: 'text', nullable: true })
  ibanFormat: string; // Country-specific IBAN format

  @Column({ name: 'branch_code_required', type: 'boolean', default: false })
  branchCodeRequired: boolean;

  @Column({ name: 'branch_code_format', type: 'text', nullable: true })
  branchCodeFormat: string;

  // Contact Information
  @Column({ name: 'head_office_address', type: 'text', nullable: true })
  headOfficeAddress: string;

  @Column({ name: 'city', length: 100, nullable: true })
  city: string;

  @Column({ name: 'state_province', length: 100, nullable: true })
  stateProvince: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode: string;

  @Column({ name: 'phone_number', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ name: 'email', length: 255, nullable: true })
  email: string;

  @Column({ name: 'website', length: 255, nullable: true })
  website: string;

  // Regulatory & Compliance
  @Column({ name: 'central_bank_license_number', length: 100, nullable: true })
  centralBankLicenseNumber: string;

  @Column({ name: 'regulatory_authority', length: 255, nullable: true })
  regulatoryAuthority: string;

  @Column({ name: 'license_issue_date', type: 'date', nullable: true })
  licenseIssueDate: Date;

  @Column({ name: 'license_expiry_date', type: 'date', nullable: true })
  licenseExpiryDate: Date;

  @Column({ name: 'is_sanctioned', type: 'boolean', default: false })
  isSanctioned: boolean;

  @Column({ name: 'sanction_list', type: 'simple-array', nullable: true })
  sanctionList: string[]; // e.g., ['OFAC', 'EU', 'UN']

  // Payroll File Generation
  @Column({ name: 'payroll_file_format', length: 50, nullable: true })
  payrollFileFormat: string; // CSV, XML, JSON, Fixed-width, etc.

  @Column({ name: 'payroll_file_template', type: 'jsonb', nullable: true })
  payrollFileTemplate: object; // Template configuration

  @Column({ name: 'payroll_encryption_required', type: 'boolean', default: false })
  payrollEncryptionRequired: boolean;

  @Column({ name: 'payroll_signature_required', type: 'boolean', default: false })
  payrollSignatureRequired: boolean;

  // API Integration
  @Column({ name: 'api_endpoint', type: 'text', nullable: true })
  apiEndpoint: string;

  @Column({ name: 'api_version', length: 20, nullable: true })
  apiVersion: string;

  @Column({ name: 'api_authentication_type', length: 50, nullable: true })
  apiAuthenticationType: string; // OAuth, API Key, Certificate, etc.

  @Column({ name: 'api_documentation_url', type: 'text', nullable: true })
  apiDocumentationUrl: string;

  // Status & Dates
  @Column({
    name: 'status',
    type: 'enum',
    enum: BankStatus,
    default: BankStatus.ACTIVE,
  })
  @Index()
  status: BankStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: Date;

  // Merger/Acquisition Tracking
  @Column({ name: 'merged_with_bank_id', type: 'uuid', nullable: true })
  mergedWithBankId: string;

  @Column({ name: 'merger_date', type: 'date', nullable: true })
  mergerDate: Date;

  // Additional Metadata
  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: object; // Country-specific fields

  // Audit Fields
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => BankBranch, (branch) => branch.bank)
  branches: BankBranch[];

  @OneToMany(() => CompanyBankAccount, (account) => account.bank)
  companyAccounts: CompanyBankAccount[];
}

/**
 * BANK BRANCH ENTITY
 * For countries that require branch-level management
 */
@Entity('bank_branches')
@Index(['bankId', 'isActive'])
@Index(['branchCode'])
@Unique(['bankId', 'branchCode'])
export class BankBranch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'bank_id', type: 'uuid' })
  @Index()
  bankId: string;

  @ManyToOne(() => BankMaster, (bank) => bank.branches)
  @JoinColumn({ name: 'bank_id' })
  bank: BankMaster;

  // Branch Identification
  @Column({ name: 'branch_name', length: 255 })
  branchName: string;

  @Column({ name: 'branch_code', length: 50 })
  @Index()
  branchCode: string;

  @Column({ name: 'branch_local_name', length: 255, nullable: true })
  branchLocalName: string;

  // Location
  @Column({ name: 'address', type: 'text' })
  address: string;

  @Column({ name: 'city', length: 100 })
  city: string;

  @Column({ name: 'state_province', length: 100, nullable: true })
  stateProvince: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode: string;

  @Column({ name: 'country_code', length: 3 })
  countryCode: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  // International Codes (branch-specific)
  @Column({ name: 'swift_code', length: 11, nullable: true })
  swiftCode: string; // Branch-specific SWIFT if applicable

  @Column({ name: 'ifsc_code', length: 11, nullable: true })
  @Index()
  ifscCode: string; // India: IFSC is branch-specific

  @Column({ name: 'micr_code', length: 9, nullable: true })
  micrCode: string; // India: MICR code for check processing

  @Column({ name: 'sort_code', length: 10, nullable: true })
  sortCode: string; // UK: Branch-specific sort code

  // Contact Information
  @Column({ name: 'phone_number', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ name: 'fax_number', length: 50, nullable: true })
  faxNumber: string;

  @Column({ name: 'email', length: 255, nullable: true })
  email: string;

  @Column({ name: 'manager_name', length: 255, nullable: true })
  managerName: string;

  // Services Offered
  @Column({ name: 'supports_corporate_banking', type: 'boolean', default: true })
  supportsCorporateBanking: boolean;

  @Column({ name: 'supports_payroll_processing', type: 'boolean', default: true })
  supportsPayrollProcessing: boolean;

  @Column({ name: 'supports_international_transfers', type: 'boolean', default: false })
  supportsInternationalTransfers: boolean;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: Date;

  // Additional Metadata
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: object;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => CompanyBankAccount, (account) => account.branch)
  companyAccounts: CompanyBankAccount[];
}

/**
 * COMPANY BANK ACCOUNT ENTITY
 * Corporate payroll bank accounts for companies/legal entities
 */
@Entity('company_bank_accounts')
@Index(['tenantId', 'legalEntityId', 'isPrimaryPayrollAccount'])
@Index(['accountNumber'])
@Unique(['tenantId', 'legalEntityId', 'bankId', 'accountNumber'])
export class CompanyBankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Company/Legal Entity Reference
  @Column({ name: 'legal_entity_id', type: 'uuid' })
  @Index()
  legalEntityId: string;

  @Column({ name: 'legal_entity_name', length: 255 })
  legalEntityName: string;

  @Column({ name: 'country_id', type: 'uuid' })
  countryId: string;

  // Bank References
  @Column({ name: 'bank_id', type: 'uuid' })
  @Index()
  bankId: string;

  @ManyToOne(() => BankMaster, (bank) => bank.companyAccounts)
  @JoinColumn({ name: 'bank_id' })
  bank: BankMaster;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  @Index()
  branchId: string;

  @ManyToOne(() => BankBranch, (branch) => branch.companyAccounts, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: BankBranch;

  // Account Details
  @Column({ name: 'account_name', length: 255 })
  accountName: string; // Account holder name

  @Column({ name: 'account_number', length: 50 })
  @Index()
  accountNumber: string;

  @Column({ name: 'iban', length: 34, nullable: true })
  iban: string;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ name: 'account_type', length: 50, default: 'CURRENT' })
  accountType: string; // CURRENT, SAVINGS, PAYROLL

  // Payroll Configuration
  @Column({ name: 'is_primary_payroll_account', type: 'boolean', default: false })
  @Index()
  isPrimaryPayrollAccount: boolean; // Main account for payroll processing

  @Column({ name: 'is_active_for_payroll', type: 'boolean', default: true })
  isActiveForPayroll: boolean;

  @Column({ name: 'payroll_purpose', type: 'simple-array', nullable: true })
  payrollPurpose: string[]; // ['SALARY', 'BONUS', 'COMMISSION', 'EXPENSES']

  @Column({ name: 'supported_payment_types', type: 'simple-array', nullable: true })
  supportedPaymentTypes: string[]; // ['BANK_TRANSFER', 'CHECK', 'CASH']

  // WPS Configuration (for GCC countries)
  @Column({ name: 'wps_employer_id', length: 50, nullable: true })
  wpsEmployerId: string;

  @Column({ name: 'wps_establishment_code', length: 50, nullable: true })
  wpsEstablishmentCode: string;

  @Column({ name: 'wps_routing_code', length: 50, nullable: true })
  wpsRoutingCode: string;

  @Column({ name: 'wps_bank_agreement_number', length: 100, nullable: true })
  wpsBankAgreementNumber: string;

  @Column({ name: 'wps_agreement_start_date', type: 'date', nullable: true })
  wpsAgreementStartDate: Date;

  @Column({ name: 'wps_agreement_end_date', type: 'date', nullable: true })
  wpsAgreementEndDate: Date;

  // SEPA Configuration (for EU)
  @Column({ name: 'sepa_creditor_id', length: 50, nullable: true })
  sepaCreditorId: string;

  @Column({ name: 'sepa_scheme', length: 20, nullable: true })
  sepaScheme: string; // CORE, B2B, COR1

  @Column({ name: 'sepa_mandate_reference', length: 50, nullable: true })
  sepaMandateReference: string;

  // API Integration
  @Column({ name: 'api_enabled', type: 'boolean', default: false })
  apiEnabled: boolean;

  @Column({ name: 'api_credentials_encrypted', type: 'text', nullable: true })
  apiCredentialsEncrypted: string; // Encrypted JSON

  @Column({ name: 'api_last_sync_date', type: 'timestamp', nullable: true })
  apiLastSyncDate: Date;

  // Transaction Limits
  @Column({ name: 'daily_transaction_limit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  dailyTransactionLimit: number;

  @Column({ name: 'monthly_transaction_limit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyTransactionLimit: number;

  @Column({ name: 'per_transaction_limit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  perTransactionLimit: number;

  // Approval Workflow
  @Column({ name: 'requires_approval', type: 'boolean', default: true })
  requiresApproval: boolean;

  @Column({ name: 'approval_workflow_id', type: 'uuid', nullable: true })
  approvalWorkflowId: string;

  @Column({ name: 'min_approval_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  minApprovalAmount: number;

  // Status & Dates
  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: Date;

  @Column({ name: 'account_opening_date', type: 'date', nullable: true })
  accountOpeningDate: Date;

  @Column({ name: 'last_used_date', type: 'date', nullable: true })
  lastUsedDate: Date;

  // Additional Metadata
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: object;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * BANK AUDIT LOG ENTITY
 * Complete audit trail for all bank-related changes
 */
@Entity('bank_audit_logs')
@Index(['entityType', 'entityId'])
@Index(['tenantId', 'createdAt'])
export class BankAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'entity_type', length: 50 })
  @Index()
  entityType: string; // BANK_MASTER, BANK_BRANCH, COMPANY_ACCOUNT, etc.

  @Column({ name: 'entity_id', type: 'uuid' })
  @Index()
  entityId: string;

  @Column({ name: 'action', length: 50 })
  action: string; // CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE, APPROVE, REJECT

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: object;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: object;

  @Column({ name: 'changed_fields', type: 'simple-array', nullable: true })
  changedFields: string[];

  @Column({ name: 'performed_by', type: 'uuid' })
  performedBy: string;

  @Column({ name: 'performed_by_name', length: 255 })
  performedByName: string;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason: string; // Reason for change

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}
