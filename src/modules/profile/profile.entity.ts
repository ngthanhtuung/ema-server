import { EGender, ERole } from 'src/common/enum/enum';
import { UserEntity } from 'src/modules/user/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'profiles' })
export class ProfileEntity {
  @PrimaryColumn()
  public profileId: string;

  @Column({ enum: ERole, type: 'enum' })
  role: ERole;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'datetime' })
  dob: Date;

  @Column({ type: 'varchar', length: 100 })
  nationalId: string;

  @Column({ enum: EGender, type: 'enum', default: EGender.MALE })
  gender: EGender;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255 })
  avatar: string;

  @OneToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId', referencedColumnName: 'id' })
  user: UserEntity;
}
