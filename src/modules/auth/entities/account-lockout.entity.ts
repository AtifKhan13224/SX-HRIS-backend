import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('account_lockouts')
export class AccountLockout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'locked_at' })
  lockedAt: Date;

  @Column({ name: 'locked_until', type: 'timestamp' })
  lockedUntil: Date;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ name: 'trigger_type', type: 'varchar', length: 100, nullable: true })
  triggerType: 'failed_attempts' | 'suspicious_activity' | 'manual' | 'compliance' | 'admin';

  @Column({ name: 'failed_attempts_count', type: 'int', nullable: true })
  failedAttemptsCount: number;

  @Column({ name: 'triggering_ip', type: 'varchar', length: 45, nullable: true })
  triggeringIp: string;

  @Column({ name: 'triggering_event', type: 'text', nullable: true })
  triggeringEvent: string;

  @Column({ name: 'unlocked_at', type: 'timestamp', nullable: true })
  unlockedAt: Date;

  @Column({ name: 'unlocked_by', nullable: true })
  unlockedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'unlocked_by' })
  unlockedByUser: User;

  @Column({ name: 'unlock_method', type: 'varchar', length: 100, nullable: true })
  unlockMethod: 'auto_expire' | 'admin_unlock' | 'password_reset' | 'support_ticket';

  @Column({ name: 'unlock_reason', type: 'text', nullable: true })
  unlockReason: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  get isCurrentlyLocked(): boolean {
    return this.isActive && new Date() < this.lockedUntil && !this.unlockedAt;
  }
}
