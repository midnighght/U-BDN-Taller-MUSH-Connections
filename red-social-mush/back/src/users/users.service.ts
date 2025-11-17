import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly uploadService: UploadService
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
}