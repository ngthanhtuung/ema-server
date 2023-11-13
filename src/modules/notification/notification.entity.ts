import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';
import { ETypeNotification } from 'src/common/enum/enum';

@Entity({ name: 'notifications' })
export class NotificationEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  readFlag: boolean;

  @Column({
    enum: ETypeNotification,
    type: 'enum',
    nullable: false,
  })
  type: ETypeNotification;

  @Column({ type: 'varchar', nullable: true })
  sender: string;

  @Column({ type: 'varchar', nullable: true })
  commonId: string;

  @Column({ type: 'varchar', nullable: true })
  eventId: string;

  @ManyToOne(() => UserEntity, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
