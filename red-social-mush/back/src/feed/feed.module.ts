import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { Post, PostSchema } from 'src/posts/schemas/posts.schema';
import { Community, CommunitySchema } from 'src/communities/schemas/communities.schema';
import { FriendshipsModule } from 'src/friendships/friendships.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Community.name, schema: CommunitySchema },
    ]),
    FriendshipsModule,
  ],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}