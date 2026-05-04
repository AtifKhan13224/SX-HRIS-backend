import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { RolePermission } from './role-permission.entity';

export enum PermissionAction {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  EXPORT = 'EXPORT',
  OVERRIDE = 'OVERRIDE',
  MASS_UPDATE = 'MASS_UPDATE',
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE',
  DELEGATE = 'DELEGATE'
}

export enum DataType {
  STANDARD = 'STANDARD',
  PII = 'PII',
  FINANCIAL = 'FINANCIAL',
  SENSITIVE = 'SENSITIVE',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED'
}

@Entity('permissions')
@Index(['tenantId', 'module', 'feature'])
@Index(['tenantId', 'isActive'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // Permission Hierarchy
  @Column({ length: 100 })
  module: string;

  @Column({ name: 'sub_module', length: 100, nullable: true })
  subModule: string;

  @Column({ length: 100 })
  feature: string;

  // Actions
  @Column({ type: 'jsonb', default: [] })
  actions: PermissionAction[];

  // Security
  @Column({
    name: 'data_type',
    type: 'enum',
    enum: DataType,
    default: DataType.STANDARD
  })
  dataType: DataType;

  @Column({ name: 'sensitivity_tags', type: 'jsonb', default: [] })
  sensitivityTags: string[];

  // Metadata
  @Column({ name: 'display_name', length: 255 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'risk_level', type: 'int', default: 0 })
  riskLevel: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  // Relations
  @OneToMany(() => RolePermission, rp => rp.permission)
  rolePermissions: RolePermission[];
}
