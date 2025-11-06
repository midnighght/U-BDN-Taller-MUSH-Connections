import { Controller, Patch, Delete ,UseGuards, Body, Request, Get } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guards';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
    constructor (private usersService: UsersService){}

    @Patch('update-bio')
    @UseGuards(AuthGuard)
    async updateDescription(@Body() description:String, @Request () req){

        const userId = req.user.userId;
        await this.usersService.updateDescription(description, userId);
        console.log('fetch descripcion weno');
    }


    @Patch('update-photo')
    @UseGuards(AuthGuard)
    async updatePhoto(@Body() userPhoto:String, @Request () req){
        const userId = req.user.userId;
        await this.usersService.updatePhoto(userPhoto, userId);
        console.log('fetch foto weno');
    }

    @Delete('delete-account')
    @UseGuards(AuthGuard)
    async deleteAccount(@Request() req){
        const userId = req.user.userId;
        await this.usersService.deleteAccount(userId);
        console.log('usuario eliminado');

    }

    @Patch('privacy')
    @UseGuards(AuthGuard)
    async Update(@Body() body: {isPrivate: boolean}, @Request() req){
        const userId = req.user.userId;
         await this.usersService.userUpdatePrivacy(body.isPrivate, userId);
        

    }
}
