import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Friendship,
  FriendshipDocument,
  FriendshipStatus,
} from './schemas/friendship.schema';
import { Neo4jService } from 'src/Neo4J/neo4j.service';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectModel(Friendship.name)
    private friendshipModel: Model<FriendshipDocument>,
    private neo4jService: Neo4jService, 
  ) {}

  async removeFriend(userId: string, friendId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const friendObjectId = new Types.ObjectId(friendId);

    const friendship = await this.friendshipModel.findOne({
      $or: [
        { requesterID: userObjectId, recipientID: friendObjectId },
        { requesterID: friendObjectId, recipientID: userObjectId },
      ],
      status: FriendshipStatus.ACCEPTED,
    });

    if (!friendship) {
      throw new BadRequestException('No son amigos');
    }

    await this.friendshipModel.findByIdAndDelete(friendship._id);

    try {
      await this.neo4jService.removeFriendship(userId, friendId);
    } catch (error) {
      console.error('Error sincronizando eliminación con Neo4j:', error);
    }

    return { success: true, message: 'Amistad eliminada' };
  }

  async getFriends(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const friendships = await this.friendshipModel
      .find({
        $or: [{ requesterID: userObjectId }, { recipientID: userObjectId }],
        status: FriendshipStatus.ACCEPTED,
      })
      .populate('requesterID', 'username userPhoto')
      .populate('recipientID', 'username userPhoto')
      .lean()
      .exec();

    return friendships.map((friendship: any) => {
      const friend =
        friendship.requesterID._id.toString() === userId
          ? friendship.recipientID
          : friendship.requesterID;

      return {
        _id: friend._id,
        username: friend.username,
        userPhoto: friend.userPhoto,
      };
    });
  }

  async getFriendshipStatus(userId: string, otherUserId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const otherUserObjectId = new Types.ObjectId(otherUserId);

    const friendship = await this.friendshipModel.findOne({
      $or: [
        { requesterID: userObjectId, recipientID: otherUserObjectId },
        { requesterID: otherUserObjectId, recipientID: userObjectId },
      ],
      status: FriendshipStatus.ACCEPTED,
    });

    if (friendship) {
      return { status: 'friends', canSendRequest: false };
    }

    return { status: 'none', canSendRequest: true };
  }

  async getFriendsWithLimit(userId: string, limit?: number, search?: string) {
    const userObjectId = new Types.ObjectId(userId);

    const friendships = await this.friendshipModel
      .find({
        $or: [{ requesterID: userObjectId }, { recipientID: userObjectId }],
        status: FriendshipStatus.ACCEPTED,
      })
      .populate('requesterID', 'username userPhoto')
      .populate('recipientID', 'username userPhoto')
      .lean()
      .exec();

    let friends = friendships.map((friendship: any) => {
      const friend =
        friendship.requesterID._id.toString() === userId
          ? friendship.recipientID
          : friendship.requesterID;

      return {
        _id: friend._id,
        username: friend.username,
        userPhoto: friend.userPhoto,
      };
    });

    if (search) {
      const searchLower = search.toLowerCase();
      friends = friends.filter((friend) =>
        friend.username.toLowerCase().includes(searchLower),
      );
    }

    if (limit) {
      friends = friends.slice(0, limit);
    }

    return friends;
  }
}
