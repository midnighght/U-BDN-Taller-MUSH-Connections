import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Patch,
  Body, 
  Param, 
  Request,
  UseGuards 
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

 
  @Post('post/:postId')
  @UseGuards(AuthGuard)
  async createComment(
    @Param('postId') postId: string,
    @Body() body: { textBody: string; parentCommentID?: string },
    @Request() req
  ) {
    const userId = req.user.userId;
    return await this.commentsService.createComment(
      postId, 
      userId, 
      body.textBody, 
      body.parentCommentID
    );
  }

  
  @Get('post/:postId')
  @UseGuards(AuthGuard)
  async getComments(@Param('postId') postId: string) {
    return await this.commentsService.getCommentsByPost(postId);
  }

  
  @Delete(':commentId')
  @UseGuards(AuthGuard)
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.commentsService.deleteComment(commentId, userId);
  }

  
  @Patch(':commentId')
  @UseGuards(AuthGuard)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: { textBody: string },
    @Request() req
  ) {
    const userId = req.user.userId;
    return await this.commentsService.updateComment(commentId, userId, body.textBody);
  }
}