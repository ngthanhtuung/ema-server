import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';
import { EventEntity } from '../event/event.entity';

@Entity({ name: 'timesheets' })
export class TimesheetEntity extends BaseEntity {
  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  checkinTime: Date;

  @Column({ type: 'varchar', nullable: true })
  checkinLocation: string;

  // @Column({ type: 'time', nullable: true })
  // checkoutTime: Date;

  // @Column({ type: 'varchar', nullable: true })
  // checkoutLocation: string;

  @ManyToOne(() => UserEntity, (user) => user.timesheets, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => EventEntity, (event) => event.timesheets, {
    onDelete: 'CASCADE',
  })
  event: EventEntity;
}
