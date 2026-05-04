import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GroupCompany } from './group-company.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_company_id' })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  // Basic Information
  @Column({ unique: true, length: 20 })
  cityCode: string;

  @Column({ length: 200 })
  cityName: string;

  @Column({ length: 200, nullable: true })
  officialName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Geographic Hierarchy
  @Column({ type: 'uuid', nullable: true })
  stateId: string;

  @Column({ length: 100, nullable: true })
  stateCode: string;

  @Column({ length: 200, nullable: true })
  stateName: string;

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

  // Location Details
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ length: 50, nullable: true })
  timezone: string;

  @Column({ type: 'int', nullable: true })
  utcOffset: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  elevation: number;

  @Column({ length: 100, nullable: true })
  climate: string;

  // Administrative
  @Column({ length: 100, nullable: true })
  cityType: string; // Municipality, Metro, Town, Village, District

  @Column({ type: 'bigint', nullable: true })
  population: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  areaKm2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  populationDensity: number;

  @Column({ length: 200, nullable: true })
  mayorName: string;

  @Column({ type: 'text', nullable: true })
  governmentStructure: string;

  // Contact Information
  @Column({ type: 'text', nullable: true })
  cityHallAddress: string;

  @Column({ length: 50, nullable: true })
  phoneNumber: string;

  @Column({ length: 100, nullable: true })
  cityWebsite: string;

  @Column({ length: 50, nullable: true })
  emergencyNumber: string;

  @Column({ length: 100, nullable: true })
  cityEmail: string;

  // Economic Information
  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  gdpUsd: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  gdpPerCapitaUsd: number;

  @Column({ type: 'simple-array', nullable: true })
  majorIndustries: string[];

  @Column({ type: 'simple-array', nullable: true })
  economicZones: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  unemploymentRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  medianHouseholdIncome: number;

  // Cost of Living
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costOfLivingIndex: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  housingCostIndex: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageRent1BR: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageRent2BR: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageRent3BR: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageHomePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  transportationCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  foodCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  utilitiesCost: number;

  @Column({ type: 'jsonb', nullable: true })
  livingCostBreakdown: Record<string, any>;

  // Taxation
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cityTaxRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  localTaxRate: number;

  @Column({ type: 'jsonb', nullable: true })
  taxRates: Record<string, any>;

  // Languages
  @Column({ type: 'simple-array', nullable: true })
  primaryLanguages: string[];

  @Column({ type: 'simple-array', nullable: true })
  spokenLanguages: string[];

  // Infrastructure & Transportation
  @Column({ type: 'boolean', default: false })
  hasAirport: boolean;

  @Column({ length: 200, nullable: true })
  airportName: string;

  @Column({ length: 10, nullable: true })
  airportCode: string;

  @Column({ type: 'boolean', default: false })
  hasSeaport: boolean;

  @Column({ type: 'boolean', default: false })
  hasSubway: boolean;

  @Column({ type: 'boolean', default: false })
  hasTrainStation: boolean;

  @Column({ type: 'simple-array', nullable: true })
  publicTransport: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  trafficIndex: number;

  @Column({ type: 'jsonb', nullable: true })
  transportationNetwork: Record<string, any>;

  // Technology & Connectivity
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  internetSpeedMbps: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  internetPenetrationRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  mobilePenetrationRate: number;

  @Column({ type: 'simple-array', nullable: true })
  internetProviders: string[];

  @Column({ length: 100, nullable: true })
  techHubStatus: string; // Emerging, Growing, Established, Major

  // Education & Healthcare
  @Column({ type: 'int', nullable: true })
  universitiesCount: number;

  @Column({ type: 'int', nullable: true })
  hospitalsCount: number;

  @Column({ type: 'simple-array', nullable: true })
  majorUniversities: string[];

  @Column({ type: 'simple-array', nullable: true })
  majorHospitals: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  literacyRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  healthcareQualityIndex: number;

  // Quality of Life
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityOfLifeIndex: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  safetyIndex: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  pollutionIndex: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  healthcareIndex: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  climateIndex: number;

  @Column({ type: 'jsonb', nullable: true })
  qualityOfLifeMetrics: Record<string, any>;

  // Business Environment
  @Column({ type: 'boolean', default: false })
  isBusinessHub: boolean;

  @Column({ type: 'boolean', default: false })
  isFinancialCenter: boolean;

  @Column({ type: 'boolean', default: false })
  isTechHub: boolean;

  @Column({ type: 'int', nullable: true })
  fortuneCompaniesCount: number;

  @Column({ type: 'int', nullable: true })
  startupsCount: number;

  @Column({ type: 'simple-array', nullable: true })
  majorEmployers: string[];

  @Column({ type: 'jsonb', nullable: true })
  businessEnvironment: Record<string, any>;

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
