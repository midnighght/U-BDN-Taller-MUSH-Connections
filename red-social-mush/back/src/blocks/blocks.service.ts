import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class BlocksService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  
  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('No puedes bloquearte a ti mismo');
    }

    const blocker = await this.userModel.findById(blockerId);
    
    if (!blocker) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const blockedObjectId = new Types.ObjectId(blockedId);

    
    if (blocker.blockedUsers?.some(id => id.toString() === blockedId)) {
      throw new ConflictException('Este usuario ya está bloqueado');
    }

   
    await this.userModel.findByIdAndUpdate(blockerId, {
      $push: { blockedUsers: blockedObjectId }
    });

    return { success: true, message: 'Usuario bloqueado exitosamente' };
  }

  
  async unblockUser(blockerId: string, blockedId: string) {
    const blocker = await this.userModel.findById(blockerId);
    
    if (!blocker) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const blockedObjectId = new Types.ObjectId(blockedId);

    
    if (!blocker.blockedUsers?.some(id => id.toString() === blockedId)) {
      throw new BadRequestException('Este usuario no está bloqueado');
    }

    
    await this.userModel.findByIdAndUpdate(blockerId, {
      $pull: { blockedUsers: blockedObjectId }
    });

    return { success: true, message: 'Usuario desbloqueado exitosamente' };
  }

  
  async getBlockedUsers(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('blockedUsers', 'username userPhoto')
      .lean()
      .exec();

    if (!user || !user.blockedUsers) {
      return [];
    }

    return (user.blockedUsers as any[]).map(blockedUser => ({
      _id: blockedUser._id,
      username: blockedUser.username,
      userPhoto: blockedUser.userPhoto,
    }));
  }

  
  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const blocker = await this.userModel
      .findById(blockerId)
      .select('blockedUsers')
      .lean()
      .exec();

    if (!blocker || !blocker.blockedUsers) {
      return false;
    }

    return blocker.blockedUsers.some(id => id.toString() === blockedId);
  }

  
  async checkBlockStatus(userId1: string, userId2: string) {
    const [user1, user2] = await Promise.all([
      this.userModel.findById(userId1).select('blockedUsers').lean().exec(),
      this.userModel.findById(userId2).select('blockedUsers').lean().exec(),
    ]);

    const iBlockedThem = user1?.blockedUsers?.some(id => id.toString() === userId2) || false;
    const theyBlockedMe = user2?.blockedUsers?.some(id => id.toString() === userId1) || false;

    return {
      isBlocked: iBlockedThem || theyBlockedMe,
      iBlockedThem,
      theyBlockedMe,
    };
  }

  
  async getBlockedUserIds(userId: string): Promise<string[]> {
    const user = await this.userModel
      .findById(userId)
      .select('blockedUsers')
      .lean()
      .exec();

    return user?.blockedUsers?.map(id => id.toString()) || [];
  }

  
  async getUsersWhoBlockedMe(userId: string): Promise<string[]> {
    const usersWhoBlockedMe = await this.userModel
      .find({ blockedUsers: userId })
      .select('_id')
      .lean()
      .exec();

    return usersWhoBlockedMe.map(user => user._id.toString());
  }
}