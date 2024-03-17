import { CustomerContactEntity } from './../customer_contacts/customer_contacts.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EventEntity } from '../event/event.entity';

@Entity({ name: 'event_types' })
export class EventTypeEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  typeName: string;

  @Column({ type: 'text', nullable: true })
  linkTemplate: string;

  @OneToMany(() => EventEntity, (event) => event.eventType)
  events: EventEntity[];

  @OneToMany(
    () => CustomerContactEntity,
    (customerContact) => customerContact.eventType,
  )
  customerContacts: CustomerContactEntity[];
}
