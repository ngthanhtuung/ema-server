import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  FilterRequest,
  RequestCreateRequest,
  UpdateRequestStatusReq,
} from './dto/request.request';
import { GetUser } from 'src/decorators/getUser.decorator';
import { UserEntity } from '../user/user.entity';
import { RequestEntity } from './request.entity';
import { Roles } from 'src/decorators/role.decorator';
import { ERole } from 'src/common/enum/enum';
import { UserPagination } from '../user/dto/user.request';

@ApiBearerAuth()
@Controller('request')
@ApiTags('Request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get('/filterRequest/:currentPage/:sizePage')
  @ApiParam({ name: 'currentPage', type: 'string' })
  @ApiParam({ name: 'sizePage', type: 'string' })
  async filterRequest(
    @Query() filter: FilterRequest,
    @Param() userPagination: UserPagination,
  ): Promise<RequestEntity> {
    // const userPagination = params;
    return await this.requestService.filterRequest(filter, userPagination);
  }

  @Get('/detail/:id')
  async getDetailRequest(@Param('id') reqID: string): Promise<RequestEntity> {
    return this.requestService.getAllDetailRequest(reqID);
  }

  @Post()
  async createRequest(
    @Body() dto: RequestCreateRequest,
    @GetUser() user: string,
  ): Promise<string> {
    const oUser = JSON.parse(user);
    return await this.requestService.createRequest(oUser.id, dto);
  }

  @Put('/approveRequest')
  @Roles(ERole.MANAGER)
  async updateRequestStatus(
    @Body() dto: UpdateRequestStatusReq,
    @GetUser() user: string,
  ): Promise<string> {
    const oUser = JSON.parse(user);
    return await this.requestService.updateRequestStatus(dto, oUser.id);
  }

  @Put('/changeRequest/:id')
  async changeRequest(
    @Param('id') reqID: string,
    @Body() dto: RequestCreateRequest,
    @GetUser() user: string,
  ): Promise<string> {
    const oUser = JSON.parse(user);
    return this.requestService.updateRequest(dto, oUser.id, reqID);
  }

  @Delete('/changeRequest/:id')
  async deleteRequest(@Param('id') reqID: string): Promise<string> {
    return this.requestService.deleteRequest(reqID);
  }
}
