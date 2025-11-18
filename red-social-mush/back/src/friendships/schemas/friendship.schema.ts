import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FriendshipDocument = Friendship & Document;

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Friendship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterID: Types.ObjectId; // Quien envió la solicitud

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipientID: Types.ObjectId; // Quien recibe la solicitud

  @Prop({ 
    type: String, 
    enum: Object.values(FriendshipStatus), 
    default: FriendshipStatus.PENDING 
  })
  status: FriendshipStatus;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

// Crear índice compuesto para búsquedas eficientes
FriendshipSchema.index({ requesterID: 1, recipientID: 1 }, { unique: true });