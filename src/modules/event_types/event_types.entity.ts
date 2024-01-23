import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EventEntity } from '../event/event.entity';

@Entity({ name: 'event_types' })
export class EventTypeEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  typeName: string;

  @OneToMany(() => EventEntity, (event) => event.eventType)
  events: EventEntity[];
}
