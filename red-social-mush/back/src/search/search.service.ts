import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async globalSearch(query: string, viewerId: string) {
    const searchRegex = new RegExp(query, 'i');

    const users = await this.userModel
      .find({
        username: searchRegex,
        _id: { $ne: viewerId }, 
      })
      .select('username userPhoto isPrivate')
      .limit(10)
      .lean()
      .exec();

    const communities = await this.communityModel
      .find({
        $or: [
          { name: searchRegex },
          { hashtags: { $in: [searchRegex] } }
        ]
      })
      .select('name description mediaURL hashtags memberID isPrivate') 
      .limit(10)
      .lean()
      .exec();

    const posts = await this.postModel
      .find({
        $or: [
          { textBody: searchRegex },
          { hashtags: { $in: [searchRegex] } }
        ]
      })
      .populate('authorID', 'username userPhoto isPrivate')
      .select('mediaURL textBody hashtags createdAt reactionUp reactionDown comunityID')
      .limit(20)
      .lean()
      .exec();

    const filteredPosts = posts.filter((post: any) => {
      return !post.authorID?.isPrivate || post.authorID?._id?.toString() === viewerId;
    });

    return {
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        userPhoto: user.userPhoto,
        isPrivate: user.isPrivate,
        type: 'user'
      })),
      communities: communities.map(community => ({
        _id: community._id,
        name: community.name,
        description: community.description,
        mediaURL: community.mediaURL,
        hashtags: community.hashtags,
        membersCount: community.memberID?.length || 0,
        isPrivate: community.isPrivate, 
        type: 'community'
      })),
      posts: filteredPosts.map((post: any) => ({
        _id: post._id,
        mediaURL: post.mediaURL,
        textBody: post.textBody,
        hashtags: post.hashtags,
        author: {
          _id: post.authorID?._id,
          username: post.authorID?.username,
          userPhoto: post.authorID?.userPhoto,
        },
        likesCount: post.reactionUp?.length || 0,
        dislikesCount: post.reactionDown?.length || 0,
        comunityID: post.comunityID,
        createdAt: post.createdAt,
        type: 'post'
      })),
      total: users.length + communities.length + filteredPosts.length
    };
  }
}