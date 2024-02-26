import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';
import { AssignEventEntity } from '../assign-event/assign-event.entity';

@Entity({ name: 'divisions' })
export class DivisionEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false, unique: true })
  divisionName: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => UserEntity, (user) => user.division, { onDelete: 'CASCADE' })
  users: UserEntity[];

  @OneToMany(() => AssignEventEntity, (assignEvent) => assignEvent.division, {
    onDelete: 'CASCADE',
  })
  assignEvents: AssignEventEntity[];
}
