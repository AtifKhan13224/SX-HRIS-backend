import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum ConflictType {
  PERMISSION_CONFLICT = 'PERMISSION_CONFLICT',
  ROLE_CONFLICT = 'ROLE_CONFLICT',
  CROSS_MODULE = 'CROSS_MODULE',
  APPROVAL_CHAIN = 'APPROVAL_CHAIN'
}

export enum RiskSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum EnforcementLevel {
  WARNING = 'WARNING',
  SOFT_BLOCK = 'SOFT_BLOCK',
  HARD_BLOCK = 'HARD_BLOCK'
}

export interface ForbiddenCombination {
  permissions?: string[];
  roles?: string[];
  reason: string;
  regulatoryReference?: string;
}

@Entity('sod_policies')
@Index(['tenantId', 'isActive'])
export class SoDPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Conflict Definition
  @Column({
    name: 'conflict_type',
    type: 'enum',
    enum: ConflictType
  })
  conflictType: ConflictType;

  @Column({ name: 'forbidden_combinations', type: 'jsonb' })
  forbiddenCombinations: ForbiddenCombination[];

  // Severity & Enforcement
  @Column({
    name: 'risk_severity',
    type: 'enum',
    enum: RiskSeverity
  })
  riskSeverity: RiskSeverity;

  @Column({
    name: 'enforcement_level',
    type: 'enum',
    enum: EnforcementLevel,
    default: EnforcementLevel.WARNING
  })
  enforcementLevel: EnforcementLevel;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
