import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { Date } from 'mongoose';


export type PostDocument = Post & Document;
@Schema()
export class Post {
  @Prop({ type: Types.ObjectId, required:true})
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  authorID: Types.ObjectId;

  @Prop()
  textBody?: string;

  @Prop({ required: true })
  mediaURL: string;

  @Prop({ type: [Types.ObjectId], default: [] })
  usertags: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop()
  comunityID?: string;

  @Prop({ type: Number, required: true })
  reactionScore: number;

  @Prop({ type: [Types.ObjectId], default: [] })
  reactionUp: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  reactionDown: Types.ObjectId[];

  @Prop({ type: Date,required: true })
  createdAt: Date;

  @Prop({ type:Boolean,required: true })
  isEdited: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);