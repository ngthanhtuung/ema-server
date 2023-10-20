import { ApiProperty, OmitType } from '@nestjs/swagger';

export class TaskFileCreateReq {
  @ApiProperty()
  taskID: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;
}

export class TaskFileRequest extends OmitType(TaskFileCreateReq, ['taskID']) {}
