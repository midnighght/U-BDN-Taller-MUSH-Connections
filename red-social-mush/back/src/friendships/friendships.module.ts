import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsService } from './friendships.service';
import { Friendship, FriendshipSchema } from './schemas/friendship.schema';
import { Neo4jModule } from 'src/neo4j/neo4j.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendshipSchema },
    ]),
    Neo4jModule,
  ],
  controllers: [FriendshipsController],
  providers: [FriendshipsService],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
