import { Controller, Post, Get, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  // ✅ Enviar solicitud de amistad
  @Post('request/:recipientId')
  @UseGuards(AuthGuard)
  async sendRequest(@Param('recipientId') recipientId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.sendFriendRequest(userId, recipientId);
  }

  // ✅ Aceptar solicitud
  @Post('accept/:friendshipId')
  @UseGuards(AuthGuard)
  async acceptRequest(@Param('friendshipId') friendshipId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.acceptFriendRequest(friendshipId, userId);
  }

  // ✅ Rechazar solicitud
  @Delete('reject/:friendshipId')
  @UseGuards(AuthGuard)
  async rejectRequest(@Param('friendshipId') friendshipId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.rejectFriendRequest(friendshipId, userId);
  }

  // ✅ Eliminar amigo
  @Delete('remove/:friendId')
  @UseGuards(AuthGuard)
  async removeFriend(@Param('friendId') friendId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.removeFriend(userId, friendId);
  }

  // ✅ Obtener solicitudes pendientes
  @Get('requests')
  @UseGuards(AuthGuard)
  async getPendingRequests(@Request() req) {
    const userId = req.user.userId;
    return await this.friendshipsService.getPendingRequests(userId);
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
}