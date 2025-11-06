import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UploadService } from 'src/upload/upload.service';
@Injectable()
export class UsersService {
    
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly uploadService: UploadService){}
        
        async updateDescription(description: String, userId: String){
            await this.userModel.findByIdAndUpdate(userId, {$set: description});
            
        }
       async updatePhoto(userPhoto: String, userId: String) {
            const imageBase64 =userPhoto.toString(); 
            const imagePath = await this.uploadService.saveImageBase64(imageBase64);
            userPhoto = imagePath;
            await this.userModel.findByIdAndUpdate(userId, {$set: userPhoto});
        }
        
}
