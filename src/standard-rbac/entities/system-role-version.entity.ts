import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { SystemRole } from './system-role.entity';

export enum ChangeType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  PERMISSIONS_CHANGED = 'PERMISSIONS_CHANGED',
  SCOPE_CHANGED = 'SCOPE_CHANGED',
  ACTIVATED = 'ACTIVATED',
  DEACTIVATED = 'DEACTIVATED',
  ARCHIVED = 'ARCHIVED',
  RESTORED = 'RESTORED'
}

@Entity('system_role_versions')
@Index(['systemRoleId', 'versionNumber'], { unique: true })
@Index(['systemRoleId', 'createdAt'])
@Index(['changeType', 'createdAt'])
export class SystemRoleVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  systemRoleId: string;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column({
    type: 'enum',
    enum: ChangeType
  })
  changeType: ChangeType;

  @Column({ type: 'jsonb' })
  snapshotData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  permissionsSnapshot: Array<{
    permissionCode: string;
    grantType: string;
    dataScopeConfigId: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  changesSummary: {
    addedPermissions: string[];
    removedPermissions: string[];
    modifiedPermissions: string[];
    scopeChanges: Record<string, any>;
  };

  @Column({ type: 'text', nullable: true })
  changeReason: string;

  @Column({ type: 'text', nullable: true })
  approvalReference: string;

  @Column({ length: 100 })
  changedBy: string;

  @Column({ length: 255, nullable: true })
  changedByName: string;

  @Column({ length: 100, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ default: false })
  isRollbackVersion: boolean;

  @Column({ type: 'uuid', nullable: true })
  rollbackFromVersionId: string;

  @Column({ type: 'jsonb', nullable: true })
  complianceSignoff: Array<{
    framework: string;
    approver: string;
    signedAt: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  regulatoryAudit: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => SystemRole, role => role.versions)
  @JoinColumn({ name: 'systemRoleId' })
  systemRole: SystemRole;
}
