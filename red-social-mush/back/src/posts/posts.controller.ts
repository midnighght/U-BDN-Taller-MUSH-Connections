import { 
  Controller, 
  Post, 
  UseGuards, 
  Body, 
  Request, 
  Get, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards/auth.guards';
import { PostsService } from './posts.service';
import { UploadService } from 'src/upload/upload.service';
import { CreatePostDTO } from './dto/posts.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('createPost')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any, // ✅ CAMBIO: any en lugar de CreatePostDTO
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Debes subir una imagen');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('La imagen no puede superar los 10MB');
    }

    try {
      const userId = req.user.userId;

      // Subir imagen a Cloudinary
      const imageUrl = await this.uploadService.uploadImageToCloudinary(file);

      // ✅ PARSEAR los arrays que vienen como strings
      const taggedUsersArray = body.taggedUsers 
        ? body.taggedUsers.split(',').filter((tag: string) => tag.trim() !== '') 
        : [];
      
      const hashtagsArray = body.hashtags 
        ? body.hashtags.split(',').filter((tag: string) => tag.trim() !== '') 
        : [];

      // ✅ CREAR el DTO correctamente
      const createPostDto: CreatePostDTO = {
        image: imageUrl,
        description: body.description || '',
        taggedUsers: taggedUsersArray,
        hashtags: hashtagsArray,
        userId: userId,
      };

      // Guardar en BD
      const result = await this.postsService.createPostInDb(createPostDto);
      
      if (!result) {
        throw new BadRequestException('Error al guardar el post');
      }

      return {
        success: true,
        message: 'Post creado exitosamente',
        imageUrl: imageUrl,
      };
    } catch (error) {
      console.error('Error al crear post:', error);
      throw new BadRequestException('Error al crear el post');
    }
  }

  @Get('userPosts')
  @UseGuards(AuthGuard)
  async obtainPosts(@Request() req) {
    const userId = req.user.userId;
    const postsData = await this.postsService.obtainUserPosts(userId);
    return postsData;
  }
}