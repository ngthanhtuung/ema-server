import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AutoMap } from '@automapper/classes';

@Entity({ name: 'mails' })
export default class Mail {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @AutoMap()
  @Column('nvarchar', { name: 'mailTitle', nullable: false, length: 500 })
  public mailTitle: string;

  @AutoMap()
  @Column({ type: 'text', nullable: false })
  public mailText: string;
}
