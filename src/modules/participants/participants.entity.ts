import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ERoleParticipant } from 'src/common/enum/enum';
import { UserEntity } from '../user/user.entity';
import { ConversationEntity } from '../conversations/conversations.entity';

@Entity({ name: 'participants' })
export class ParticipantsEntity extends BaseEntity {
  @Column({ type: 'enum', enum: ERoleParticipant, nullable: false })
  type: ERoleParticipant;

  @ManyToOne(() => UserEntity, (user) => user.participants)
  user: UserEntity;

  @ManyToOne(
    () => ConversationEntity,
    (conversation) => conversation.participants,
  )
  conversations: ConversationEntity;
}
