import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friendship, FriendshipDocument, FriendshipStatus } from './schemas/friendship.schema';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/schemas/notification.schema';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectModel(Friendship.name) private readonly friendshipModel: Model<FriendshipDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ✅ Enviar solicitud de amistad
  async sendFriendRequest(requesterId: string, recipientId: string) {
    if (requesterId === recipientId) {
      throw new BadRequestException('No puedes enviarte una solicitud a ti mismo');
    }

    const requesterObjectId = new Types.ObjectId(requesterId);
    const recipientObjectId = new Types.ObjectId(recipientId);

    // Verificar si ya existe una solicitud
    const existingFriendship = await this.friendshipModel.findOne({
      $or: [
        { requesterID: requesterObjectId, recipientID: recipientObjectId },
        { requesterID: recipientObjectId, recipientID: requesterObjectId },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new ConflictException('Ya son amigos');
      }
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        throw new ConflictException('Ya existe una solicitud pendiente');
      }
    }

    // Crear solicitud

      const friendship = new this.friendshipModel({
        requesterID: requesterObjectId,
        recipientID: recipientObjectId,
        status: FriendshipStatus.PENDING,
      });

      await friendship.save();

      // Convertir el _id explícitamente a string
      const friendshipId = (friendship._id as Types.ObjectId).toString();

      // Crear notificación
      await this.notificationsService.createNotification({
        recipientID: recipientId,
        senderID: requesterId,
        type: NotificationType.FRIEND_REQUEST,
        message: 'te envió una solicitud de amistad',
        relatedID: friendshipId,
      });

    return { success: true, message: 'Solicitud enviada' };
  }

  // ✅ Aceptar solicitud
  async acceptFriendRequest(friendshipId: string, userId: string) {
    const friendship = await this.friendshipModel.findById(friendshipId);

    if (!friendship) {
      throw new BadRequestException('Solicitud no encontrada');
    }

    if (friendship.recipientID.toString() !== userId) {
      throw new BadRequestException('No puedes aceptar esta solicitud');
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('Esta solicitud ya fue procesada');
    }

    friendship.status = FriendshipStatus.ACCEPTED;
    await friendship.save();

    // Notificar al solicitante
    await this.notificationsService.createNotification({
      recipientID: friendship.requesterID.toString(),
      senderID: userId,
      type: NotificationType.FRIEND_ACCEPT,
      message: 'aceptó tu solicitud de amistad',
    });

    return { success: true, message: 'Solicitud aceptada' };
  }

  // ✅ Rechazar solicitud
  async rejectFriendRequest(friendshipId: string, userId: string) {
    const friendship = await this.friendshipModel.findById(friendshipId);

    if (!friendship) {
      throw new BadRequestException('Solicitud no encontrada');
    }

    if (friendship.recipientID.toString() !== userId) {
      throw new BadRequestException('No puedes rechazar esta solicitud');
    }

    await this.friendshipModel.findByIdAndDelete(friendshipId);

    return { success: true, message: 'Solicitud rechazada' };
  }

  // ✅ Eliminar amigo
  async removeFriend(userId: string, friendId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const friendObjectId = new Types.ObjectId(friendId);

    const friendship = await this.friendshipModel.findOne({
      $or: [
        { requesterID: userObjectId, recipientID: friendObjectId },
        { requesterID: friendObjectId, recipientID: userObjectId },
      ],
      status: FriendshipStatus.ACCEPTED,
    });

    if (!friendship) {
      throw new BadRequestException('No son amigos');
    }

    await this.friendshipModel.findByIdAndDelete(friendship._id);

    return { success: true, message: 'Amistad eliminada' };
  }

  // ✅ Obtener solicitudes pendientes
  async getPendingRequests(userId: string) {
    const requests = await this.friendshipModel
      .find({
        recipientID: userId,
        status: FriendshipStatus.PENDING,
      })
      .populate('requesterID', 'username userPhoto')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return requests.map((req: any) => ({
      _id: req._id,
      requester: {
        _id: req.requesterID._id,
        username: req.requesterID.username,
        userPhoto: req.requesterID.userPhoto,
      },
      createdAt: req.createdAt,
    }));
  }

  // ✅ Obtener lista de amigos
  async getFriends(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const friendships = await this.friendshipModel
      .find({
        $or: [{ requesterID: userObjectId }, { recipientID: userObjectId }],
        status: FriendshipStatus.ACCEPTED,
      })
      .populate('requesterID', 'username userPhoto')
      .populate('recipientID', 'username userPhoto')
      .lean()
      .exec();

    return friendships.map((friendship: any) => {
      const friend =
        friendship.requesterID._id.toString() === userId
          ? friendship.recipientID
          : friendship.requesterID;

      return {
        _id: friend._id,
        username: friend.username,
        userPhoto: friend.userPhoto,
      };
    });
  }

  // ✅ Verificar estado de amistad
  async getFriendshipStatus(userId: string, otherUserId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const otherUserObjectId = new Types.ObjectId(otherUserId);

    const friendship = await this.friendshipModel.findOne({
      $or: [
        { requesterID: userObjectId, recipientID: otherUserObjectId },
        { requesterID: otherUserObjectId, recipientID: userObjectId },
      ],
    });

    if (!friendship) {
      return { status: 'none', canSendRequest: true };
    }

    if (friendship.status === FriendshipStatus.ACCEPTED) {
      return { status: 'friends', canSendRequest: false };
    }

    if (friendship.status === FriendshipStatus.PENDING) {
      const isSender = friendship.requesterID.toString() === userId;
      return {
        status: 'pending',
        canSendRequest: false,
        isSender,
        friendshipId: friendship._id,
      };
    }

    return { status: 'none', canSendRequest: true };
  }
}