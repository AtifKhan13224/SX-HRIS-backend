import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GroupCompany } from './group-company.entity';

@Entity('work_locations')
export class WorkLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_company_id' })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  // Basic Information
  @Column({ unique: true, length: 20 })
  locationCode: string;

  @Column({ length: 200 })
  locationName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100 })
  locationType: string; // Office, Remote, Hybrid, Client Site, Field, Home, Co-working

  // Work Arrangement
  @Column({ length: 100, nullable: true })
  workArrangement: string; // Full-time Office, Full Remote, Hybrid, Flexible

  @Column({ type: 'int', nullable: true })
  requiredOfficeDaysPerWeek: number;

  @Column({ type: 'boolean', default: false })
  allowsRemoteWork: boolean;

  @Column({ type: 'boolean', default: false })
  allowsHybridWork: boolean;

  @Column({ type: 'boolean', default: false })
  requiresOfficePresence: boolean;

  @Column({ type: 'simple-array', nullable: true })
  allowedWorkLocations: string[];

  // Related Office Location (if applicable)
  @Column({ type: 'uuid', nullable: true })
  officeLocationId: string;

  @Column({ length: 100, nullable: true })
  officeLocationCode: string;

  @Column({ length: 200, nullable: true })
  officeLocationName: string;

  // Geographic Details
  @Column({ type: 'uuid', nullable: true })
  cityId: string;

  @Column({ length: 200, nullable: true })
  cityName: string;

  @Column({ type: 'uuid', nullable: true })
  stateId: string;

  @Column({ length: 200, nullable: true })
  stateName: string;

  @Column({ type: 'uuid', nullable: true })
  countryId: string;

  @Column({ length: 200, nullable: true })
  countryName: string;

  @Column({ type: 'uuid', nullable: true })
  regionId: string;

  @Column({ length: 200, nullable: true })
  regionName: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  timezone: string;

  @Column({ type: 'int', nullable: true })
  utcOffset: number;

  // Capacity & Usage
  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentOccupancy: number;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  utilizationRate: number;

  // Business Operations
  @Column({ type: 'simple-array', nullable: true })
  departments: string[];

  @Column({ type: 'simple-array', nullable: true })
  teams: string[];

  @Column({ type: 'simple-array', nullable: true })
  functions: string[];

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isOperational: boolean;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'boolean', default: false })
  isTemporary: boolean;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;
}
