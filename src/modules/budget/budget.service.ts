/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { BudgetEntity } from './budget.entity';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import BudgetRepository from './budgets.repository';
import {
  BudgetsCreateRequest,
  BudgetsUpdateRequest,
} from './dto/budgets.request';
import { BudgetsPagination } from './dto/budgets.pagination';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
import { BudgetsResponse } from './dto/budgets.response';
import { plainToClass } from 'class-transformer';
import * as moment from 'moment-timezone';
import { EStatusBudgets, ETypeNotification } from 'src/common/enum/enum';
import { UserService } from '../user/user.service';
import { AppGateway } from 'src/sockets/app.gateway';
import { DeviceService } from '../device/device.service';
import { NotificationService } from '../notification/notification.service';
import { Inject } from '@nestjs/common/decorators';
import { forwardRef } from '@nestjs/common/utils';
import { NotificationCreateRequest } from '../notification/dto/notification.request';
import { UserEntity } from '../user/user.entity';
@Injectable()
export class BudgetService extends BaseService<BudgetEntity> {
  constructor(
    @InjectRepository(BudgetEntity)
    private readonly budgetsRepository: BudgetRepository,
    @InjectDataSource()
    private dataSource: DataSource,
    private notificationService: NotificationService,
    private userService: UserService,
    @Inject(forwardRef(() => AppGateway))
    private readonly appGateWay: AppGateway,
    private readonly deviceService: DeviceService,
  ) {
    super(budgetsRepository);
  }

  generalBuilderBudgets(): SelectQueryBuilder<BudgetEntity> {
    return this.budgetsRepository.createQueryBuilder('budgets');
  }

