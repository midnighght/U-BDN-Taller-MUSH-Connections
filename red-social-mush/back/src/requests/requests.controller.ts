import { Controller, Post, Get, Delete, Param, Body, Request, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('requests')
@UseGuards(AuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // ⚠️ IMPORTANTE: Las rutas estáticas DEBEN ir ANTES de las rutas con :params

  // ✅ Obtener solicitudes de amistad pendientes (RECIBIDAS)
  @Get('friends')
  async getFriendRequests(@Request() req) {
    const userId = req.user.userId;
    return await this.requestsService.getUserPendingRequests(userId);
  }

  // ✅ Obtener solicitudes ENVIADAS - DEBE IR ANTES de rutas con :param
  @Get('friends/sent')
  async getSentFriendRequests(@Request() req) {
    const userId = req.user.userId;
    return await this.requestsService.getSentRequests(userId);
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

  // ✅ Aceptar solicitud
  @Post(':requestId/accept')
  async acceptRequest(
    @Param('requestId') requestId: string,
    @Request() req
  ) {
    const approverId = req.user.userId;
    return await this.requestsService.acceptRequest(requestId, approverId);
  }

  // ✅ Rechazar solicitud
  @Delete(':requestId/reject')
  async rejectRequest(
    @Param('requestId') requestId: string,
    @Request() req
  ) {
    const approverId = req.user.userId;
    return await this.requestsService.rejectRequest(requestId, approverId);
  }

  // ✅ Cancelar solicitud enviada
  @Delete(':requestId/cancel')
  async cancelRequest(
    @Param('requestId') requestId: string,
    @Request() req
  ) {
    const requesterId = req.user.userId;
    return await this.requestsService.cancelRequest(requestId, requesterId);
  }
}