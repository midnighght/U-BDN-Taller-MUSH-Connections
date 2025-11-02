import { Controller, Post, UseGuards, Body, Request, Param, Get, ConsoleLogger } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guards';
import { PostsService } from './posts.service';
import { UploadService } from 'src/upload/upload.service';

@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService,
        private readonly uploadService: UploadService,
    ){}


    @Post('createPost')
    @UseGuards(AuthGuard)
    async createPost(@Body() input: { image: string;
        description: String;
        taggedUsers: String;
        hashtags: String;
        userId: String },  @Request() req){
        const userId = req.user.userId;
        
        input.userId = userId;
        const imageBase64 = input.image;
        const imagePath = await this.uploadService.saveImageBase64(imageBase64);
        input.image = imagePath;
        const result = await this.postsService.createPostInDb(input);
        return result;
    }

    @Get('userPosts')
    @UseGuards(AuthGuard)
    async obtainPosts (@Request() req){
        const userId = req.user.userId;
        console.log(userId);
        const postsData = await this.postsService.obtainUserPosts(userId);
        return postsData;
    }
}

// endpoints para crear, obtener, actualizar y borrar posts