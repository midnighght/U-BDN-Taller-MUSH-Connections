import { 
  Controller, 
  Post, 
  UseGuards, 
  Body, 
  Request, 
  Get, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  Param,
  Delete
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
  @Body() body: any, 
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
    
    // ✅ Verificar si se está creando en una comunidad
    const communityId = body.communityId;

    // Subir imagen a Cloudinary
    const imageUrl = await this.uploadService.uploadImageToCloudinary(file);

    const taggedUsersArray = body.taggedUsers 
      ? body.taggedUsers.split(',').filter((tag: string) => tag.trim() !== '') 
      : [];
    
    const hashtagsArray = body.hashtags 
      ? body.hashtags.split(',').filter((tag: string) => tag.trim() !== '') 
      : [];

    const createPostDto: CreatePostDTO = {
      image: imageUrl,
      description: body.description || '',
      taggedUsers: taggedUsersArray,
      hashtags: hashtagsArray,
      userId: userId,
    };

    // ✅ Pasar communityId al servicio
    const result = await this.postsService.createPostInDb(createPostDto, communityId);
    
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

  // ✅ Obtener un post individual con detalles
  @Get(':id')
  @UseGuards(AuthGuard)
  async getPostById(@Param('id') postId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.postsService.getPostWithDetails(postId, userId);
  }

  // ✅ Like a un post
  @Post(':id/like')
  @UseGuards(AuthGuard)
  async likePost(@Param('id') postId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.postsService.toggleLike(postId, userId);
  }

  // ✅ Dislike a un post
  @Post(':id/dislike')
  @UseGuards(AuthGuard)
  async dislikePost(@Param('id') postId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.postsService.toggleDislike(postId, userId);
  } 

}