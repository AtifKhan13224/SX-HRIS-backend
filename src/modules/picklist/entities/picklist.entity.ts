import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('picklists')
@Index(['internalName'], { unique: true })
@Index(['type'])
@Index(['status'])
@Index(['isHierarchical'])
export class Picklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  internalName: string;

  @Column({ length: 255 })
  displayLabel: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['standard', 'custom', 'system'],
    default: 'custom',
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'draft', 'deprecated'],
    default: 'active',
  })
  status: string;

  @Column({ default: false })
  isHierarchical: boolean;

  @Column({ default: false })
  allowMultiSelect: boolean;

  @Column({ default: false })
  isSearchable: boolean;

  @Column({ default: true })
  isSortable: boolean;

  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ default: false })
  isVersioned: boolean;

  @Column({ default: false })
  supportExternalSync: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  externalSyncUrl: string;

  @Column({ type: 'int', nullable: true })
  maxValues: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  editPermissions: string[];

  @Column({ type: 'text', array: true, nullable: true })
  viewPermissions: string[];

  @Column({ type: 'int', default: 0 })
  totalValues: number;

  @Column({ type: 'int', default: 0 })
  activeValues: number;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PicklistValue, (value) => value.picklist, { cascade: true })
  values: PicklistValue[];

  @OneToMany(() => PicklistDependency, (dep) => dep.parentPicklist)
  dependencies: PicklistDependency[];

  @OneToMany(() => PicklistVersion, (version) => version.picklist)
  versions: PicklistVersion[];
}

@Entity('picklist_values')
@Index(['picklistId', 'value'], { unique: true })
@Index(['parentValue'])
@Index(['status'])
@Index(['order'])
export class PicklistValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  picklistId: string;

  @Column({ length: 100 })
  value: string;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  parentValue: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  effectiveStartDate: Date;

  @Column({ type: 'date', nullable: true })
  effectiveEndDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  translations: Array<{
    locale: string;
    label: string;
    description?: string;
  }>;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Picklist, (picklist) => picklist.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'picklistId' })
  picklist: Picklist;
}

@Entity('picklist_dependencies')
@Index(['parentPicklistId', 'childPicklistId'], { unique: true })
export class PicklistDependency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  parentPicklistId: string;

  @Column({ type: 'uuid' })
  childPicklistId: string;

  @Column({
    type: 'enum',
    enum: ['parent-child', 'cascading', 'conditional'],
    default: 'parent-child',
  })
  dependencyType: string;

  @Column({ type: 'jsonb', nullable: true })
  mappings: Array<{
    parentValue: string;
    childValues: string[];
  }>;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Picklist, (picklist) => picklist.dependencies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentPicklistId' })
  parentPicklist: Picklist;

  @ManyToOne(() => Picklist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'childPicklistId' })
  childPicklist: Picklist;
}

@Entity('picklist_versions')
@Index(['picklistId', 'version'], { unique: true })
export class PicklistVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  picklistId: string;

  @Column({ length: 50 })
  version: string;

  @Column({ type: 'text' })
  changeDescription: string;

  @Column({ type: 'jsonb' })
  snapshot: Record<string, any>;

  @Column({ type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Picklist, (picklist) => picklist.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'picklistId' })
  picklist: Picklist;
}

@Entity('picklist_usage_logs')
@Index(['picklistId'])
@Index(['fieldName'])
@Index(['usedAt'])
export class PicklistUsageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  picklistId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  valueId: string;

  @Column({ length: 200 })
  fieldName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  recordId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userId: string;

  @Column({ type: 'enum', enum: ['view', 'select', 'update'], default: 'select' })
  actionType: string;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any>;

  @CreateDateColumn()
  usedAt: Date;
}

@Entity('picklist_audit_logs')
@Index(['picklistId'])
@Index(['action'])
@Index(['performedAt'])
export class PicklistAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  picklistId: string;

  @Column({
    type: 'enum',
    enum: ['create', 'update', 'delete', 'activate', 'deactivate', 'version', 'import', 'export', 'sync'],
  })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'varchar', length: 100 })
  performedBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  performedAt: Date;
}
