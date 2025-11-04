// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Body} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { loginDTO, loginResponseDTO, registerDTO, signInDTO } from './dto/auth.dto';

type SignInData = { userId: string; username: string; email: string };

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService, 
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}
     
    
    async authenticate(@Body() loginDTO: loginDTO): Promise<loginResponseDTO> {
        const user = await this.validateUser(loginDTO);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        
        await this.userModel.findByIdAndUpdate(user.userId, { 
            lastLogin: new Date() 
        });
        
        return this.signIn(user); 
    }

    async validateUser(@Body() loginDTO: loginDTO): Promise<SignInData | null> {
        const user = await this.userModel.findOne({ email: loginDTO.email});

        if (!user) {
            return null;
        }

        // Comparar contraseña hasheada
        const isPasswordValid = await bcrypt.compare(loginDTO.password, user.password);
        
        if (isPasswordValid) {
            return {
                userId: user.id,
                username: user.username,
                email: user.email,
            };
        }
        
        return null;
    }

    
    async signIn(@Body() user: signInDTO): Promise<loginResponseDTO> {
        const tokenPayload = {
            sub: user.userId,
            username: user.username,
            email: user.email,
        };

        
        const accessToken = await this.jwtService.signAsync(tokenPayload);
        return { 
            access_token:accessToken, 
            user : {
                id: user.userId,
                username: user.username,
                email: user.email
            }
        };
    }

    
    async register(@Body() registerDTO:registerDTO): Promise<loginResponseDTO> {
        // Verificar si el usuario ya existe
        const existingUser = await this.userModel.findOne({
            $or: [{ email: registerDTO.email }, { username: registerDTO.username }]
        });

        if (existingUser) {
            if (existingUser.email === registerDTO.email) {
                throw new UnauthorizedException('Email already exists');
            }
            throw new UnauthorizedException('Username already exists');
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(registerDTO.password, 10);

        // Crear usuario
        const user = new this.userModel({
            ...registerDTO,
            password: hashedPassword,
            isPrivate: registerDTO.isPrivate || false,
            
        });

        const savedUser = await user.save();

        
        return this.signIn({
            userId: savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
        });
    }

    
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