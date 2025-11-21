import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService], // Para usar en otros módulos
})
export class BlocksModule {}