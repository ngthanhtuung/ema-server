import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment-timezone';
import { EStatusBudgets } from 'src/common/enum/enum';
import { UserService } from '../user/user.service';

@Injectable()
export class BudgetService extends BaseService<BudgetEntity> {
  constructor(
    @InjectRepository(BudgetEntity)
    private readonly budgetsRepository: BudgetRepository,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly userService: UserService,
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
   * @returns
   */
  async getAllBudgetsByEventID(
    budgetsPagination: BudgetsPagination,
    eventID: string,
    mode: number,
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
        'budgets.createdAt as createAt',
        'budgets.approveBy as approveBy',
        'budgets.approveDate as approveDate',
        'budgets.urlImage as urlImage',
        'budgets.supplier as supplier',
        'budgets.description as description',
      ]);
      query.where('budgets.eventID = :eventID', {
        eventID: eventID,
      });
      if (mode === 1) {
        query.andWhere('budgets.status = :status', {
          status: EStatusBudgets.PROCESSING,
        });
      } else {
        query.andWhere('budgets.status != :status', {
          status: EStatusBudgets.PROCESSING,
        });
      }
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
  async createBudgetRequest(budgets: BudgetsCreateRequest): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.insert(BudgetEntity, {
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
      await this.budgetsRepository.update(
        { id: budgetsID },
        {
          status: status,
          approveBy: idUser,
          approveDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
      );
      return 'Update status successfully!!!';
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
  ): Promise<string> {
    try {
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
      return 'Update status successfully!!!';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
