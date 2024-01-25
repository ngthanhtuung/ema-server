import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { EGroupSetting, ERole } from 'src/common/enum/enum';
import { SettingRequestDto } from './dto/settings.dto';
import { Roles } from 'src/decorators/role.decorator';
import { SettingEntity } from './settings.entity';

@ApiTags('System Settings')
@Controller('settings')
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingService: SettingsService) {}

  // @Get('/:code')
  // @Roles(ERole.ADMIN)
  // async getSettingByCode(
  //   @Param('code') code: string,
  // ): Promise<SettingEntity | undefined> {
  //   console.log('Code: ', code);
  //   return await this.settingService.getSettingByCode(code);
  // }

  @Post('/new')
  @Roles(ERole.ADMIN)
  @ApiQuery({
    name: 'group',
    enum: EGroupSetting,
  })
  async createNewSetting(
    @Query('group') group: EGroupSetting,
    @Body() settingRequest: SettingRequestDto,
  ): Promise<string | undefined> {
    return this.settingService.createNewSetting(group, settingRequest);
  }
}
