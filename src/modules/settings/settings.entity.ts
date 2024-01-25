import { EGroupSetting } from 'src/common/enum/enum';
import { BaseEntity } from '../base/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('settings')
export class SettingEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false, unique: true })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: EGroupSetting,
  })
  group: EGroupSetting;

  @Column({
    type: 'text',
    nullable: true,
  })
  value: string;
}
