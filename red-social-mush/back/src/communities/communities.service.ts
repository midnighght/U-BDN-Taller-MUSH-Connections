import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
        @InjectModel(Community.name) private readonly communityModel: Model<CommunityDocument>,
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}
    
    async createCommunity(createComunityDTO: CreateComunityDTO, userId: string) {
        const existingCommunity = await this.communityModel.findOne({ 
            name: createComunityDTO.name 
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
                pendingRequestID: []
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
                { adminID: { $in: [userObjectId] } }
            ]
        });
        
        return communitiesCount;
    }
    
    async getUserCommunities(userId: string) {
        const userObjectId = new Types.ObjectId(userId);
        const communities = await this.communityModel.find({
            $or: [
                { superAdminID: userObjectId },
                { memberID: { $in: [userObjectId] }},
                { adminID: { $in: [userObjectId] } }
            ]
        }).select('name description mediaURL hashtags isPrivate adminID memberID superAdminID createdAt');
        
        return communities.map(community => ({
            _id: community._id,
            name: community.name,
            description: community.description,
            mediaURL: community.mediaURL, 
            hashtags: community.hashtags,
            isPrivate: community.isPrivate,
            isAdmin: community.adminID.some(id => id.toString() === userId),
            isSuperAdmin: community.superAdminID.toString() === userId,
            membersCount: community.memberID.length,
            adminsCount: community.adminID.length + 1,
            createdAt: community.createdAt
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

        const userIdObj = new Types.ObjectId(userId);
        const isMember = community.memberID.some(id => id.equals(userIdObj));
        const isAdmin = community.adminID.some(id => id.equals(userIdObj));

        if (!isMember && !isAdmin) {
            throw new BadRequestException('Not a member of this community');
        }

        try {
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

    // ✅ NUEVOS MÉTODOS

    /**
     * Obtener comunidad por ID con información del rol del usuario
     */
    async getCommunityById(communityId: string, userId: string) {
        const community = await this.communityModel.findById(communityId);
        
        if (!community) {
            throw new BadRequestException('Community not found');
        }

        // Determinar rol del usuario - Usar toString() para comparar
        let userRole: 'superAdmin' | 'admin' | 'member' | 'pending' | 'none' = 'none';
        
        if (community.superAdminID.toString() === userId) {
            userRole = 'superAdmin';
        } else if (community.adminID.some(id => id.toString() === userId)) {
            userRole = 'admin';
        } else if (community.memberID.some(id => id.toString() === userId)) {
            userRole = 'member';
        } else if (community.pendingRequestID.some(id => id.toString() === userId)) {
            userRole = 'pending';
        }

        // Contar posts de la comunidad
        const postsCount = await this.postModel.countDocuments({ comunityID: communityId });

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
                admins: community.adminID.length + 1, // +1 por el superAdmin
                posts: postsCount
            },
            userRole,
            createdAt: community.createdAt
        };
    }

    /**
     * Obtener posts de una comunidad
     */
    async getCommunityPosts(communityId: string, userId: string) {
  const community = await this.communityModel.findById(communityId);
  
  if (!community) {
    throw new BadRequestException('Community not found');
  }
  
  // Verificar si el usuario tiene acceso
  const isMember = community.memberID.some(id => id.toString() === userId);
  const isAdmin = community.adminID.some(id => id.toString() === userId);
  const isSuperAdmin = community.superAdminID.toString() === userId;
  
  // ✅ Si es comunidad PRIVADA, solo miembros/admins pueden ver
  if (community.isPrivate && !isMember && !isAdmin && !isSuperAdmin) {
    throw new ForbiddenException('You must be a member to view posts');
  }

  // ✅ Si es PÚBLICA, cualquiera puede ver los posts
  const posts = await this.postModel
    .find({ comunityID: communityId })
    .populate('authorID', 'username userPhoto')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return posts;
}

    /**
     * Solicitar unirse a comunidad privada
     */
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
      memberCount: community.memberID.length
    });

    if (community.isPrivate) {
      console.log('❌ Comunidad es privada');
      throw new BadRequestException('This community is private, request to join instead');
    }

    const userObjectId = new Types.ObjectId(userId);
    console.log('🔍 Verificando si ya es miembro...');

    // Verificar si ya es miembro
    const isMember = community.memberID.some(id => id.equals(userObjectId));
    const isAdmin = community.adminID.some(id => id.equals(userObjectId));
    const isSuperAdmin = community.superAdminID.equals(userObjectId);

    console.log('📊 Estado del usuario:', { isMember, isAdmin, isSuperAdmin });

    if (isMember || isAdmin || isSuperAdmin) {
      console.log('❌ Ya es miembro');
      throw new BadRequestException('Already a member of this community');
    }

    console.log('✅ Agregando usuario a la comunidad...');
    
    const result = await this.communityModel.findByIdAndUpdate(
      communityId,
      { $addToSet: { memberID: userObjectId } },
      { new: true }
    );

    console.log('✅ Usuario agregado exitosamente. Total miembros:', result?.memberID.length);

    return { success: true, message: 'Joined community successfully' };
  } catch (error) {
    console.error('❌ Error en joinCommunity:', error);
    throw error;
  }
}
/**
 * Solicitar unirse a comunidad privada
 */
