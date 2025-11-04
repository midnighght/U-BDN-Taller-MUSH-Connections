
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

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    
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
        const user = await this.authService['userModel'].findById(request.user.userId)
            .select('-password');
        if(user!=null){
        return {
          
            id: user._id,
            username: user.username,
            email: user.email,
            description: user.description,
            isPrivate: user.isPrivate,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
        };
      }
    }
}