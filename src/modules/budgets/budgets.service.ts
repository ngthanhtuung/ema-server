/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  CreateTransactionRequest,
  FilterBigTaskAndItem,
  FilterTransaction,
  TransactionRejectNote,
} from './dto/budget.request';
import { ItemEntity } from '../items/items.entity';
import { TransactionEntity } from './transactions.entity';
import { UserEntity } from '../user/user.entity';
import { BaseService } from '../base/base.service';
import { TaskEntity } from '../task/task.entity';
import { TaskService } from '../task/task.service';
import { SharedService } from '../../shared/shared.service';
import {
  ECheckUserInTask,
  ERole,
  ETaskStatus,
  ETransaction,
  ETypeNotification,
} from '../../common/enum/enum';
import * as moment from 'moment-timezone';
import { BudgetPagination } from './dto/budgets.pagination';
import { UserService } from '../user/user.service';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
import { FileRequest } from '../../file/dto/file.request';
import { FileService } from '../../file/file.service';
import { TransactionEvidenceEntity } from './transaction_evidence.entity';
import { NotificationTransactionRequest } from '../notification/dto/notification.request';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BudgetsService extends BaseService<TransactionEntity> {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly taskService: TaskService,
    private readonly sharedService: SharedService,
    private readonly userService: UserService,
    private readonly fileService: FileService,
    private readonly notificationService: NotificationService,
  ) {
    super(transactionRepository);
  }

  async createTransaction(
    taskId: string,
    data: CreateTransactionRequest,
    oUser: string,
  ): Promise<string> {
    try {
      const queryRunner = await this.createQueryRunner();
      const user = JSON.parse(oUser);
      const taskExisted = await queryRunner.manager.findOne(TaskEntity, {
        where: {
          id: taskId,
        },
        relations: ['assignTasks'],
      });
      if (!taskExisted) {
        throw new NotFoundException('Không thể tìm thấy công việc này');
      }
      if (taskExisted.status !== ETaskStatus.PENDING) {
        throw new BadRequestException(
          'Không thể tạo yêu cầu giao dịch cho công việc này vì công việc này đã hoàn thành hoặc quá hạn',
        );
      }
      const checkUserInTask = await this.checkUserInTask(
        taskId,
        user.id,
        ECheckUserInTask.ASSIGNEE,
      );
      if (!checkUserInTask) {
        throw new BadRequestException(
          'Bạn không thể tạo yêu cầu giao dịch cho công việc này',
        );
      }
      const assignTasks = taskExisted?.assignTasks;
      if (assignTasks.length <= 0) {
        throw new BadRequestException(
          'Công việc này hiện tại chưa được giao cho ai nên không thể tạo giao dịch',
        );
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (user.role === ERole.STAFF && taskExisted?.parentTask !== null) {
        throw new ForbiddenException(
          'Bạn chỉ được quyền tạo yêu cầu giao dịch cho hạng mục và gửi đến cho quản lý',
        );
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (user.role === ERole.EMPLOYEE && taskExisted?.parentTask === null) {
        throw new ForbiddenException(
          'Bạn không được quyền tạo yêu cầu giao dịch cho công việc này',
        );
      }
      const filterAssignTasks = assignTasks.filter(
        (task) => task.assignee === user.id,
      );
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
        const dataNotificationAccepted: NotificationTransactionRequest = {
          title: `Có một yêu cầu mới`,
          content: `Yêu cầu ${transactionCode} đang đợi để được xử lý`,
          type: ETypeNotification.BUDGET,
          receiveUser: filterAssignTasks[0]?.taskMaster,
          commonId: newTransaction.identifiers[0].id,
          transactionId: newTransaction.identifiers[0].id,
          avatar: user?.avatar,
          messageSocket: 'notification',
        };
        await this.notificationService.createTransactionNotfication(
          dataNotificationAccepted,
          user?.id,
          queryRunner,
        );
        return 'Create transaction successfully';
      }
      throw new InternalServerErrorException(
        'Tạo giao dịch thất bại vui lòng thử lại sau',
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getOwnRequest(
    pagination: BudgetPagination,
    filter: FilterTransaction,
    user: UserEntity,
  ): Promise<IPaginateResponse<unknown> | undefined> {
    try {
      const { currentPage, sizePage } = pagination;
      const { sortProperty, sort, status } = filter;
      const query = this.generalBuilderContracts();
      query.leftJoinAndSelect('transactions.task', 'task');
      query.select([
        'transactions.id as id',
        'transactions.transactionCode as transactionCode',
        'transactions.description as description',
        'transactions.amount as amount',
        'transactions.rejectNote as rejectNote',
        'transactions.status as status',
        'transactions.processedBy as processedBy',
        'transactions.createdAt as createdAt',
        'transactions.createdBy as createdBy',
        'transactions.updatedAt as updatedAt',
        'transactions.updatedBy as updatedBy',
        'task.id as taskId',
        'task.code as taskCode',
        'task.title as taskTitle',
        'task.parentTask as parentTask',
      ]);
      query.where('transactions.createdBy = :userId', {
        userId: user?.id,
      });
      if (status !== ETransaction.ALL) {
        query.andWhere('transactions.status = :status', { status: status });
      }
      if (sortProperty) {
        query.orderBy(`transactions.${sortProperty}`, sort);
      }
      const [result, total] = await Promise.all([
        query
          .offset((sizePage as number) * ((currentPage as number) - 1))
          .limit(sizePage as number)
          .execute(),
        query.getCount(),
      ]);
      const transactionWithProcessBy = await Promise.all(
        result.map(async (item) => {
          const res = { ...item };
          if (item.processedBy) {
            const userDetails = await this.userService.findByIdV2(
              item.processedBy,
            );
            res.processedBy = {
              id: userDetails.id,
              fullName: userDetails.fullName,
              email: userDetails.email,
              phoneNumber: userDetails.phoneNumber,
              dob: userDetails.dob,
              avatar: userDetails.avatar,
              status: userDetails.status,
            };
          }
          return item;
        }),
      );
      const formattedData = this.groupTransactionsByTask(
        transactionWithProcessBy,
      );
      return paginateResponse<unknown>(
        [formattedData, total],
        currentPage as number,
        sizePage as number,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateStatusTransaction(
    transactionId: string,
    status: ETransaction,
    user: string,
    rejectReason?: TransactionRejectNote,
  ): Promise<string> {
    try {
      const queryRunner = await this.createQueryRunner();
      const oUser = JSON.parse(user);
      const transactionExisted = await queryRunner.manager.findOne(
        TransactionEntity,
        {
          where: {
            id: transactionId,
          },
          relations: ['task', 'task.item'],
        },
      );
      if (!transactionExisted) {
        throw new NotFoundException('Không thể tìm thấy giao dịch này');
      }
      const task = transactionExisted?.task;
      const itemOfTask = task?.item;
      const checkUserInTask = await this.checkUserInTask(
        task?.id,
        oUser.id,
        ECheckUserInTask.TASK_MASTER,
      );
      if (!checkUserInTask) {
        throw new ForbiddenException('Bạn không có quyền duyệt giao dịch này');
      }
      switch (status) {
        case ETransaction.ACCEPTED:
          const totalPriceBudget =
            itemOfTask?.plannedAmount * itemOfTask?.plannedPrice;
          const budgetAvailable =
            totalPriceBudget * (itemOfTask?.percentage / 100);
          const totalUsed = await this.getTransactionOfItem(itemOfTask?.id);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const totalTransactionUser = totalUsed.totalTransactionUsed;
          if (
            transactionExisted?.amount >
            budgetAvailable - totalTransactionUser
          ) {
            let errorMessage =
              'Số tiền yêu cầu của giao dịch này vượt quá hạn mức còn lại. ';
            if (oUser.role.roleName === ERole.MANAGER) {
              errorMessage += ' Vui lòng mở thêm hạn mức';
            } else {
              errorMessage +=
                ' Vui lòng tạo một giao dịch với số tiền này để quản lý mở thêm hạn mức chi tiêu cho công việc này';
            }
            throw new BadRequestException(errorMessage);
          }
          const resultAccepted = await queryRunner.manager.update(
            TransactionEntity,
            { id: transactionId },
            {
              status: ETransaction.ACCEPTED,
              processedBy: oUser?.id,
              updatedBy: oUser?.id,
              updatedAt: moment()
                .tz('Asia/Bangkok')
                .format('YYYY-MM-DD HH:mm:ss'),
            },
          );
          if (resultAccepted.affected > 0) {
            const dataNotificationAccepted: NotificationTransactionRequest = {
              title: `Yêu cầu được chấp thuận`,
              content: `Yêu cầu ${transactionExisted?.transactionCode} được chấp thuận`,
              type: ETypeNotification.BUDGET,
              receiveUser: transactionExisted?.createdBy,
              commonId: transactionExisted?.id,
              transactionId: transactionExisted?.id,
              avatar: oUser?.avatar,
              messageSocket: 'notification',
            };
            await this.notificationService.createTransactionNotfication(
              dataNotificationAccepted,
              oUser?.id,
              queryRunner,
            );
            return `Giao dịch này được duyệt thành công`;
          }
          throw new BadRequestException('Giao dịch này được duyệt thất bại');
        case ETransaction.REJECTED:
          if (rejectReason.rejectNote.length <= 0) {
            throw new BadRequestException(
              'Bạn cần phải nhập lý do từ chối hợp đồng này',
            );
          }
          const resultReject = await queryRunner.manager.update(
            TransactionEntity,
            { id: transactionId },
            {
              status: ETransaction.REJECTED,
              rejectNote: rejectReason.rejectNote,
              processedBy: oUser?.id,
              updatedBy: oUser?.id,
              updatedAt: moment()
                .tz('Asia/Bangkok')
                .format('YYYY-MM-DD HH:mm:ss'),
            },
          );
          if (resultReject.affected > 0) {
            const dataNotificationReject: NotificationTransactionRequest = {
              title: `Yêu cầu bị từ chối`,
              content: `Yêu cầu ${transactionExisted?.transactionCode} bị từ chối`,
              type: ETypeNotification.BUDGET,
              receiveUser: transactionExisted?.createdBy,
              commonId: transactionExisted?.id,
              transactionId: transactionExisted?.id,
              avatar: oUser?.avatar,
              messageSocket: 'notification',
            };
            await this.notificationService.createTransactionNotfication(
              dataNotificationReject,
              oUser?.id,
              queryRunner,
            );
            return `Từ chối giao dịch ${transactionExisted.transactionCode} thành công. Lý do: ${rejectReason.rejectNote}`;
          }
          throw new BadRequestException('Giao dịch này được duyệt thất bại');
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getListBugdetForTask(filter: FilterBigTaskAndItem): Promise<unknown> {
    try {
      const listTaskAndItem = await this.taskService.filterTaskByAssignee({
        assignee: filter?.assignee,
        eventID: filter?.eventID,
        priority: undefined,
        sort: undefined,
        status: undefined,
      });
      const extractedData = await Promise.all(
        listTaskAndItem.map(async (task) => {
          const { id, title, code, parentTask, status, item } = task;
          if (parentTask === null) {
            const budgetOfItem = await this.getTransactionOfItem(item?.id);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const totalPriceUsed = budgetOfItem?.totalTransactionUsed || 0;
            return {
              id,
              title,
              code,
              parentTask,
              status,
              item: {
                ...item,
                totalPriceUsed,
              },
            };
          }
        }),
      );
      return extractedData.filter(Boolean); // Filtering out undefined entries
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
        relations: [
          'tasks',
          'tasks.transactions',
          'tasks.transactions.evidences',
        ],
      });
      console.log('itemExisted', itemExisted);
      if (!itemExisted) {
        throw new NotFoundException(
          'Không tìm thấy ngân sách của hạng mục này',
        );
      }
      let totalAcceptedTransaction = 0;
      const listTask = itemExisted?.tasks.filter(
        (task) => task.transactions.length > 0,
      );
      for (const task of listTask) {
        const acceptedTransaction = task?.transactions.filter((transaction) =>
          [ETransaction.ACCEPTED, ETransaction.SUCCESS].includes(
            transaction.status,
          ),
        );
        if (acceptedTransaction.length > 0) {
          totalAcceptedTransaction = acceptedTransaction.reduce(
            (total, transaction) => (total += transaction.amount),
            0,
          );
        }
      }
      return {
        totalTransactionUsed: totalAcceptedTransaction,
        itemExisted: {
          ...itemExisted,
          tasks: listTask,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateItemPercentage(
    transactionId: string,
    amount: number,
    user: string,
  ): Promise<unknown> {
    try {
      const oUser = JSON.parse(user);
      const queryRunner = await this.createQueryRunner();
      const transactionExisted = await queryRunner.manager.findOne(
        TransactionEntity,
        {
          where: {
            id: transactionId,
          },
          relations: ['task', 'task.item'],
        },
      );
      if (!transactionExisted) {
        throw new NotFoundException('Không tìm thấy giao dịch này');
      }
      const taskOfTransaction = transactionExisted?.task;
      if (
        ![ETaskStatus.PENDING, ETaskStatus.PROCESSING].includes(
          taskOfTransaction?.status,
        )
      ) {
        throw new BadRequestException(
          `Công việc đang không còn trong trạng thái PENDING or PROCESSING, vì vậy không thể mở thêm số tiền cho mạng mục`,
        );
      }
      const checkUserInTask = await this.checkUserInTask(
        taskOfTransaction.id,
        oUser?.id,
        ECheckUserInTask.TASK_MASTER,
      );
      if (!checkUserInTask) {
        throw new ForbiddenException(
          'Bạn không quản lý hạng này nên không thể nâng hạng mức',
        );
      }
      const itemExisted = transactionExisted?.task?.item;
      const totalPriceBudget =
        itemExisted.plannedAmount * itemExisted.plannedPrice;
      const budgetAvailable = totalPriceBudget * (itemExisted.percentage / 100);
      const totalUsed = await this.getTransactionOfItem(itemExisted?.id);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const totalTransactionUsed = totalUsed?.totalTransactionUsed;
      const remainingBudget = budgetAvailable - totalTransactionUsed;
      if (amount <= remainingBudget) {
        await this.updateStatusTransaction(
          transactionId,
          ETransaction.REJECTED,
          user,
          {
            rejectNote: `Số tiền yêu cầu vẫn đủ trong hạn mức được giao. Vì vậy yêu cầu ${transactionExisted.transactionCode} với số tiền ${amount} bị từ chối`,
          },
        );
        throw new BadRequestException(
          `Số tiền yêu cầu vẫn đủ trong hạn mức được giao. Vì vậy yêu cầu ${transactionExisted.transactionCode} với số tiền ${amount} bị từ chối`,
        );
      }
      const amountPercentage = Math.round((amount / remainingBudget) * 100);
      if (amountPercentage > 100 - itemExisted.percentage) {
        throw new BadRequestException(
          'Số tiền này vượt quá hạn mức quy định của kế hoạch, không thể mở thêm hạng mức cho hạng mục này',
        );
      }
      const result = await queryRunner.manager.update(
        ItemEntity,
        { id: itemExisted?.id },
        {
          percentage: itemExisted?.percentage + amountPercentage,
          updatedBy: oUser?.id,
          updatedAt: moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        },
      );
      if (result.affected > 0) {
        const updateResult = await this.updateStatusTransaction(
          transactionId,
          ETransaction.SUCCESS,
          user,
        );
        return `Đã nâng hạng mức thành công. Hạn mức mới là ${
          itemExisted?.percentage + amountPercentage
        }`;
      }
      throw new InternalServerErrorException('Cập nhật hạng mức thất bại');
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateContractEvidence(
    transactionId: string,
    files: FileRequest[],
    user: UserEntity,
  ): Promise<unknown | undefined> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const transaction = await queryRunner.manager.findOne(TransactionEntity, {
        where: { id: transactionId },
      });
      if (!transaction) {
        throw new InternalServerErrorException('Transaction not found');
      }
      if (transaction.createdBy !== user.id) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật bằng chứng cho giao dịch này',
        );
      } else if (transaction.status !== ETransaction.ACCEPTED) {
        throw new BadRequestException(
          `Giao dịch này ${
            transaction.status === ETransaction.PENDING
              ? 'đang được xử lý không thể cập nhật bằng chứng.'
              : 'bị từ chối, không thể cập nhật bằng chứng'
          }`,
        );
      }
      const listPromiseAllUploadFile = files.map((files, index) => {
        return this.fileService.uploadFile(
          files,
          `transaction/${transaction?.transactionCode}`, //file path to upload on Firebase
          `${transaction?.transactionCode} - ${index + 1}`,
        );
      });
      const listBufSign = await Promise.all(listPromiseAllUploadFile);
      console.log('listBufSign', listBufSign);
      const dataMapTransactionEvidenceEntityInsert = listBufSign.map(
        (bufSign, index) => {
          return {
            transaction: transaction,
            evidenceFileName: `${transaction?.transactionCode} - ${index + 1}`,
            evidenceFileSize: bufSign['fileSize'],
            evidenceFileType: bufSign['fileType'],
            evidenceUrl: bufSign['downloadUrl'],
            createdBy: user.id,
          };
        },
      );
      await queryRunner.manager.insert(
        TransactionEvidenceEntity,
        dataMapTransactionEvidenceEntityInsert,
      );
      if (listBufSign.length > 0) {
        await queryRunner.manager.update(
          TransactionEntity,
          {
            id: transactionId,
          },
          {
            updatedAt: moment.tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
            updatedBy: user.id,
            status: ETransaction.SUCCESS,
          },
        );
      }
      return listBufSign;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getAllTransactionRequest(
    filter: FilterBigTaskAndItem,
  ): Promise<unknown> {
    try {
      const listItems = [];
      const items = await this.getListBugdetForTask(filter);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (const item of items) {
        listItems.push(item.item);
      }
      const transactionPromises = listItems.map((item) =>
        this.getTransactionOfItem(item.id),
      );
      const listTransactions = await Promise.all(transactionPromises);
      const listTransactionArray = [];
      for (const task of listTransactions) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (const transaction of task.listTask[0].transactions) {
          listTransactionArray.push(transaction);
        }
      }
      return listTransactionArray;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getEvidenceByTransactionId(
    transactionId: string,
  ): Promise<TransactionEvidenceEntity[]> {
    try {
      const queryRunner = await this.createQueryRunner();
      const evidence = await queryRunner.manager.find(
        TransactionEvidenceEntity,
        {
          where: { transaction: { id: transactionId } },
        },
      );
      return evidence;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  private generalBuilderContracts(): SelectQueryBuilder<TransactionEntity> {
    return this.transactionRepository.createQueryBuilder('transactions');
  }

  private async createQueryRunner(): Promise<QueryRunner> {
    return this.dataSource.createQueryRunner();
  }

  private async checkUserInTask(
    taskId: string,
    userId: string,
    typeCheck: ECheckUserInTask,
  ): Promise<boolean> {
    const queryRunner = await this.createQueryRunner();
    let query = `
        SELECT COUNT(*) as count
        FROM tasks
        INNER JOIN assign_tasks ON tasks.id = assign_tasks.taskId
        WHERE tasks.id = '${taskId}'`;
    if (typeCheck === ECheckUserInTask.ASSIGNEE) {
      query += ` AND assign_tasks.assignee = '${userId}'`;
    } else if (typeCheck === ECheckUserInTask.TASK_MASTER) {
      query += ` AND assign_tasks.taskMaster = '${userId}'`;
    } else {
      query += ` AND (assign_tasks.assignee = '${userId}' OR assign_tasks.taskMaster = '${userId}')`;
    }
    const result = await queryRunner.manager.query(query);
    return result.length > 0 ? true : false;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private groupTransactionsByTask(data: any) {
    const tasks = {};

    data.forEach((transaction) => {
      const taskId = transaction.taskId;
      if (!tasks[taskId]) {
        tasks[taskId] = {
          taskId: transaction.taskId,
          taskCode: transaction.taskCode,
          taskTitle: transaction.taskTitle,
          parentTask: transaction.parentTask,
          transactions: [],
        };
      }
      tasks[taskId].transactions.push({
        id: transaction.id,
        transactionCode: transaction.transactionCode,
        description: transaction.description,
        amount: transaction.amount,
        rejectNote: transaction.rejectNote,
        status: transaction.status,
        processedBy: transaction.processedBy,
        createdAt: transaction.createdAt,
        createdBy: transaction.createdBy,
        updatedAt: transaction.updatedAt,
        updatedBy: transaction.updatedBy,
      });
    });

    return Object.values(tasks);
  }
}
