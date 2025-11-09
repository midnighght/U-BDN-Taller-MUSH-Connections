import { Module } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';
import { Community, CommunitySchema } from './schemas/communities.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Community.name, schema: CommunitySchema }
      ]), UploadModule
    ],
  providers: [CommunitiesService],
  controllers: [CommunitiesController],
  exports:[CommunitiesService]
})
export class CommunitiesModule {}
