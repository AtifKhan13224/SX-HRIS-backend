import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ConflictSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ConflictAction {
  BLOCK = 'BLOCK',
  WARN = 'WARN',
  ALLOW_WITH_APPROVAL = 'ALLOW_WITH_APPROVAL',
  LOG_ONLY = 'LOG_ONLY'
}

export enum RegulatoryFramework {
  SOX = 'SOX',
  GDPR = 'GDPR',
  SOC2 = 'SOC2',
  ISO27001 = 'ISO27001',
  HIPAA = 'HIPAA',
  PCI_DSS = 'PCI_DSS',
  CUSTOM = 'CUSTOM'
}

@Entity('sod_policies')
@Index(['policyCode'], { unique: true })
@Index(['tenantId', 'isActive'])
@Index(['conflictSeverity', 'isEnforced'])
export class SoDPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  @Index()
  policyCode: string;

  @Column({ length: 255 })
  policyName: string;

  @Column({ type: 'text', nullable: true })
  policyDescription: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isEnforced: boolean;

  @Column({ length: 100, nullable: true })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  conflictingRole1: string;

  @Column({ type: 'uuid' })
  conflictingRole2: string;

  @Column({ type: 'simple-array', nullable: true })
  conflictingPermissions: string[];

  @Column({
    type: 'enum',
    enum: ConflictSeverity,
    default: ConflictSeverity.MEDIUM
  })
  conflictSeverity: ConflictSeverity;

  @Column({
    type: 'enum',
    enum: ConflictAction,
    default: ConflictAction.WARN
  })
  conflictAction: ConflictAction;

  @Column({ type: 'text', nullable: true })
  businessJustification: string;

  @Column({ type: 'text', nullable: true })
  mitigatingControls: string;

  @Column({ type: 'simple-array', nullable: true })
  regulatoryFrameworks: string[];

  @Column({ type: 'jsonb', nullable: true })
  complianceMapping: Record<string, any>;

  @Column({ default: false })
  requiresException: boolean;

  @Column({ type: 'text', nullable: true })
  exceptionApproverRole: string;

  @Column({ type: 'int', nullable: true })
  exceptionValidityDays: number;

  @Column({ default: false })
  requiresPeriodicReview: boolean;

  @Column({ type: 'int', default: 90 })
  reviewFrequencyDays: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewedAt: Date;

  @Column({ length: 100, nullable: true })
  lastReviewedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  auditFlags: string[];

  @Column({ type: 'jsonb', nullable: true })
  riskMetrics: {
    riskScore: number;
    impactLevel: string;
    likelihood: string;
    residualRisk: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100 })
  createdBy: string;
}
