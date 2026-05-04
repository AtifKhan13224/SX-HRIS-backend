import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('password_history')
export class PasswordHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;

  @Column({ name: 'changed_by', nullable: true })
  changedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;

  @Column({ name: 'change_reason', type: 'varchar', length: 255, nullable: true })
  changeReason: 'manual' | 'expired' | 'reset' | 'compromised' | 'policy' | 'admin';

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;
}
