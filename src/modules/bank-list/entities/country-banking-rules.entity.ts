import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

/**
 * COUNTRY BANKING RULES ENTITY
 * Centralized country-specific banking compliance and validation rules
 * Supports dynamic field validation for different countries
 */

@Entity('country_banking_rules')
@Index(['countryCode', 'isActive'])
@Unique(['tenantId', 'countryCode'])
export class CountryBankingRules {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  // Country Information
  @Column({ name: 'country_code', length: 3 })
  @Index()
  countryCode: string; // ISO 3166-1 alpha-3

  @Column({ name: 'country_name', length: 100 })
  countryName: string;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string; // ISO 4217

  // Central Bank Information
  @Column({ name: 'central_bank_name', length: 255 })
  centralBankName: string;

  @Column({ name: 'central_bank_code', length: 50, nullable: true })
  centralBankCode: string;

  @Column({ name: 'regulatory_authority', length: 255, nullable: true })
  regulatoryAuthority: string;

  @Column({ name: 'regulatory_website', type: 'text', nullable: true })
  regulatoryWebsite: string;

  // Account Number Validation
  @Column({ name: 'account_number_format', type: 'text' })
  accountNumberFormat: string; // Regex pattern

  @Column({ name: 'account_number_example', length: 100 })
  accountNumberExample: string;

  @Column({ name: 'account_number_min_length', type: 'int' })
  accountNumberMinLength: number;

  @Column({ name: 'account_number_max_length', type: 'int' })
  accountNumberMaxLength: number;

  @Column({ name: 'account_number_type', length: 50 })
  accountNumberType: string; // NUMERIC, ALPHANUMERIC, IBAN

  @Column({ name: 'account_number_checksum_algorithm', length: 50, nullable: true })
  accountNumberChecksumAlgorithm: string; // MOD97, LUHN, etc.

  // IBAN Configuration
  @Column({ name: 'iban_supported', type: 'boolean', default: false })
  ibanSupported: boolean;

  @Column({ name: 'iban_required', type: 'boolean', default: false })
  ibanRequired: boolean;

  @Column({ name: 'iban_format', type: 'text', nullable: true })
  ibanFormat: string; // Country-specific IBAN format regex

  @Column({ name: 'iban_length', type: 'int', nullable: true })
  ibanLength: number;

  @Column({ name: 'iban_example', length: 100, nullable: true })
  ibanExample: string;

  @Column({ name: 'iban_prefix', length: 10, nullable: true })
  ibanPrefix: string; // e.g., 'GB', 'FR', 'DE'

  // Bank Code Configuration
  @Column({ name: 'bank_code_name', length: 50 })
  bankCodeName: string; // SWIFT, IFSC, Routing Number, Sort Code, etc.

  @Column({ name: 'bank_code_format', type: 'text' })
  bankCodeFormat: string; // Regex pattern

  @Column({ name: 'bank_code_example', length: 100 })
  bankCodeExample: string;

  @Column({ name: 'bank_code_length', type: 'int' })
  bankCodeLength: number;

  @Column({ name: 'bank_code_required', type: 'boolean', default: true })
  bankCodeRequired: boolean;

  // Branch Code Configuration
  @Column({ name: 'branch_code_supported', type: 'boolean', default: false })
  branchCodeSupported: boolean;

  @Column({ name: 'branch_code_required', type: 'boolean', default: false })
  branchCodeRequired: boolean;

  @Column({ name: 'branch_code_name', length: 50, nullable: true })
  branchCodeName: string; // Branch Code, Sort Code, BSB, etc.

  @Column({ name: 'branch_code_format', type: 'text', nullable: true })
  branchCodeFormat: string;

  @Column({ name: 'branch_code_example', length: 100, nullable: true })
  branchCodeExample: string;

  @Column({ name: 'branch_code_length', type: 'int', nullable: true })
  branchCodeLength: number;

  // SWIFT Code Configuration
  @Column({ name: 'swift_code_required', type: 'boolean', default: false })
  swiftCodeRequired: boolean;

  @Column({ name: 'swift_format', type: 'text', nullable: true })
  swiftFormat: string; // 8 or 11 characters

  // Additional Required Fields (Country-specific)
  @Column({ name: 'additional_required_fields', type: 'jsonb', nullable: true })
  additionalRequiredFields: {
    fieldName: string;
    fieldLabel: string;
    fieldType: string; // TEXT, NUMBER, DATE, SELECT
    format?: string;
    maxLength?: number;
    options?: string[];
    example?: string;
  }[];

  // Payroll System Integration
  @Column({ name: 'wps_enabled', type: 'boolean', default: false })
  wpsEnabled: boolean;

  @Column({ name: 'wps_system_name', length: 100, nullable: true })
  wpsSystemName: string; // 'UAE WPS', 'GOSI', 'Mudad', etc.

  @Column({ name: 'wps_routing_code_required', type: 'boolean', default: false })
  wpsRoutingCodeRequired: boolean;

