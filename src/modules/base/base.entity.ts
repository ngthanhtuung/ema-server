import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn()
  @Transform(({ value }) => {
    return moment(value)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DD HH:mm:ss.SSS');
  })
  public createdAt: Date;

  @UpdateDateColumn()
  @Transform(({ value }) => {
    return moment(value)
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DD HH:mm:ss.SSS');
  })
  public updatedAt: Date;
}
