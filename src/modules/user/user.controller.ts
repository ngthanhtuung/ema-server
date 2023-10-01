import { UserPagination } from './dto/user.request';
import { Controller, Get, Param, Query, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/getUser.decorator';
import { UserService } from './user.service';
import { Roles } from 'src/decorators/role.decorator';
import { ERole, EUserStatus } from 'src/common/enum/enum';
import { UserProfile } from './dto/user.response';
import { IPaginateResponse } from '../base/filter.pagination';

@ApiBearerAuth()
@Controller('user')
@ApiTags('user-controller')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@GetUser() user: string): Promise<UserProfile> {
    return await this.userService.findByIdV2(JSON.parse(user).id);
  }

  @Get('/:userId')
  @Roles(ERole.MANAGER)
  async getUserById(@Param('userId') userId: string): Promise<UserProfile> {
    return await this.userService.findByIdV2(userId);
  }

  @Get('')
  async getUserByDivision(
    @Query('divisionId') divisionId: string,
    @Query() userPagination: UserPagination,
    @GetUser() user: string,
  ): Promise<IPaginateResponse<UserProfile>> {
    const role = JSON.parse(user).role;
    return await this.userService.findByDivision(
      divisionId,
      userPagination,
      role,
    );
  }

  @Put('/:userId/:status')
  @Roles(ERole.MANAGER)
  @ApiParam({ name: 'status', enum: EUserStatus })
  async upadateStatus(
    @Param('userId') userId: string,
    @Param('status') status: EUserStatus,
    @GetUser()
    user: string,
  ): Promise<string> {
    return await this.userService.updateStatus(
      userId,
      status,
      JSON.parse(user).id,
    );
  }
}
