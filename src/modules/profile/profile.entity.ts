import { EAccountStatus, EGender, ERole } from 'src/common/enum/enum';
import { AccountEntity } from 'src/modules/account/account.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'profile' })
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

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255 })
  avatar: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @Column({
    enum: EAccountStatus,
    type: 'enum',
    default: EAccountStatus.INACTIVE,
  })
  status: EAccountStatus;

  @OneToOne(() => AccountEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profileId', referencedColumnName: 'id' })
  account: AccountEntity;
}
