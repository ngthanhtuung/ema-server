import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    type: 'datetime',
    default: moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss.SSS'),
  })
  public createdAt: Date;

  @Column({
    type: 'datetime',
    default: moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss.SSS'),
  })
  public updatedAt: Date;
}
