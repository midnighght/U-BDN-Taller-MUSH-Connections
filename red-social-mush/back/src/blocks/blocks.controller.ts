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

  // ✅ Bloquear usuario
  @Post(':userId')
  async blockUser(@Param('userId') blockedUserId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.blocksService.blockUser(userId, blockedUserId);
  }

  // ✅ Desbloquear usuario
  @Delete(':userId')
  async unblockUser(@Param('userId') blockedUserId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.blocksService.unblockUser(userId, blockedUserId);
  }

  // ✅ Obtener lista de usuarios bloqueados
  @Get()
  async getBlockedUsers(@Request() req) {
    const userId = req.user.userId;
    return await this.blocksService.getBlockedUsers(userId);
  }

  // ✅ Verificar si bloqueé a un usuario
  @Get('check/:userId')
  async checkIfBlocked(@Param('userId') otherUserId: string, @Request() req) {
    const userId = req.user.userId;
    const isBlocked = await this.blocksService.isUserBlocked(userId, otherUserId);
    return { isBlocked };
  }

  // ✅ Verificar estado de bloqueo mutuo
  @Get('status/:userId')
  async getBlockStatus(@Param('userId') otherUserId: string, @Request() req) {
    const userId = req.user.userId;
    return await this.blocksService.checkBlockStatus(userId, otherUserId);
  }
}