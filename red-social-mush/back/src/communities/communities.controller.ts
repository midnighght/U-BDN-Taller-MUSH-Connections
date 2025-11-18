import { Body, Controller,Post,Get, UseGuards, Request, Delete } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { AuthGuard } from 'src/auth/guards/auth.guards';
import { CreateComunityDTO } from './dto/communities.dto';
import { UploadService } from 'src/upload/upload.service';


@Controller('communities')
export class CommunitiesController {
    constructor(private communitiesService: CommunitiesService,
        
    ){}

    @Post('createComunity')
    @UseGuards(AuthGuard)
    async createCommunity(@Body() createCommunityDTO: CreateComunityDTO, @Request() req){
        const userId = req.user.userId;
        console.log('id en el controller de comunidades ',userId);
        await  this.communitiesService.createCommunity(createCommunityDTO, userId);
    }

    
    @Get('my-communities')
    @UseGuards(AuthGuard)
    async getMyCommunitiesDetailed(@Request() request) {
        const userId = request.user.userId;
        const communities = await this.communitiesService.getUserCommunities(userId);
        return communities;
    }

     @Delete('leaveCommunity')
  @UseGuards(AuthGuard)
  async leaveCommunity(@Body() body: { communityId: string }, @Request() req) {
    // ✅ RECIBIR CORRECTAMENTE EL BODY
    const { communityId } = body;
    const userId = req.user.userId;
    
    console.log('👤 Usuario:', userId);
    console.log('🏠 Comunidad:', communityId);
    
    const response = await this.communitiesService.leaveCommunity(communityId, userId);
    return response;
  }
}
