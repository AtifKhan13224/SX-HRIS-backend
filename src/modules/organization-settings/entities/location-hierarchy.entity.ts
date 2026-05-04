import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GroupCompany } from './group-company.entity';

@Entity('location_hierarchies')
export class LocationHierarchy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_company_id' })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  // Basic Information
  @Column({ unique: true, length: 20 })
  hierarchyCode: string;

  @Column({ length: 200 })
  hierarchyName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Hierarchy Structure
  @Column({ length: 100 })
  locationType: string; // Region, Country, State, City, Office, Work Location

  @Column({ type: 'uuid' })
  locationId: string;

  @Column({ length: 200 })
  locationName: string;

  @Column({ type: 'uuid', nullable: true })
  parentHierarchyId: string;

  @Column({ type: 'uuid', nullable: true })
  parentLocationId: string;

  @Column({ length: 200, nullable: true })
  parentLocationName: string;

  @Column({ length: 100, nullable: true })
  parentLocationType: string;

  @Column({ type: 'simple-array', nullable: true })
  childHierarchyIds: string[];

  @Column({ type: 'int', default: 1 })
  hierarchyLevel: number;

  @Column({ type: 'text', nullable: true })
  hierarchyPath: string; // e.g., "Region/Country/State/City/Office"

  @Column({ type: 'jsonb', nullable: true })
  pathIds: Record<string, any>; // { regionId, countryId, stateId, cityId, officeId }

  // Aggregations
  @Column({ type: 'int', default: 0 })
  childrenCount: number;

  @Column({ type: 'int', default: 0 })
  totalDescendants: number;

  @Column({ type: 'int', default: 0 })
  officeCount: number;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isLeaf: boolean;

  @Column({ type: 'boolean', default: false })
  isRoot: boolean;

  // Metadata
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
