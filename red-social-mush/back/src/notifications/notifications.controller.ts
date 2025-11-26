import { 
  Controller, 
  Get, 
  Patch, 
  Delete, 
  Param, 
  Query, 
  Request, 
  UseGuards 
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const userId = req.user.userId;
    return await this.notificationsService.getNotifications(
      userId, 
      parseInt(page), 
      parseInt(limit)
    );
  }

  @Get('unread')
  async getUnreadNotifications(@Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.getUnreadNotifications(userId);
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.userId;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { unreadCount: count };
  }

  @Patch(':notificationId/read')
  async markAsRead(@Param('notificationId') notificationId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.markAsRead(notificationId, userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':notificationId')
  async deleteNotification(@Param('notificationId') notificationId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.deleteNotification(notificationId, userId);
  }

  @Delete()
  async deleteAllNotifications(@Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.deleteAllNotifications(userId);
  }
}