import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationPreference, NotificationType, NotificationCategory } from './entities/notification.entity';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  BulkCreateNotificationDto,
  NotificationQueryDto,
  UpdateNotificationPreferencesDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferencesRepository: Repository<NotificationPreference>,
  ) {}

  // Notification Methods
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async bulkCreate(bulkCreateDto: BulkCreateNotificationDto): Promise<Notification[]> {
    const { userIds, ...notificationData } = bulkCreateDto;

    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        userId,
        ...notificationData,
      }),
    );

    return this.notificationRepository.save(notifications);
  }

  async findAll(query: NotificationQueryDto): Promise<{
    data: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  }> {
    const { userId, category, isRead, page = 1, limit = 20 } = query;

    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

    if (userId) {
      queryBuilder.andWhere('notification.userId = :userId', { userId });
    }

    if (category) {
      queryBuilder.andWhere('notification.category = :category', { category });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    const total = await queryBuilder.getCount();

    // Get unread count for the user
    let unreadCount = 0;
    if (userId) {
      unreadCount = await this.notificationRepository.count({
        where: { userId, isRead: false },
      });
    }

    const data = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, unreadCount, page, limit };
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update()
      .set({ isRead: true, readAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();
  }

  async deleteAllRead(userId: string): Promise<void> {
    await this.notificationRepository.delete({
      userId,
      isRead: true,
    });
  }

  async getUserUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  // Notification Preferences Methods
  async getPreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await this.preferencesRepository.findOne({ where: { userId } });

    if (!preferences) {
      // Create default preferences if not exists
      preferences = this.preferencesRepository.create({
        userId,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        categoryPreferences: {},
      });
      await this.preferencesRepository.save(preferences);
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreference> {
    let preferences = await this.preferencesRepository.findOne({ where: { userId } });

    if (!preferences) {
      preferences = this.preferencesRepository.create({
        userId,
        ...updatePreferencesDto,
      });
    } else {
      Object.assign(preferences, updatePreferencesDto);
    }

    return this.preferencesRepository.save(preferences);
  }

  // Utility Methods
  async sendLeaveNotification(
    userId: string,
    leaveStatus: string,
    leaveType: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      title: 'Leave Request Update',
      message: `Your ${leaveType} leave request has been ${leaveStatus}`,
      type: leaveStatus === 'approved' ? NotificationType.SUCCESS : NotificationType.WARNING,
      category: NotificationCategory.LEAVE,
      metadata: { leaveType, status: leaveStatus },
    });
  }

  async sendPayrollNotification(userId: string, month: string): Promise<Notification> {
    return this.create({
      userId,
      title: 'Payroll Processed',
      message: `Your payroll for ${month} has been processed`,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.PAYROLL,
      metadata: { month },
    });
  }

  async sendPerformanceReviewNotification(
    userId: string,
    reviewPeriod: string,
  ): Promise<Notification> {
    return this.create({
      userId,
      title: 'Performance Review',
      message: `Your performance review for ${reviewPeriod} is ready`,
      type: NotificationType.INFO,
      category: NotificationCategory.PERFORMANCE,
      actionUrl: '/performance/reviews',
      metadata: { reviewPeriod },
    });
  }
}
