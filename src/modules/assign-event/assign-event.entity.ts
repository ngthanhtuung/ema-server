import { Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { DivisionEntity } from '../division/division.entity';
import { EventEntity } from '../event/event.entity';

@Entity({ name: 'assign_event' })
export class AssignEventEntity extends BaseEntity {
  @ManyToOne(() => EventEntity, (event) => event.assignEvents, {
    onDelete: 'CASCADE',
  })
  event: EventEntity;

  @ManyToOne(() => DivisionEntity, (division) => division.assignEvents, {
    onDelete: 'CASCADE',
  })
  division: DivisionEntity;
}
