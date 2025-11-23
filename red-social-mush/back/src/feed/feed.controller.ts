import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { FeedService } from './feed.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * GET /feed
   * Obtener feed personalizado con paginación
   * Query params:
   * - page: número de página (default: 1)
   * - limit: posts por página (default: 10)
   */
  @Get()
  @UseGuards(AuthGuard)
  async getFeed(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.userId;
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;

    return await this.feedService.getFeed(userId, pageNum, limitNum);
  }
}