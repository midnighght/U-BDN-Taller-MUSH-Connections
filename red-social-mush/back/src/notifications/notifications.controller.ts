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

  // ✅ Obtener todas las notificaciones (con paginación)
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

  // ✅ Obtener solo notificaciones no leídas
  @Get('unread')
  async getUnreadNotifications(@Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.getUnreadNotifications(userId);
  }

  // ✅ Obtener cantidad de notificaciones no leídas
  @Get('unread/count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.userId;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { unreadCount: count };
  }

  // ✅ Marcar una notificación como leída
  @Patch(':notificationId/read')
  async markAsRead(@Param('notificationId') notificationId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.markAsRead(notificationId, userId);
  }

  // ✅ Marcar todas las notificaciones como leídas
  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.markAllAsRead(userId);
  }

  // ✅ Eliminar una notificación
  @Delete(':notificationId')
  async deleteNotification(@Param('notificationId') notificationId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.deleteNotification(notificationId, userId);
  }

  // ✅ Eliminar todas las notificaciones
  @Delete()
  async deleteAllNotifications(@Request() req) {
    const userId = req.user.userId;
    return await this.notificationsService.deleteAllNotifications(userId);
  }
}