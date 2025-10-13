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

@Module({
   imports: [
    MongooseModule.forRoot('mongodb://localhost/redsocial'),
    UsersModule,
    AuthModule,
    PostsModule,
    CommunitiesModule,
    CommentsModule,
    RegistrationModule,
  ],
  controllers: [AppController, CommentsController],
  providers: [AppService, CommentsService],
})
export class AppModule {}
