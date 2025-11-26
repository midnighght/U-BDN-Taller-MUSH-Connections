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
  requesterID: Types.ObjectId; 

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipientID: Types.ObjectId; 

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

FriendshipSchema.index({ requesterID: 1, recipientID: 1 }, { unique: true });