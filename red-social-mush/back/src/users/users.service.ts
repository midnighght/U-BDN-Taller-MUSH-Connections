import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UploadService } from 'src/upload/upload.service';
import { Post, PostDocument } from 'src/posts/schemas/posts.schema';
import { Comment, CommentDocument } from 'src/comments/schemas/comments.schema';
import { Friendship, FriendshipDocument } from 'src/friendships/schemas/friendship.schema';
import { Community, CommunityDocument } from 'src/communities/schemas/communities.schema';
import { Request, RequestDocument } from 'src/requests/schemas/requests.schema';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { CommunitiesService } from 'src/communities/communities.service';
import { RequestsService } from 'src/requests/requests.service';
import { Neo4jService } from 'src/Neo4J/neo4j.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Friendship.name) private readonly friendshipModel: Model<FriendshipDocument>,
    @InjectModel(Community.name) private readonly communityModel: Model<CommunityDocument>,
    @InjectModel(Request.name) private readonly requestModel: Model<RequestDocument>,
    private readonly uploadService: UploadService,
    private friendshipsService: FriendshipsService,
    private requestsService: RequestsService,
    private communitiesService: CommunitiesService,
    private neo4jService: Neo4jService,
  ) {}

  async updateDescription(description: any, userId: string) {
    const descriptionText = description.description || description;
    await this.userModel.findByIdAndUpdate(userId, {
      description: descriptionText,
    });
  }

  async updatePhoto(userPhoto: any, userId: string) {
    const photoBase64 = userPhoto.userPhoto || userPhoto;
    const imageUrl = await this.uploadService.saveImageBase64(
      photoBase64.toString(),
    );

    await this.userModel.findByIdAndUpdate(userId, {
      userPhoto: imageUrl,
    });

    try {
      const user = await this.userModel
        .findById(userId)
        .select('username userPhoto');
      if (user) {
        await this.neo4jService.createOrUpdateUser(
          userId,
          user.username,
          imageUrl,
        );
        console.log('Foto actualizada en Neo4j');
      }
    } catch (error) {
      console.error('Error actualizando foto en Neo4j:', error);
     
    }
  }

   async deleteAccount(userId: string): Promise<void> {
    console.log(`Iniciando eliminación de cuenta: ${userId}`);
    console.log(`Tipo de userId:`, typeof userId);

    const userObjectId = new Types.ObjectId(userId);
    console.log(`UserObjectId creado:`, userObjectId.toString());
    
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

  
    const postsBeforeDelete = await this.postModel.find({ authorID: userObjectId }).lean();
    console.log(` Posts encontrados ANTES de eliminar:`, postsBeforeDelete.length);
    if (postsBeforeDelete.length > 0) {
      console.log(`Primer post:`, {
        _id: postsBeforeDelete[0]._id,
        authorID: postsBeforeDelete[0].authorID,
        authorID_type: typeof postsBeforeDelete[0].authorID,
        comunityID: postsBeforeDelete[0].comunityID,
      });
    }

    try {
      // 1. Manejar comunidades donde es SuperAdmin
      await this.handleSuperAdminCommunities(userId);

      // 2. Eliminar posts del usuario (incluyendo imágenes y comentarios)
      await this.deleteUserPosts(userId);

      // 3. Eliminar comentarios del usuario en posts de otros
      await this.deleteUserComments(userId);

      // 4. Eliminar amistades
      await this.deleteUserFriendships(userObjectId);

      // 5. Eliminar de comunidades donde es miembro o admin
      await this.removeFromCommunities(userObjectId);

      // 6. Eliminar bloqueos
      await this.removeUserBlocks(userObjectId);

      // 7. Eliminar solicitudes de amistad pendientes
      await this.deleteUserRequests(userId);

      // 8. Eliminar de Neo4j
      await this.deleteFromNeo4j(userId);

      // 9. Finalmente, eliminar el usuario de MongoDB
      await this.userModel.findByIdAndDelete(userId);

      console.log(`Usuario ${userId} eliminado exitosamente`);
    } catch (error) {
      console.error(`Error eliminando usuario ${userId}:`, error);
      throw new BadRequestException('Error al eliminar la cuenta del usuario');
    }
  }

 
  private async handleSuperAdminCommunities(userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);

    const communitiesAsSuperAdmin = await this.communityModel.find({
      superAdminID: userObjectId,
    });

    console.log(`Comunidades como SuperAdmin: ${communitiesAsSuperAdmin.length}`);

    for (const community of communitiesAsSuperAdmin) {
      // Buscar un admin aleatorio
      if (community.adminID && community.adminID.length > 0) {
        const randomIndex = Math.floor(Math.random() * community.adminID.length);
        const newSuperAdminId = community.adminID[randomIndex];


        // Transferir rol
        await this.communityModel.findByIdAndUpdate(community._id, {
          superAdminID: newSuperAdminId,
          $pull: { adminID: newSuperAdminId },
        });
      }
      // Si no hay admins, buscar un miembro aleatorio
      else if (community.memberID && community.memberID.length > 0) {
        const randomIndex = Math.floor(Math.random() * community.memberID.length);
        const newSuperAdminId = community.memberID[randomIndex];


        // Transferir rol
        await this.communityModel.findByIdAndUpdate(community._id, {
          superAdminID: newSuperAdminId,
          $pull: { memberID: newSuperAdminId },
        });
      }
      else {
        
        // Eliminar posts de la comunidad
        const communityIdStr = (community._id as Types.ObjectId).toString();
        await this.postModel.deleteMany({ comunityID: communityIdStr });
        
        // Eliminar la comunidad
        await this.communityModel.findByIdAndDelete(community._id);
      }
    }
  }


  private async deleteUserPosts(userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const userIdString = userId.toString();
    
    // Buscar posts con diferentes formas de authorID (por compatibilidad)
    const posts = await this.postModel.find({
      $or: [
        { authorID: userObjectId },
        { authorID: userIdString }
      ]
    }).lean();

    console.log(`Encontrados ${posts.length} posts del usuario`);

    for (const post of posts) {
      console.log(`   Procesando post ${post._id}`);
      
      
      if (post.mediaURL) {
        try {
          const publicId = this.extractCloudinaryPublicId(post.mediaURL);
          if (publicId) {
            await this.uploadService.deleteImageFromCloudinary(publicId);
            console.log(`Imagen eliminada de Cloudinary`);
          }
        } catch (error) {
          console.error(`Error eliminando imagen de Cloudinary:`, error);
        }
      }

      
      const deletedComments = await this.commentModel.deleteMany({ postID: post._id });
    }

    
    const result = await this.postModel.deleteMany({
      $or: [
        { authorID: userObjectId },
        { authorID: userIdString }
      ]
    });
  }

 
  private async deleteUserComments(userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const commentCount = await this.commentModel.countDocuments({ authorID: userObjectId });


    await this.commentModel.deleteMany({ authorID: userObjectId });
  }

 
  private async deleteUserFriendships(userObjectId: Types.ObjectId): Promise<void> {
    const friendships = await this.friendshipModel.find({
      $or: [{ requesterID: userObjectId }, { recipientID: userObjectId }],
    });

    console.log(`Eliminando ${friendships.length} amistades`);

    await this.friendshipModel.deleteMany({
      $or: [{ requesterID: userObjectId }, { recipientID: userObjectId }],
    });
  }

  private async removeFromCommunities(userObjectId: Types.ObjectId): Promise<void> {
    const communitiesAsMember = await this.communityModel.find({
      $or: [
        { memberID: { $in: [userObjectId] } },
        { adminID: { $in: [userObjectId] } },
        { pendingRequestID: { $in: [userObjectId] } },
      ],
    });

    console.log(`Removiendo de ${communitiesAsMember.length} comunidades`);

    await this.communityModel.updateMany(
      {
        $or: [
          { memberID: { $in: [userObjectId] } },
          { adminID: { $in: [userObjectId] } },
          { pendingRequestID: { $in: [userObjectId] } },
        ],
      },
      {
        $pull: {
          memberID: userObjectId,
          adminID: userObjectId,
          pendingRequestID: userObjectId,
        },
      },
    );
  }

  private async removeUserBlocks(userObjectId: Types.ObjectId): Promise<void> {
    await this.userModel.updateMany(
      { blockedUsers: { $in: [userObjectId] } },
      { $pull: { blockedUsers: userObjectId } },
    );

  
  }

 
  private async deleteUserRequests(userId: string): Promise<void> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      
      const requests = await this.requestModel.find({
        $or: [
          { requesterID: userObjectId },
          { recipientID: userObjectId }
        ]
      });


      for (const request of requests) {
        try {
          await this.neo4jService.removeFriendRequest(
            request.requesterID.toString(),
            request.recipientID?.toString() || ''
          );
        } catch (error) {
          console.error('Error eliminando request de Neo4j:', error);
        }
      }

      // Eliminar todas las requests
      await this.requestModel.deleteMany({
        $or: [
          { requesterID: userObjectId },
          { recipientID: userObjectId }
        ]
      });

      console.log(`Solicitudes eliminadas`);
    } catch (error) {
      console.error('Error eliminando requests:', error);
    }
  }

  
  private async deleteFromNeo4j(userId: string): Promise<void> {
    try {
      await this.neo4jService.deleteUser(userId);
      console.log('Usuario eliminado de Neo4j');
    } catch (error) {
      console.error('Error eliminando usuario de Neo4j:', error);
    }
  }


  private extractCloudinaryPublicId(url: string): string | null {
    try {
      const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|gif|webp)$/i);
      return matches ? matches[1] : null;
    } catch (error) {
      console.error('Error extrayendo public_id:', error);
      return null;
    }
  }

  async userUpdatePrivacy(isPrivate: boolean, userId: any) {
    await this.userModel.findByIdAndUpdate(userId, { isPrivate });
  }

  async getUserProfile(userId: string, viewerId: string) {
    console.log('Viendo perfil:', userId);
    console.log('   Viewer:', viewerId);

    const user = await this.userModel
      .findById(userId)
      .select('-password -email -verificationToken')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isBlocked = user.blockedUsers?.some(
      (id: Types.ObjectId) => id.toString() === viewerId,
    );

    if (isBlocked) {
      throw new ForbiddenException('No tienes acceso a este perfil');
    }

    const friendshipStatus = await this.friendshipsService.getFriendshipStatus(
      viewerId,
      userId,
    );

    const requestStatus = await this.requestsService.getFriendRequestStatus(
      viewerId,
      userId,
    );

    console.log('friendshipStatus:', friendshipStatus);
    console.log('requestStatus:', requestStatus);

    const areFriends = friendshipStatus.status === 'friends';

    if (user.isPrivate && !areFriends && viewerId !== userId) {
      console.log('Perfil privado - acceso limitado');

      return {
        profile: {
          _id: user._id,
          username: user.username,
          userPhoto: user.userPhoto,
          bio: user.description || 'Sin descripción',
          isPrivate: true,
          createdAt: user.createdAt,
          stats: {
            friends: 0,
            posts: 0,
            communities: 0,
          },
          relationship: {
            friendship: friendshipStatus,
            request: requestStatus,
            isBlockedByMe: false,
          },
        },
        posts: [],
      };
    }

    console.log('Perfil accesible - mostrando información completa');

    const posts = await this.postModel
      .find({ authorID: userId })
      .select('mediaURL textBody hashtags createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();

    const postsCount = await this.postModel.countDocuments({
      authorID: userId,
    });
    const friendsCount = await this.countFriends(userId);
    const communitiesCount =
      await this.communitiesService.getUserCommunitiesCount(userId);

    const viewer = await this.userModel
      .findById(viewerId)
      .select('blockedUsers')
      .lean();
    const isBlockedByMe =
      viewer?.blockedUsers?.some(
        (id: Types.ObjectId) => id.toString() === userId,
      ) || false;

    return {
      profile: {
        _id: user._id,
        username: user.username,
        userPhoto: user.userPhoto,
        bio: user.description || '',
        isPrivate: user.isPrivate,
        createdAt: user.createdAt,
        stats: {
          friends: friendsCount,
          posts: postsCount,
          communities: communitiesCount,
        },
        relationship: {
          friendship: friendshipStatus,
          request: requestStatus,
          isBlockedByMe,
        },
      },
      posts: posts.map((post) => ({
        _id: post._id,
        mediaURL: post.mediaURL,
        textBody: post.textBody,
        hashtags: post.hashtags,
        createdAt: post.createdAt,
      })),
    };
  }

  private async countFriends(userId: string): Promise<number> {
    try {
      const friends = await this.friendshipsService.getFriends(userId);
      return friends.length;
    } catch (error) {
      console.error('Error contando amigos:', error);
      return 0;
    }
  }
}
