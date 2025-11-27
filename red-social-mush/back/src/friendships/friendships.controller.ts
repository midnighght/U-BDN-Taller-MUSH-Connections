import { Controller, Get, Delete, Param, Request, UseGuards, Query } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  
  @Delete('remove/:friendId')
  @UseGuards(AuthGuard)
  async removeFriend(@Param('friendId') friendId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.removeFriend(userId, friendId);
  }

  
  @Get('friends')
  @UseGuards(AuthGuard)
  async getFriends(@Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.getFriends(userId);
  }

 
  @Get('status/:otherUserId')
  @UseGuards(AuthGuard)
  async getFriendshipStatus(@Param('otherUserId') otherUserId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.getFriendshipStatus(userId, otherUserId);
  }

  @Get('friends/search')
  @UseGuards(AuthGuard)
  async getFriendsWithLimit(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit) : undefined;
    return await this.friendshipsService.getFriendsWithLimit(userId, limitNum, search);
  }
}