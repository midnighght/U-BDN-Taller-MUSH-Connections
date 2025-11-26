import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { Date } from 'mongoose';

export type CommunityDocument = Community & Document;

@Schema()
export class Community {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  mediaURL: string;

  @Prop()
  description?: string;

  @Prop({ type: Boolean, default: false })
  isPrivate: boolean;

  @Prop({ type: Types.ObjectId, required: true })
  superAdminID: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [] })
  adminID: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  memberID: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  pendingRequestID: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ type: Date, required: true, default: Date.now })
  createdAt: Date;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);
