import { EGender, ERole } from 'src/common/enum/enum';
import { UserEntity } from 'src/modules/user/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'profiles' })
export class ProfileEntity {
  @PrimaryColumn()
  profileId: string;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'datetime' })
  dob: Date;

  @Column({ type: 'varchar', length: 100, unique: true })
  nationalId: string;

  @Column({ enum: EGender, type: 'enum', default: EGender.MALE })
  gender: EGender;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  phoneNumber: string;

  @Column({ type: 'text' })
  avatar: string;

  @OneToOne(() => UserEntity, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  // @JoinColumn({ name: 'profileId' })
  user: UserEntity;
}
