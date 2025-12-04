import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { Request, RequestSchema } from './schemas/requests.schema';
import {
  Friendship,
  FriendshipSchema,
} from 'src/friendships/schemas/friendship.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Neo4jModule } from 'src/Neo4J/neo4j.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: Friendship.name, schema: FriendshipSchema }, 
    ]),
    NotificationsModule,
    Neo4jModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
