import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from 'src/posts/schemas/posts.schema';
import { Community, CommunityDocument } from 'src/communities/schemas/communities.schema';
import { FriendshipsService } from 'src/friendships/friendships.service';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Community.name) private readonly communityModel: Model<CommunityDocument>,
    private readonly friendshipsService: FriendshipsService,
  ) {}

  async getFeed(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  const userObjectId = new Types.ObjectId(userId);
  const friends = await this.friendshipsService.getFriends(userId);
  const friendIdStrings = friends.map(f => f._id.toString());
  const communities = await this.communityModel
    .find({
      $or: [
        { superAdminID: userObjectId },
        { adminID: userObjectId },
        { memberID: userObjectId },
      ],
    })
    .select('_id name mediaURL')
    .lean();

  const communityIds = communities.map(c => c._id.toString());
  
  const communityMap = new Map<string, { name: string; mediaURL: string }>(
    communities.map(c => [
      c._id.toString(), 
      { name: c.name, mediaURL: c.mediaURL || '' }
    ])
  );

 
  const orConditions: any[] = [
    { authorID: userId },
  ];

  if (friendIdStrings.length > 0) {
    orConditions.push({ authorID: { $in: friendIdStrings } });
  }

  if (communityIds.length > 0) {
    orConditions.push(
      { comunityID: { $in: communityIds } },
      { communityID: { $in: communityIds } }
    );
  }

  const query = { $or: orConditions };

  
  const posts = await this.postModel
    .find(query)
    .populate('authorID', 'username userPhoto')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

 
  const validPosts = posts.filter((post: any) => post.authorID !== null);

  console.log(`Posts totales: ${posts.length}, Posts válidos: ${validPosts.length}`);

  
  const totalPosts = await this.postModel.countDocuments(query);
  const hasMore = skip + validPosts.length < totalPosts;

 
  const enrichedPosts = await Promise.all(validPosts.map(async (post: any) => {
    const hasLiked = post.reactionUp?.some((id: Types.ObjectId) => 
      id.toString() === userId
    ) || false;
    const hasDisliked = post.reactionDown?.some((id: Types.ObjectId) => 
      id.toString() === userId
    ) || false;

    const communityId = post.comunityID || post.communityID;
    let communityInfo: { _id: string; name: string; mediaURL: string } | null = null;
    
    if (communityId) {
      const cached = communityMap.get(communityId);
      if (cached) {
        communityInfo = {
          _id: communityId,
          name: cached.name,
          mediaURL: cached.mediaURL,
        };
      } else {
        const community = await this.communityModel
          .findById(communityId)
          .select('name mediaURL')
          .lean();
        
        if (community) {
          communityInfo = {
            _id: communityId,
            name: community.name,
            mediaURL: community.mediaURL || '',
          };
        }
      }
    }

    return {
      _id: post._id,
      mediaURL: post.mediaURL,
      textBody: post.textBody,
      hashtags: post.hashtags || [],
      createdAt: post.createdAt,
      authorID: post.authorID,
      likesCount: post.reactionUp?.length || 0,
      dislikesCount: post.reactionDown?.length || 0,
      hasLiked,
      hasDisliked,
      comunityID: communityId || null,
      community: communityInfo,
    };
  }));

  return {
    posts: enrichedPosts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit) || 1,
      totalPosts,
      hasMore,
    },
  };
}
}