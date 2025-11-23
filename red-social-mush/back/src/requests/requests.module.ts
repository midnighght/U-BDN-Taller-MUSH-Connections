// requests/requests.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { Request, RequestSchema } from './schemas/requests.schema';
import { Friendship, FriendshipSchema } from 'src/friendships/schemas/friendship.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: Friendship.name, schema: FriendshipSchema }, // ✅ AGREGAR
    ]),
    NotificationsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}