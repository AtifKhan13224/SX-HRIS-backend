import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GroupCompany } from './group-company.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_company_id' })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  // Basic Information
  @Column({ unique: true, length: 20 })
  countryCode: string;

  @Column({ length: 200 })
  countryName: string;

  @Column({ length: 200, nullable: true })
  officialName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 10, nullable: true })
  iso2Code: string;

  @Column({ length: 10, nullable: true })
  iso3Code: string;

  @Column({ length: 10, nullable: true })
  isoNumericCode: string;

  // Geographic Information
  @Column({ length: 100, nullable: true })
  continent: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ length: 100, nullable: true })
  subregion: string;

  @Column({ length: 200, nullable: true })
  capital: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  areaKm2: number;

  @Column({ type: 'bigint', nullable: true })
  population: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'simple-array', nullable: true })
  borders: string[];

  @Column({ type: 'simple-array', nullable: true })
  timezones: string[];

  // Currency Information
  @Column({ length: 10, nullable: true })
  currencyCode: string;

  @Column({ length: 100, nullable: true })
  currencyName: string;

  @Column({ length: 10, nullable: true })
  currencySymbol: string;

  @Column({ type: 'simple-array', nullable: true })
  supportedCurrencies: string[];

  @Column({ type: 'jsonb', nullable: true })
  currencyDetails: Record<string, any>;

  // Language Information
  @Column({ type: 'simple-array', nullable: true })
  officialLanguages: string[];

  @Column({ type: 'simple-array', nullable: true })
  spokenLanguages: string[];

  @Column({ length: 10, nullable: true })
  primaryLanguage: string;

  @Column({ type: 'jsonb', nullable: true })
  languageDetails: Record<string, any>;

  // Contact & Communication
  @Column({ length: 20, nullable: true })
  phoneCode: string;

  @Column({ length: 20, nullable: true })
  internetTLD: string;

  @Column({ length: 100, nullable: true })
  postalCodeFormat: string;

  @Column({ type: 'text', nullable: true })
  addressFormat: string;

  // Economic Information
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  gdpUsd: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  gdpPerCapitaUsd: number;

  @Column({ length: 100, nullable: true })
  economicClassification: string;

  @Column({ type: 'simple-array', nullable: true })
  majorIndustries: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  unemploymentRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  inflationRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  corporateTaxRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  vatRate: number;

  // Business & Legal
  @Column({ type: 'text', nullable: true })
  businessRegistrationProcess: string;

  @Column({ type: 'simple-array', nullable: true })
  requiredBusinessLicenses: string[];

  @Column({ type: 'jsonb', nullable: true })
  businessRegulations: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  legalEntityTypes: string[];

  @Column({ type: 'text', nullable: true })
  companyRegistrationRequirements: string;

  // Employment & Labor Laws
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumWage: number;

  @Column({ length: 50, nullable: true })
  minimumWageCurrency: string;

  @Column({ length: 50, nullable: true })
  minimumWageFrequency: string;

  @Column({ type: 'int', nullable: true })
  standardWorkWeekHours: number;

  @Column({ type: 'int', nullable: true })
  standardWorkDayHours: number;

  @Column({ type: 'int', nullable: true })
  minimumAnnualLeave: number;

  @Column({ type: 'int', nullable: true })
  minimumSickLeave: number;

  @Column({ type: 'int', nullable: true })
  maternityLeaveDays: number;

  @Column({ type: 'int', nullable: true })
  paternityLeaveDays: number;

  @Column({ type: 'jsonb', nullable: true })
  publicHolidays: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  laborLawSummary: string;

  @Column({ type: 'simple-array', nullable: true })
  employmentRegulations: string[];

  @Column({ type: 'jsonb', nullable: true })
  terminationRules: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  noticePeriodRequirements: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  severancePayRules: Record<string, any>;

  // Immigration & Visa
  @Column({ type: 'boolean', default: false })
  requiresWorkPermit: boolean;

  @Column({ type: 'simple-array', nullable: true })
  availableVisaTypes: string[];

  @Column({ type: 'jsonb', nullable: true })
  visaRequirements: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  visaFreeCountries: string[];

  @Column({ type: 'jsonb', nullable: true })
  workPermitProcess: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  workPermitProcessingDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  workPermitCost: number;

  @Column({ length: 10, nullable: true })
  workPermitCostCurrency: string;

  // Social Security & Benefits
  @Column({ type: 'boolean', default: false })
  hasSocialSecurity: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  employerSocialSecurityRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  employeeSocialSecurityRate: number;

  @Column({ type: 'jsonb', nullable: true })
  socialSecurityComponents: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  hasNationalHealthcare: boolean;

  @Column({ type: 'jsonb', nullable: true })
  healthcareSystem: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  hasPensionSystem: boolean;

  @Column({ type: 'jsonb', nullable: true })
  pensionSystemDetails: Record<string, any>;

  // Compliance & Regulatory
  @Column({ type: 'simple-array', nullable: true })
  dataProtectionLaws: string[];

  @Column({ type: 'boolean', default: false })
  hasGDPREquivalent: boolean;

  @Column({ type: 'text', nullable: true })
  privacyLawsSummary: string;

  @Column({ type: 'simple-array', nullable: true })
  antiCorruptionLaws: string[];

  @Column({ type: 'simple-array', nullable: true })
  complianceRequirements: string[];

  @Column({ type: 'jsonb', nullable: true })
  regulatoryBodies: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  auditRequirements: string[];

  @Column({ type: 'simple-array', nullable: true })
  reportingObligations: string[];

  // Market & Business Environment
  @Column({ type: 'int', nullable: true })
  easeOfDoingBusinessRank: number;

  @Column({ type: 'int', nullable: true })
  corruptionPerceptionIndex: number;

  @Column({ type: 'int', nullable: true })
  globalCompetitivenessIndex: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  foreignInvestmentIndex: number;

  @Column({ type: 'simple-array', nullable: true })
  tradeAgreements: string[];

  @Column({ type: 'simple-array', nullable: true })
  economicBlocs: string[];

  // HR & Payroll Considerations
  @Column({ length: 50, nullable: true })
  payrollFrequency: string;

  @Column({ type: 'jsonb', nullable: true })
  payrollTaxRates: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  benefitsRequirements: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  hrBestPractices: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  payrollNotes: string;

  // Risk & Security
  @Column({ length: 50, nullable: true })
  politicalStability: string;

  @Column({ length: 50, nullable: true })
  securityRating: string;

  @Column({ type: 'simple-array', nullable: true })
  travelAdvisories: string[];

  @Column({ type: 'jsonb', nullable: true })
  riskAssessment: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  securityConsiderations: string;

  // Cost of Living
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costOfLivingIndex: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageRentUsd: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageSalaryUsd: number;

  @Column({ type: 'jsonb', nullable: true })
  livingCostBreakdown: Record<string, any>;

  // Status & Configuration
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isOperational: boolean;

  @Column({ type: 'boolean', default: false })
  hasOffice: boolean;

  @Column({ type: 'boolean', default: false })
  hasEmployees: boolean;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ type: 'int', default: 0 })
  officeCount: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 100, nullable: true })
  sourceSystem: string;

  @Column({ length: 100, nullable: true })
  externalId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;
}
