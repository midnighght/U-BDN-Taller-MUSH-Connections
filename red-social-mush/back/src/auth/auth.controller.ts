import { 
  Body, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post, 
  Get, 
  Query,
  UseGuards, 
  Request 
} from '@nestjs/common';
import { loginDTO, registerDTO } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guards';
import { CommunitiesService } from 'src/communities/communities.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private communitiesService: CommunitiesService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDTO: loginDTO) {
    return await this.authService.authenticate(loginDTO);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() registerDTO: registerDTO) {
    return await this.authService.register(registerDTO);
  }

  @HttpCode(HttpStatus.OK)
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      return { 
        success: false, 
        message: 'Token de verificación no proporcionado' 
      };
    }
    
    try {
      const result = await this.authService.verifyEmail(token);
      return { 
        success: true, 
        message: result.message 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Error al verificar el email' 
      };
    }
  }

  
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return await this.authService.requestPasswordReset(body.email);
  }

 
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(
    @Body() body: { token: string; newPassword: string }
  ) {
    return await this.authService.resetPassword(body.token, body.newPassword);
  }

  @UseGuards(AuthGuard) 
  @Get('me')
  async getUserInfo(@Request() request) {
    const userId = request.user.userId;
    const user = await this.authService['userModel'].findById(userId)
      .select('-password');
    const communities = await this.communitiesService.getUserCommunitiesCount(userId);
     const friendsCount = await this.authService.countFriends(userId);
    if (user != null) {
      return {
        id: user._id,
        username: user.username,
        email: user.email,
        description: user.description,
        userPhoto: user.userPhoto,
        isPrivate: user.isPrivate,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        communities,
         friends: friendsCount
      };
    }
  }
}