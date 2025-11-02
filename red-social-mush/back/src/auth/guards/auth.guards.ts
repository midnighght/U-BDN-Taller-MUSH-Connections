// src/auth/guards/auth.guards.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {} 

    async canActivate(context: ExecutionContext) {
        console.log('guard')
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization;
        const token = authorization?.split(' ')[1]; 

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
           
            const tokenPayload = await this.jwtService.verifyAsync(token);
            request.user = {
                userId: tokenPayload.sub,
                username: tokenPayload.username,
                email: tokenPayload.email,
            };
            console.log('token ok')
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}