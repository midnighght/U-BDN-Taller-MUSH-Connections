import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { Date } from 'mongoose';


export type CommentDocument = Comment & Document;
@Schema()
export class Comment {
  @Prop({ type: Types.ObjectId , required:true})
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  postID: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  authorID: Types.ObjectId;

  @Prop({ required: true })
  textBody: string;

  @Prop({ type: Types.ObjectId })
  parentCommentID?: Types.ObjectId;

  @Prop({type:Date, required: true })
  createdAt: Date;

  @Prop({ type: Boolean, required: true })
  isEdited: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);