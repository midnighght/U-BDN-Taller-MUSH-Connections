// requests/requests.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request, RequestDocument, RequestType, RequestStatus } from './schemas/requests.schema';
import { Friendship, FriendshipDocument, FriendshipStatus } from 'src/friendships/schemas/friendship.schema';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/schemas/notification.schema';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
    @InjectModel(Friendship.name) private friendshipModel: Model<FriendshipDocument>,
    private notificationsService: NotificationsService,
  ) {}

  // ✅ Crear solicitud de amistad
  async createFriendRequest(requesterId: string, recipientId: string) {
    console.log('📤 Creando solicitud de amistad');
    console.log('   De:', requesterId);
    console.log('   Para:', recipientId);

    if (requesterId === recipientId) {
      throw new BadRequestException('No puedes enviarte una solicitud a ti mismo');
    }

    const requesterObjectId = new Types.ObjectId(requesterId);
    const recipientObjectId = new Types.ObjectId(recipientId);

    // ✅ Verificar si ya son amigos (en Friendships)
    const existingFriendship = await this.friendshipModel.findOne({
      $or: [
        { requesterID: requesterObjectId, recipientID: recipientObjectId, status: FriendshipStatus.ACCEPTED },
        { requesterID: recipientObjectId, recipientID: requesterObjectId, status: FriendshipStatus.ACCEPTED },
      ],
    });

    if (existingFriendship) {
      throw new BadRequestException('Ya son amigos');
    }

    // ✅ Verificar si ya existe una solicitud pendiente (en cualquier dirección)
    const existingRequest = await this.requestModel.findOne({
      $or: [
        { requesterID: requesterObjectId, recipientID: recipientObjectId },
        { requesterID: recipientObjectId, recipientID: requesterObjectId },
      ],
      type: RequestType.FRIEND_REQUEST,
      status: RequestStatus.PENDING,
    });

    if (existingRequest) {
      throw new BadRequestException('Ya existe una solicitud pendiente');
    }

    // ✅ Crear la solicitud
    const request = new this.requestModel({
      requesterID: requesterObjectId,
      recipientID: recipientObjectId,
      type: RequestType.FRIEND_REQUEST,
      status: RequestStatus.PENDING,
    }) as RequestDocument;

    await request.save();

    // ✅ Crear notificación
    await this.notificationsService.createNotification({
      recipientID: recipientId,
      senderID: requesterId,
      type: NotificationType.FRIEND_REQUEST,
      message: 'te envió una solicitud de amistad',
      relatedID: (request._id as Types.ObjectId).toString(),
    });

    console.log('✅ Solicitud de amistad creada:', request._id);
    return { success: true, message: 'Solicitud enviada', requestId: request._id };
  }

  // ✅ Aceptar solicitud
  async acceptRequest(requestId: string, approverId: string) {
    console.log('✅ Aceptando solicitud:', requestId);

    const request = await this.requestModel.findById(requestId);

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Esta solicitud ya fue procesada');
    }

    // Verificar permisos según el tipo
    if (request.type === RequestType.FRIEND_REQUEST) {
      if (request.recipientID?.toString() !== approverId) {
        throw new BadRequestException('No puedes aceptar esta solicitud');
      }

      // ✅ Crear Friendship en MongoDB
      const friendship = new this.friendshipModel({
        requesterID: request.requesterID,
        recipientID: request.recipientID,
        status: FriendshipStatus.ACCEPTED,
      });
      await friendship.save();
      
      console.log('✅ Friendship creada en MongoDB:', friendship._id);

      // ✅ Crear notificación de aceptación
      await this.notificationsService.createNotification({
        recipientID: request.requesterID.toString(),
        senderID: approverId,
        type: NotificationType.FRIEND_ACCEPT,
        message: 'aceptó tu solicitud de amistad',
      });
    }

    // Si es de comunidad, validar permisos de admin (implementar después)
    // ...

    // ✅ Eliminar la solicitud (ya no es necesaria)
    await this.requestModel.findByIdAndDelete(requestId);

    // ✅ Eliminar la notificación asociada
    try {
      await this.notificationsService.deleteNotificationByRelatedId(requestId);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }

    console.log('✅ Solicitud aceptada y procesada');
    return { success: true, message: 'Solicitud aceptada' };
  }

  // ✅ Rechazar solicitud
  async rejectRequest(requestId: string, approverId: string) {
    console.log('❌ Rechazando solicitud:', requestId);

    const request = await this.requestModel.findById(requestId);

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Esta solicitud ya fue procesada');
    }

    // Verificar permisos según el tipo
    if (request.type === RequestType.FRIEND_REQUEST) {
      if (request.recipientID?.toString() !== approverId) {
        throw new BadRequestException('No puedes rechazar esta solicitud');
      }
    }

    // Eliminar la solicitud
    await this.requestModel.findByIdAndDelete(requestId);

    // ✅ Eliminar la notificación asociada
    try {
      await this.notificationsService.deleteNotificationByRelatedId(requestId);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }

    console.log('✅ Solicitud rechazada y eliminada');
    return { success: true, message: 'Solicitud rechazada' };
  }

  // ✅ Obtener solicitudes pendientes de un usuario (amistades)
  async getUserPendingRequests(userId: string) {
    console.log('📥 Obteniendo solicitudes pendientes para:', userId);

    const requests = await this.requestModel
      .find({
        recipientID: userId,
        type: RequestType.FRIEND_REQUEST,
        status: RequestStatus.PENDING,
      })
      .populate('requesterID', 'username userPhoto')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log('✅ Solicitudes encontradas:', requests.length);

    return requests.map((req: any) => ({
      _id: req._id,
      type: req.type,
      requester: {
        _id: req.requesterID._id,
        username: req.requesterID.username,
        userPhoto: req.requesterID.userPhoto,
      },
      createdAt: req.createdAt,
    }));
  }

  // ✅ CORREGIDO: Verificar estado de solicitud entre dos usuarios
  async getFriendRequestStatus(userId: string, otherUserId: string) {
    console.log('🔍 Verificando solicitud entre:', userId, 'y', otherUserId);
    
    // ✅ Convertir a ObjectId
    const userObjectId = new Types.ObjectId(userId);
    const otherUserObjectId = new Types.ObjectId(otherUserId);
    
    const request = await this.requestModel.findOne({
      $or: [
        { requesterID: userObjectId, recipientID: otherUserObjectId },
        { requesterID: otherUserObjectId, recipientID: userObjectId },
      ],
      type: RequestType.FRIEND_REQUEST,
      status: RequestStatus.PENDING,
    }).lean().exec(); // ✅ Agregar .lean().exec() para mejor performance

    console.log('🔍 Solicitud encontrada:', request ? 'SÍ' : 'NO');

    if (!request) {
      // Verificar si ya son amigos
      const friendship = await this.friendshipModel.findOne({
        $or: [
          { requesterID: userObjectId, recipientID: otherUserObjectId, status: FriendshipStatus.ACCEPTED },
          { requesterID: otherUserObjectId, recipientID: userObjectId, status: FriendshipStatus.ACCEPTED },
        ],
      }).lean().exec();

      if (friendship) {
        console.log('✅ Ya son amigos');
        return { status: 'friends', canSendRequest: false };
      }

      console.log('❌ No hay solicitud ni amistad');
      return { status: 'none', canSendRequest: true };
    }

    // ✅ Determinar si el usuario actual es quien envió la solicitud
    const isSender = request.requesterID.toString() === userId;
    const requestId = request._id.toString();
    
    console.log('📋 Estado de solicitud:', {
      status: 'pending',
      isSender,
      requestId,
      requesterID: request.requesterID.toString(),
      recipientID: request.recipientID?.toString(),
      userId
    });

    return {
      status: 'pending',
      canSendRequest: false,
      isSender,
      requestId,
    };
  }

  // ✅ Obtener solicitudes de unión a comunidad (para admins)
  async getCommunityPendingRequests(communityId: string, userId: string) {
    console.log('🏠 Obteniendo solicitudes para comunidad:', communityId);

    const requests = await this.requestModel
      .find({
        communityID: communityId,
        type: RequestType.COMMUNITY_JOIN,
        status: RequestStatus.PENDING,
      })
      .populate('requesterID', 'username userPhoto')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log('✅ Solicitudes de comunidad encontradas:', requests.length);

    return requests.map((req: any) => ({
      _id: req._id,
      type: req.type,
      communityID: req.communityID,
      requester: {
        _id: req.requesterID._id,
        username: req.requesterID.username,
        userPhoto: req.requesterID.userPhoto,
      },
      metadata: req.metadata,
      createdAt: req.createdAt,
    }));
  }

  // ✅ Crear solicitud para unirse a comunidad
  async createCommunityJoinRequest(requesterId: string, communityId: string, message?: string) {
    console.log('🏠 Creando solicitud para unirse a comunidad');
    console.log('   Usuario:', requesterId);
    console.log('   Comunidad:', communityId);

    // Verificar si ya existe una solicitud
    const existing = await this.requestModel.findOne({
      requesterID: requesterId,
      communityID: communityId,
      type: RequestType.COMMUNITY_JOIN,
      status: RequestStatus.PENDING,
    });

    if (existing) {
      throw new BadRequestException('Ya existe una solicitud pendiente para esta comunidad');
    }

    const request = new this.requestModel({
      requesterID: new Types.ObjectId(requesterId),
      communityID: new Types.ObjectId(communityId),
      type: RequestType.COMMUNITY_JOIN,
      status: RequestStatus.PENDING,
      metadata: { message: message || '' },
    });

    await request.save();

    // TODO: Notificar a los admins de la comunidad

    console.log('✅ Solicitud de comunidad creada:', request._id);
    return { success: true, message: 'Solicitud enviada', requestId: request._id };
  }

  // ✅ Cancelar solicitud enviada (solo el que la envió puede cancelarla)
  async cancelRequest(requestId: string, requesterId: string) {
    console.log('🚫 Cancelando solicitud:', requestId);

    const request = await this.requestModel.findById(requestId);

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Esta solicitud ya fue procesada');
    }

    // Solo el que envió la solicitud puede cancelarla
    if (request.requesterID.toString() !== requesterId) {
      throw new BadRequestException('No puedes cancelar esta solicitud');
    }

    // Eliminar la solicitud
    await this.requestModel.findByIdAndDelete(requestId);

    // ✅ Eliminar la notificación asociada
    try {
      await this.notificationsService.deleteNotificationByRelatedId(requestId);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }

    console.log('✅ Solicitud cancelada');
    return { success: true, message: 'Solicitud cancelada' };
  }

  // ✅ Obtener solicitudes ENVIADAS por el usuario (para saber cuáles puede cancelar)
  async getSentRequests(userId: string) {
    console.log('📤 Obteniendo solicitudes enviadas por:', userId);

    const requests = await this.requestModel
      .find({
        requesterID: userId,
        type: RequestType.FRIEND_REQUEST,
        status: RequestStatus.PENDING,
      })
      .populate('recipientID', 'username userPhoto')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log('✅ Solicitudes enviadas encontradas:', requests.length);

    return requests.map((req: any) => ({
      _id: req._id,
      type: req.type,
      recipient: {
        _id: req.recipientID._id,
        username: req.recipientID.username,
        userPhoto: req.recipientID.userPhoto,
      },
      createdAt: req.createdAt,
    }));
  }
}