import { UserPagination } from './dto/user.request';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/getUser.decorator';
import { UserService } from './user.service';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';

@ApiBearerAuth()
@Controller('user')
@ApiTags('user-controller')
export class UserController {

    constructor(
        private readonly userService: UserService,
    ) { }

    @Get('profile')
    async getProfile(@GetUser() user: string): Promise<any | undefined> {
        return await this.userService.findByIdV2(JSON.parse(user).id);
    }

    @Get('/:userId')
    @Roles(ERole.MANAGER)
    async getUserById(@Param('userId') userId: string): Promise<any | undefined> {
        return await this.userService.findByIdV2(userId);
    }

    @Get('division/:divisionId')
    async getUserByDivision(
        @Param('divisionId') divisionId: string,
        @Query() userPagination: UserPagination
    ): Promise<any | undefined> {
        return await this.userService.findByDivision(divisionId, userPagination);
    }
}

