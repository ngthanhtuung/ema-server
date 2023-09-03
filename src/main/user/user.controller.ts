import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import UserCreateDto from './dto/user-create.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { hasRoles } from '../auth/role-auth/roles.decorator';
import { RoleEnum } from '../role/enum/role.enum';
import ChangePasswordDto from './dto/changePassword.dto';
import { GetUser } from 'src/decorators/getUser.decorator';
import User from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/role-auth/role.guard';

@Controller('user')
@ApiTags('user-controller')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {

  constructor(private readonly userService: UserService) { }

  @Get('/profile')
  async getProfile(@GetUser() user: User): Promise<any | undefined> {
    return await this.userService.getProfile(user);
  }

  @Post()
  @hasRoles(RoleEnum.ADMIN)
  async createUser(@Body() data: UserCreateDto, @GetUser() user: User): Promise<any | undefined> {
    return await this.userService.createUser(data, user);
  }

  @Put('/change-password')
  async changePassword(@Body() data: ChangePasswordDto, @GetUser() user: User): Promise<any | undefined> {
    return await this.userService.changePassword(data, user);
  }
}
