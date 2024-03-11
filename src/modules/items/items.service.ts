import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ItemEntity } from './items.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from '../categories/categories.service';
import { EPlanningUnit } from '../../common/enum/enum';
import * as csvFormat from 'json2csv';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { EventEntity } from '../event/event.entity';
import { EVENT_ERROR_MESSAGE } from '../../common/constants/constants';
import { BaseService } from '../base/base.service';
import { CreateItemRequest } from './dto/item.request';
import { CategoryEntity } from '../categories/categories.entity';
import { UserEntity } from '../user/user.entity';
import { BudgetEntity } from '../budgets/budgets.entity';

@Injectable()
export class ItemsService extends BaseService<ItemEntity> {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemsRepository: Repository<ItemEntity>,
    private readonly categoriesService: CategoriesService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(itemsRepository);
  }

  async exportTemplateToCSV(): Promise<void> {
    try {
      const headers = [
        'STT',
        'Hạng mục',
        'Diễn giải',
        'Đơn vị tính',
        'Số Lượng',
        'Đơn giá',
        'Thành Tiền',
      ];
      const opts = {
        headers: false,
        fieldFormatter: {
          'Số Lượng': (value) => Number(value).toFixed(2), // Format Số Lượng to 2 decimal places
          'Đơn giá': (value) => Number(value).toFixed(2), // Format Đơn giá to 2 decimal places
          'Thành Tiền': (value) => Number(value).toFixed(2), // Format Thành Tiền to 2 decimal places
        },
      };
      const data = [];
      const comboOptions = EPlanningUnit;
      const moreField = ['Tổng cộng', 'Dự phòng', 'VAT (10%)', 'GRAND TOTAL'];
      for (let i = 0; i < 100; i++) {
        const row = {
          STT: `=IF(B${i + 2}="","",ROW()-ROW($A$2)+1)`,
          'Hạng mục': '',
          'Diễn giải': '',
          'Đơn vị tính': '',
          'Số Lượng': '',
          'Đơn giá': '',
          'Thành Tiền': `=IF(OR(ISBLANK(E${i + 2}),ISBLANK(F${i + 2})),"",E${
            i + 2
          }*F${i + 2})`,
        };
        data.push(row);
      }
      const csv = csvFormat.parse(data, opts);
      return csv;
    } catch (err) {
      console.log('Error at export CSV template: ', err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async readCSVFile(file: Express.Multer.File): Promise<object> {
    try {
      const results = [];
      const errors = [];
      let lineNumber = 1;
      let totalRecords = 0;
      let totalErrorsRecords = 0;
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      await new Promise<void>((resolve, reject) => {
        readableStream
          .pipe(csvParser())
          .on('data', (data) => {
            totalRecords++;
            let hasErrorInRecord = false;
            Object.entries(data).forEach(([key, value]) => {
              // @ts-ignore
              if (value.trim() === '') {
                errors.push(`Error at line ${lineNumber} - ${key} is empty`);
                if (!hasErrorInRecord) {
                  totalErrorsRecords++;
                }
                hasErrorInRecord = true;
              }
            });
            // @ts-ignore
            if (!Object.values(data).some((value) => value.trim() === '')) {
              results.push(data);
            }
            lineNumber++;
          })
          .on('end', () => {
            if (errors.length > 0) {
              errors.forEach((error) => console.log(error));
            }
            resolve();
          })
          .on('error', (error) => reject(error));
      });
      return {
        TotalRecords: totalRecords,
        TotalErrorsRecords: totalErrorsRecords,
        Success: results,
        Errors: errors,
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async createEventPlan(
    planData: CreateItemRequest[],
    eventId: string,
    user: UserEntity,
  ): Promise<string> {
    // const { itemName, description, eventId, categoryId, budget } = planData;
    const queryRunner = this.dataSource.createQueryRunner();
    const callback = async (queryRunner: QueryRunner): Promise<void> => {
      const eventExisted = await queryRunner.manager.findOne(EventEntity, {
        where: { id: eventId },
      });
      if (!eventExisted) {
        throw new NotFoundException(EVENT_ERROR_MESSAGE.EVENT_NOT_FOUND);
      }
      //Create plan
      planData.map(async (plan) => {
        const existedCategory = await queryRunner.manager.findOne(
          CategoryEntity,
          {
            where: { id: plan.categoryId },
          },
        );
        if (!existedCategory) {
          throw new NotFoundException('Category Not Found');
        }
        await Promise.all(
          plan.items.map((item) => {
            const newItem = queryRunner.manager.insert(ItemEntity, {
              itemName: item.itemName,
              description: item.description,
              event: eventExisted,
              category: existedCategory,
              createdBy: user.id,
            });
            console.log('New item planning: ', newItem);
            if (newItem) {
              const newBudget = queryRunner.manager.insert(BudgetEntity, {
                plannedAmount: item.budget.plannedAmount,
                plannedPrice: item.budget.plannedPrice,
                description: item.budget.description,
              });
            }
          }),
        );
      });
    };
    await this.transaction(callback, queryRunner);
    return 'Create planning successfully';
  }
}
