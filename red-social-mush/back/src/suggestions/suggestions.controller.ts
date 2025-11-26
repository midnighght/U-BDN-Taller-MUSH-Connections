import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';

@Controller('suggestions')
@UseGuards(AuthGuard)
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  
  @Get('friends')
  async getFriendSuggestions(
    @Request() req,
    @Query('limit') limit?: string
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit) : 10;
    
    return await this.suggestionsService.getFriendSuggestions(userId, limitNum);
  }
}