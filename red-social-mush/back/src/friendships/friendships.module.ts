// friendships/friendships.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsService } from './friendships.service';
import { Friendship, FriendshipSchema } from './schemas/friendship.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendshipSchema },
    ]),
    // ✅ REMOVER NotificationsModule de aquí
  ],
  controllers: [FriendshipsController],
  providers: [FriendshipsService],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}