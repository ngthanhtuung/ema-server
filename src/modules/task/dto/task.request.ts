import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';
import { EPriority, ETaskStatus, SortEnum } from 'src/common/enum/enum';
import { TaskFileRequest } from 'src/modules/taskfile/dto/taskFile.request';

export class TaskCreateReq {
  @ApiProperty()
  title: string;

  @ApiProperty()
  eventID: string;

  @ApiProperty({ required: false })
  startDate: Date;

  @ApiProperty({ required: false })
  endDate: Date;

  @ApiProperty({ required: false })
  desc: string;

  @ApiProperty({ required: false, default: false })
  isTemplate: boolean;

  @ApiProperty({
    type: 'enum',
    enum: EPriority,
    required: false,
  })
  priority: EPriority;

  @ApiProperty({ required: false })
  parentTask: string;

  @ApiProperty({ required: false })
  estimationTime: number;

  @ApiProperty({ required: false })
  assignee: [string];

  @ApiProperty({ required: false })
  leader: string;

  @ApiProperty({ required: false })
  itemId: string;

  @ApiProperty({ required: false })
  itemPercentage: number;

  @ApiProperty({
    type: [TaskFileRequest],
    required: false,
  })
  file?: TaskFileRequest[];
}

export class TaskUpdateReq {
  @ApiProperty({ required: false, default: '' })
  title: string;

  @ApiProperty({ required: true, default: null })
  eventID: string;

  @ApiProperty({ required: false, default: null })
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss.SSS');
  })
  startDate: Date;

  @ApiProperty({ required: false, default: null })
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss.SSS');
  })
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

export class GetListTaskByDate {
  @ApiProperty({ description: 'User ID', required: true, default: 'test' })
  userId: string;

  @ApiProperty({
    description: 'Date: Get list task in Date',
    required: true,
    default: moment().format('YYYY-MM-DD'),
  })
  date: string;

  @ApiProperty({
    description: 'dateEnd: Get list task in Date to DateEnd',
    required: false,
    default: moment().add(6, 'days').format('YYYY-MM-DD'),
  })
  dateEnd?: string;
}

export class FilterTask {
  @ApiProperty({ required: false })
  assignee: string;

  @ApiProperty({ required: false })
  eventID: string;

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
