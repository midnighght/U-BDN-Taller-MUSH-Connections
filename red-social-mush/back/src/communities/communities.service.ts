import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UploadService } from 'src/upload/upload.service';
import { Community, CommunityDocument } from './schemas/communities.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateComunityDTO } from './dto/communities.dto';

@Injectable()
export class CommunitiesService {
    constructor(
        private readonly uploadService: UploadService,
        @InjectModel(Community.name) private readonly communityModel: Model<CommunityDocument>
    ) {}
    
    async createCommunity(createComunityDTO: CreateComunityDTO, userId: string) {
        // Verificar si ya existe
        const existingCommunity = await this.communityModel.findOne({ 
            name: createComunityDTO.name 
        });
        
        if (existingCommunity) {
            throw new UnauthorizedException('Community already exists');
        }
        
        // ✅ Subir imagen a Cloudinary (ahora devuelve URL)
        const imageBase64 = createComunityDTO.image.toString(); 
        const imageUrl = await this.uploadService.saveImageBase64(imageBase64);
        
        try {
            const community = new this.communityModel({
                name: createComunityDTO.name,
                mediaURL: imageUrl, // ✅ URL de Cloudinary
                superAdminID: [new Types.ObjectId(userId)],
                description: createComunityDTO.description,
                hashtags: createComunityDTO.hashtags,
                isPrivate: false
            });
            
            console.log('Comunidad creada:', community);
            await community.save();
            return true;
        } catch (error) {
            console.error('Error saving community:', error);
            return false;
        }
    }
    
    async getUserCommunitiesCount(userId: string) {
        const userObjectId = new Types.ObjectId(userId);
        
        const communitiesCount = await this.communityModel.countDocuments({
            $or: [
                { superAdminID: { $in: [userObjectId] } },
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
                { superAdminID: { $in: [userObjectId] } },
                { memberID: { $in: [userObjectId] }},
                { adminID: { $in: [userObjectId] } }
            ]
        }).select('name description mediaURL hashtags isPrivate adminID memberID createdAt');
        
        return communities.map(community => ({
            _id: community._id,
            name: community.name,
            description: community.description,
            mediaURL: community.mediaURL, // ✅ Ya es URL de Cloudinary
            hashtags: community.hashtags,
            isPrivate: community.isPrivate,
            isAdmin: community.adminID.some(id => id.toString() === userId),
            membersCount: community.memberID.length,
            adminsCount: community.adminID.length,
            createdAt: community.createdAt
        }));
    }
}