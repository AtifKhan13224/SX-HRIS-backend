import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_mfa_settings')
export class MfaSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  method: 'totp' | 'sms' | 'email' | 'biometric';

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ name: 'totp_secret', type: 'text', nullable: true })
  totpSecret: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ name: 'email_address', type: 'varchar', length: 255, nullable: true })
  emailAddress: string;

  @Column({ name: 'device_id', type: 'text', nullable: true })
  deviceId: string;

  @Column({ name: 'device_name', type: 'varchar', length: 255, nullable: true })
  deviceName: string;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
