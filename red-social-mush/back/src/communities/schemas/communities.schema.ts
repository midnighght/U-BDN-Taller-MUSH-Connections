import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { Date } from 'mongoose';


export type CommunityDocument = Community & Document;

@Schema()
export class Community {
  @Prop({ type: Types.ObjectId, required:true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Boolean, required: true })
  isPrivate: boolean;

  @Prop({ type: [Types.ObjectId], required: true })
  adminID: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  mmemberID: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  pendingRequestID: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ type: Date, required: true })
  createdAt: Date;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);