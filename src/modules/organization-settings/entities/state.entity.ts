import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GroupCompany } from './group-company.entity';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_company_id' })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  // Basic Information
  @Column({ unique: true, length: 20 })
  stateCode: string;

  @Column({ length: 200 })
  stateName: string;

  @Column({ length: 200, nullable: true })
  officialName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 10, nullable: true })
  stateAbbreviation: string;

  @Column({ length: 10, nullable: true })
  isoCode: string;

  // Geographic Hierarchy
  @Column({ type: 'uuid', nullable: true })
  countryId: string;

  @Column({ length: 100, nullable: true })
  countryCode: string;

  @Column({ length: 200, nullable: true })
  countryName: string;

  @Column({ type: 'uuid', nullable: true })
  regionId: string;

  @Column({ length: 100, nullable: true })
  regionCode: string;

  @Column({ length: 200, nullable: true })
  regionName: string;

  // Geographic Details
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
  timezones: string[];

  @Column({ length: 50, nullable: true })
  primaryTimezone: string;

  @Column({ type: 'simple-array', nullable: true })
  borderingStates: string[];

  // Administrative
  @Column({ length: 100, nullable: true })
  stateType: string; // State, Province, Territory, District, Canton, Prefecture

  @Column({ length: 100, nullable: true })
  governmentType: string;

  @Column({ length: 200, nullable: true })
  governorName: string;

  @Column({ length: 200, nullable: true })
  legislatureType: string;

  @Column({ type: 'text', nullable: true })
  governmentStructure: string;

  // Contact Information
  @Column({ type: 'text', nullable: true })
  capitalAddress: string;

  @Column({ length: 50, nullable: true })
  phoneCode: string;

  @Column({ length: 100, nullable: true })
  officialWebsite: string;

  @Column({ length: 100, nullable: true })
  emergencyNumber: string;

  // Economic Information
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  gdpUsd: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  gdpPerCapitaUsd: number;

  @Column({ length: 10, nullable: true })
  currencyCode: string;

  @Column({ type: 'simple-array', nullable: true })
  majorIndustries: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  unemploymentRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  povertyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  medianHouseholdIncome: number;

  // Tax & Financial
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  stateTaxRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  salesTaxRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  propertyTaxRate: number;

  @Column({ type: 'boolean', default: false })
  hasIncomeTax: boolean;

  @Column({ type: 'jsonb', nullable: true })
  taxRates: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  taxBrackets: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  taxNotes: string;

  // Employment & Labor Laws
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumWage: number;

  @Column({ length: 10, nullable: true })
  minimumWageCurrency: string;

  @Column({ type: 'date', nullable: true })
  minimumWageEffectiveDate: Date;

  @Column({ type: 'int', nullable: true })
  standardWorkWeekHours: number;

  @Column({ type: 'simple-array', nullable: true })
  laborLaws: string[];

  @Column({ type: 'jsonb', nullable: true })
  employmentRegulations: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  hasRightToWorkLaws: boolean;

  @Column({ type: 'boolean', default: false })
  hasAtWillEmployment: boolean;

  @Column({ type: 'jsonb', nullable: true })
  terminationRules: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  laborLawSummary: string;

  // Workers' Compensation & Benefits
  @Column({ type: 'boolean', default: false })
  requiresWorkersComp: boolean;

  @Column({ type: 'jsonb', nullable: true })
  workersCompRates: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  hasUnemploymentInsurance: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  unemploymentInsuranceRate: number;

  @Column({ type: 'boolean', default: false })
  hasDisabilityInsurance: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  disabilityInsuranceRate: number;

  @Column({ type: 'jsonb', nullable: true })
  mandatoryBenefits: Record<string, any>;

  // Payroll & HR Compliance
  @Column({ type: 'simple-array', nullable: true })
  payrollRequirements: string[];

  @Column({ type: 'simple-array', nullable: true })
  registrationRequirements: string[];

  @Column({ type: 'simple-array', nullable: true })
  complianceDeadlines: string[];

  @Column({ type: 'jsonb', nullable: true })
  payrollTaxes: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  hrComplianceNotes: string;

  // Business & Licensing
  @Column({ type: 'simple-array', nullable: true })
  businessLicenseTypes: string[];

  @Column({ type: 'jsonb', nullable: true })
  businessRegistrationProcess: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  requiredPermits: string[];

  @Column({ type: 'text', nullable: true })
  businessRegulations: string;

  // Legal & Regulatory
  @Column({ type: 'simple-array', nullable: true })
  dataProtectionLaws: string[];

  @Column({ type: 'boolean', default: false })
  hasPrivacyLaws: boolean;

  @Column({ type: 'text', nullable: true })
  privacyLawsSummary: string;

  @Column({ type: 'simple-array', nullable: true })
  regulatoryBodies: string[];

  @Column({ type: 'simple-array', nullable: true })
  complianceRequirements: string[];

  // Cost of Living
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costOfLivingIndex: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  housingCostIndex: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageRent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageHomePrice: number;

  @Column({ type: 'jsonb', nullable: true })
  livingCostBreakdown: Record<string, any>;

  // Languages
  @Column({ type: 'simple-array', nullable: true })
  officialLanguages: string[];

  @Column({ type: 'simple-array', nullable: true })
  spokenLanguages: string[];

  @Column({ length: 10, nullable: true })
  primaryLanguage: string;

  // Demographics
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  literacyRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  urbanPopulationPercent: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ruralPopulationPercent: number;

  @Column({ type: 'jsonb', nullable: true })
  demographicBreakdown: Record<string, any>;

  // Business Operations
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isOperational: boolean;

  @Column({ type: 'boolean', default: false })
  hasOffices: boolean;

  @Column({ type: 'boolean', default: false })
  hasEmployees: boolean;

  @Column({ type: 'int', default: 0 })
  officeCount: number;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ type: 'int', default: 0 })
  cityCount: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

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
