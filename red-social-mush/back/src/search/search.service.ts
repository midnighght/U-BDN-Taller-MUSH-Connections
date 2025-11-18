import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Community, CommunityDocument } from 'src/communities/schemas/communities.schema';
import { Post, PostDocument } from 'src/posts/schemas/posts.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async globalSearch(query: string) {
    const searchRegex = new RegExp(query, 'i');

    // Buscar usuarios (solo públicos y verificados)
    const users = await this.userModel
      .find({
        $and: [
          {
            $or: [
              { username: searchRegex },
            ],
          },
          { isPrivate: false },
          { isVerified: true },
        ],
      })
      .select('username userPhoto')
      .limit(10)
      .lean()
      .exec();

    // Buscar comunidades (solo públicas)
    const communities = await this.communityModel
      .find({
        $and: [
          {
            $or: [
              { name: searchRegex },
              { description: searchRegex },
              { hashtags: searchRegex },
            ],
          },
          { isPrivate: false },
        ],
      })
      .select('name description mediaURL hashtags memberID adminID superAdminID')
      .limit(10)
      .lean()
      .exec();

    // Buscar posts (solo de usuarios públicos)
    const posts = await this.postModel
      .find({
        $or: [
          { textBody: searchRegex },
          { hashtags: searchRegex },
        ],
      })
      .populate({
        path: 'authorID',
        select: 'username userPhoto isPrivate',
      })
      .select('mediaURL textBody hashtags authorID createdAt reactionUp reactionDown comunityID')
      .limit(15)
      .lean()
      .exec();

    // Filtrar posts de usuarios privados
    const publicPosts = posts.filter((post: any) => 
      post.authorID && !post.authorID.isPrivate
    );

    return {
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        userPhoto: user.userPhoto,
        type: 'user',
      })),
      communities: communities.map(community => ({
        _id: community._id,
        name: community.name,
        description: community.description,
        mediaURL: community.mediaURL,
        hashtags: community.hashtags,
        membersCount: community.memberID?.length || 0,
        type: 'community',
      })),
      posts: publicPosts.map((post: any) => ({
        _id: post._id,
        mediaURL: post.mediaURL,
        textBody: post.textBody,
        hashtags: post.hashtags,
        author: {
          _id: post.authorID._id,
          username: post.authorID.username,
          userPhoto: post.authorID.userPhoto,
        },
        likesCount: post.reactionUp?.length || 0,
        dislikesCount: post.reactionDown?.length || 0,
        comunityID: post.comunityID,
        createdAt: post.createdAt,
        type: 'post',
      })),
      total: users.length + communities.length + publicPosts.length,
    };
  }
}