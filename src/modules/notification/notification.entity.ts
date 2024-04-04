import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ETypeNotification } from 'src/common/enum/enum';
import { UserNotificationsEntity } from '../user_notifications/user_notifications.entity';

@Entity({ name: 'notifications' })
export class NotificationEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  eventID: string;

  @Column({ type: 'varchar', nullable: true })
  commonId: string;

  @Column({ type: 'varchar', nullable: true })
  parentTaskId: string;

  @Column({ type: 'varchar', nullable: true })
  contractId: string;

  @Column({ type: 'varchar', nullable: true })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  avatarSender: string;

  @Column({
    enum: ETypeNotification,
    type: 'enum',
    nullable: false,
  })
  type: ETypeNotification;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(
    () => UserNotificationsEntity,
    (userNotification) => userNotification.notification,
    {
      onDelete: 'CASCADE',
    },
  )
  userNotifications: UserNotificationsEntity[];
}
