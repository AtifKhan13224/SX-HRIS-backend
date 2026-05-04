import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum NotificationCategory {
  SYSTEM = 'system',
  LEAVE = 'leave',
  ATTENDANCE = 'attendance',
  PAYROLL = 'payroll',
  PERFORMANCE = 'performance',
  RECRUITMENT = 'recruitment',
  ANNOUNCEMENT = 'announcement',
}

@Entity('notifications')
@Index(['userId', 'isRead'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationCategory,
    default: NotificationCategory.SYSTEM,
  })
  category: NotificationCategory;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ nullable: true, name: 'action_url' })
  actionUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'sent_by', nullable: true })
  sentBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('notification_preferences')
@Index(['userId'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'email_notifications', default: true })
  emailNotifications: boolean;

  @Column({ name: 'push_notifications', default: true })
  pushNotifications: boolean;

  @Column({ name: 'sms_notifications', default: false })
  smsNotifications: boolean;

  @Column({ type: 'jsonb', default: {}, name: 'category_preferences' })
  categoryPreferences: Record<string, boolean>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
