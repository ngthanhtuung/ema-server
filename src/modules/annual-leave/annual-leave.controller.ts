import { Controller, Get, Param } from '@nestjs/common';
import { AnnualLeaveService } from './annual-leave.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { GetUser } from 'src/decorators/getUser.decorator';
import { AnnualLeaveEntity } from './annual-leave.entity';
import { AnnualLeaveGetRequest } from './dto/annual-leave.request';

@ApiBearerAuth()
@Controller('annual-leave')
@ApiTags('Annual-leave')
export class AnnualLeaveController {
  constructor(private readonly annualLeaveService: AnnualLeaveService) {}

  @Get()
  //   @Roles()
  async getAnnualLeaveOfYear(
    @GetUser() user: string,
    @Param() dto: AnnualLeaveGetRequest,
  ): Promise<AnnualLeaveEntity> {
    const oUser = JSON.parse(user);
    return await this.annualLeaveService.getAnnualLeaveOfyear(
      oUser.id,
      dto.year,
    );
  }
}
