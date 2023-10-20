import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CommentFileRequest } from 'src/modules/commentfile/dto/commentFile.request';

export class CommentCreateRequest {
  @IsString()
  @ApiProperty({})
  taskID: string;

  @IsString()
  @ApiProperty()
  content: string;

  @ApiProperty({
    type: [CommentFileRequest],
    required: false,
  })
  file?: CommentFileRequest[];
}
