import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CommentFileRequest {
  @IsString()
  @Optional()
  @ApiProperty()
  fileName: string;

  @IsString()
  @Optional()
  @ApiProperty()
  fileUrl: string;
}
