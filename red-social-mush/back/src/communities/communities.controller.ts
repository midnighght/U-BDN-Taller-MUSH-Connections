import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';
import { CreateComunityDTO } from './dto/communities.dto';
import { PostsService } from 'src/posts/posts.service';

@Controller('communities')
export class CommunitiesController {
  constructor(
    private communitiesService: CommunitiesService,
    private postsService: PostsService,
  ) {}

  @Post('createComunity')
  @UseGuards(AuthGuard)
  async createCommunity(
    @Body() createCommunityDTO: CreateComunityDTO,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return await this.communitiesService.createCommunity(
      createCommunityDTO,
      userId,
    );
  }

  @Get('my-communities')
  @UseGuards(AuthGuard)
  async getMyCommunitiesDetailed(@Request() request) {
    const userId = request.user.userId;
    const communities =
      await this.communitiesService.getUserCommunities(userId);
    return communities;
  }

  @Delete('leaveCommunity')
  @UseGuards(AuthGuard)
  async leaveCommunity(@Body() body: { communityId: string }, @Request() req) {
    const { communityId } = body;
    const userId = req.user.userId;
    const response = await this.communitiesService.leaveCommunity(
      communityId,
      userId,
    );
    return response;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getCommunityById(@Param('id') communityId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.communitiesService.getCommunityById(communityId, userId);
  }

  @Get(':id/posts')
  @UseGuards(AuthGuard)
  async getCommunityPosts(@Param('id') communityId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.communitiesService.getCommunityPosts(communityId, userId);
  }

  @Post(':id/request-join')
  @UseGuards(AuthGuard)
  async requestJoin(@Param('id') communityId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.communitiesService.requestJoin(communityId, userId);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard)
  async joinCommunity(@Param('id') communityId: string, @Request() req) {
    try {
      const userId = req.user.userId;
      console.log(' Request to join community:', { communityId, userId });
      const result = await this.communitiesService.joinCommunity(
        communityId,
        userId,
      );
      console.log('Join successful:', result);
      return result;
    } catch (error) {
      console.error('Error in joinCommunity controller:', error);
      throw error;
    }
  }

  @Get(':id/pending-requests')
  @UseGuards(AuthGuard)
  async getPendingRequests(@Param('id') communityId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.communitiesService.getPendingRequests(
      communityId,
      userId,
    );
  }

  @Post(':id/accept-request')
  @UseGuards(AuthGuard)
  async acceptRequest(
    @Param('id') communityId: string,
    @Body() body: { userId: string },
    @Request() req,
  ) {
    const adminUserId = req.user.userId;
    return await this.communitiesService.acceptRequest(
      communityId,
      body.userId,
      adminUserId,
    );
  }

  @Post(':id/reject-request')
  @UseGuards(AuthGuard)
  async rejectRequest(
    @Param('id') communityId: string,
    @Body() body: { userId: string },
    @Request() req,
  ) {
    const adminUserId = req.user.userId;
    return await this.communitiesService.rejectRequest(
      communityId,
      body.userId,
      adminUserId,
    );
  }

  @Delete(':id/remove-member')
  @UseGuards(AuthGuard)
  async removeMember(
    @Param('id') communityId: string,
    @Body() body: { userId: string },
    @Request() req,
  ) {
    const adminUserId = req.user.userId;
    return await this.communitiesService.removeMember(
      communityId,
      body.userId,
      adminUserId,
    );
  }

  @Post(':id/promote-admin')
  @UseGuards(AuthGuard)
  async promoteToAdmin(
    @Param('id') communityId: string,
    @Body() body: { userId: string },
    @Request() req,
  ) {
    const superAdminUserId = req.user.userId;
    return await this.communitiesService.promoteToAdmin(
      communityId,
      body.userId,
      superAdminUserId,
    );
  }

  @Post(':id/demote-admin')
  @UseGuards(AuthGuard)
  async demoteFromAdmin(
    @Param('id') communityId: string,
    @Body() body: { userId: string },
    @Request() req,
  ) {
    const superAdminUserId = req.user.userId;
    return await this.communitiesService.demoteFromAdmin(
      communityId,
      body.userId,
      superAdminUserId,
    );
  }

  @Post(':id/transfer-ownership')
  @UseGuards(AuthGuard)
  async transferOwnership(
    @Param('id') communityId: string,
    @Body() body: { newOwnerId: string },
    @Request() req,
  ) {
    const currentOwnerId = req.user.userId;
    return await this.communitiesService.transferOwnership(
      communityId,
      body.newOwnerId,
      currentOwnerId,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteCommunity(@Param('id') communityId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.communitiesService.deleteCommunity(communityId, userId);
  }

  @Get(':id/members')
  @UseGuards(AuthGuard)
  async getCommunityMembers(@Param('id') communityId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.communitiesService.getCommunityMembers(
      communityId,
      userId,
    );
  }

  @Delete(':communityId/posts/:postId')
  @UseGuards(AuthGuard)
  async deletePostAsAdmin(
    @Param('communityId') communityId: string,
    @Param('postId') postId: string,
    @Request() req,
  ) {
    const userId = req.user.userId;

    const isAdmin = await this.communitiesService.isUserAdmin(
      communityId,
      userId,
    );

    if (!isAdmin) {
      throw new UnauthorizedException(
        'Solo los admins pueden eliminar posts en esta comunidad',
      );
    }

    return await this.postsService.deletePost(postId, userId, true);
  }

  @Patch(':id/photo')
  @UseGuards(AuthGuard)
  async updateCommunityPhoto(
    @Param('id') communityId: string,
    @Body() body: { image: string },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return await this.communitiesService.updateCommunityPhoto(
      communityId,
      userId,
      body.image,
    );
  }

  @Patch(':id/description')
  @UseGuards(AuthGuard)
  async updateCommunityDescription(
    @Param('id') communityId: string,
    @Body() body: { description: string },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return await this.communitiesService.updateCommunityDescription(
      communityId,
      userId,
      body.description,
    );
  }

  @Patch(':id/hashtags')
  @UseGuards(AuthGuard)
  async updateCommunityHashtags(
    @Param('id') communityId: string,
    @Body() body: { hashtags: string[] },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return await this.communitiesService.updateCommunityHashtags(
      communityId,
      userId,
      body.hashtags,
    );
  }

  @Patch(':id/privacy')
  @UseGuards(AuthGuard)
  async updateCommunityPrivacy(
    @Param('id') communityId: string,
    @Body() body: { isPrivate: boolean },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return await this.communitiesService.updateCommunityPrivacy(
      communityId,
      userId,
      body.isPrivate,
    );
  }
}
