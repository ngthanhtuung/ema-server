import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { RequestEntity } from '../request/request.entity';

@Entity({ name: 'request_types' })
export class RequestTypeEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  typeName: string;

  @OneToMany(() => RequestEntity, (request) => request.requestType, {
    onDelete: 'CASCADE',
  })
  requests: RequestEntity[];
}
