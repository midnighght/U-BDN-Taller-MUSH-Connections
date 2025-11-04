import { Controller, Post, UseGuards, Body, Request, Param, Get, ConsoleLogger } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guards';
import { PostsService } from './posts.service';
import { UploadService } from 'src/upload/upload.service';
import {CreatePostDTO} from './dto/posts.dto';
@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService,
        private readonly uploadService: UploadService,
    ){}


    @Post('createPost')
    @UseGuards(AuthGuard)
    async createPost(@Body() createPostDto: CreatePostDTO,  @Request() req){


        const userId = req.user.userId;
        createPostDto.userId = userId;
        console.log(createPostDto.image);
        const imageBase64 =createPostDto.image.toString(); 
        const imagePath = await this.uploadService.saveImageBase64(imageBase64);
        createPostDto.image = imagePath;
        const result = await this.postsService.createPostInDb(createPostDto);
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