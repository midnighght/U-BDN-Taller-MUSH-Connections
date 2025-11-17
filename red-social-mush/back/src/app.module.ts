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
import { ConfigModule } from '@nestjs/config';
import { UploadService } from './upload/upload.service';
import { UploadModule } from './upload/upload.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryController } from './cloudinary/cloudinary.controller';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EmailModule } from './email/email.module';

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
    UsersModule,
    AuthModule,
    PostsModule,
    CommunitiesModule,
    CommentsModule,
    UploadModule,
    CloudinaryModule,
    EmailModule,
  ],
  controllers: [AppController, CommentsController, CloudinaryController],
  providers: [AppService, CommentsService, UploadService, CloudinaryService],
})
export class AppModule {}