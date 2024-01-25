import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EGroupSetting } from 'src/common/enum/enum';

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
