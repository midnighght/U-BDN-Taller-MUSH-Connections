import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UploadService } from 'src/upload/upload.service';
import { Community, CommunityDocument } from './schemas/communities.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateComunityDTO } from './dto/communities.dto';
import { BadRequestException } from '@nestjs/common';
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
        
        
        const imageBase64 = createComunityDTO.image.toString(); 
        const imageUrl = await this.uploadService.saveImageBase64(imageBase64);
        
        try {
            const community = new this.communityModel({
                name: createComunityDTO.name,
                mediaURL: imageUrl, 
                superAdminID: new Types.ObjectId(userId),
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
                { superAdminID:  [userObjectId]  },
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
                { superAdminID:  [userObjectId]  },
                { memberID: { $in: [userObjectId] }},
                { adminID: { $in: [userObjectId] } }
            ]
        }).select('name description mediaURL hashtags isPrivate adminID memberID createdAt');
        
        return communities.map(community => ({
            _id: community._id,
            name: community.name,
            description: community.description,
            mediaURL: community.mediaURL, 
            hashtags: community.hashtags,
            isPrivate: community.isPrivate,
            isAdmin: community.adminID.some(id => id.toString() === userId),
            membersCount: community.memberID.length,
            adminsCount: community.adminID.length + 1,
            createdAt: community.createdAt
        }));
    }

  async leaveCommunity(communityId: string, userId: string) {
  console.log('Attempting to leave community:', communityId);
  console.log('User leaving:', userId);

  const community = await this.communityModel.findById(communityId);
  
  if (!community) {
    throw new BadRequestException('Community not found');
  }

  const isSuperAdmin = community.superAdminID.toString() === userId;
  
  if (isSuperAdmin) {
    console.log('User is SuperAdmin, cannot leave');
    return {
      success: false,
      message: 'You are a superAdmin',
    };
  }
  const userIdObj = new Types.ObjectId(userId);
  const isMember = community.memberID.includes(userIdObj);
  const isAdmin = community.adminID.includes(userIdObj);

  if (!isMember && !isAdmin) {
    throw new BadRequestException('Not a member of this community');
  }

  try {
    await this.communityModel.findByIdAndUpdate(communityId, {
      $pull: {
        memberID: { $in: [userId] },
        adminID: { $in: [userId] },
      },
    });

    console.log('User removed from community');

    return {
      success: true,
      message: 'Successfully left the community',
    };
  } catch (error) {
    console.error('Error updating community:', error);
    throw new BadRequestException('Error leaving the community');
  }
}
}