import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { CustomRole } from './custom-role.entity';

export enum CompositionType {
  INHERITS_FROM = 'INHERITS_FROM',
  COMPOSED_OF = 'COMPOSED_OF',
  EXTENDS = 'EXTENDS'
}

export enum InheritanceStrategy {
  FULL = 'FULL',
  SELECTIVE = 'SELECTIVE',
  ADDITIVE = 'ADDITIVE',
  RESTRICTIVE = 'RESTRICTIVE'
}

export interface OverrideRule {
  permissionId: string;
  action: 'ALLOW' | 'DENY' | 'INHERIT';
  reason: string;
  priority: number;
}

@Entity('role_compositions')
@Index(['roleId'])
@Index(['parentRoleId'])
export class RoleComposition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'parent_role_id', type: 'uuid' })
  parentRoleId: string;

  @Column({
    name: 'composition_type',
    type: 'enum',
    enum: CompositionType
  })
  compositionType: CompositionType;

  @Column({
    name: 'inheritance_strategy',
    type: 'enum',
    enum: InheritanceStrategy,
    default: InheritanceStrategy.FULL
  })
  inheritanceStrategy: InheritanceStrategy;

  @Column({ name: 'override_rules', type: 'jsonb', default: [] })
  overrideRules: OverrideRule[];

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => CustomRole, role => role.compositions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: CustomRole;

  @ManyToOne(() => CustomRole, role => role.parentOf, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_role_id' })
  parentRole: CustomRole;
}
