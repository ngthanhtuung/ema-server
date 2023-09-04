import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
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
import UserPagination from './dto/user.pagination';

@Controller('user')
@ApiTags('user-controller')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {

  constructor(private readonly userService: UserService) { }

  /**
   * http://localhost:6969/api/v1/user/list(GET)
   * getAllUser
   * @param userPagination 
   * @returns 
   */
  @Get('/list')
  async getAllUser(@Query() userPagination: UserPagination): Promise<any | undefined> {
    return await this.userService.getAllUser(userPagination);
  }

  /**
   * http://localhost:6969/api/v1/user/list(GET)
   * getListUserByFilter
   * @param condition 
   * @param data 
   * @returns 
   */
  @Get('/list/filter')
  async getListUserByFilter(@Query('condition') condition: string, @Query('data') data?: string): Promise<any | undefined> {
    return await this.userService.getListUserByFilter(condition, data);
  }

  /**
   * http://localhost:6969/api/v1/user/profile(GET)
   * getProfile
   * @param user 
   * @returns 
   */
  @Get('/profile')
  async getProfile(@GetUser() user: User): Promise<any | undefined> {
    return await this.userService.getProfile(user);
  }

  /**
   * http://localhost:6969/api/v1/user/create(Post)
   * createUser
   * @param data 
   * @param user 
   * @returns 
   */
  @Post('/create')
  @hasRoles(RoleEnum.ADMIN)
  async createUser(@Body() data: UserCreateDto, @GetUser() user: User): Promise<any | undefined> {
    return await this.userService.createUser(data, user);
  }

  /**
   * http://localhost:6969/api/v1/user/change-password(Put)
   * changePassword
   * @param data 
   * @param user 
   * @returns 
   */
  @Put('/change-password')
  async changePassword(@Body() data: ChangePasswordDto, @GetUser() user: User): Promise<any | undefined> {
    return await this.userService.changePassword(data, user);
  }

  /**
   * http://localhost:6969/api/v1/user/:idUser/change-status(put)
   * changeStatus
   * @param idUser
   * @param user 
   * @returns 
   */
  @Put('/:idUser/change-status')
  @hasRoles(RoleEnum.ADMIN)
  async changeStatus(@Param('idUser') idUser: string, @GetUser() user: User): Promise<any | undefined> {
    return await this.userService.changeStatusUser(idUser, user);
  }
}
