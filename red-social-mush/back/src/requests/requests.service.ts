import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request, RequestDocument, RequestType, RequestStatus } from './schemas/requests.schema';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/schemas/notification.schema';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
    private notificationsService: NotificationsService,
  ) {}

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

  // ✅ Aceptar solicitud (genérico)
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
    }

    // Si es de comunidad, validar permisos de admin (implementar después)

    request.status = RequestStatus.ACCEPTED;
    await request.save();

    // Crear notificación según el tipo
    if (request.type === RequestType.FRIEND_REQUEST) {
      await this.notificationsService.createNotification({
        recipientID: request.requesterID.toString(),
        senderID: approverId,
        type: NotificationType.FRIEND_ACCEPT,
        message: 'aceptó tu solicitud de amistad',
      });
    }

    console.log('✅ Solicitud aceptada exitosamente');
    return { success: true, message: 'Solicitud aceptada', request };
  }

  // ✅ Rechazar solicitud (genérico)
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

    // Eliminar la solicitud en lugar de marcarla como rechazada
    await this.requestModel.findByIdAndDelete(requestId);

    console.log('✅ Solicitud rechazada y eliminada');
    return { success: true, message: 'Solicitud rechazada' };
  }

  // ✅ Crear solicitud de amistad
  async createFriendRequest(requesterId: string, recipientId: string) {
    console.log('📤 Creando solicitud de amistad');
    console.log('   De:', requesterId);
    console.log('   Para:', recipientId);

    if (requesterId === recipientId) {
      throw new BadRequestException('No puedes enviarte una solicitud a ti mismo');
    }

    // Verificar si ya existe una solicitud
    const existing = await this.requestModel.findOne({
      requesterID: requesterId,
      recipientID: recipientId,
      type: RequestType.FRIEND_REQUEST,
      status: RequestStatus.PENDING,
    });

    if (existing) {
      throw new BadRequestException('Ya existe una solicitud pendiente');
    }

    const request = new this.requestModel({
    requesterID: new Types.ObjectId(requesterId),
    recipientID: new Types.ObjectId(recipientId),
    type: RequestType.FRIEND_REQUEST,
    status: RequestStatus.PENDING,
    }) as RequestDocument ;

await request.save();

// Crear notificación
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

  // ✅ Obtener estado de solicitud entre dos usuarios
  async getFriendRequestStatus(userId: string, otherUserId: string) {
    const request = await this.requestModel.findOne({
      $or: [
        { requesterID: userId, recipientID: otherUserId },
        { requesterID: otherUserId, recipientID: userId },
      ],
      type: RequestType.FRIEND_REQUEST,
      status: RequestStatus.PENDING,
    });

    if (!request) {
      return { status: 'none', canSendRequest: true };
    }

    const isSender = request.requesterID.toString() === userId;
    return {
      status: 'pending',
      canSendRequest: false,
      isSender,
      requestId: request._id,
    };
  }
}