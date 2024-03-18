import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SettingRequestDto {
  @IsString()
  @ApiProperty()
  code: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  value: string;
}
