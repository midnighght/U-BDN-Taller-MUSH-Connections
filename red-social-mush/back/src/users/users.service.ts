import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UploadService } from 'src/upload/upload.service';
import { Post, PostDocument, PostSchema } from 'src/posts/schemas/posts.schema';
import { FriendshipsService } from 'src/friendships/friendships.service';
@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        private readonly uploadService: UploadService,
        private friendshipsService: FriendshipsService,
    ) {}
        
    async updateDescription(description: any, userId: string) {
        // ✅ FIX: description viene como objeto {description: "texto"}
        const descriptionText = description.description || description;
        await this.userModel.findByIdAndUpdate(userId, { 
            description: descriptionText 
        });
    }
    
    async updatePhoto(userPhoto: any, userId: string) {
        // ✅ FIX: userPhoto viene como objeto {userPhoto: "base64..."}
        const photoBase64 = userPhoto.userPhoto || userPhoto;
        
        // Subir a Cloudinary (este método ya funciona con Cloudinary ahora)
        const imageUrl = await this.uploadService.saveImageBase64(photoBase64.toString());
        
        // Guardar URL en MongoDB
        await this.userModel.findByIdAndUpdate(userId, { 
            userPhoto: imageUrl 
        });
    }
    
    async deleteAccount(userId: string) {
        await this.userModel.findByIdAndDelete(userId);
    }
    
    async userUpdatePrivacy(isPrivate: boolean, userId: any) {
        await this.userModel.findByIdAndUpdate(userId, { isPrivate });
    }

     async getUserProfile(userId: string, viewerId: string) {
        const user = await this.userModel
            .findById(userId)
            .select('-password -email')
            .lean()
            .exec();

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // TODO: Descomentar cuando implementes BlocksService
        // Verificar bloqueos
        // const blockStatus = await this.blocksService.checkBlockStatus(viewerId, userId);
        // if (blockStatus.theyBlockedMe) {
        //     throw new BadRequestException('No puedes ver el perfil de este usuario');
        // }

        // TODO: Descomentar cuando implementes FriendshipsService
        // const friendshipStatus = await this.friendshipsService.getFriendshipStatus(viewerId, userId);

        // Obtener posts públicos del usuario
        const posts = await this.postModel
            .find({ authorID: userId })
            .select('mediaURL textBody hashtags createdAt')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .exec();

        // Contar estadísticas
        const [friendsCount, postsCount, communitiesCount] = await Promise.all([
            this.countFriends(userId),
            this.postModel.countDocuments({ authorID: userId }),
            0, // TODO: Implementar countCommunities cuando tengas CommunitiesService
        ]);

        return {
            profile: {
                _id: user._id,
                username: user.username,
                userPhoto: user.userPhoto,
                bio: user.description,
                createdAt: user.createdAt,
                stats: {
                    friends: friendsCount,
                    posts: postsCount,
                    communities: communitiesCount,
                },
                relationship: {
                    friendship: {
                        status: 'none', // TODO: Usar friendshipStatus cuando esté disponible
                        canSendRequest: true,
                    },
                    isBlockedByMe: false, // TODO: Usar blockStatus.iBlockedThem
                },
            },
            posts: posts.map(post => ({
                _id: post._id,
                mediaURL: post.mediaURL,
                textBody: post.textBody,
                hashtags: post.hashtags,
                createdAt: post.createdAt,
            })),
        };
    }

    private async countFriends(userId: string): Promise<number> {
         
         const friends = await this.friendshipsService.getFriends(userId);
         return friends.length;
            return 0;
    }
}