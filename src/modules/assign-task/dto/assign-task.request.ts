import { ApiProperty } from '@nestjs/swagger';

export class AssignTaskReq {
  @ApiProperty()
  assignee: [string];

  @ApiProperty()
  taskID: string;

  @ApiProperty()
  leader: string;
}