async requestJoin(communityId: string, userId: string) {
  const community = await this.communityModel.findById(communityId);
  
  if (!community) {
    throw new BadRequestException('Community not found');
  }

  if (!community.isPrivate) {
    throw new BadRequestException('This community is public, use join instead');
  }

  const userObjectId = new Types.ObjectId(userId);

  // Verificar si ya es miembro o admin
  const isMember = community.memberID.some(id => id.equals(userObjectId));
  const isAdmin = community.adminID.some(id => id.equals(userObjectId));
  const isSuperAdmin = community.superAdminID.equals(userObjectId);

  if (isMember || isAdmin || isSuperAdmin) {
    throw new BadRequestException('Already a member of this community');
  }

  // Verificar si ya tiene solicitud pendiente
  if (community.pendingRequestID.some(id => id.equals(userObjectId))) {
    throw new BadRequestException('Request already pending');
  }

  await this.communityModel.findByIdAndUpdate(communityId, {
    $addToSet: { pendingRequestID: userObjectId }
  });

  return { success: true, message: 'Join request sent' };
}

    /**
     * Obtener solicitudes pendientes
     */
    async getPendingRequests(communityId: string, userId: string) {
        const community = await this.communityModel.findById(communityId);
        
        if (!community) {
            throw new BadRequestException('Community not found');
        }

        // Verificar permisos
        const userObjectId = new Types.ObjectId(userId);
        const isAdmin = community.adminID.some(id => id.equals(userObjectId));
        const isSuperAdmin = community.superAdminID.equals(userObjectId);

        if (!isAdmin && !isSuperAdmin) {
            throw new ForbiddenException('Only admins can view pending requests');
        }

        const users = await this.userModel
            .find({ _id: { $in: community.pendingRequestID } })
            .select('username userPhoto')
            .lean();

        return users;
    }

    /**
     * Aceptar solicitud de unión
     */
    async acceptRequest(communityId: string, requestUserId: string, adminUserId: string) {
        const community = await this.communityModel.findById(communityId);
        
        if (!community) {
            throw new BadRequestException('Community not found');
        }

        // Verificar permisos
        const adminObjectId = new Types.ObjectId(adminUserId);
        const isAdmin = community.adminID.some(id => id.equals(adminObjectId));
        const isSuperAdmin = community.superAdminID.equals(adminObjectId);

        if (!isAdmin && !isSuperAdmin) {
            throw new ForbiddenException('Only admins can accept requests');
        }

        const requestUserObjectId = new Types.ObjectId(requestUserId);

        await this.communityModel.findByIdAndUpdate(communityId, {
            $pull: { pendingRequestID: requestUserObjectId },
            $addToSet: { memberID: requestUserObjectId }
        });

        return { success: true, message: 'Request accepted' };
    }

    /**
     * Rechazar solicitud de unión
     */
    async rejectRequest(communityId: string, requestUserId: string, adminUserId: string) {
        const community = await this.communityModel.findById(communityId);
        
        if (!community) {
            throw new BadRequestException('Community not found');
        }

        // Verificar permisos
        const adminObjectId = new Types.ObjectId(adminUserId);
        const isAdmin = community.adminID.some(id => id.equals(adminObjectId));
        const isSuperAdmin = community.superAdminID.equals(adminObjectId);

        if (!isAdmin && !isSuperAdmin) {
            throw new ForbiddenException('Only admins can reject requests');
        }

        const requestUserObjectId = new Types.ObjectId(requestUserId);

        await this.communityModel.findByIdAndUpdate(communityId, {
            $pull: { pendingRequestID: requestUserObjectId }
        });

        return { success: true, message: 'Request rejected' };
    }

    /**
     * Eliminar miembro
     */
    async removeMember(communityId: string, memberUserId: string, adminUserId: string) {
        const community = await this.communityModel.findById(communityId);
        
        if (!community) {
            throw new BadRequestException('Community not found');
        }

        // Verificar permisos
        const adminObjectId = new Types.ObjectId(adminUserId);
        const isAdmin = community.adminID.some(id => id.equals(adminObjectId));
        const isSuperAdmin = community.superAdminID.equals(adminObjectId);

        if (!isAdmin && !isSuperAdmin) {
            throw new ForbiddenException('Only admins can remove members');
        }

        const memberObjectId = new Types.ObjectId(memberUserId);

        // No se puede eliminar al superAdmin
        if (community.superAdminID.equals(memberObjectId)) {
            throw new BadRequestException('Cannot remove super admin');
        }

        await this.communityModel.findByIdAndUpdate(communityId, {
            $pull: { 
                memberID: memberObjectId,
                adminID: memberObjectId 
            }
        });

        return { success: true, message: 'Member removed' };
    }

    /**
     * Ascender a admin
     */
    async promoteToAdmin(communityId: string, memberUserId: string, superAdminUserId: string) {
        const community = await this.communityModel.findById(communityId);
        
        if (!community) {
            throw new BadRequestException('Community not found');
        }

        // Solo el superAdmin puede ascender
        const superAdminObjectId = new Types.ObjectId(superAdminUserId);
        if (!community.superAdminID.equals(superAdminObjectId)) {
            throw new ForbiddenException('Only super admin can promote members');
        }

        const memberObjectId = new Types.ObjectId(memberUserId);

        // Verificar que sea miembro
        if (!community.memberID.some(id => id.equals(memberObjectId))) {
            throw new BadRequestException('User is not a member');
        }

        await this.communityModel.findByIdAndUpdate(communityId, {
            $pull: { memberID: memberObjectId },
            $addToSet: { adminID: memberObjectId }
        });

        return { success: true, message: 'Member promoted to admin' };
    }

    /**
     * Degradar de admin a miembro
     */
    async demoteFromAdmin(communityId: string, adminUserId: string, superAdminUserId: string) {
        const community = await this.communityModel.findById(communityId);
        
        if (!community) {
            throw new BadRequestException('Community not found');
        }

        // Solo el superAdmin puede degradar
        const superAdminObjectId = new Types.ObjectId(superAdminUserId);
        if (!community.superAdminID.equals(superAdminObjectId)) {
            throw new ForbiddenException('Only super admin can demote admins');
        }

        const adminObjectId = new Types.ObjectId(adminUserId);

        await this.communityModel.findByIdAndUpdate(communityId, {
            $pull: { adminID: adminObjectId },
            $addToSet: { memberID: adminObjectId }
        });

        return { success: true, message: 'Admin demoted to member' };
    }

    /**
     * Transferir propiedad
     */
    async transferOwnership(communityId: string, newOwnerId: string, currentOwnerId: string) {
        const community = await this.communityModel.findById(communityId);
        
        if (!community) {
            throw new BadRequestException('Community not found');
        }

        // Verificar que el que transfiere sea el superAdmin actual
        const currentOwnerObjectId = new Types.ObjectId(currentOwnerId);
        if (!community.superAdminID.equals(currentOwnerObjectId)) {
            throw new ForbiddenException('Only current super admin can transfer ownership');
        }

        const newOwnerObjectId = new Types.ObjectId(newOwnerId);

        // El nuevo owner debe ser miembro o admin
        const isNewOwnerMember = community.memberID.some(id => id.equals(newOwnerObjectId));
        const isNewOwnerAdmin = community.adminID.some(id => id.equals(newOwnerObjectId));

        if (!isNewOwnerMember && !isNewOwnerAdmin) {
            throw new BadRequestException('New owner must be a member or admin');
        }

        // Actualizar: nuevo owner como superAdmin, viejo owner como admin
        await this.communityModel.findByIdAndUpdate(communityId, {
            superAdminID: newOwnerObjectId,
            $addToSet: { adminID: currentOwnerObjectId },
            $pull: { 
                memberID: newOwnerObjectId,
                adminID: newOwnerObjectId 
            }
        });

        return { success: true, message: 'Ownership transferred successfully' };
    }

    /**
     * Eliminar comunidad
     */
    async deleteCommunity(communityId: string, userId: string) {
        const community = await this.communityModel.findById(communityId);
        
        if (!community) {
            throw new BadRequestException('Community not found');
        }

        // Solo el superAdmin puede eliminar
        const userObjectId = new Types.ObjectId(userId);
        if (!community.superAdminID.equals(userObjectId)) {
            throw new ForbiddenException('Only super admin can delete the community');
        }

        // Eliminar todos los posts de la comunidad
        await this.postModel.deleteMany({ comunityID: communityId });

        // Eliminar la comunidad
        await this.communityModel.findByIdAndDelete(communityId);

        return { success: true, message: 'Community deleted successfully' };
    }

    /**
     * Obtener miembros de la comunidad
     */
    async getCommunityMembers(communityId: string, userId: string) {
        const community = await this.communityModel.findById(communityId);
        
        if (!community) {
            throw new BadRequestException('Community not found');
        }

        const userObjectId = new Types.ObjectId(userId);
        
        // Verificar si el usuario tiene acceso
        const isMember = community.memberID.some(id => id.equals(userObjectId));
        const isAdmin = community.adminID.some(id => id.equals(userObjectId));
        const isSuperAdmin = community.superAdminID.equals(userObjectId);
        
        if (!isMember && !isAdmin && !isSuperAdmin) {
            throw new ForbiddenException('Only members can view member list');
        }

        // Obtener todos los IDs
        const allMemberIds = [
            community.superAdminID,
            ...community.adminID,
            ...community.memberID
        ];

        const members = await this.userModel
            .find({ _id: { $in: allMemberIds } })
            .select('username userPhoto')
            .lean();

        return members;
    }
}