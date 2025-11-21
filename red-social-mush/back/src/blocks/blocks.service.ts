import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class BlocksService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ✅ Bloquear usuario
  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('No puedes bloquearte a ti mismo');
    }

    const blocker = await this.userModel.findById(blockerId);
    
    if (!blocker) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const blockedObjectId = new Types.ObjectId(blockedId);

    // Verificar si ya está bloqueado
    if (blocker.blockedUsers?.some(id => id.toString() === blockedId)) {
      throw new ConflictException('Este usuario ya está bloqueado');
    }

    // Agregar a la lista de bloqueados
    await this.userModel.findByIdAndUpdate(blockerId, {
      $push: { blockedUsers: blockedObjectId }
    });

    return { success: true, message: 'Usuario bloqueado exitosamente' };
  }

  // ✅ Desbloquear usuario
  async unblockUser(blockerId: string, blockedId: string) {
    const blocker = await this.userModel.findById(blockerId);
    
    if (!blocker) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const blockedObjectId = new Types.ObjectId(blockedId);

    // Verificar si está en la lista
    if (!blocker.blockedUsers?.some(id => id.toString() === blockedId)) {
      throw new BadRequestException('Este usuario no está bloqueado');
    }

    // Remover de la lista
    await this.userModel.findByIdAndUpdate(blockerId, {
      $pull: { blockedUsers: blockedObjectId }
    });

    return { success: true, message: 'Usuario desbloqueado exitosamente' };
  }

  // ✅ Obtener lista de usuarios bloqueados
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

  // ✅ Verificar si un usuario está bloqueado
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

  // ✅ Verificar bloqueo mutuo
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

  // ✅ Obtener IDs de usuarios bloqueados (útil para filtrar posts/comentarios)
  async getBlockedUserIds(userId: string): Promise<string[]> {
    const user = await this.userModel
      .findById(userId)
      .select('blockedUsers')
      .lean()
      .exec();

    return user?.blockedUsers?.map(id => id.toString()) || [];
  }

  // ✅ Obtener IDs de usuarios que me bloquearon
  async getUsersWhoBlockedMe(userId: string): Promise<string[]> {
    const usersWhoBlockedMe = await this.userModel
      .find({ blockedUsers: userId })
      .select('_id')
      .lean()
      .exec();

    return usersWhoBlockedMe.map(user => user._id.toString());
  }
}