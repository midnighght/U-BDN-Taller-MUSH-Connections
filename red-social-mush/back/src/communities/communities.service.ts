import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UploadService } from 'src/upload/upload.service';
import { Community, CommunityDocument } from './schemas/communities.schema';
import { Post, PostDocument } from 'src/posts/schemas/posts.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateComunityDTO } from './dto/communities.dto';

@Injectable()
export class CommunitiesService {
  constructor(
    private readonly uploadService: UploadService,
    @InjectModel(Community.name)
    private readonly communityModel: Model<CommunityDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createCommunity(createComunityDTO: CreateComunityDTO, userId: string) {
    const existingCommunity = await this.communityModel.findOne({
      name: createComunityDTO.name,
    });

    if (existingCommunity) {
      throw new UnauthorizedException('Ya existe la comunidad');
    }

    const imageBase64 = createComunityDTO.image.toString();
    const imageUrl = await this.uploadService.saveImageBase64(imageBase64);

    try {
      const community = new this.communityModel({
        name: createComunityDTO.name,
        mediaURL: imageUrl,
        superAdminID: new Types.ObjectId(userId),
        description: createComunityDTO.description,
        hashtags: createComunityDTO.hashtags,
        isPrivate: false,
        adminID: [],
        memberID: [],
        pendingRequestID: [],
      });

      await community.save();
      return { success: true, communityId: community._id };
    } catch (error) {
      console.error('Error al guardar la comunidad');
      throw new BadRequestException('Error al crear la comunidad');
    }
  }

  async getUserCommunitiesCount(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const communitiesCount = await this.communityModel.countDocuments({
      $or: [
        { superAdminID: userObjectId },
        { memberID: { $in: [userObjectId] } },
        { adminID: { $in: [userObjectId] } },
      ],
    });

    return communitiesCount;
  }

  async getUserCommunities(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const communities = await this.communityModel
      .find({
        $or: [
          { superAdminID: userObjectId },
          { memberID: { $in: [userObjectId] } },
          { adminID: { $in: [userObjectId] } },
        ],
      })
      .select(
        'name description mediaURL hashtags isPrivate adminID memberID superAdminID createdAt',
      );

    return communities.map((community) => ({
      _id: community._id,
      name: community.name,
      description: community.description,
      mediaURL: community.mediaURL,
      hashtags: community.hashtags,
      isPrivate: community.isPrivate,
      isAdmin: community.adminID.some((id) => id.toString() === userId),
      isSuperAdmin: community.superAdminID.toString() === userId,
      membersCount: community.memberID.length,
      adminsCount: community.adminID.length + 1,
      createdAt: community.createdAt,
    }));
  }

  async leaveCommunity(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    const isSuperAdmin = community.superAdminID.toString() === userId;

    if (isSuperAdmin) {
      return {
        success: false,
        message: 'Eres super admin, dale tu rol a otra persona antes de salir',
      };
    }

    
    const isMember = community.memberID.some((id) => id.toString() === userId);
    const isAdmin = community.adminID.some((id) => id.toString() === userId);

    if (!isMember && !isAdmin) {
      throw new BadRequestException('No eres miembro de la comunidad');
    }

    try {
      const userIdObj = new Types.ObjectId(userId);
      await this.communityModel.findByIdAndUpdate(communityId, {
        $pull: {
          memberID: userIdObj,
          adminID: userIdObj,
        },
      });

      return {
        success: true,
        message: 'Te has salido correctamente de la comunidad',
      };
    } catch (error) {
      console.error('Error updating community:', error);
      throw new BadRequestException('Error al salir de la comunidad');
    }
  }

  async getCommunityById(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    let userRole: 'superAdmin' | 'admin' | 'member' | 'pending' | 'none' =
      'none';

    if (community.superAdminID.toString() === userId) {
      userRole = 'superAdmin';
    } else if (community.adminID.some((id) => id.toString() === userId)) {
      userRole = 'admin';
    } else if (community.memberID.some((id) => id.toString() === userId)) {
      userRole = 'member';
    } else if (
      community.pendingRequestID.some((id) => id.toString() === userId)
    ) {
      userRole = 'pending';
    }

    const postsCount = await this.postModel.countDocuments({
      comunityID: communityId,
    });

    return {
      _id: community._id,
      name: community.name,
      mediaURL: community.mediaURL,
      description: community.description,
      isPrivate: community.isPrivate,
      hashtags: community.hashtags,
      superAdminID: community.superAdminID.toString(),
      stats: {
        members: community.memberID.length,
        admins: community.adminID.length + 1,
        posts: postsCount,
      },
      userRole,
      createdAt: community.createdAt,
    };
  }

  async getCommunityPosts(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    const isMember = community.memberID.some((id) => id.toString() === userId);
    const isAdmin = community.adminID.some((id) => id.toString() === userId);
    const isSuperAdmin = community.superAdminID.toString() === userId;

    if (community.isPrivate && !isMember && !isAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Tienes que ser miembro de la comunidad para ver sus posts');
    }

    const posts = await this.postModel
      .find({ comunityID: communityId })
      .populate('authorID', 'username userPhoto')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return posts;
  }

  async joinCommunity(communityId: string, userId: string) {
    try {
      console.log('Intentando unirse a comunidad:', { communityId, userId });

      const community = await this.communityModel.findById(communityId);

      if (!community) {
        console.log('Comunidad no encontrada:');
        throw new BadRequestException('Comunidad no encontrada');
      }

      console.log('Comunidad encontrada:', {
        name: community.name,
        isPrivate: community.isPrivate,
        superAdminID: community.superAdminID,
        memberCount: community.memberID.length,
      });

      if (community.isPrivate) {
        console.log('Comunidad es privada');
        throw new BadRequestException(
          'Esta comunidad es privada, envía solicitud para entrar',
        );
      }

     

    
      const isMember = community.memberID.some((id) => id.toString() === userId);
      const isAdmin = community.adminID.some((id) => id.toString() === userId);
      const isSuperAdmin = community.superAdminID.toString() === userId;

      console.log('Estado del usuario:', {
        isMember,
        isAdmin,
        isSuperAdmin,
      });

      if (isMember || isAdmin || isSuperAdmin) {
        console.log('Ya es miembro');
        throw new BadRequestException('Ya eres miembro de esta comunidad');
      }

      

      const userObjectId = new Types.ObjectId(userId);
      const result = await this.communityModel.findByIdAndUpdate(
        communityId,
        { $addToSet: { memberID: userObjectId } },
        { new: true },
      );

      console.log(
        'Usuario agregado exitosamente. Total miembros:',
        result?.memberID.length,
      );

      return { success: true, message: 'Te has unido correctamente' };
    } catch (error) {
      console.error('Error en joinCommunity:', error);
      throw new Error('Error al entrar en la comunidad');
    }
  }

  async requestJoin(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    if (!community.isPrivate) {
      throw new BadRequestException(
        'This community is public, use join instead',
      );
    }


    const isMember = community.memberID.some((id) => id.toString() === userId);
    const isAdmin = community.adminID.some((id) => id.toString() === userId);
    const isSuperAdmin = community.superAdminID.toString() === userId;

    if (isMember || isAdmin || isSuperAdmin) {
      throw new BadRequestException('Ya eres miembro de esta comunidad');
    }

    if (community.pendingRequestID.some((id) => id.toString() === userId)) {
      throw new BadRequestException('Ya hay una solicitud pendiente');
    }

    const userObjectId = new Types.ObjectId(userId);
    await this.communityModel.findByIdAndUpdate(communityId, {
      $addToSet: { pendingRequestID: userObjectId },
    });

    return { success: true, message: 'Solicitud enviada' };
  }

  async getPendingRequests(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    
    const isAdmin = community.adminID.some((id) => id.toString() === userId);
    const isSuperAdmin = community.superAdminID.toString() === userId;

    if (!isAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only admins can view pending requests');
    }

    const users = await this.userModel
      .find({ _id: { $in: community.pendingRequestID } })
      .select('username userPhoto')
      .lean();

    return users;
  }

  async acceptRequest(
    communityId: string,
    requestUserId: string,
    adminUserId: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

   
    const isAdmin = community.adminID.some((id) => id.toString() === adminUserId);
    const isSuperAdmin = community.superAdminID.toString() === adminUserId;

    if (!isAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only admins can accept requests');
    }

    const requestUserObjectId = new Types.ObjectId(requestUserId);

    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: { pendingRequestID: requestUserObjectId },
      $addToSet: { memberID: requestUserObjectId },
    });

