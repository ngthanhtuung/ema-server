import { ApiProperty } from '@nestjs/swagger';
import { EPriority, ETaskStatus, SortEnum } from 'src/common/enum/enum';

export class TaskCreateReq {
  @ApiProperty()
  title: string;

  @ApiProperty()
  eventID: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  desc: string;

  @ApiProperty({
    type: 'enum',
    enum: EPriority,
  })
  priority: EPriority;

  @ApiProperty({ required: false })
  parentTask: string;

  @ApiProperty()
  estimationTime: number;

  @ApiProperty()
  effort: number;

  @ApiProperty({ required: false })
  assignee: [string];

  @ApiProperty({ required: false })
  leader: string;

  @ApiProperty({ required: false })
  fileUrl: string;
}

export class TaskUpdateReq {
  @ApiProperty({ required: false, default: '' })
  title: string;

  @ApiProperty({ required: true, default: null })
  eventID: string;

  @ApiProperty({ required: false, default: null })
  startDate: Date;

  @ApiProperty({ required: false, default: null })
  endDate: Date;

  @ApiProperty({ required: false, default: null })
  description: string;

  @ApiProperty({
    type: 'enum',
    enum: EPriority,
    required: false,
  })
  priority: EPriority;

  @ApiProperty({ required: false, default: null })
  parentTask: string;

  @ApiProperty({ required: false, default: null })
  estimationTime: number;

  @ApiProperty({ required: false, default: null })
  effort: number;
}

export class TaskUpdateStatusReq {
  @ApiProperty({ required: true })
  taskID: string;

  @ApiProperty({
    required: true,
    type: 'enum',
    enum: ETaskStatus,
  })
  status: ETaskStatus;
}

export class TaskIDReq {
  @ApiProperty({ required: true })
  taskID: string;
}

export class TaskConditonFind {
  @ApiProperty({ required: true })
  fieldName: string;

  @ApiProperty({ required: true })
  conValue: string;
}

export class FilterTask {
  @ApiProperty({ required: false })
  assignee: string;

  @ApiProperty({
    type: 'enum',
    enum: EPriority,
    required: false,
  })
  priority: EPriority;

  @ApiProperty({
    type: 'enum',
    enum: SortEnum,
    required: false,
  })
  sort: SortEnum;

  @ApiProperty({
    required: false,
    type: 'enum',
    enum: ETaskStatus,
  })
  status: ETaskStatus;
}
