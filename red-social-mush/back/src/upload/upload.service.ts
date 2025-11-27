import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  
  async uploadImageToCloudinary(file: Express.Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error al subir imagen a Cloudinary:', error);
      throw new BadRequestException('Error al subir la imagen');
    }
  }

  async saveImageBase64(base64String: string): Promise<string> {
    try {
      return await this.uploadBase64ToCloudinary(base64String);
    } catch (error) {
      console.error('Error al subir base64:', error);
      throw new BadRequestException('Error al subir la imagen');
    }
  }

  private async uploadBase64ToCloudinary(base64String: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          folder: 'user-photos', 
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!.secure_url); 
        }
      );
    });
  }

  async deleteImageFromCloudinary(publicId: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteImage(publicId);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      throw new BadRequestException('Error al eliminar la imagen');
    }
  }
}