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

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipientID: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderID: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationType), 
    required: true 
  })
  type: NotificationType;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Types.ObjectId, required: false })
  relatedID?: Types.ObjectId;

  @Prop({ type: Boolean, default: false, required: true })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Índice para búsquedas rápidas
NotificationSchema.index({ recipientID: 1, isRead: 1, createdAt: -1 });