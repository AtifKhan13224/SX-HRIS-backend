import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'session_token', type: 'varchar', length: 500, unique: true })
  sessionToken: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  refreshToken: string;

  @Column({ name: 'access_token', type: 'varchar', length: 500, nullable: true })
  accessToken: string;

  // Device Information
  @Column({ name: 'device_id', type: 'text' })
  deviceId: string;

  @Column({ name: 'device_name', type: 'varchar', length: 255, nullable: true })
  deviceName: string;

  @Column({ name: 'device_type', type: 'varchar', length: 50, nullable: true })
  deviceType: string;

  @Column({ name: 'os_name', type: 'varchar', length: 100, nullable: true })
  osName: string;

  @Column({ name: 'os_version', type: 'varchar', length: 50, nullable: true })
  osVersion: string;

  @Column({ name: 'browser_name', type: 'varchar', length: 100, nullable: true })
  browserName: string;

  @Column({ name: 'browser_version', type: 'varchar', length: 50, nullable: true })
  browserVersion: string;

  @Column({ name: 'device_fingerprint', type: 'text', nullable: true })
  deviceFingerprint: string;

  // Network Information
  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'ip_country', type: 'varchar', length: 100, nullable: true })
  ipCountry: string;

  @Column({ name: 'ip_city', type: 'varchar', length: 255, nullable: true })
  ipCity: string;

  @Column({ name: 'ip_timezone', type: 'varchar', length: 100, nullable: true })
  ipTimezone: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  // Session Status
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_activity_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivityAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'terminated_at', type: 'timestamp', nullable: true })
  terminatedAt: Date;

  @Column({ name: 'termination_reason', type: 'varchar', length: 255, nullable: true })
  terminationReason: string;

  // Security Flags
  @Column({ name: 'mfa_verified', default: false })
  mfaVerified: boolean;

  @Column({ name: 'risk_score', type: 'int', default: 0 })
  riskScore: number;

  @Column({ name: 'is_suspicious', default: false })
  isSuspicious: boolean;

  @Column({ name: 'trust_score', type: 'int', default: 50 })
  trustScore: number;

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isValid(): boolean {
    return this.isActive && !this.isExpired && !this.terminatedAt;
  }
}
