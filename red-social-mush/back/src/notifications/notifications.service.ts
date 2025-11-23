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
  ) {
    console.log('✅ NotificationsService inicializado');
  }

  // ✅ Crear notificación con manejo robusto de errores
  async createNotification(dto: CreateNotificationDto) {
    console.log('🔔 [NotificationsService] Creando notificación');
    console.log('   recipientID:', dto.recipientID, '(tipo:', typeof dto.recipientID, ')');
    console.log('   senderID:', dto.senderID, '(tipo:', typeof dto.senderID, ')');
    console.log('   type:', dto.type);
    console.log('   message:', dto.message);
    console.log('   relatedID:', dto.relatedID);

    try {
      // Validar que los IDs sean válidos
      if (!Types.ObjectId.isValid(dto.recipientID)) {
        throw new BadRequestException(`recipientID inválido: ${dto.recipientID}`);
      }
      if (!Types.ObjectId.isValid(dto.senderID)) {
        throw new BadRequestException(`senderID inválido: ${dto.senderID}`);
      }
      if (dto.relatedID && !Types.ObjectId.isValid(dto.relatedID)) {
        throw new BadRequestException(`relatedID inválido: ${dto.relatedID}`);
      }

      const notificationData: any = {
        recipientID: new Types.ObjectId(dto.recipientID),
        senderID: new Types.ObjectId(dto.senderID),
        type: dto.type,
        message: dto.message,
        isRead: false,
      };

      // Solo agregar relatedID si existe
      if (dto.relatedID) {
        notificationData.relatedID = new Types.ObjectId(dto.relatedID);
      }

      console.log('   Datos a guardar:', JSON.stringify(notificationData, null, 2));

      const notification = new this.notificationModel(notificationData);
      
      console.log('   Documento antes de save():', notification);

      const saved = await notification.save();
      
      console.log('✅ Notificación guardada exitosamente');
      console.log('   _id:', saved._id);
      console.log('   recipientID:', saved.recipientID);
      console.log('   senderID:', saved.senderID);
      console.log('   type:', saved.type);
      console.log('   isRead:', saved.isRead);

      return saved;
    } catch (error) {
      console.error('❌ ERROR COMPLETO al guardar notificación:');
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
      console.error('   Error completo:', error);
      throw error;
    }
  }

  // ✅ Obtener notificaciones del usuario (con paginación)
  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    console.log('📋 [getNotifications] userId:', userId, 'page:', page, 'limit:', limit);
    
    const skip = (page - 1) * limit;

    const notifications = await this.notificationModel
      .find({ recipientID: userId })
      .populate('senderID', 'username userPhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    console.log('   Encontradas:', notifications.length);

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
    console.log('📥 [getUnreadNotifications] userId:', userId);
    console.log('   Tipo de userId:', typeof userId);
    console.log('   Es ObjectId válido?:', Types.ObjectId.isValid(userId));

    // Asegurar que userId sea ObjectId
    const userObjectId = new Types.ObjectId(userId);
    
    console.log('   Buscando con ObjectId:', userObjectId);

    const notifications = await this.notificationModel
      .find({ recipientID: userObjectId, isRead: false })
      .populate('senderID', 'username userPhoto')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    console.log('   Notificaciones encontradas:', notifications.length);
    
    if (notifications.length > 0) {
      console.log('   Primera notificación:', {
        _id: notifications[0]._id,
        recipientID: notifications[0].recipientID,
        type: notifications[0].type,
        isRead: notifications[0].isRead,
      });
    }

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
    const result = await this.notificationModel.updateMany(
      { recipientID: userId, isRead: false },
      { $set: { isRead: true } }
    );

    console.log(`✅ Marcadas como leídas: ${result.modifiedCount} notificaciones`);

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
    console.log('📊 [getUnreadCount] userId:', userId);
    
    const userObjectId = new Types.ObjectId(userId);
    
    const count = await this.notificationModel.countDocuments({
      recipientID: userObjectId,
      isRead: false,
    });
    
    console.log('   Cantidad no leídas:', count);
    return count;
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

  // ✅ MÉTODO DE DEBUG - Eliminar después de testear
  async debugGetAllNotifications() {
    const all = await this.notificationModel.find().lean();
    console.log('🔍 Total de notificaciones en DB:', all.length);
    return all;
  }

  // ✅ Eliminar notificación por relatedID (cuando se procesa una solicitud)
async deleteNotificationByRelatedId(relatedId: string) {
  console.log('🗑️ Eliminando notificación con relatedID:', relatedId);
  
  const result = await this.notificationModel.deleteMany({
    relatedID: new Types.ObjectId(relatedId),
  });

  console.log(`✅ Notificaciones eliminadas: ${result.deletedCount}`);
  return { success: true, deletedCount: result.deletedCount };
}
}