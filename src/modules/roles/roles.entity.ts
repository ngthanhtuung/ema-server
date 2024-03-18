import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  roleName: string;

  @OneToMany(() => UserEntity, (user) => user.role, {
    onDelete: 'CASCADE',
  })
  users: UserEntity[];
}
