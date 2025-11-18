import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async globalSearch(@Query('query') query: string) {
    if (!query || query.trim() === '') {
      return {
        users: [],
        communities: [],
        posts: [],
        total: 0,
      };
    }

    return await this.searchService.globalSearch(query.trim());
  }
}