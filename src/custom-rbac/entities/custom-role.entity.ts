import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';

export enum RoleCategory {
  OPERATIONAL = 'OPERATIONAL',
  MANAGERIAL = 'MANAGERIAL',
  HR = 'HR',
  FINANCE = 'FINANCE',
  IT = 'IT',
  AUDIT = 'AUDIT',
  EXECUTIVE = 'EXECUTIVE',
  CUSTOM = 'CUSTOM'
}

export enum SensitivityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

@Entity('custom_roles')
@Index(['tenantId', 'roleCode'], { unique: true })
@Index(['tenantId', 'category'])
@Index(['tenantId', 'isActive'])
export class CustomRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'role_code', length: 100 })
  roleCode: string;

  @Column({ name: 'role_name', length: 255 })
  roleName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Classification
  @Column({
    type: 'enum',
    enum: RoleCategory
  })
  category: RoleCategory;

  @Column({
    name: 'sensitivity_level',
    type: 'enum',
    enum: SensitivityLevel,
    default: SensitivityLevel.LOW
  })
  sensitivityLevel: SensitivityLevel;

  @Column({ name: 'business_criticality', length: 100, nullable: true })
  businessCriticality: string;

  // Lifecycle
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'effective_start_date', type: 'timestamp' })
  effectiveStartDate: Date;

  @Column({ name: 'effective_end_date', type: 'timestamp', nullable: true })
  effectiveEndDate: Date;

  // Governance
  @Column({ name: 'requires_approval', default: false })
  requiresApproval: boolean;

  @Column({ name: 'approval_workflow_id', type: 'uuid', nullable: true })
  approvalWorkflowId: string;

  @Column({ name: 'risk_score', type: 'int', default: 0 })
  riskScore: number;

  // Metadata
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'modified_by', type: 'uuid', nullable: true })
  modifiedBy: string;

  @UpdateDateColumn({ name: 'modified_at', nullable: true })
  modifiedAt: Date;

  @Column({ type: 'int', default: 1 })
  version: number;

  // Relations
  @OneToMany(() => RoleComposition, composition => composition.role)
  compositions: RoleComposition[];

  @OneToMany(() => RoleComposition, composition => composition.parentRole)
  parentOf: RoleComposition[];

  @OneToMany(() => RolePermission, rp => rp.role)
  permissions: RolePermission[];

  @OneToMany(() => RoleVersion, version => version.role)
  versions: RoleVersion[];
}

// Import related entities (forward declarations)
import { RoleComposition } from './role-composition.entity';
import { RolePermission } from './role-permission.entity';
import { RoleVersion } from './role-version.entity';
