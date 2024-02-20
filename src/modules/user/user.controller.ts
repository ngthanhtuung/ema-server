import {
  FilterFreeEmployee,
  UserPagination,
  UserProfileUpdateRequest,
  UserProfileUpdateRequestV2,
} from './dto/user.request';
import { Controller, Get, Param, Query, Put, Body, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/getUser.decorator';
import { UserService } from './user.service';
import { Roles } from 'src/decorators/role.decorator';
import { ERole, EUserStatus } from 'src/common/enum/enum';
import { UserProfile } from './dto/user.response';
import { IPaginateResponse } from '../base/filter.pagination';

@ApiBearerAuth()
@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@GetUser() user: string): Promise<UserProfile> {
    return await this.userService.findByIdV2(JSON.parse(user).id);
  }

  @Get('/:userId')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.ADMIN)
  async getUserById(@Param('userId') userId: string): Promise<UserProfile> {
    return await this.userService.findByIdV2(userId);
  }

  // @Get('')
  // @ApiQuery({
  //   name: 'divisionId',
  //   required: false,
  // })
  // async getUserByDivision(
  //   @Query('divisionId') divisionId: string,
  //   @Query() userPagination: UserPagination,
  //   @GetUser() user: string,
  // ): Promise<IPaginateResponse<UserProfile>> {
  //   const role = JSON.parse(user).role;
  //   return await this.userService.findByDivision(
  //     divisionId,
  //     userPagination,
  //     role,
  //   );
  // }

  @Get('')
  @Roles(ERole.MANAGER, ERole.STAFF, ERole.ADMIN)
  @ApiQuery({
    name: 'role',
    enum: [ERole.STAFF, ERole.EMPLOYEE],
    required: false,
  })
  @ApiQuery({
    name: 'divisionId',
    required: false,
  })
  async getUserByDivisionAndRole(
    @Query('divisionId') divisionId: string,
    @Query('role') role: ERole,
    @Query() userPagination: UserPagination,
    @GetUser() user: string,
  ): Promise<IPaginateResponse<UserProfile>> {
    const roleLogin = JSON.parse(user).role;
    return await this.userService.findByDivision(
      divisionId,
      userPagination,
      role,
      roleLogin,
    );
  }

  @Put('/:userId/:status')
  @Roles(ERole.MANAGER, ERole.ADMIN)
  @ApiParam({ name: 'status', enum: EUserStatus })
  async updateStatus(
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

  @Put('profile')
  async updateProfile(
    @GetUser() user: string,
    @Body() updateBody: UserProfileUpdateRequest,
  ): Promise<string> {
    return await this.userService.updateProfile(
      JSON.parse(user).id,
      updateBody,
    );
  }

  @Put('/:userId')
  @Roles(ERole.MANAGER, ERole.ADMIN)
  async UpdateProfileV2(
    @GetUser() user: string,
    @Body() updateProfile: UserProfileUpdateRequestV2,
    @Param('userId') userId: string,
  ): Promise<string> {
    return await this.userService.updateProfileV2(
      JSON.parse(user).id,
      updateProfile,
      userId,
    );
  }

  @Get('/getFreeEmployee/:startDate/:endDate')
  async getFreeEmployee(
    @Param('startDate') startDate: Date,
    @Param('endDate') endDate: Date,
  ): Promise<string> {
    const filter = { startDate, endDate };
    return await this.userService.getFreeEmployee(filter);
  }
}
