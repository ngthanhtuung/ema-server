import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  CreateTransactionRequest,
  FilterBigTaskAndItem,
} from './dto/budget.request';
import { ItemEntity } from '../items/items.entity';
import { TransactionEntity } from './transactions.entity';
import { UserEntity } from '../user/user.entity';
import { BaseService } from '../base/base.service';
import { TaskEntity } from '../task/task.entity';
import { TaskService } from '../task/task.service';
import { SharedService } from '../../shared/shared.service';
import { ETransaction } from '../../common/enum/enum';

@Injectable()
export class BudgetsService extends BaseService<TransactionEntity> {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly taskService: TaskService,
    private readonly sharedService: SharedService,
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
      const checkUserInTask = await this.checkUserInTask(
        taskId,
        user.id,
        false,
      );
      if (!checkUserInTask) {
        throw new BadRequestException(
          'Bạn không thể tạo yêu cầu giao dịch cho công việc này',
        );
      }
      const transactionCode =
        await this.sharedService.generateTransactionCode();
      const newTransaction = await queryRunner.manager.insert(
        TransactionEntity,
        {
          transactionCode: transactionCode,
          transactionName: data?.transactionName,
          description: data?.description,
          amount: data?.amount,
          createdBy: user.id,
          task: taskExisted,
        },
      );
      if (newTransaction.identifiers[0].id) {
        return 'Create transacntion successfully';
      }
      throw new InternalServerErrorException(
        'Tạo giao dịch thất bại vui lòng thử lại sau',
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getListBugdetForTask(filter: FilterBigTaskAndItem): Promise<unknown> {
    try {
      const { assignee, priority, sort, status, eventID } = filter;
      const listTaskAndItem = await this.taskService.filterTaskByAssignee(
        filter,
      );
      const extractedData = [];
      for (const task of listTaskAndItem) {
        const {
          id,
          createdAt,
          updatedAt,
          title,
          code,
          startDate,
          endDate,
          description,
          priority,
          parentTask,
          progress,
          status,
          estimationTime,
          effort,
          createdBy,
          modifiedBy,
          approvedBy,
          isTemplate,
          item,
        } = task;
        extractedData.push({
          id,
          createdAt,
          updatedAt,
          title,
          code,
          startDate,
          endDate,
          description,
          priority,
          parentTask,
          progress,
          status,
          estimationTime,
          effort,
          createdBy,
          modifiedBy,
          approvedBy,
          isTemplate,
          item,
        });
      }
      console.log(extractedData);
      return extractedData;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getTransactionOfItem(itemId: string): Promise<unknown> {
    try {
      const queryRunner = await this.createQueryRunner();
      const itemExisted = await queryRunner.manager.findOne(ItemEntity, {
        where: {
          id: itemId,
        },
        relations: ['tasks', 'tasks.transactions'],
      });
      if (!itemExisted) {
        throw new NotFoundException('Không tìm thấy giao dịch nào');
      }
      let totalAcceptedTransaction = 0;
      const listTask = itemExisted?.tasks;
      for (const task of listTask) {
        const acceptedTransaction = task?.transactions.filter(
          (transaction) => transaction.status === ETransaction.ACCEPTED,
        );
        if (acceptedTransaction.length > 0) {
          for (const transaction of acceptedTransaction) {
            totalAcceptedTransaction += transaction.amount;
          }
        }
      }

      return { totalTransactionUsed: totalAcceptedTransaction, listTask };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  private async createQueryRunner(): Promise<QueryRunner> {
    return this.dataSource.createQueryRunner();
  }

  private async checkUserInTask(
    taskId: string,
    userId: string,
    includeTaskMaster: boolean,
  ): Promise<boolean> {
    const queryRunner = await this.createQueryRunner();
    let query = `
        SELECT COUNT(*) as count
        FROM tasks
        INNER JOIN assign_tasks ON tasks.id = assign_tasks.taskId
        WHERE tasks.id = '${taskId}'
            AND (assign_tasks.assignee = '${userId}'`;

    if (includeTaskMaster) {
      query += ` OR assign_tasks.taskMaster = '${userId}'`;
    }
    query += ')';
    console.log('Query: ', query);
    const result = await queryRunner.manager.query(query);
    return result.length > 0 ? true : false;
  }
}
