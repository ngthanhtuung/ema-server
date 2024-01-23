import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { DivisionEntity } from '../division/division.entity';
import { EventEntity } from '../event/event.entity';
import { TaskEntity } from '../task/task.entity';

@Entity({ name: 'assign_events' })
export class AssignEventEntity extends BaseEntity {
  @ManyToOne(() => EventEntity, (event) => event.assignEvents, {
    onDelete: 'CASCADE',
  })
  event: EventEntity;

  @ManyToOne(() => DivisionEntity, (division) => division.assignEvents, {
    onDelete: 'CASCADE',
  })
  division: DivisionEntity;

  @OneToMany(() => TaskEntity, (task) => task.eventDivision)
  tasks: TaskEntity[];
}
