import { BaseEntity } from 'src/modules/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'account' })
export class AccountEntity extends BaseEntity {
  @Column({ unique: true, type: 'varchar', length: 50 })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  authCode: string;

  @Column({ type: 'datetime', nullable: true })
  issueDate: Date;
}
