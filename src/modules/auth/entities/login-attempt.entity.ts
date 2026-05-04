import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'boolean' })
  success: boolean;

  @Column({ name: 'failure_reason', type: 'varchar', length: 255, nullable: true })
  failureReason: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'ip_country', type: 'varchar', length: 100, nullable: true })
  ipCountry: string;

  @Column({ name: 'ip_city', type: 'varchar', length: 255, nullable: true })
  ipCity: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'device_id', type: 'text', nullable: true })
  deviceId: string;

  @Column({ name: 'device_fingerprint', type: 'text', nullable: true })
  deviceFingerprint: string;

  @Column({ name: 'risk_score', type: 'int', default: 0 })
  riskScore: number;

  @Column({ name: 'is_suspicious', type: 'boolean', default: false })
  isSuspicious: boolean;

  @Column({ name: 'blocked_by_rule', type: 'varchar', length: 255, nullable: true })
  blockedByRule: string;

  @Column({ name: 'mfa_required', type: 'boolean', default: false })
  mfaRequired: boolean;

  @Column({ name: 'mfa_verified', type: 'boolean', default: false })
  mfaVerified: boolean;

  @Column({ name: 'mfa_method', type: 'varchar', length: 50, nullable: true })
  mfaMethod: string;

  @CreateDateColumn({ name: 'attempted_at' })
  attemptedAt: Date;
}
