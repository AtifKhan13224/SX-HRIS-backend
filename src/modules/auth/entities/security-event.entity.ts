import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('security_events')
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({ name: 'event_category', type: 'varchar', length: 100 })
  eventCategory: 'authentication' | 'authorization' | 'account' | 'session' | 'mfa' | 'password' | 'system';

  @Column({ type: 'varchar', length: 20 })
  severity: 'info' | 'warning' | 'high' | 'critical';

  @Column({ name: 'event_name', type: 'varchar', length: 255 })
  eventName: string;

  @Column({ name: 'event_description', type: 'text', nullable: true })
  eventDescription: string;

  @Column({ name: 'event_data', type: 'jsonb', nullable: true })
  eventData: Record<string, any>;

  // Context
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

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  sessionId: string;

  // Risk Analysis
  @Column({ name: 'risk_score', type: 'int', default: 0 })
  riskScore: number;

  @Column({ name: 'is_anomaly', default: false })
  isAnomaly: boolean;

  @Column({ name: 'anomaly_reason', type: 'varchar', length: 255, nullable: true })
  anomalyReason: string;

  // Response
  @Column({ name: 'action_taken', type: 'varchar', length: 255, nullable: true })
  actionTaken: string;

  @Column({ name: 'requires_review', default: false })
  requiresReview: boolean;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt: Date;
}
