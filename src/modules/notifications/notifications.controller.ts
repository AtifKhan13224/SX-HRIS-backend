import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  BulkCreateNotificationDto,
  NotificationQueryDto,
  UpdateNotificationPreferencesDto,
} from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create bulk notifications' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  bulkCreate(@Body() bulkCreateDto: BulkCreateNotificationDto) {
    return this.notificationsService.bulkCreate(bulkCreateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications with filters' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  findAll(@Query() query: NotificationQueryDto) {
    return this.notificationsService.findAll(query);
  }

  @Get('unread-count/:userId')
  @ApiOperation({ summary: 'Get unread notification count for a user' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  getUserUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUserUnreadCount(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.EMPLOYEE)
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('mark-all-read/:userId')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete('clear-read/:userId')
  @ApiOperation({ summary: 'Delete all read notifications for a user' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  deleteAllRead(@Param('userId') userId: string) {
    return this.notificationsService.deleteAllRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE)
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  // Notification Preferences
  @Get('preferences/:userId')
  @ApiOperation({ summary: 'Get notification preferences for a user' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  getPreferences(@Param('userId') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  @Patch('preferences/:userId')
  @ApiOperation({ summary: 'Update notification preferences for a user' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  updatePreferences(
    @Param('userId') userId: string,
    @Body() updatePreferencesDto: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationsService.updatePreferences(userId, updatePreferencesDto);
  }
}
