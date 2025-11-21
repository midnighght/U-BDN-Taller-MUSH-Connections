import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { Date } from 'mongoose';


export type PostDocument = Post & Document;

@Schema({timestamps:true})
export class Post {
  

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorID: Types.ObjectId;

  @Prop({type : String})
  textBody: string;

  @Prop({ required: true })
  mediaURL: string;

  @Prop({ type: [String], default: [] })
  usertags: String[];

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({type:String})
  comunityID: string;

  @Prop({ type: Number, default: 0 })
  reactionScore: number;

  @Prop({ type: [Types.ObjectId], default: [] })
  reactionUp: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  reactionDown: Types.ObjectId[];

  @Prop({ type: Date,required: true, default: Date.now })
  createdAt: Date;

  @Prop({ type:Boolean,required: true, default: false })
  isEdited: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);