import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { Date } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {

  @Prop({type: Types.ObjectId, required: true})
  _id: Types.ObjectId;

  @Prop({required: true })
  username: string;

  @Prop({required: true})
  email: string;

  @Prop({required: true})
  password: string;

  @Prop({type: [Types.ObjectId]})
  blockedUsers: Types.ObjectId[];

  @Prop()
  description?: string;

  @Prop({type:Boolean , required: true})
  isPrivate: boolean;

  @Prop({type: Date, required: true})
  createdAt: Date;

  @Prop()
  lastLogin?: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);
