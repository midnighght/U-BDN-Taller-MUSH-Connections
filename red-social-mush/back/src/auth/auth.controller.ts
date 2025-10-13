// src/auth/auth.controller.ts
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
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guards';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    // 👇 Login - Retorna token JWT
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() input: { email: string; password: string }) {
        const result = await this.authService.authenticate(input);
        return {
            message: 'Login successful',
            access_token: result.accessToken, // 🔑 Token JWT aquí
            user: {
                id: result.userId,
                username: result.username,
                email: result.email,
            }
        };
    }

    // 👇 Registro - Retorna token JWT
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() input: { 
        username: string; 
        email: string;
        password: string;
        description?: string;
        isPrivate?: boolean;
    }) {
        const result = await this.authService.register(input);
        return {
            message: 'User registered successfully',
            access_token: result.accessToken, // 🔑 Token JWT aquí
            user: {
                id: result.userId,
                username: result.username,
                email: result.email,
            }
        };
    }

    // 👇 Ruta protegida - Usa el AuthGuard (valida token JWT)
    @UseGuards(AuthGuard) // 🛡️ Protegido por JWT
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