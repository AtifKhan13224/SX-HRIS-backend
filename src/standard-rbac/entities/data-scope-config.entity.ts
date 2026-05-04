import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ScopeType {
  LEGAL_ENTITY = 'LEGAL_ENTITY',
  COUNTRY = 'COUNTRY',
  REGION = 'REGION',
  BUSINESS_UNIT = 'BUSINESS_UNIT',
  DEPARTMENT = 'DEPARTMENT',
  COST_CENTER = 'COST_CENTER',
  REPORTING_LINE = 'REPORTING_LINE',
  LOCATION = 'LOCATION',
  DIVISION = 'DIVISION',
  CUSTOM = 'CUSTOM',
  GLOBAL = 'GLOBAL'
}

export enum ScopeLogic {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  XOR = 'XOR'
}

@Entity('data_scope_config')
@Index(['scopeCode'], { unique: true })
@Index(['tenantId', 'isActive'])
@Index(['scopeType', 'isActive'])
export class DataScopeConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  @Index()
  scopeCode: string;

  @Column({ length: 255 })
  scopeName: string;

  @Column({ type: 'text', nullable: true })
  scopeDescription: string;

  @Column({
    type: 'enum',
    enum: ScopeType
  })
  scopeType: ScopeType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 100, nullable: true })
  @Index()
  tenantId: string;

  @Column({ default: false })
  isHierarchical: boolean;

  @Column({ default: false })
  includeChildren: boolean;

  @Column({ default: 0 })
  hierarchyDepth: number;

  @Column({ type: 'simple-array', nullable: true })
  scopeValues: string[];

  @Column({
    type: 'enum',
    enum: ScopeLogic,
    default: ScopeLogic.OR
  })
  scopeLogic: ScopeLogic;

  @Column({ type: 'jsonb', nullable: true })
  layeredScopes: Array<{
    scopeType: ScopeType;
    scopeValues: string[];
    logic: ScopeLogic;
  }>;

  @Column({ default: false })
  dynamicResolution: boolean;

  @Column({ type: 'text', nullable: true })
  resolutionRule: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  reportingLineConfig: {
    directReports: boolean;
    indirectReports: boolean;
    maxLevels: number;
    includeMatrix: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  geographicScope: {
    countries: string[];
    regions: string[];
    includeSubRegions: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  temporalScope: {
    allowHistorical: boolean;
    allowFuture: boolean;
    maxHistoricalDays: number;
    maxFutureDays: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  exclusions: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100 })
  createdBy: string;
}
