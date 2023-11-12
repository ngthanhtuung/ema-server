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

  @Column({ type: 'varchar' })
  sender: string;

  @ManyToOne(() => UserEntity, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
