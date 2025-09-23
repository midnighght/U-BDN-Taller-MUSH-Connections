import { Body, Controller, HttpCode, HttpStatus, NotImplementedException, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guards';
/*
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() input: { username: string; password: string }) {
        return this.authService.authenticate(input);
        
    }

    @UseGuards(AuthGuard)
    @Get('me')
    getUserInfo(@Request() request){
        return request.user;
    }

}*/


@Controller('auth')
export class AuthController {

  // 🔥 ENDPOINT TEMPORAL PARA PROBAR
  @Get('test')
  async testConnection() {
    return { 
      message: '✅ Backend conectado correctamente',
      timestamp: new Date().toISOString(),
      status: 'active'
    };
  }

  @Post('login')
  async login(@Body() body: any) {
    console.log('📨 Login recibido:', body);
    return {
      access_token: 'jwt-token-' + Date.now(),
      user: {
        id: '1',
        email: body.email,
        name: 'Usuario de Prueba',
        avatar: null
      }
    };
  }
}