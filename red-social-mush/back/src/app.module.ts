import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommunitiesModule } from './communities/communities.module';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { CommentsModule } from './comments/comments.module';
import { RegistrationModule } from './registration/registration.module';
import { UploadService } from './upload/upload.service';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // Usar variable de entorno con fallback para desarrollo local
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 
      'mongodb://mush:password1234@localhost:38130/redsocial?authSource=admin'
    ),
    UsersModule,
    AuthModule,
    PostsModule,
    CommunitiesModule,
    CommentsModule,
    RegistrationModule,
    UploadModule,
  ],
  controllers: [AppController, CommentsController],
  providers: [AppService, CommentsService, UploadService],
})
export class AppModule {}