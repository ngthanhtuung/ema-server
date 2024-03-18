import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  EContractPaymentMethod,
  EEventDate,
  EEventStatus,
  SortEnum,
} from 'src/common/enum/enum';
import { TaskCreateReq } from 'src/modules/task/dto/task.request';

export class EventCreateRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Sự kiện 10 năm thành lập FBT' })
  eventName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Test desc' })
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: '2023-10-10' })
  startDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: '2023-11-09' })
  processingDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: '2023-11-10' })
  endDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Quận 12' })
  location: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    default:
      'https://img.freepik.com/free-psd/saturday-party-social-media-template_505751-2935.jpg?w=740&t=st=1696662680~exp=1696663280~hmac=30be138e6333ca7cbd4ea46fc39296aed44c5b3247173cab7bd45c230b65bfec',
  })
  coverUrl: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ default: '120000000' })
  estBudget: number;

  @ApiProperty()
  eventTypeId?: string;

  @ApiProperty({
    default: [
      {
        title: 'Test create task',
        desc: 'Test create task',
        priority: 'low',
        itemId: 'test',
      },
    ],
  })
  listTask: TaskCreateReq[];

  @IsArray()
  @ApiProperty({ default: ['1a73eb86-99ee-46c4-92c3-a9ae091c0caf'] })
  listDivision: Array<string>;
}

export class EventCreateRequestContract {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Sự kiện 10 năm thành lập FBT' })
  eventName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: '2023-10-10' })
  startDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: '2023-11-09' })
  processingDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: '2023-11-10' })
  endDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Quận 12' })
  location: string;

  @ApiProperty()
  eventTypeId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: 'Nguyễn Văn A',
  })
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: '123456789',
  })
  customerNationalId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: 'Thành Phố Thủ Dầu Một, Bình Dương',
  })
  customerAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: 'nguyenvana@gmail.com',
  })
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: '0987654321',
  })
  customerPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'enum',
    enum: EContractPaymentMethod,
    default: EContractPaymentMethod.CASH,
  })
  paymentMethod: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: '2024-10-10',
  })
  paymentDate: string;
}

export class EventAssignRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    default: 'bf27aaa9-5fc7-4c23-b1ab-aaf57489cfaf',
  })
  eventId: string;

  @IsArray()
  @ApiProperty({ default: ['1a73eb86-99ee-46c4-92c3-a9ae091c0caf'] })
  divisionId: Array<string>;
}

export class EventUpdateRequest extends EventCreateRequest {
  @IsArray()
  @ApiProperty({ default: [] })
  divisionId: Array<string>;
}

export class FilterEvent {
  @ApiProperty({ required: false, default: 'test' })
  eventName: string;

  @ApiProperty({ required: false, default: '2023-10' })
  monthYear: string;

  @ApiProperty({
    type: 'string',
    required: false,
    default: 'startDate',
  })
  nameSort: string;

  @ApiProperty({
    type: 'enum',
    enum: SortEnum,
    required: false,
  })
  sort: SortEnum;

  @ApiProperty({
    required: false,
    type: 'enum',
    enum: EEventStatus,
  })
  status: EEventStatus;
}

export class GetListEvent {
  @ApiProperty({ description: 'User ID', required: true, default: 'test' })
  userId: string;

  @ApiProperty({
    description:
      'TODAY: Get list event TODAY, UPCOMING: Get list event UPCOMMING',
    required: true,
    default: EEventDate.TODAY,
  })
  status: EEventDate;
}
