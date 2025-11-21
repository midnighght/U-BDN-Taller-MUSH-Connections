import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async globalSearch(@Query('query') query: string,  @Request() req) {
    if (!query || query.trim() === '') {
      return {
        users: [],
        communities: [],
        posts: [],
        total: 0,
      };
    }

    const viewerId = req.user.userId;
    return await this.searchService.globalSearch(query.trim(), viewerId);
  }
}