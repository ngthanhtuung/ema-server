import { Column, Entity, OneToMany } from 'typeorm';
import { ItemEntity } from '../items/items.entity';
import { BaseEntity } from '../base/base.entity';

@Entity({ name: 'categories' })
export class CategoryEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false, unique: true })
  categoryName: string;

  @OneToMany(() => ItemEntity, (item) => item.category)
  items: ItemEntity[];
}