    return { success: true, message: 'Solicitud aceptada' };
  }

  async rejectRequest(
    communityId: string,
    requestUserId: string,
    adminUserId: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

  
    const isAdmin = community.adminID.some((id) => id.toString() === adminUserId);
    const isSuperAdmin = community.superAdminID.toString() === adminUserId;

    if (!isAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only admins can reject requests');
    }

    const requestUserObjectId = new Types.ObjectId(requestUserId);

    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: { pendingRequestID: requestUserObjectId },
    });

    return { success: true, message: 'Solicitud rechazada' };
  }

  async removeMember(
    communityId: string,
    memberUserId: string,
    adminUserId: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

   
    const isAdmin = community.adminID.some((id) => id.toString() === adminUserId);
    const isSuperAdmin = community.superAdminID.toString() === adminUserId;

    if (!isAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only admins can remove members');
    }

    
    if (community.superAdminID.toString() === memberUserId) {
      throw new BadRequestException('No puedes eliminar al superAdmin');
    }

    const memberObjectId = new Types.ObjectId(memberUserId);

    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: {
        memberID: memberObjectId,
        adminID: memberObjectId,
      },
    });

    return { success: true, message: 'Member removed' };
  }

  async promoteToAdmin(
    communityId: string,
    memberUserId: string,
    superAdminUserId: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    
    if (community.superAdminID.toString() !== superAdminUserId) {
      throw new ForbiddenException('Only super admin can promote members');
    }

    
    if (!community.memberID.some((id) => id.toString() === memberUserId)) {
      throw new BadRequestException('User is not a member');
    }

    const memberObjectId = new Types.ObjectId(memberUserId);

    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: { memberID: memberObjectId },
      $addToSet: { adminID: memberObjectId },
    });

    return { success: true, message: 'Miembro ascendido a Admin' };
  }

  async demoteFromAdmin(
    communityId: string,
    adminUserId: string,
    superAdminUserId: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    
    if (community.superAdminID.toString() !== superAdminUserId) {
      throw new ForbiddenException('Only super admin can demote admins');
    }

    const adminObjectId = new Types.ObjectId(adminUserId);

    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: { adminID: adminObjectId },
      $addToSet: { memberID: adminObjectId },
    });

    return { success: true, message: 'Admin descendido a Miembro' };
  }

  async transferOwnership(
    communityId: string,
    newOwnerId: string,
    currentOwnerId: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    
    if (community.superAdminID.toString() !== currentOwnerId) {
      throw new ForbiddenException(
        'Only current super admin can transfer ownership',
      );
    }

    
    const isNewOwnerMember = community.memberID.some((id) => id.toString() === newOwnerId);
    const isNewOwnerAdmin = community.adminID.some((id) => id.toString() === newOwnerId);

    if (!isNewOwnerMember && !isNewOwnerAdmin) {
      throw new BadRequestException('New owner must be a member or admin');
    }

    const newOwnerObjectId = new Types.ObjectId(newOwnerId);

    
    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: {
        memberID: newOwnerObjectId,
        adminID: newOwnerObjectId,
      },
    });

  
    const currentOwnerObjectId = new Types.ObjectId(currentOwnerId);
    await this.communityModel.findByIdAndUpdate(communityId, {
      superAdminID: newOwnerObjectId,
      $addToSet: { adminID: currentOwnerObjectId },
    });

    return { success: true, message: 'Rol transferido exitosamente' };
  }

  async deleteCommunity(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }


    if (community.superAdminID.toString() !== userId) {
      throw new ForbiddenException('Only super admin can delete the community');
    }

    await this.postModel.deleteMany({ comunityID: communityId });
    await this.communityModel.findByIdAndDelete(communityId);

    return { success: true, message: 'Comunidad eliminada exitosamente' };
  }

  async getCommunityMembers(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    
    const isMember = community.memberID.some((id) => id.toString() === userId);
    const isAdmin = community.adminID.some((id) => id.toString() === userId);
    const isSuperAdmin = community.superAdminID.toString() === userId;

    if (!isMember && !isAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only members can view member list');
    }

    const allMemberIds = [
      community.superAdminID,
      ...community.adminID,
      ...community.memberID,
    ];

    const users = await this.userModel
      .find({ _id: { $in: allMemberIds } })
      .select('username userPhoto')
      .lean();

    return users.map(user => {
      const odId = user._id.toString();
      let role: 'superAdmin' | 'admin' | 'member' = 'member';

      if (community.superAdminID.toString() === odId) {
        role = 'superAdmin';
      } else if (community.adminID.some(id => id.toString() === odId)) {
        role = 'admin';
      }

      return {
        _id: user._id,
        username: user.username,
        userPhoto: user.userPhoto,
        role,
      };
    });
  }

  async isUserAdmin(communityId: string, userId: string): Promise<boolean> {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    
    return (
      community.superAdminID.toString() === userId ||
      community.adminID.some((id) => id.toString() === userId)
    );
  }

  async updateCommunityPhoto(
    communityId: string,
    userId: string,
    imageBase64: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    if (community.superAdminID.toString() !== userId) {
      throw new ForbiddenException('Only super admin can update community photo');
    }

    const imageUrl = await this.uploadService.saveImageBase64(imageBase64);

    await this.communityModel.findByIdAndUpdate(communityId, {
      mediaURL: imageUrl,
    });

    return { success: true, message: 'Foto de la comunidad actualizada' };
  }

  async updateCommunityDescription(
    communityId: string,
    userId: string,
    description: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    if (community.superAdminID.toString() !== userId) {
      throw new ForbiddenException('Only super admin can update community description');
    }

    await this.communityModel.findByIdAndUpdate(communityId, {
      description,
    });

    return { success: true, message: 'Descripción de la comunidad actualizada' };
  }

  async updateCommunityHashtags(
    communityId: string,
    userId: string,
    hashtags: string[],
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    if (community.superAdminID.toString() !== userId) {
      throw new ForbiddenException('Only super admin can update community hashtags');
    }

    await this.communityModel.findByIdAndUpdate(communityId, {
      hashtags,
    });

    return { success: true, message: 'Hashtags de la comunidad actualizados' };
  }

  async updateCommunityPrivacy(
    communityId: string,
    userId: string,
    isPrivate: boolean,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Comunidad no encontrada');
    }

    if (community.superAdminID.toString() !== userId) {
      throw new ForbiddenException('Only super admin can update community privacy');
    }

    await this.communityModel.findByIdAndUpdate(communityId, {
      isPrivate,
    });

    return { success: true, message: 'Privacidad de la comunidad actualizada', isPrivate };
  }
}