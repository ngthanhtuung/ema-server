import { Body, Controller, Post } from '@nestjs/common';
import { DeviceService } from './device.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeviceRequest } from './dto/device.request';
import { GetUser } from 'src/decorators/getUser.decorator';

@Controller('device')
@ApiTags('Device')
@ApiBearerAuth()
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async insertDevice(
    @Body() device: DeviceRequest,
    @GetUser() user: string,
  ): Promise<string> {
    return await this.deviceService.insertDeviceToken(
      device.deviceToken,
      JSON.parse(user).id,
    );
  }
}
