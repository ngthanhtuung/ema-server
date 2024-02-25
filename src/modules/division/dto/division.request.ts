import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import * as moment from 'moment-timezone';

export class DivisionCreateRequest {
  @IsString()
  @ApiProperty({ default: 'Hậu Cần' })
  divisionName: string;

  @IsString()
  @ApiProperty({ default: 'abc test' })
  description: string;
}

export class DivisionUpdateRequest extends DivisionCreateRequest {
  @IsBoolean()
  @ApiProperty({
    type: 'enum',
    enum: [true, false],
  })
  status: boolean;
}

export class DivisionConditionFind {
  @ApiProperty({
    description: 'Id: id user, Email: email user',
    required: true,
    default: 'id',
  })
  fieldName: string;

  @ApiProperty({
    description: 'Value of field name',
    required: true,
    default: 'value id user',
  })
  conValue: string;
}

export class EmployeeFreeFind extends DivisionConditionFind {
  @ApiProperty({
    description: 'StartDate: start date of task',
    required: true,
    default: moment().format('DD-MM-YYYY'),
  })
  startDate: string;

  @ApiProperty({
    description: 'EndDate: end date of task',
    required: true,
    default: moment().add(3, 'days').format('DD-MM-YYYY'),
  })
  endDate: string;
}
// customerName: string;
// customerNationalId: string;
// customerEmail: string;
// customerPhoneNumber: string;
// contractValue: number;
// paymentMethod: string;
// paymentDate: string;
