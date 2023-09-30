import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'device' })
export class DeviceEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  deviceToken: string;

  @ManyToOne(() => UserEntity, (user) => user.devices, { onDelete: 'CASCADE' })
  user: UserEntity;
}
