import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { SystemRole } from './system-role.entity';
import { PermissionRegistry } from './permission-registry.entity';
import { DataScopeConfig } from './data-scope-config.entity';

export enum GrantType {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  CONDITIONAL = 'CONDITIONAL'
}

@Entity('system_role_permissions')
@Index(['systemRoleId', 'permissionId'], { unique: true })
@Index(['systemRoleId', 'isActive'])
@Index(['permissionId', 'grantType'])
export class SystemRolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  systemRoleId: string;

  @Column({ type: 'uuid' })
  @Index()
  permissionId: string;

  @Column({
    type: 'enum',
    enum: GrantType,
    default: GrantType.ALLOW
  })
  grantType: GrantType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo: Date;

  @Column({ default: false })
  isConditional: boolean;

  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>;

  @Column({ default: false })
  requiresDataScope: boolean;

  @Column({ type: 'uuid', nullable: true })
  dataScopeConfigId: string;

  @Column({ default: false })
  requiresFieldSecurity: boolean;

  @Column({ type: 'jsonb', nullable: true })
  fieldRestrictions: Record<string, any>;

  @Column({ default: false })
  allowOverride: boolean;

  @Column({ length: 100, nullable: true })
  overrideApprover: string;

  @Column({ default: false })
  auditRequired: boolean;

  @Column({ type: 'jsonb', nullable: true })
  runtimeConstraints: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100 })
  createdBy: string;

  @ManyToOne(() => SystemRole, role => role.permissions)
  @JoinColumn({ name: 'systemRoleId' })
  systemRole: SystemRole;

  @ManyToOne(() => PermissionRegistry)
  @JoinColumn({ name: 'permissionId' })
  permission: PermissionRegistry;

  @ManyToOne(() => DataScopeConfig)
  @JoinColumn({ name: 'dataScopeConfigId' })
  dataScopeConfig: DataScopeConfig;
}
