import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  CreatePlanBudgetRequest,
  CreateTransactionRequest,
} from './dto/budget.request';
import { ItemEntity } from '../items/items.entity';
import { TransactionEntity } from './transactions.entity';
import { UserEntity } from '../user/user.entity';
import { BaseService } from '../base/base.service';
import { TaskEntity } from '../task/task.entity';

@Injectable()
export class BudgetsService extends BaseService<TransactionEntity> {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super(transactionRepository);
  }

  async createTransaction(
    taskId: string,
    data: CreateTransactionRequest,
    user: UserEntity,
  ): Promise<string> {
    try {
      const queryRunner = await this.createQueryRunner();
      const taskExisted = await queryRunner.manager.findOne(TaskEntity, {
        where: {
          id: taskId,
        },
      });

      if (!taskExisted) {
        throw new NotFoundException('Không thể tìm thấy công việc này');
      }

      return 'Create transacntion successfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // async getListBugdetForTask(eventId: string): Promise<unknown> {
  //   try {
  //     const queryRunner = await this.createQueryRunner();
  //   } catch (err) {
  //     throw new InternalServerErrorException(err.message);
  //   }
  // }

  private async createQueryRunner(): Promise<QueryRunner> {
    return this.dataSource.createQueryRunner();
  }
}
