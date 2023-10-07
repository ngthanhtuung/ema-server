import { ApiProperty } from '@nestjs/swagger';

export class TaskFileCreateReq {
  @ApiProperty()
  taskID: string;

  @ApiProperty()
  fileUrl: string;
}
