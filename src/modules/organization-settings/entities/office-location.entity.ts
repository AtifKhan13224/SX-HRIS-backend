import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GroupCompany } from './group-company.entity';

@Entity('office_locations')
export class OfficeLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_company_id' })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  // Basic Information
  @Column({ unique: true, length: 20 })
  officeCode: string;

  @Column({ length: 200 })
  officeName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  officeType: string; // Headquarters, Regional Office, Branch, Satellite, Co-working, Remote Hub

  // Geographic Hierarchy
  @Column({ type: 'uuid', nullable: true })
  cityId: string;

  @Column({ length: 100, nullable: true })
  cityCode: string;

  @Column({ length: 200, nullable: true })
  cityName: string;

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

  // Address Information
  @Column({ type: 'text' })
  address: string;

  @Column({ length: 200, nullable: true })
  addressLine1: string;

  @Column({ length: 200, nullable: true })
  addressLine2: string;

  @Column({ length: 100, nullable: true })
  addressLine3: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  @Column({ length: 100, nullable: true })
  district: string;

  @Column({ length: 100, nullable: true })
  landmark: string;

  // Location Coordinates
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  mapUrl: string;

  @Column({ type: 'text', nullable: true })
  googleMapsLink: string;

  // Building Details
  @Column({ length: 200, nullable: true })
  buildingName: string;

  @Column({ length: 50, nullable: true })
  floorNumber: string;

  @Column({ length: 100, nullable: true })
  suiteNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAreaSqFt: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAreaSqM: number;

  @Column({ type: 'int', nullable: true })
  numberOfFloors: number;

  @Column({ type: 'boolean', default: false })
  isOwnedProperty: boolean;

  @Column({ type: 'boolean', default: false })
  isLeasedProperty: boolean;

  @Column({ type: 'date', nullable: true })
  leaseStartDate: Date;

  @Column({ type: 'date', nullable: true })
  leaseEndDate: Date;

  @Column({ length: 200, nullable: true })
  landlordName: string;

  @Column({ length: 100, nullable: true })
  landlordContact: string;

  // Capacity & Occupancy
  @Column({ type: 'int', nullable: true })
  seatCapacity: number;

  @Column({ type: 'int', nullable: true })
  currentOccupancy: number;

  @Column({ type: 'int', nullable: true })
  availableSeats: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  occupancyRate: number;

  @Column({ type: 'int', nullable: true })
  parkingSpaces: number;

  @Column({ type: 'int', nullable: true })
  meetingRoomsCount: number;

  @Column({ type: 'int', nullable: true })
  conferenceRoomsCount: number;

  // Contact Information
  @Column({ length: 50, nullable: true })
  phoneNumber: string;

  @Column({ length: 50, nullable: true })
  faxNumber: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  emergencyNumber: string;

  @Column({ length: 50, nullable: true })
  receptionNumber: string;

  // Operational Details
  @Column({ length: 50, nullable: true })
  timezone: string;

  @Column({ type: 'int', nullable: true })
  utcOffset: number;

  @Column({ type: 'jsonb', nullable: true })
  operatingHours: Record<string, any>;

  @Column({ type: 'time', nullable: true })
  standardOpenTime: string;

  @Column({ type: 'time', nullable: true })
  standardCloseTime: string;

  @Column({ type: 'simple-array', nullable: true })
  workingDays: string[];

  @Column({ type: 'boolean', default: true })
  is24x7: boolean;

  // Facilities & Amenities
  @Column({ type: 'simple-array', nullable: true })
  facilities: string[];

  @Column({ type: 'simple-array', nullable: true })
  amenities: string[];

  @Column({ type: 'boolean', default: false })
  hasCafeteria: boolean;

  @Column({ type: 'boolean', default: false })
  hasGym: boolean;

  @Column({ type: 'boolean', default: false })
  hasParking: boolean;

  @Column({ type: 'boolean', default: false })
  hasReceptionDesk: boolean;

  @Column({ type: 'boolean', default: false })
  hasConferenceRoom: boolean;

  @Column({ type: 'boolean', default: false })
  hasWifi: boolean;

  @Column({ type: 'boolean', default: false })
  hasSecurity: boolean;

  @Column({ type: 'boolean', default: false })
  hasAccessControl: boolean;

  @Column({ type: 'boolean', default: false })
  hasCCTV: boolean;

  @Column({ type: 'boolean', default: false })
  hasFireSafety: boolean;

  @Column({ type: 'boolean', default: false })
  hasDisabledAccess: boolean;

  @Column({ type: 'jsonb', nullable: true })
  facilityDetails: Record<string, any>;

  // IT & Technology
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  internetSpeedMbps: number;

  @Column({ length: 100, nullable: true })
  ispProvider: string;

  @Column({ type: 'boolean', default: false })
  hasBackupInternet: boolean;

  @Column({ type: 'boolean', default: false })
  hasVpn: boolean;

  @Column({ type: 'simple-array', nullable: true })
  itInfrastructure: string[];

  @Column({ type: 'jsonb', nullable: true })
  technologyStack: Record<string, any>;

  // Cost Information
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyRent: number;

  @Column({ length: 10, nullable: true })
  rentCurrency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyMaintenanceCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyUtilitiesCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalMonthlyCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPerSeat: number;

  @Column({ type: 'jsonb', nullable: true })
  costBreakdown: Record<string, any>;

  // Business Operations
  @Column({ type: 'simple-array', nullable: true })
  businessUnits: string[];

  @Column({ type: 'simple-array', nullable: true })
  departments: string[];

  @Column({ type: 'simple-array', nullable: true })
  functions: string[];

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ type: 'int', default: 0 })
  contractorCount: number;

  @Column({ type: 'int', default: 0 })
  visitorCount: number;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isOperational: boolean;

  @Column({ length: 100, nullable: true })
  status: string; // Active, Inactive, Under Construction, Closed, Renovating

  @Column({ type: 'date', nullable: true })
  operationalSince: Date;

  @Column({ type: 'date', nullable: true })
  closedDate: Date;

  // Management
  @Column({ type: 'uuid', nullable: true })
  officeManagerId: string;

  @Column({ length: 200, nullable: true })
  officeManagerName: string;

  @Column({ length: 100, nullable: true })
  officeManagerEmail: string;

  @Column({ type: 'uuid', nullable: true })
  facilityManagerId: string;

  @Column({ length: 200, nullable: true })
  facilityManagerName: string;

  @Column({ type: 'jsonb', nullable: true })
  managementTeam: Record<string, any>;

  // Compliance & Safety
  @Column({ type: 'simple-array', nullable: true })
  safetyCompliance: string[];

  @Column({ type: 'simple-array', nullable: true })
  certifications: string[];

  @Column({ type: 'date', nullable: true })
  lastSafetyInspection: Date;

  @Column({ type: 'date', nullable: true })
  nextSafetyInspection: Date;

  @Column({ type: 'date', nullable: true })
  fireSafetyExpiry: Date;

  @Column({ type: 'jsonb', nullable: true })
  complianceDocuments: Record<string, any>;

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
