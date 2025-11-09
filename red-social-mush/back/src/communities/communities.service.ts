import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UploadService } from 'src/upload/upload.service';
import { Community, CommunityDocument } from './schemas/communities.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateComunityDTO } from './dto/communities.dto';
import { Integer } from 'neo4j-driver';
import { use } from 'passport';

@Injectable()
export class CommunitiesService {

    
    constructor( private readonly uploadService: UploadService,
        @InjectModel(Community.name) private readonly communityModel: Model<CommunityDocument>
    ){}
    async createCommunity(createComunityDTO: CreateComunityDTO, userId: string) {
        const existingCommunity = await this.communityModel.findOne({ name: createComunityDTO.name });
        if (existingCommunity) {
            throw new UnauthorizedException('Community already exists');
        }
        const imageBase64 = createComunityDTO.image.toString(); 
        const imagePath = await this.uploadService.saveImageBase64(imageBase64);
        createComunityDTO.image = imagePath;
        try {
            const comunity = new this.communityModel({
                name: createComunityDTO.name,
                mediaURL: createComunityDTO.image, // Assuming the image file is stored in the `path` property
                adminID: [new Types.ObjectId(userId)], // Assuming the image file is stored in the `path` propertyuserId], 
                description: createComunityDTO.description,
                hashtags: createComunityDTO.hashtags,
                isPrivate: false
            }
            );
            console.log(comunity);
            await comunity.save();
            return true;
        }catch (error) {
            console.error('Error saving post:', error);
            return false;
        }
        
    };
    async getUserCommunitiesCount(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    
    const communitiesCount = await this.communityModel.countDocuments({
        $or: [
            { memberID: { $in: [userObjectId] } },
            { adminID: { $in: [userObjectId] } }
        ]
    });
    
    console.log('Communities count:', communitiesCount);
    return communitiesCount;
}
// En communities.service.ts
async getUserCommunities(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const communities = await this.communityModel.find({
        $or: [
            { memberID: { $in: [userObjectId] }},
            { adminID: { $in: [userObjectId] } }
        ]
    }).select('name description mediaURL hashtags isPrivate adminID memberID createdAt');
    
    // Agregar información de si el usuario es admin
    return communities.map(community => ({
        _id: community._id,
        name: community.name,
        description: community.description,
        mediaURL: community.mediaURL,
        hashtags: community.hashtags,
        isPrivate: community.isPrivate,
        isAdmin: community.adminID.includes(userId as any),
        membersCount: community.memberID.length,
        adminsCount: community.adminID.length,
        createdAt: community.createdAt
    }));
}
}
