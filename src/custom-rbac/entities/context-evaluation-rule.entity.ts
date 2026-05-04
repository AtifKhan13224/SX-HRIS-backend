import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index
} from 'typeorm';

export enum ContextType {
  LIFECYCLE_STAGE = 'LIFECYCLE_STAGE',
  NOTICE_PERIOD = 'NOTICE_PERIOD',
  ACTING_ASSIGNMENT = 'ACTING_ASSIGNMENT',
  TEMPORARY_ELEVATION = 'TEMPORARY_ELEVATION',
  TIME_BOUND = 'TIME_BOUND',
  EMERGENCY_MODE = 'EMERGENCY_MODE'
}

@Entity('context_evaluation_rules')
@Index(['tenantId', 'contextType'])
export class ContextEvaluationRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'rule_name', length: 255 })
  ruleName: string;

  @Column({
    name: 'context_type',
    type: 'enum',
    enum: ContextType
  })
  contextType: ContextType;

  @Column({
    name: 'evaluation_logic',
    type: 'jsonb',
    comment: 'IF-THEN conditions for context evaluation'
  })
  evaluationLogic: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
