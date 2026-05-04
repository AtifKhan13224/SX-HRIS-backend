import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { CustomRole } from './custom-role.entity';

export enum ChangeType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export interface UserAccessChange {
  userId: string;
  permissionsAdded: string[];
  permissionsRemoved: string[];
  scopeChanges: ScopeChange[];
}

export interface ScopeChange {
  permissionId: string;
  oldScope: any;
  newScope: any;
}

export interface SimulationResult {
  usersGainingAccess: UserAccessChange[];
  usersLosingAccess: UserAccessChange[];
  newSoDViolations: any[];
  riskScoreChange: number;
}

@Entity('role_versions')
@Index(['roleId', 'version'], { unique: true })
@Index(['roleId'])
export class RoleVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ type: 'int' })
  version: number;

  // Snapshot
  @Column({ name: 'role_snapshot', type: 'jsonb' })
  roleSnapshot: any;

  @Column({ name: 'permissions_snapshot', type: 'jsonb' })
  permissionsSnapshot: any[];

  @Column({ name: 'composition_snapshot', type: 'jsonb', default: [] })
  compositionSnapshot: any[];

  // Change Tracking
  @Column({
    name: 'change_type',
    type: 'enum',
    enum: ChangeType
  })
  changeType: ChangeType;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy: string;

  @Column({ name: 'changed_at', type: 'timestamp' })
  changedAt: Date;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason: string;

  // Impact
  @Column({ name: 'affected_user_count', type: 'int', default: 0 })
  affectedUserCount: number;

  @Column({ name: 'simulation_results', type: 'jsonb', nullable: true })
  simulationResults: SimulationResult;

  // Relations
  @ManyToOne(() => CustomRole, role => role.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: CustomRole;
}
