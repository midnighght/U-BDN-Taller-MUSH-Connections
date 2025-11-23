import { Module, forwardRef } from '@nestjs/common'; // ✅ Importar forwardRef
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/posts.schema';
import { UploadModule } from '../upload/upload.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Comment, CommentSchema } from 'src/comments/schemas/comments.schema';
import { CommentsModule } from '../comments/comments.module';
import { UsersModule } from '../users/users.module';
import { Community, CommunitySchema } from 'src/communities/schemas/communities.schema'; // ✅ Agregar

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Community.name, schema: CommunitySchema }, // ✅ Agregar el schema
    ]),
    UploadModule,
    CloudinaryModule,
    CommentsModule,
    forwardRef(() => UsersModule), // ✅ Usar forwardRef
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService, MongooseModule],
})
export class PostsModule {}