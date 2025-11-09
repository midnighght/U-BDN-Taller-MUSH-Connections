
import { 
    Body, 
    Controller, 
    HttpCode, 
    HttpStatus, 
    Post, 
    Get, 
    UseGuards, 
    Request 
} from '@nestjs/common';
import { loginDTO, loginResponseDTO, registerDTO } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guards';
import { CommunitiesService } from 'src/communities/communities.service';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService,
            private communitiesService: CommunitiesService
    ) {}

    
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDTO:loginDTO) {
        return await this.authService.authenticate(loginDTO);
    
    }

    // 👇 Registro - Retorna token JWT
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() registerDTO:registerDTO) {
        return await this.authService.register(registerDTO);
        
    }

    
    @UseGuards(AuthGuard) 
    @Get('me')
    async getUserInfo(@Request() request) {
        const userId = request.user.userId;
        const user = await this.authService['userModel'].findById(userId)
            .select('-password');
        const communities = await this.communitiesService.getUserCommunitiesCount(userId);
        console.log('id en el controller auth ', userId);
        if(user!=null){
        console.log('Foto '+ user.userPhoto)
        return {
            id: user._id,
            username: user.username,
            email: user.email,
            description: user.description,
            userPhoto : user.userPhoto,
            isPrivate: user.isPrivate,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            communities
        };
      }
    }
}