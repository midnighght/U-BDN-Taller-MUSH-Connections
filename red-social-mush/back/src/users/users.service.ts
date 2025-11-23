import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UploadService } from 'src/upload/upload.service';
import { Post, PostDocument } from 'src/posts/schemas/posts.schema';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { CommunitiesService } from 'src/communities/communities.service';
import { RequestsService } from 'src/requests/requests.service';
import { Neo4jService } from 'src/neo4j/neo4j.service'; // ✅ Importar Neo4jService

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly uploadService: UploadService,
    private friendshipsService: FriendshipsService,
    private requestsService: RequestsService,
    private communitiesService: CommunitiesService,
    private neo4jService: Neo4jService, // ✅ Inyectar Neo4jService
  ) {}

  async updateDescription(description: any, userId: string) {
    const descriptionText = description.description || description;
    await this.userModel.findByIdAndUpdate(userId, {
      description: descriptionText,
    });
    // No sincronizar con Neo4j - la descripción no se usa en el grafo
  }

  async updatePhoto(userPhoto: any, userId: string) {
    const photoBase64 = userPhoto.userPhoto || userPhoto;
    const imageUrl = await this.uploadService.saveImageBase64(
      photoBase64.toString(),
    );

    await this.userModel.findByIdAndUpdate(userId, {
      userPhoto: imageUrl,
    });

    // ✅ Sincronizar foto con Neo4j
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
        console.log('✅ Foto actualizada en Neo4j');
      }
    } catch (error) {
      console.error('⚠️ Error actualizando foto en Neo4j:', error);
      // No fallar la operación si Neo4j falla
    }
  }

  async deleteAccount(userId: string) {
    await this.userModel.findByIdAndDelete(userId);

    // ✅ Eliminar nodo de Neo4j
    try {
      await this.neo4jService.deleteUser(userId);
      console.log('✅ Usuario eliminado de Neo4j');
    } catch (error) {
      console.error('⚠️ Error eliminando usuario de Neo4j:', error);
      // No fallar la operación si Neo4j falla
    }
  }

  async userUpdatePrivacy(isPrivate: boolean, userId: any) {
    await this.userModel.findByIdAndUpdate(userId, { isPrivate });
    // No sincronizar con Neo4j - la privacidad no se usa en el grafo
  }

  async getUserProfile(userId: string, viewerId: string) {
    console.log('👁️ Viendo perfil:', userId);
    console.log('   Viewer:', viewerId);

    const user = await this.userModel
      .findById(userId)
      .select('-password -email -verificationToken')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si está bloqueado
    const isBlocked = user.blockedUsers?.some(
      (id: Types.ObjectId) => id.toString() === viewerId,
    );

    if (isBlocked) {
      throw new ForbiddenException('No tienes acceso a este perfil');
    }

    // ✅ Obtener estado de amistad (solo amistades ESTABLECIDAS)
    const friendshipStatus = await this.friendshipsService.getFriendshipStatus(
      viewerId,
      userId,
    );

    // ✅ Obtener estado de solicitud (solo solicitudes PENDIENTES)
    const requestStatus = await this.requestsService.getFriendRequestStatus(
      viewerId,
      userId,
    );

    console.log('🔍 friendshipStatus:', friendshipStatus);
    console.log('🔍 requestStatus:', requestStatus);

    const areFriends = friendshipStatus.status === 'friends';

    // Si el perfil es privado y no son amigos, limitar info
    if (user.isPrivate && !areFriends && viewerId !== userId) {
      console.log('🔒 Perfil privado - acceso limitado');

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

    // Perfil público o son amigos - mostrar todo
    console.log('✅ Perfil accesible - mostrando información completa');

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

    // Verificar si el viewer ha bloqueado al usuario
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
