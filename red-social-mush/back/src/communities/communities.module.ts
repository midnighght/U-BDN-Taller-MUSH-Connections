import { Module } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';
import { Community, CommunitySchema } from './schemas/communities.schema';
import { Post, PostSchema } from 'src/posts/schemas/posts.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadModule } from 'src/upload/upload.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema }
    ]),
    UploadModule,
    CloudinaryModule
  ],
  providers: [CommunitiesService],
  controllers: [CommunitiesController],
  exports: [CommunitiesService]
})
export class CommunitiesModule {}