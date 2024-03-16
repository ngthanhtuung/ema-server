import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { ItemEntity } from '../items/items.entity';
import { TaskEntity } from '../task/task.entity';
import { BudgetEntity } from './budgets.entity';
import { ETransaction } from '../../common/enum/enum';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';
import { AssignTaskEntity } from '../assign-task/assign-task.entity';

@Entity({ name: 'transactions' })
export class TransactionEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  transactionCode: string;

  @Column({ type: 'float', nullable: false })
  amount: number;

  @Column({
    type: 'enum',
    enum: ETransaction,
    default: ETransaction.PENDING,
  })
  status: ETransaction;

  @CreateDateColumn()
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  })
  public createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  createdBy: string;

  @UpdateDateColumn()
  @Transform(({ value }) => {
    return moment(value).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @ManyToOne(() => BudgetEntity, (budget) => budget.transactions, {
    onDelete: 'CASCADE',
  })
  budget: BudgetEntity;

  @ManyToOne(() => AssignTaskEntity, (taskAssign) => taskAssign.transactions, {
    onDelete: 'CASCADE',
  })
  taskAssign: AssignTaskEntity;
}
