import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'timesheets' })
export class TimesheetEntity extends BaseEntity {
  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  checkinTime: Date;

  @Column({ type: 'varchar' })
  checkinLocation: string;

  @Column({ type: 'time' })
  checkoutTime: Date;

  @Column({ type: 'varchar' })
  checkoutLocation: string;

  @ManyToOne(() => UserEntity, (user) => user.timesheets, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
