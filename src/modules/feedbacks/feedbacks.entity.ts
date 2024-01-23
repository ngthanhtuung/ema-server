import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { EventEntity } from '../event/event.entity';

@Entity({ name: 'feedbacks' })
export class FeedbackEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  customerName: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'char', length: 13, nullable: false })
  phoneNumber: string;

  @Column({ type: 'integer', nullable: false })
  rating: number;

  @Column({ type: 'varchar', nullable: false })
  feedbackTexting: string;

  @ManyToOne(() => EventEntity, (event) => event.feedbacks)
  event: EventEntity;
}
