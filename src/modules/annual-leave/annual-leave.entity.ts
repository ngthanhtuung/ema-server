import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'annual_leaves' })
export class AnnualLeaveEntity extends BaseEntity {
  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'float' })
  amount: number;

  @Column()
  userID: string;

  @ManyToOne(() => UserEntity, (user) => user.annualLeaves, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userID', referencedColumnName: 'id' })
  user: UserEntity;
}