  /**
   * getAllBudgetsByEventID
   * @param budgetsPagination
   * @param eventID
   * @param mode
   * @param userID
   * @returns
   */
  async getAllBudgetsByEventID(
    budgetsPagination: BudgetsPagination,
    eventID: string,
    mode: number,
    userID: string,
  ): Promise<IPaginateResponse<BudgetsResponse[]>> {
    try {
      const { currentPage, sizePage } = budgetsPagination;
      const query = this.generalBuilderBudgets();
      query.leftJoin('events', 'events', 'events.id = budgets.eventID');
      query.select([
        'budgets.id as id',
        'budgets.budgetName as budgetName',
        'budgets.estExpense as estExpense',
        'budgets.realExpense as realExpense',
        'budgets.status as status',
        'budgets.eventID as eventID',
        'events.eventName as eventName',
        'budgets.createBy as createBy',
        'budgets.createdAt as createdAt',
        'budgets.updatedAt as updatedAt',
        'budgets.approveBy as approveBy',
        'budgets.approveDate as approveDate',
        'budgets.urlImage as urlImage',
        'budgets.supplier as supplier',
        'budgets.description as description',
      ]);
      query.where('budgets.eventID = :eventID', {
        eventID: eventID,
      });
      if (Number(mode) === 1) {
        query.andWhere('budgets.status = :status', {
          status: EStatusBudgets.PROCESSING,
        });
      } else {
        query.andWhere('budgets.status != :status', {
          status: EStatusBudgets.PROCESSING,
        });
      }
      if (userID != undefined) {
        query.andWhere('budgets.createBy = :userID', {
          userID: userID,
        });
      }
      query.orderBy(`budgets.createdAt`, 'DESC');
      const [result, total] = await Promise.all([
        query
          .offset((sizePage as number) * ((currentPage as number) - 1))
          .limit(sizePage as number)
          .execute(),
        query.getCount(),
      ]);

      const finalRes: BudgetsResponse[] = [];
      for (let index = 0; index < result.length; index++) {
        const item = result[index];
        const userName = (await this.userService.findById(item?.createBy))
          ?.fullName;
        console.log('item:', item);

        item.createdAt = moment(item.createdAt)
          .tz('Asia/Ho_Chi_Minh')
          .format('YYYY-MM-DD HH:mm:ss');
        item.updatedAt = moment(item.updatedAt)
          .tz('Asia/Ho_Chi_Minh')
          .format('YYYY-MM-DD HH:mm:ss');
        if (item?.approveDate) {
          item.approvedDate = moment(item.approveDate)
            .tz('Asia/Ho_Chi_Minh')
            .format('YYYY-MM-DD HH:mm:ss');
        }
        const data = {
          ...item,
          userName,
        };
        finalRes.push(data);
      }

      return paginateResponse<BudgetsResponse[]>(
        [finalRes, total],
        currentPage as number,
        sizePage as number,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * createEvent
   * @param budgets
   * @returns
   */
  async createBudgetRequest(
    budgets: BudgetsCreateRequest,
    userID: string,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    const oUser = JSON.parse(userID);
    try {
      await queryRunner.startTransaction();
      const createBudget = await queryRunner.manager.insert(BudgetEntity, {
        budgetName: budgets.budgetName,
        estExpense: budgets.estExpense,
        realExpense: budgets.realExpense,
        description: budgets.description,
        event: {
          id: budgets.eventID,
        },
        createBy: budgets.createBy,
        urlImage: budgets.urlImage,
        supplier: budgets.supplier,
      });
      const idReceive = await queryRunner.manager.findOne(UserEntity, {
        where: { division: { id: null } },
      });
      const dataNotification = {
        title: `Yêu cầu thu chi đã được gửi`,
        content: `${oUser?.fullName} đã gửi yêu cầu thu chi đến bạn`,
      };

      await this.pushNotification(
        idReceive?.id,
        oUser,
        createBudget.generatedMaps[0]['id'],
        dataNotification,
        'notification',
      );
      await queryRunner.commitTransaction();
      return `Budgets created successfully`;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    }
  }

  /**
   * updateBudgetStatus
   * @param budgetsID
   * @param status
   * @returns
   */
  async updateBudgetStatus(
    budgetsID: string,
    status: EStatusBudgets,
    idUser: string,
  ): Promise<string> {
    try {
      const oUser = JSON.parse(idUser);
      await this.budgetsRepository.update(
        { id: budgetsID },
        {
          status: status,
          approveBy: oUser.id,
          approveDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
      );
      const queryRunner = this.dataSource.createQueryRunner();
      const idReceive = await queryRunner.manager.findOne(BudgetEntity, {
        where: { id: budgetsID },
      });
      const dataNotification = {
        title: 'Yêu cầu đã được phản hồi',
        content: `${oUser.fullName} đã phản hồi lại yêu cầu của bạn`,
      };
      await this.pushNotification(
        idReceive?.createBy,
        oUser,
        budgetsID,
        dataNotification,
        'notification',
      );
      return 'Update status successfully!!!';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * updateBudgetStatus
   * @param budgetsID
   * @param status
   * @returns
   */
  async deleteBudgets(budgetsID: string): Promise<string> {
    try {
      await this.budgetsRepository.delete({ id: budgetsID });
      return 'Delete budgets successfully!!!';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * updateBudget
   * @param budgetsID
   * @param data
   * @returns
   */
  async updateBudget(
    budgetsID: string,
    data: BudgetsUpdateRequest,
    idUser: string,
  ): Promise<string> {
    try {
      const oUser = JSON.parse(idUser);
      await this.budgetsRepository.update(
        { id: budgetsID },
        {
          budgetName: data.budgetName,
          estExpense: data.estExpense,
          realExpense: data.realExpense,
          description: data.description,
          supplier: data.supplier,
          urlImage: data.urlImage,
        },
      );
      const queryRunner = this.dataSource.createQueryRunner();
      const idReceive = await queryRunner.manager.findOne(UserEntity, {
        where: { division: { id: null } },
      });
      const dataNotification = {
        title: 'Yêu cầu thu chi đã được chỉnh sửa',
        content: `${oUser.fullName} đã chỉnh sửa lại yêu cầu thu chi`,
      };
      await this.pushNotification(
        idReceive?.id,
        oUser,
        budgetsID,
        dataNotification,
        'notification',
      );
      return 'Update budgets successfully!!!';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * getBudgetById
   * @param ids
   * @returns
   */
  async getBudgetById(id: string): Promise<BudgetsResponse> {
    try {
      const budget = await this.findOne({
        where: { id: id },
      });

      if (!budget) {
        throw new NotFoundException('Division not found');
      }
      const userName = (await this.userService.findById(budget?.createBy))
        ?.fullName;
      const item = {
        ...budget,
        createdAt: moment(budget.createdAt)
          .tz('Asia/Ho_Chi_Minh')
          .format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(budget.updatedAt)
          .tz('Asia/Ho_Chi_Minh')
          .format('YYYY-MM-DD HH:mm:ss'),
        approveDate: budget?.approveDate
          ? moment(budget.approveDate)
              .tz('Asia/Ho_Chi_Minh')
              .format('YYYY-MM-DD HH:mm:ss')
          : null,
        userName: userName,
      };
      return plainToClass(BudgetsResponse, item);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async pushNotification(
    receive: any,
    sender: any,
    requestId: string,
    data: any,
    command: any,
  ): Promise<void> {
    const dataNotification: NotificationCreateRequest = {
      title: data.title,
      content: data.content,
      readFlag: false,
      type: ETypeNotification.BUDGETS,
      sender: sender.id,
      userId: receive,
      eventId: null,
      parentTaskId: null,
      commonId: requestId,
    };
    const socketId = (await this.userService.findById(receive))?.socketId;
    const client = this.appGateWay.server;
    if (socketId !== null) {
      client.to(socketId).emit(command, {
        ...dataNotification,
        avatar: sender?.avatar,
      });
    }
    await this.notificationService.createNotification(dataNotification);
    const listAssigneeDeviceToken =
      await this.deviceService.getListDeviceTokens([receive]);
    await this.notificationService.pushNotificationFirebase(
      listAssigneeDeviceToken,
      data.title,
      data.content,
    );
  }
}
