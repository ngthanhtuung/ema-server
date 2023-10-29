import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeviceRequest {
  @IsString()
  @ApiProperty()
  deviceToken: string;
}
