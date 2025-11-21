import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comments.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
  ) {}

  // ✅ Crear comentario
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

    // Poblar el autor para devolver el comentario completo
    await comment.populate('authorID', 'username userPhoto');

    return comment;
  }

  // ✅ Obtener comentarios de un post (con estructura jerárquica tipo Instagram)
  async getCommentsByPost(postId: string) {
  // Convertir el string a ObjectId para la búsqueda
  const postObjectId = new Types.ObjectId(postId);
  
  const comments = await this.commentModel
    .find({ postID: postObjectId }) // ✅ Usar ObjectId, no string
    .populate('authorID', 'username userPhoto')
    .sort({ createdAt: 1 })
    .lean()
    .exec();

  console.log('📝 Comentarios encontrados en DB:', comments.length); // Debug

  // Organizar en estructura jerárquica
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

  // ✅ Eliminar comentario (y sus respuestas)
  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    
    if (!comment) {
      throw new BadRequestException('Comentario no encontrado');
    }

    if (comment.authorID.toString() !== userId) {
      throw new UnauthorizedException('No puedes eliminar este comentario');
    }

    // Eliminar el comentario
    await this.commentModel.findByIdAndDelete(commentId);
    
    // Eliminar todas las respuestas recursivamente
    await this.deleteRepliesRecursively(commentId);

    return { success: true, message: 'Comentario eliminado' };
  }

  // ✅ Método privado para eliminar respuestas recursivamente
  private async deleteRepliesRecursively(commentId: string) {
    const replies = await this.commentModel.find({ parentCommentID: commentId });
    
  for (const reply of replies) {
    if (reply._id) {
        await this.deleteRepliesRecursively(reply._id.toString());
        await this.commentModel.findByIdAndDelete(reply._id);
    }
    }
  }

  // ✅ Editar comentario
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

  // ✅ Contar comentarios de un post
  async getCommentCount(postId: string): Promise<number> {
    return await this.commentModel.countDocuments({ postID: postId });
  }
}