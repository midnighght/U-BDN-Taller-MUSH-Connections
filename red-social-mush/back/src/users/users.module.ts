import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UploadModule } from 'src/upload/upload.module';
import { UploadService } from 'src/upload/upload.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Post, PostSchema } from 'src/posts/schemas/posts.schema';
import { FriendshipsModule } from 'src/friendships/friendships.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema},
        {name: Post.name, schema: PostSchema}
       
    ]), UploadModule, CloudinaryModule, FriendshipsModule
  ],
  providers: [UsersService,UploadService],
  exports: [UsersService, MongooseModule],
  controllers: [UsersController] 
})
export class UsersModule {}