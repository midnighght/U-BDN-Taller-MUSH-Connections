// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

type AuthInput = { email: string; password: string };
type SignInData = { userId: string; username: string; email: string };
type AuthResult = { accessToken: string; userId: string; username: string; email: string };

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService, // 👈 JWT Service para tokens
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}
     
    // 👇 Login - Genera token JWT
    async authenticate(input: AuthInput): Promise<AuthResult> {
        const user = await this.validateUser(input);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        // Actualizar último login
        await this.userModel.findByIdAndUpdate(user.userId, { 
            lastLogin: new Date() 
        });
        
        return this.signIn(user); // 👈 Retorna con token
    }

    async validateUser(input: AuthInput): Promise<SignInData | null> {
        const user = await this.userModel.findOne({ email: input.email });

        if (!user) {
            return null;
        }

        // Comparar contraseña hasheada
        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        
        if (isPasswordValid) {
            return {
                userId: user.id,
                username: user.username,
                email: user.email,
            };
        }
        
        return null;
    }

    // 👇 Genera el token JWT (ya lo tenías)
    async signIn(user: SignInData): Promise<AuthResult> {
        const tokenPayload = {
            sub: user.userId,
            username: user.username,
            email: user.email,
        };

        // 🔑 Genera el token JWT
        const accessToken = await this.jwtService.signAsync(tokenPayload);
        
        return { 
            accessToken, // 👈 Token JWT
            username: user.username, 
            userId: user.userId,
            email: user.email 
        };
    }

    // 👇 Registro - También genera token JWT
    async register(userData: {
        username: string;
        email: string;
        password: string;
        description?: string;
        isPrivate?: boolean;
    }): Promise<AuthResult> {
        // Verificar si el usuario ya existe
        const existingUser = await this.userModel.findOne({
            $or: [{ email: userData.email }, { username: userData.username }]
        });

        if (existingUser) {
            if (existingUser.email === userData.email) {
                throw new UnauthorizedException('Email already exists');
            }
            throw new UnauthorizedException('Username already exists');
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Crear usuario
        const user = new this.userModel({
            ...userData,
            password: hashedPassword,
            isPrivate: userData.isPrivate || false,
            
        });

        const savedUser = await user.save();

        // 👇 Retorna con token JWT
        return this.signIn({
            userId: savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
        });
    }

    // 👇 NUEVO: Validar token (útil para después)
    async validateToken(token: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            const user = await this.userModel.findById(payload.sub).select('-password');
            
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            
            return {
                userId: user.id,
                username: user.username,
                email: user.email,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}