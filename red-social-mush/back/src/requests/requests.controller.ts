import { Controller, Post, Get, Delete, Param, Body, Request, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('requests')
@UseGuards(AuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('friends')
  async getFriendRequests(@Request() req) {
    const userId = req.user.userId;
    return await this.requestsService.getUserPendingRequests(userId);
  }

  @Get('friends/sent')
  async getSentFriendRequests(@Request() req) {
    const userId = req.user.userId;
    return await this.requestsService.getSentRequests(userId);
  }

  @Get('status/:otherUserId')
  async getRequestStatus(
    @Param('otherUserId') otherUserId: string,
    @Request() req
  ) {
    const userId = req.user.userId;
    return await this.requestsService.getFriendRequestStatus(userId, otherUserId);
  }

  @Get('community/:communityId')
  async getCommunityRequests(
    @Param('communityId') communityId: string,
    @Request() req
  ) {
    const userId = req.user.userId;
    return await this.requestsService.getCommunityPendingRequests(communityId, userId);
  }

  @Post('friends/:recipientId')
  async sendFriendRequest(
    @Param('recipientId') recipientId: string,
    @Request() req
  ) {
    const requesterId = req.user.userId;
    return await this.requestsService.createFriendRequest(requesterId, recipientId);
  }

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

  @Post(':requestId/accept')
  async acceptRequest(
    @Param('requestId') requestId: string,
    @Request() req
  ) {
    const approverId = req.user.userId;
    return await this.requestsService.acceptRequest(requestId, approverId);
  }

  @Delete(':requestId/reject')
  async rejectRequest(
    @Param('requestId') requestId: string,
    @Request() req
  ) {
    const approverId = req.user.userId;
    return await this.requestsService.rejectRequest(requestId, approverId);
  }

  @Delete(':requestId/cancel')
  async cancelRequest(
    @Param('requestId') requestId: string,
    @Request() req
  ) {
    const requesterId = req.user.userId;
    return await this.requestsService.cancelRequest(requestId, requesterId);
  }
}