import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/posts.schema';
import { UploadModule } from '../upload/upload.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Comment, CommentSchema } from 'src/comments/schemas/comments.schema'; // Import CommentModel
import { CommentsModule } from '../comments/comments.module'; // ✅ IMPORTAR
import { UsersModule } from '../users/users.module'; // ✅ IMPORTAR

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    UploadModule,
    CloudinaryModule,
    CommentsModule,
    UsersModule, // ✅ ADD THIS LINE
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}