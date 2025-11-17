import { Body, Injectable } from '@nestjs/common';
import { PostDocument, Post } from './schemas/posts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDTO } from './dto/posts.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>
  ) {}

  async createPostInDb(@Body() createPostDto: CreatePostDTO): Promise<boolean> {
    try {
      const post = new this.postModel({
        mediaURL: createPostDto.image,
        authorID: createPostDto.userId,
        textBody: createPostDto.description,
        usertags: createPostDto.taggedUsers,
        hashtags: createPostDto.hashtags
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
        .sort({ createdAt: -1 }) // Más recientes primero
        .lean()
        .exec();
      
      // ✅ DEVOLVER ARRAY DIRECTAMENTE (no JSON.stringify)
      return posts;
    } catch (error) {
      console.error('Error obteniendo posts:', error);
      return [];
    }
  }
}