import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Version Snapshot Entity
 * Stores complete snapshots of role configurations for rollback capability
 */
@Entity('rbac_role_version_snapshots')
@Index(['roleId', 'version'])
@Index(['createdAt'])
export class RBACRoleVersionSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  roleId: string;

  @Column({ type: 'integer' })
  version: number;

  @Column({ type: 'simple-json' })
  roleSnapshot: Record<string, any>; // Complete role state

  @Column({ type: 'simple-json' })
  permissionsSnapshot: Record<string, any>[]; // All permissions at this version

  @Column({ type: 'text', nullable: true })
  changeDescription: string;

  @Column({ type: 'text', nullable: true })
  changeReason: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdByName: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'boolean', default: true })
  canRollbackTo: boolean;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;
}
