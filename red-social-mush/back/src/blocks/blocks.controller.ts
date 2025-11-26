import { 
  Controller, 
  Post, 
  Delete, 
  Get, 
  Param, 
  Request, 
  UseGuards 
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('blocks')
@UseGuards(AuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}


  @Post(':userId')
  async blockUser(@Param('userId') blockedUserId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.blocksService.blockUser(userId, blockedUserId);
  }

  @Delete(':userId')
  async unblockUser(@Param('userId') blockedUserId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.blocksService.unblockUser(userId, blockedUserId);
  }

 
  @Get()
  async getBlockedUsers(@Request() req) {
    const userId = req.user.userId;
    return await this.blocksService.getBlockedUsers(userId);
  }

  
  @Get('check/:userId')
  async checkIfBlocked(@Param('userId') otherUserId: string, @Request() req) {
    const userId = req.user.userId;
    const isBlocked = await this.blocksService.isUserBlocked(userId, otherUserId);
    return { isBlocked };
  }

  
  @Get('status/:userId')
  async getBlockStatus(@Param('userId') otherUserId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.blocksService.checkBlockStatus(userId, otherUserId);
  }
}