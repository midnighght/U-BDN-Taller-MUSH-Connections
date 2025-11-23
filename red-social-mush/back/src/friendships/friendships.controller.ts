// friendships/friendships.controller.ts
import { Controller, Get, Delete, Param, Request, UseGuards, Query } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  // ✅ Eliminar amigo
  @Delete('remove/:friendId')
  @UseGuards(AuthGuard)
  async removeFriend(@Param('friendId') friendId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.removeFriend(userId, friendId);
  }

  // ✅ Obtener lista de amigos
  @Get('friends')
  @UseGuards(AuthGuard)
  async getFriends(@Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.getFriends(userId);
  }

  // ✅ Verificar estado de amistad con otro usuario
  @Get('status/:otherUserId')
  @UseGuards(AuthGuard)
  async getFriendshipStatus(@Param('otherUserId') otherUserId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.getFriendshipStatus(userId, otherUserId);
  }

  // ✅ Obtener amigos con límite y búsqueda
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