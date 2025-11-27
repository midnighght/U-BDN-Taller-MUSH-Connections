import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Community, CommunitySchema } from 'src/communities/schemas/communities.schema';
import { Post, PostSchema } from 'src/posts/schemas/posts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Community.name, schema: CommunitySchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}