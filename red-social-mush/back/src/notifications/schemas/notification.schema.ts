
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ACCEPT = 'friend_accept',
  COMMENT = 'comment',
  LIKE = 'like',
  MENTION = 'mention',
  COMMUNITY_INVITE = 'community_invite',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipientID: Types.ObjectId; // Quien recibe la notificación

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderID: Types.ObjectId; // Quien genera la notificación

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationType), 
    required: true 
  })
  type: NotificationType;

  @Prop({ type: String, required: true })
  message: string; // Ej: "Juan te envió una solicitud de amistad"

  @Prop({ type: Types.ObjectId }) // ID del recurso relacionado (post, comment, etc.)
  relatedID?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Índice para búsquedas rápidas
NotificationSchema.index({ recipientID: 1, isRead: 1, createdAt: -1 });