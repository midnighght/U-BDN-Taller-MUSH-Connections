import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comments.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
  ) {}

  
  async createComment(postId: string, userId: string, textBody: string, parentCommentID?: string) {
    const comment = new this.commentModel({
      postID: new Types.ObjectId(postId),
      authorID: new Types.ObjectId(userId),
      textBody,
      parentCommentID: parentCommentID ? new Types.ObjectId(parentCommentID) : undefined,
      createdAt: new Date(),
      isEdited: false,
    });

    await comment.save();

    
    await comment.populate('authorID', 'username userPhoto');

    return comment;
  }

  
  async getCommentsByPost(postId: string) {

  const postObjectId = new Types.ObjectId(postId);
  
  const comments = await this.commentModel
    .find({ postID: postObjectId }) 
    .populate('authorID', 'username userPhoto')
    .sort({ createdAt: 1 })
    .lean()
    .exec();

  

  
  const commentMap = new Map();
  const rootComments: any[] = [];

  comments.forEach((comment: any) => {
    comment.replies = [];
    commentMap.set(comment._id.toString(), comment);
  });

  comments.forEach((comment: any) => {
    if (comment.parentCommentID) {
      const parent = commentMap.get(comment.parentCommentID.toString());
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

  
  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    
    if (!comment) {
      throw new BadRequestException('Comentario no encontrado');
    }

    if (comment.authorID.toString() !== userId) {
      throw new UnauthorizedException('No puedes eliminar este comentario');
    }

    
    await this.commentModel.findByIdAndDelete(commentId);
    
    
    await this.deleteRepliesRecursively(commentId);

    return { success: true, message: 'Comentario eliminado' };
  }

  
  private async deleteRepliesRecursively(commentId: string) {
    const replies = await this.commentModel.find({ parentCommentID: commentId });
    
  for (const reply of replies) {
    if (reply._id) {
        await this.deleteRepliesRecursively(reply._id.toString());
        await this.commentModel.findByIdAndDelete(reply._id);
    }
    }
  }

  
  async updateComment(commentId: string, userId: string, newText: string) {
    const comment = await this.commentModel.findById(commentId);
    
    if (!comment) {
      throw new BadRequestException('Comentario no encontrado');
    }

    if (comment.authorID.toString() !== userId) {
      throw new UnauthorizedException('No puedes editar este comentario');
    }

    comment.textBody = newText;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('authorID', 'username userPhoto');

    return comment;
  }

  
  async getCommentCount(postId: string): Promise<number> {
    return await this.commentModel.countDocuments({ postID: postId });
  }
}