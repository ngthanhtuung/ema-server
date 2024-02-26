import { EGender, ERole } from 'src/common/enum/enum';
import { UserEntity } from 'src/modules/user/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'profiles' })
export class ProfileEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 255, default: null })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'datetime', default: null })
  dob: Date;

  @Column({ type: 'varchar', length: 100, unique: true, default: null })
  nationalId: string;

  @Column({ type: 'text', default: null, nullable: true })
  nationalIdImage: string;

  @Column({ enum: EGender, type: 'enum', default: null })
  gender: EGender;

  @Column({ type: 'varchar', length: 255, default: null })
  address: string;

  @Column({ type: 'varchar', length: 100, unique: true, default: null })
  phoneNumber: string;

  @Column({ type: 'text', default: null })
  avatar: string;

  @OneToOne(() => UserEntity, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  user: UserEntity;
}
