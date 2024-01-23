import { OmitType } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { NotificationEntity } from '../notification/notification.entity';

@Entity({ name: 'user_notifications' })
export class UserNotificationsEntity extends BaseEntity {
  @Column({ type: 'boolean', default: true })
  isRead: boolean;

  @ManyToOne(() => UserEntity, (user) => user.userNotifications)
  user: UserEntity;

  @ManyToOne(
    () => NotificationEntity,
    (notification) => notification.userNotifications,
  )
  notification: NotificationEntity;
}