  @Column({ name: 'wps_employer_id_format', type: 'text', nullable: true })
  wpsEmployerIdFormat: string;

  @Column({ name: 'wps_employer_id_example', length: 100, nullable: true })
  wpsEmployerIdExample: string;

  @Column({ name: 'wps_file_format', length: 50, nullable: true })
  wpsFileFormat: string; // SIF, XML, CSV

  @Column({ name: 'wps_file_specification_url', type: 'text', nullable: true })
  wpsFileSpecificationUrl: string;

  // SEPA Configuration (EU Countries)
  @Column({ name: 'sepa_enabled', type: 'boolean', default: false })
  sepaEnabled: boolean;

  @Column({ name: 'sepa_creditor_id_required', type: 'boolean', default: false })
  sepaCreditorIdRequired: boolean;

  @Column({ name: 'sepa_creditor_id_format', type: 'text', nullable: true })
  sepaCreditorIdFormat: string;

  @Column({ name: 'sepa_schemes_supported', type: 'simple-array', nullable: true })
  sepaSchemesSupportedColumn: string[]; // ['CORE', 'B2B', 'COR1']

  // ACH Configuration (USA)
  @Column({ name: 'ach_enabled', type: 'boolean', default: false })
  achEnabled: boolean;

  @Column({ name: 'ach_routing_number_format', type: 'text', nullable: true })
  achRoutingNumberFormat: string; // 9-digit ABA routing number

  @Column({ name: 'ach_account_types', type: 'simple-array', nullable: true })
  achAccountTypes: string[]; // ['CHECKING', 'SAVINGS']

  // Other Local Payment Systems
  @Column({ name: 'local_payment_systems', type: 'jsonb', nullable: true })
  localPaymentSystems: {
    systemName: string;
    systemCode: string;
    enabled: boolean;
    description?: string;
    requirements?: object;
  }[];

  // Compliance & Regulatory
  @Column({ name: 'max_salary_transfer_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxSalaryTransferAmount: number;

  @Column({ name: 'requires_employee_consent', type: 'boolean', default: false })
  requiresEmployeeConsent: boolean;

  @Column({ name: 'requires_bank_letter', type: 'boolean', default: false })
  requiresBankLetter: boolean;

  @Column({ name: 'bank_letter_template_url', type: 'text', nullable: true })
  bankLetterTemplateUrl: string;

  @Column({ name: 'mandatory_waiting_period_days', type: 'int', default: 0 })
  mandatoryWaitingPeriodDays: number; // Days before salary can be transferred

  @Column({ name: 'supports_retro_payments', type: 'boolean', default: true })
  supportsRetroPayments: boolean;

  @Column({ name: 'retro_payment_max_months', type: 'int', nullable: true })
  retroPaymentMaxMonths: number;

  // Validation Rules
  @Column({ name: 'validation_rules', type: 'jsonb', nullable: true })
  validationRules: {
    ruleName: string;
    ruleType: string; // REGEX, CHECKSUM, LOOKUP, CUSTOM
    ruleExpression: string;
    errorMessage: string;
    severity: string; // ERROR, WARNING, INFO
  }[];

  // Documentation
  @Column({ name: 'setup_guide_url', type: 'text', nullable: true })
  setupGuideUrl: string;

  @Column({ name: 'compliance_documentation_url', type: 'text', nullable: true })
  complianceDocumentationUrl: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'last_updated_by_regulation', type: 'date', nullable: true })
  lastUpdatedByRegulation: Date;

  // Audit
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * VALIDATION RESULT ENTITY
 * Store validation results for bank account configurations
 */
@Entity('bank_validation_logs')
@Index(['tenantId', 'entityType', 'entityId'])
@Index(['validationStatus', 'createdAt'])
export class BankValidationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'entity_type', length: 50 })
  @Index()
  entityType: string; // COMPANY_ACCOUNT, EMPLOYEE_ACCOUNT

  @Column({ name: 'entity_id', type: 'uuid' })
  @Index()
  entityId: string;

  @Column({ name: 'country_code', length: 3 })
  countryCode: string;

  @Column({ name: 'bank_id', type: 'uuid', nullable: true })
  bankId: string;

  @Column({ name: 'validation_type', length: 50 })
  validationType: string; // ACCOUNT_NUMBER, IBAN, BANK_CODE, BRANCH_CODE, etc.

  @Column({ name: 'validation_status', length: 20 })
  @Index()
  validationStatus: string; // PASS, FAIL, WARNING

  @Column({ name: 'validation_errors', type: 'jsonb', nullable: true })
  validationErrors: {
    field: string;
    rule: string;
    message: string;
    severity: string;
  }[];

  @Column({ name: 'input_value', type: 'text' })
  inputValue: string;

  @Column({ name: 'expected_format', type: 'text', nullable: true })
  expectedFormat: string;

  @Column({ name: 'performed_by', type: 'uuid' })
  performedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}
