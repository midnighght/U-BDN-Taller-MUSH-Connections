import { BadRequestException, Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { PostDocument, Post } from './schemas/posts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePostDTO } from './dto/posts.dto';
import { Comment, CommentDocument } from 'src/comments/schemas/comments.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CommentsService } from 'src/comments/comments.service'; 
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
     private readonly commentsService: CommentsService
  ) {}

  async createPostInDb(@Body() createPostDto: CreatePostDTO, communityId?: string): Promise<boolean> {
  try {
    const post = new this.postModel({
      mediaURL: createPostDto.image,
      authorID: createPostDto.userId,
      textBody: createPostDto.description,
      usertags: createPostDto.taggedUsers,
      hashtags: createPostDto.hashtags,
      ...(communityId && { comunityID: communityId }) // ✅ Agregar communityId si existe
    });
    
    await post.save();
    return true;
  } catch (error) {
    console.error('Error saving post:', error);
    return false;
  }
}

  async obtainUserPosts(userId: string) {
    try {
      const posts = await this.postModel
        .find({ authorID: userId })
        .sort({ createdAt: -1 }) 
        .lean()
        .exec();
      
      
      return posts;
    } catch (error) {
      console.error('Error obteniendo posts:', error);
      return [];
    }
  }

  async getPostWithDetails(postId: string, currentUserId: string) {
  const post = await this.postModel
    .findById(postId)
    .populate('authorID', 'username userPhoto') // Esto ya lo tienes
    .lean()
    .exec();

  if (!post) {
    throw new BadRequestException('Post no encontrado');
  }

  const hasLiked = post.reactionUp.some((id: any) => id.toString() === currentUserId);
  const hasDisliked = post.reactionDown.some((id: any) => id.toString() === currentUserId);
  
  const commentsCount = await this.commentsService.getCommentCount(postId);

  return {
    ...post,
    likesCount: post.reactionUp.length,
    dislikesCount: post.reactionDown.length,
    commentsCount,
    hasLiked,
    hasDisliked,
  };
}

  // ✅ Toggle Like
  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new BadRequestException('Post no encontrado');

    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = post.reactionUp.some(id => id.equals(userObjectId));
    const hasDisliked = post.reactionDown.some(id => id.equals(userObjectId));

    if (hasLiked) {
      await this.postModel.findByIdAndUpdate(postId, {
        $pull: { reactionUp: userObjectId },
        $inc: { reactionScore: -1 },
      });
      return { action: 'unliked', likesCount: post.reactionUp.length - 1 };
    } else {
      const update: any = {
        $addToSet: { reactionUp: userObjectId },
        $inc: { reactionScore: hasDisliked ? 2 : 1 },
      };
      if (hasDisliked) {
        update.$pull = { reactionDown: userObjectId };
      }
      await this.postModel.findByIdAndUpdate(postId, update);
      return { action: 'liked', likesCount: post.reactionUp.length + 1 };
    }
  }

  // ✅ Toggle Dislike
  async toggleDislike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new BadRequestException('Post no encontrado');

    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = post.reactionUp.some(id => id.equals(userObjectId));
    const hasDisliked = post.reactionDown.some(id => id.equals(userObjectId));

    if (hasDisliked) {
      await this.postModel.findByIdAndUpdate(postId, {
        $pull: { reactionDown: userObjectId },
        $inc: { reactionScore: 1 },
      });
      return { action: 'undisliked', dislikesCount: post.reactionDown.length - 1 };
    } else {
      const update: any = {
        $addToSet: { reactionDown: userObjectId },
        $inc: { reactionScore: hasLiked ? -2 : -1 },
      };
      if (hasLiked) {
        update.$pull = { reactionUp: userObjectId };
      }
      await this.postModel.findByIdAndUpdate(postId, update);
      return { action: 'disliked', dislikesCount: post.reactionDown.length + 1 };
    }
  }
}