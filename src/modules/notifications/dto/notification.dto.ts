import { IsString, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { NotificationType, NotificationCategory } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationType, default: NotificationType.INFO })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ enum: NotificationCategory, default: NotificationCategory.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @ApiProperty({ description: 'Action URL', required: false })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Sent by user ID', required: false })
  @IsOptional()
  @IsString()
  sentBy?: string;
}

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiProperty({ description: 'Is read', required: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class BulkCreateNotificationDto {
  @ApiProperty({ description: 'User IDs', type: [String] })
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationType, default: NotificationType.INFO })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ enum: NotificationCategory, default: NotificationCategory.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @ApiProperty({ description: 'Action URL', required: false })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Sent by user ID', required: false })
  @IsOptional()
  @IsString()
  sentBy?: string;
}

export class NotificationQueryDto {
  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ enum: NotificationCategory, required: false })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @ApiProperty({ description: 'Is read', required: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 20, required: false })
  @IsOptional()
  limit?: number;
}

export class UpdateNotificationPreferencesDto {
  @ApiProperty({ description: 'Email notifications', required: false })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({ description: 'Push notifications', required: false })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiProperty({ description: 'SMS notifications', required: false })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiProperty({ description: 'Category preferences', required: false })
  @IsOptional()
  @IsObject()
  categoryPreferences?: Record<string, boolean>;
}
