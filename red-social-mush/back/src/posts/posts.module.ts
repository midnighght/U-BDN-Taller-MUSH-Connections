import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostSchema, Post } from './schemas/posts.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [
    MongooseModule.forFeature([{ name: Post.name , schema: PostSchema }]),
    UploadModule
  ],
})
export class PostsModule {}