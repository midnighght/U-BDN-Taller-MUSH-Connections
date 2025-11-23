import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommunitiesModule } from './communities/communities.module';
import { CommentsModule } from './comments/comments.module'; // ✅ IMPORTAR
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EmailModule } from './email/email.module';
import { SearchModule } from './search/search.module';
import { FriendshipsModule } from './friendships/friendships.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BlocksService } from './blocks/blocks.service';
import { BlocksModule } from './blocks/blocks.module';
import { RequestsModule } from './requests/requests.module';
import { RequestsService } from './requests/requests.service';
import { FeedService } from './feed/feed.service';
import { FeedModule } from './feed/feed.module';
import { SuggestionsModule } from './suggestions/suggestions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
       envFilePath: '.env',
    }),
    // Usar variable de entorno con fallback para desarrollo local
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 
      'mongodb://mush:password1234@localhost:38130/redsocial?authSource=admin'
      
    ),
    AuthModule,
    UsersModule,
    PostsModule,
    CommunitiesModule,
    CommentsModule, // ✅ ADD THIS LINE
    UploadModule,
    CloudinaryModule,
    EmailModule,
    SearchModule,
    FriendshipsModule,
    NotificationsModule,
    BlocksModule,
    RequestsModule,
    FeedModule,
    SuggestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, BlocksService, FeedService],
})
export class AppModule {}