import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export default class ChangePasswordDto {
  @IsNotEmpty()
  @ApiProperty()
  public oldPassword: string;

  @IsNotEmpty()
  @ApiProperty()
  public newPassword: string;

  @IsNotEmpty()
  @ApiProperty()
  public confirmPassword: string;
}
