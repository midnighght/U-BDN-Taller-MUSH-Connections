import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UploadModule } from 'src/upload/upload.module';
import { UploadService } from 'src/upload/upload.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Post, PostSchema } from 'src/posts/schemas/posts.schema';
import { Comment, CommentSchema } from 'src/comments/schemas/comments.schema';
import { Friendship, FriendshipSchema } from 'src/friendships/schemas/friendship.schema';
import { Community, CommunitySchema } from 'src/communities/schemas/communities.schema';
import { Request, RequestSchema } from 'src/requests/schemas/requests.schema';
import { FriendshipsModule } from 'src/friendships/friendships.module';
import { CommunitiesModule } from 'src/communities/communities.module';
import { RequestsModule } from 'src/requests/requests.module';
import { Neo4jModule } from 'src/neo4j/neo4j.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Friendship.name, schema: FriendshipSchema },
      { name: Community.name, schema: CommunitySchema },
      { name: Request.name, schema: RequestSchema },
    ]),
    UploadModule,
    CloudinaryModule,
    FriendshipsModule,
    RequestsModule,
    Neo4jModule,
    forwardRef(() => CommunitiesModule),
  ],
  providers: [UsersService, UploadService],
  exports: [UsersService, MongooseModule],
  controllers: [UsersController],
})
export class UsersModule {}