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
      throw new UnauthorizedException('Community already exists');
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
      console.error('Error saving community:', error);
      throw new BadRequestException('Error creating community');
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
      throw new BadRequestException('Community not found');
    }

    const isSuperAdmin = community.superAdminID.toString() === userId;

    if (isSuperAdmin) {
      return {
        success: false,
        message: 'You are a superAdmin, transfer ownership before leaving',
      };
    }

    // ✅ Cambiar a .toString()
    const isMember = community.memberID.some((id) => id.toString() === userId);
    const isAdmin = community.adminID.some((id) => id.toString() === userId);

    if (!isMember && !isAdmin) {
      throw new BadRequestException('Not a member of this community');
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
        message: 'Successfully left the community',
      };
    } catch (error) {
      console.error('Error updating community:', error);
      throw new BadRequestException('Error leaving the community');
    }
  }

  async getCommunityById(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
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
      throw new BadRequestException('Community not found');
    }

    const isMember = community.memberID.some((id) => id.toString() === userId);
    const isAdmin = community.adminID.some((id) => id.toString() === userId);
    const isSuperAdmin = community.superAdminID.toString() === userId;

    if (community.isPrivate && !isMember && !isAdmin && !isSuperAdmin) {
      throw new ForbiddenException('You must be a member to view posts');
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
      console.log('🔍 Intentando unirse a comunidad:', { communityId, userId });

      const community = await this.communityModel.findById(communityId);

      if (!community) {
        console.log('❌ Comunidad no encontrada:', communityId);
        throw new BadRequestException('Community not found');
      }

      console.log('✅ Comunidad encontrada:', {
        name: community.name,
        isPrivate: community.isPrivate,
        superAdminID: community.superAdminID,
        memberCount: community.memberID.length,
      });

      if (community.isPrivate) {
        console.log('❌ Comunidad es privada');
        throw new BadRequestException(
          'This community is private, request to join instead',
        );
      }

      console.log('🔍 Verificando si ya es miembro...');

      // ✅ Cambiar a .toString()
      const isMember = community.memberID.some((id) => id.toString() === userId);
      const isAdmin = community.adminID.some((id) => id.toString() === userId);
      const isSuperAdmin = community.superAdminID.toString() === userId;

      console.log('📊 Estado del usuario:', {
        isMember,
        isAdmin,
        isSuperAdmin,
      });

      if (isMember || isAdmin || isSuperAdmin) {
        console.log('❌ Ya es miembro');
        throw new BadRequestException('Already a member of this community');
      }

      console.log('✅ Agregando usuario a la comunidad...');

      const userObjectId = new Types.ObjectId(userId);
      const result = await this.communityModel.findByIdAndUpdate(
        communityId,
        { $addToSet: { memberID: userObjectId } },
        { new: true },
      );

      console.log(
        '✅ Usuario agregado exitosamente. Total miembros:',
        result?.memberID.length,
      );

      return { success: true, message: 'Joined community successfully' };
    } catch (error) {
      console.error('❌ Error en joinCommunity:', error);
      throw error;
    }
  }

  async requestJoin(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    if (!community.isPrivate) {
      throw new BadRequestException(
        'This community is public, use join instead',
      );
    }

    // ✅ Cambiar TODAS a .toString()
    const isMember = community.memberID.some((id) => id.toString() === userId);
    const isAdmin = community.adminID.some((id) => id.toString() === userId);
    const isSuperAdmin = community.superAdminID.toString() === userId;

    if (isMember || isAdmin || isSuperAdmin) {
      throw new BadRequestException('Already a member of this community');
    }

    if (community.pendingRequestID.some((id) => id.toString() === userId)) {
      throw new BadRequestException('Request already pending');
    }

    const userObjectId = new Types.ObjectId(userId);
    await this.communityModel.findByIdAndUpdate(communityId, {
      $addToSet: { pendingRequestID: userObjectId },
    });

    return { success: true, message: 'Join request sent' };
  }

  async getPendingRequests(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    // ✅ Cambiar a .toString()
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
      throw new BadRequestException('Community not found');
    }

    // ✅ Cambiar a .toString()
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

    return { success: true, message: 'Request accepted' };
  }

  async rejectRequest(
    communityId: string,
    requestUserId: string,
    adminUserId: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    // ✅ Cambiar a .toString()
    const isAdmin = community.adminID.some((id) => id.toString() === adminUserId);
    const isSuperAdmin = community.superAdminID.toString() === adminUserId;

    if (!isAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only admins can reject requests');
    }

    const requestUserObjectId = new Types.ObjectId(requestUserId);

    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: { pendingRequestID: requestUserObjectId },
    });

    return { success: true, message: 'Request rejected' };
  }

  async removeMember(
    communityId: string,
    memberUserId: string,
    adminUserId: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    // ✅ Cambiar a .toString()
    const isAdmin = community.adminID.some((id) => id.toString() === adminUserId);
    const isSuperAdmin = community.superAdminID.toString() === adminUserId;

    if (!isAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only admins can remove members');
    }

    // ✅ Cambiar a .toString()
    if (community.superAdminID.toString() === memberUserId) {
      throw new BadRequestException('Cannot remove super admin');
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

    // ✅ Cambiar a .toString()
    if (community.superAdminID.toString() !== superAdminUserId) {
      throw new ForbiddenException('Only super admin can promote members');
    }

    // ✅ Cambiar a .toString()
    if (!community.memberID.some((id) => id.toString() === memberUserId)) {
      throw new BadRequestException('User is not a member');
    }

    const memberObjectId = new Types.ObjectId(memberUserId);

    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: { memberID: memberObjectId },
      $addToSet: { adminID: memberObjectId },
    });

    return { success: true, message: 'Member promoted to admin' };
  }

  async demoteFromAdmin(
    communityId: string,
    adminUserId: string,
    superAdminUserId: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    // ✅ Cambiar a .toString()
    if (community.superAdminID.toString() !== superAdminUserId) {
      throw new ForbiddenException('Only super admin can demote admins');
    }

    const adminObjectId = new Types.ObjectId(adminUserId);

    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: { adminID: adminObjectId },
      $addToSet: { memberID: adminObjectId },
    });

    return { success: true, message: 'Admin demoted to member' };
  }

  async transferOwnership(
    communityId: string,
    newOwnerId: string,
    currentOwnerId: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    // ✅ Cambiar a .toString()
    if (community.superAdminID.toString() !== currentOwnerId) {
      throw new ForbiddenException(
        'Only current super admin can transfer ownership',
      );
    }

    // ✅ Cambiar a .toString()
    const isNewOwnerMember = community.memberID.some((id) => id.toString() === newOwnerId);
    const isNewOwnerAdmin = community.adminID.some((id) => id.toString() === newOwnerId);

    if (!isNewOwnerMember && !isNewOwnerAdmin) {
      throw new BadRequestException('New owner must be a member or admin');
    }

    const newOwnerObjectId = new Types.ObjectId(newOwnerId);

    // 1️⃣ Primero: Remover al nuevo owner de memberID y adminID
    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: {
        memberID: newOwnerObjectId,
        adminID: newOwnerObjectId,
      },
    });

    // 2️⃣ Segundo: Actualizar superAdmin y agregar el antiguo owner a adminID
    const currentOwnerObjectId = new Types.ObjectId(currentOwnerId);
    await this.communityModel.findByIdAndUpdate(communityId, {
      superAdminID: newOwnerObjectId,
      $addToSet: { adminID: currentOwnerObjectId },
    });

    return { success: true, message: 'Ownership transferred successfully' };
  }

  async deleteCommunity(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    // ✅ Cambiar a .toString()
    if (community.superAdminID.toString() !== userId) {
      throw new ForbiddenException('Only super admin can delete the community');
    }

    await this.postModel.deleteMany({ comunityID: communityId });
    await this.communityModel.findByIdAndDelete(communityId);

    return { success: true, message: 'Community deleted successfully' };
  }

  async getCommunityMembers(communityId: string, userId: string) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    // ✅ Cambiar a .toString()
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

    // ✅ Cambiar a .toString()
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

    return { success: true, message: 'Community photo updated', mediaURL: imageUrl };
  }

  async updateCommunityDescription(
    communityId: string,
    userId: string,
    description: string,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    if (community.superAdminID.toString() !== userId) {
      throw new ForbiddenException('Only super admin can update community description');
    }

    await this.communityModel.findByIdAndUpdate(communityId, {
      description,
    });

    return { success: true, message: 'Community description updated' };
  }

  async updateCommunityHashtags(
    communityId: string,
    userId: string,
    hashtags: string[],
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    if (community.superAdminID.toString() !== userId) {
      throw new ForbiddenException('Only super admin can update community hashtags');
    }

    await this.communityModel.findByIdAndUpdate(communityId, {
      hashtags,
    });

    return { success: true, message: 'Community hashtags updated' };
  }

  async updateCommunityPrivacy(
    communityId: string,
    userId: string,
    isPrivate: boolean,
  ) {
    const community = await this.communityModel.findById(communityId);

    if (!community) {
      throw new BadRequestException('Community not found');
    }

    if (community.superAdminID.toString() !== userId) {
      throw new ForbiddenException('Only super admin can update community privacy');
    }

    await this.communityModel.findByIdAndUpdate(communityId, {
      isPrivate,
    });

    return { success: true, message: 'Community privacy updated', isPrivate };
  }
}