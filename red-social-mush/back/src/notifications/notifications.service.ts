import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';

interface CreateNotificationDto {
  recipientID: string;
  senderID: string;
  type: NotificationType;
  message: string;
  relatedID?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  // ✅ Crear notificación
  async createNotification(dto: CreateNotificationDto) {
    const notification = new this.notificationModel({
      recipientID: new Types.ObjectId(dto.recipientID),
      senderID: new Types.ObjectId(dto.senderID),
      type: dto.type,
      message: dto.message,
      relatedID: dto.relatedID ? new Types.ObjectId(dto.relatedID) : undefined,
      isRead: false,
    });

    await notification.save();
    return notification;
  }

  // ✅ Obtener notificaciones del usuario (con paginación)
  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const notifications = await this.notificationModel
      .find({ recipientID: userId })
      .populate('senderID', 'username userPhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const total = await this.notificationModel.countDocuments({ recipientID: userId });
    const unreadCount = await this.getUnreadCount(userId);

    return {
      notifications: notifications.map((notif: any) => ({
        _id: notif._id,
        type: notif.type,
        message: notif.message,
        isRead: notif.isRead,
        relatedID: notif.relatedID,
        createdAt: notif.createdAt,
        sender: {
          _id: notif.senderID._id,
          username: notif.senderID.username,
          userPhoto: notif.senderID.userPhoto,
        },
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        unreadCount,
      },
    };
  }

  // ✅ Obtener solo notificaciones no leídas
  async getUnreadNotifications(userId: string) {
    const notifications = await this.notificationModel
      .find({ recipientID: userId, isRead: false })
      .populate('senderID', 'username userPhoto')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return notifications.map((notif: any) => ({
      _id: notif._id,
      type: notif.type,
      message: notif.message,
      isRead: notif.isRead,
      relatedID: notif.relatedID,
      createdAt: notif.createdAt,
      sender: {
        _id: notif.senderID._id,
        username: notif.senderID.username,
        userPhoto: notif.senderID.userPhoto,
      },
    }));
  }

  // ✅ Marcar notificación como leída
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.recipientID.toString() !== userId) {
      throw new BadRequestException('No puedes marcar esta notificación');
    }

    notification.isRead = true;
    await notification.save();

    return { success: true, message: 'Notificación marcada como leída' };
  }

  // ✅ Marcar todas como leídas
  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { recipientID: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return { success: true, message: 'Todas las notificaciones fueron marcadas como leídas' };
  }

  // ✅ Eliminar notificación
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.recipientID.toString() !== userId) {
      throw new BadRequestException('No puedes eliminar esta notificación');
    }

    await this.notificationModel.findByIdAndDelete(notificationId);

    return { success: true, message: 'Notificación eliminada' };
  }

  // ✅ Eliminar todas las notificaciones
  async deleteAllNotifications(userId: string) {
    await this.notificationModel.deleteMany({ recipientID: userId });
    return { success: true, message: 'Todas las notificaciones fueron eliminadas' };
  }

  // ✅ Contar notificaciones no leídas
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationModel.countDocuments({
      recipientID: userId,
      isRead: false,
    });
  }

  // ✅ Eliminar notificaciones antiguas (más de 30 días)
  async deleteOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true,
    });

    return { 
      success: true, 
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} notificaciones antiguas eliminadas` 
    };
  }
}