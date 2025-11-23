import { Injectable, UnauthorizedException, BadRequestException, Body } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { loginDTO, loginResponseDTO, registerDTO, signInDTO } from './dto/auth.dto';
import { EmailService } from 'src/email/email.service';
import { Neo4jService } from 'src/neo4j/neo4j.service'; // ✅ Importar Neo4jService

type SignInData = { userId: string; username: string; email: string };

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private emailService: EmailService,
    private neo4jService: Neo4jService, // ✅ Inyectar Neo4jService
  ) {}

  async authenticate(@Body() loginDTO: loginDTO): Promise<loginResponseDTO> {
    const user = await this.validateUser(loginDTO);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // ✅ VERIFICAR SI EL EMAIL ESTÁ VERIFICADO
    const userDoc = await this.userModel.findOne({ email: loginDTO.email });
    if (userDoc && !userDoc.isVerified) {
      throw new UnauthorizedException(
        'Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
      );
    }

    await this.userModel.findByIdAndUpdate(user.userId, {
      lastLogin: new Date(),
    });

    return this.signIn(user);
  }

  async validateUser(@Body() loginDTO: loginDTO): Promise<SignInData | null> {
    const user = await this.userModel.findOne({ email: loginDTO.email });

    if (!user) {
      return null;
    }

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
      access_token: accessToken,
      user: {
        id: user.userId,
        username: user.username,
        email: user.email,
      },
    };
  }

  async register(@Body() registerDTO: registerDTO): Promise<{ message: string }> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({
      $or: [{ email: registerDTO.email }, { username: registerDTO.username }],
    });

    if (existingUser) {
      if (existingUser.email === registerDTO.email) {
        throw new BadRequestException('Este correo electrónico ya está registrado');
      }
      throw new BadRequestException('Este nombre de usuario ya está en uso');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDTO.password, 10);

    // ✅ GENERAR TOKEN DE VERIFICACIÓN
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    // Crear usuario en MongoDB
    const user = new this.userModel({
      username: registerDTO.username,
      email: registerDTO.email,
      password: hashedPassword,
      firstName: registerDTO.firstName,
      lastName: registerDTO.lastName,
      birthDate: new Date(registerDTO.birthDate),
      location: registerDTO.location,
      isPrivate: registerDTO.isPrivate || false,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await user.save();

    // ✅ CREAR NODO EN NEO4J
    // ✅ CREAR NODO EN NEO4J
try {
  await this.neo4jService.createOrUpdateUser(
    (user._id as any).toString(), // ✅ Cast a any
    user.username,
    user.userPhoto || ''
  );
  console.log('✅ Usuario creado en Neo4j:', user._id);
} catch (error) {
  console.error('⚠️ Error creando usuario en Neo4j:', error);
  // No fallar el registro si Neo4j falla
}

    // ✅ ENVIAR EMAIL DE VERIFICACIÓN
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.username,
        verificationToken,
      );
    } catch (error) {
      console.error('Error al enviar email de verificación:', error);
    }

    return {
      message:
        'Registro exitoso. Por favor revisa tu correo electrónico para verificar tu cuenta.',
    };
  }

  // ✅ NUEVO: Verificar email
  async verifyEmail(token: string): Promise<{ message: string }> {
    console.log('🔍 Buscando usuario con token:', token);

    const user = await this.userModel.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      console.log('❌ Token inválido o expirado');
      throw new BadRequestException('Token de verificación inválido o expirado');
    }

    console.log('👤 Usuario encontrado:', user.email);

    // Marcar como verificado y eliminar tokens
    await this.userModel.findByIdAndUpdate(user._id, {
      $set: { isVerified: true },
      $unset: { 
        verificationToken: 1, 
        verificationTokenExpires: 1 
      }
    });

    console.log('✅ Usuario marcado como verificado');

    // Enviar email de bienvenida
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.username);
      console.log('📧 Email de bienvenida enviado');
    } catch (error) {
      console.error('⚠️ Error al enviar email de bienvenida:', error);
    }

    return { message: 'Email verificado exitosamente. Ya puedes iniciar sesión.' };
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.userModel.findById(payload.sub).select('-password');

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return {
        userId: user.id,
        username: user.username,
        email: user.email,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}