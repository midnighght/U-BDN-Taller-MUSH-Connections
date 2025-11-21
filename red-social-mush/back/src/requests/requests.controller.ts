import { Controller, Post, Get, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('requests')
@UseGuards(AuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // ✅ Obtener solicitudes de amistad pendientes
  @Get('friends')
  async getFriendRequests(@Request() req) {
    const userId = req.user.userId;
    return await this.requestsService.getUserPendingRequests(userId);
  }

  // ✅ Obtener solicitudes de comunidad (para admins)
  @Get('community/:communityId')
  async getCommunityRequests(
    @Param('communityId') communityId: string,
    @Request() req
  ) {
    const userId = req.user.userId;
    return await this.requestsService.getCommunityPendingRequests(communityId, userId);
  }

  // ✅ Enviar solicitud de amistad
  @Post('friends/:recipientId')
  async sendFriendRequest(
    @Param('recipientId') recipientId: string,
    @Request() req
  ) {
    const requesterId = req.user.userId;
    return await this.requestsService.createFriendRequest(requesterId, recipientId);
  }

  // ✅ Solicitar unirse a una comunidad
  @Post('community/:communityId/join')
  async requestJoinCommunity(
    @Param('communityId') communityId: string,
    @Body() body: { message?: string },
    @Request() req
  ) {
    const requesterId = req.user.userId;
    return await this.requestsService.createCommunityJoinRequest(
      requesterId,
      communityId,
      body.message
    );
  }

  // ✅ Aceptar solicitud (genérico)
  @Post(':requestId/accept')
  async acceptRequest(
    @Param('requestId') requestId: string,
    @Request() req
  ) {
    const approverId = req.user.userId;
    return await this.requestsService.acceptRequest(requestId, approverId);
  }

  // ✅ Rechazar solicitud (genérico)
  @Delete(':requestId/reject')
  async rejectRequest(
    @Param('requestId') requestId: string,
    @Request() req
  ) {
    const approverId = req.user.userId;
    return await this.requestsService.rejectRequest(requestId, approverId);
  }

  // ✅ Verificar estado de solicitud con otro usuario
  @Get('status/:otherUserId')
  async getRequestStatus(
    @Param('otherUserId') otherUserId: string,
    @Request() req
  ) {
    const userId = req.user.userId;
    return await this.requestsService.getFriendRequestStatus(userId, otherUserId);
  }
}