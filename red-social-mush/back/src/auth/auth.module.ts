// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt'; // 👈 JWT Module
import { JWT_SECRET } from 'src/configs/jwt-secret';

@Module({
    providers: [AuthService],
    controllers: [AuthController],
    imports: [
        UsersModule,
        JwtModule.register({
            global: true, // 👈 JWT disponible globalmente
            secret: JWT_SECRET, // 🔑 Secret para firmar tokens
            signOptions: { expiresIn: '1d' }, // ⏰ Tokens expiran en 1 día
        }),
    ],
})
export class AuthModule {}