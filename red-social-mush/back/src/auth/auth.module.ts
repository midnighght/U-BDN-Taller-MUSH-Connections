import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt'; 
import { JWT_SECRET } from 'src/configs/jwt-secret';
import { CommunitiesModule } from 'src/communities/communities.module';
import { EmailModule } from 'src/email/email.module';
import { Neo4jModule } from 'src/neo4j/neo4j.module';
import { FriendshipsModule } from 'src/friendships/friendships.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    CommunitiesModule,
    EmailModule,
    Neo4jModule,
    FriendshipsModule
  ],
})
export class AuthModule {}
