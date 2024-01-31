import { OmitType } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import { Column, Entity, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { NotificationEntity } from '../notification/notification.entity';
import * as moment from 'moment-timezone';
import { Transform } from 'class-transformer';

@Entity({ name: 'user_notifications' })
export class UserNotificationsEntity extends BaseEntity {
  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ type: 'datetime', nullable: true })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  readAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deleteAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.userNotifications)
  user: UserEntity;

  @ManyToOne(
    () => NotificationEntity,
    (notification) => notification.userNotifications,
  )
  notification: NotificationEntity;
}
