import { Column, Entity, OneToMany } from 'typeorm';
import { ParticipantsEntity } from '../participants/participants.entity';
import { BaseEntity } from '../base/base.entity';

@Entity({ name: 'conversations' })
export class ConversationEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  creatorId: string;

  @Column({ type: 'date', nullable: true })
  deletedAt: Date;

  @OneToMany(
    () => ParticipantsEntity,
    (participant) => participant.conversations,
  )
  participants: ParticipantsEntity[];
}
