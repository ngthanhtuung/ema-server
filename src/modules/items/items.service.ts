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
import { BudgetsService } from '../budgets/budgets.service';
import * as iconv from 'iconv-lite';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ItemsService extends BaseService<ItemEntity> {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemsRepository: Repository<ItemEntity>,
    private readonly categoriesService: CategoriesService,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly budgetService: BudgetsService,
  ) {
    super(itemsRepository);
  }

  async exportTemplateToCSV(): Promise<unknown> {
    try {
      const headers = [
        'STT',
        'Loại hạng mục',
        'Hạng mục',
        'Diễn giải',
        'Đơn vị tính',
        'Độ ưu tiên',
        'Số Lượng',
        'Đơn giá',
        'Thành Tiền',
      ];

      const columnName = [...Array(26)].map((_, index) =>
        String.fromCharCode(65 + index),
      );

      const indexItemNameColumn = headers.indexOf('Hạng mục');

      const getAllCategories = await this.categoriesService.getCategories();
      const listCategoriesId = getAllCategories.map((category) => category.id);
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
      for (let i = 0; i < 10; i++) {
        const row = {
          STT: `=IF(${columnName[headers.indexOf('Hạng mục')]}${
            i + 2
          }="","",ROW()-ROW(${columnName[headers.indexOf('STT')]}$2)+1)`,
        };
        headers.slice(1).forEach((header, index) => {
          row[header] = '';
        });
        row['Thành Tiền'] = `=IF(OR(ISBLANK(${
          columnName[headers.indexOf('Số Lượng')]
        }${i + 2}),ISBLANK(${columnName[headers.indexOf('Đơn giá')]}${
          i + 2
        })),"",${columnName[headers.indexOf('Số Lượng')]}${i + 2}*${
          columnName[headers.indexOf('Đơn giá')]
        }${i + 2})`;
        data.push(row);
      }
      const csv = csvFormat.parse(data, opts);
      // Encode the CSV data in UTF-8 format
      const encodedCsv = iconv.encode(csv, 'utf8');
      return encodedCsv;
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
      //convert Object
      const convertResult = await this.convertResultFromCSV(
        JSON.stringify(results),
      );
      return {
        TotalRecords: totalRecords,
        TotalErrorsRecords: totalErrorsRecords,
        Success: convertResult,
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
      await Promise.all(
        planData.map(async (plan) => {
          const category = await queryRunner.manager.findOne(CategoryEntity, {
            where: { id: plan?.categoryId },
          });
          if (!category) {
            throw new NotFoundException(
              `Category with ID ${plan.categoryId} not found`,
            );
          }
          await Promise.all(
            plan.items.map(async (itemData) => {
              const newItem = queryRunner.manager.create(ItemEntity, {
                itemName: itemData.itemName,
                description: itemData.description,
                category,
                event: eventExisted,
                createdBy: user.id,
              });
              const createdItem = await queryRunner.manager.save(newItem);
              if (createdItem) {
                const plannedBudget = {
                  plannedAmount: itemData.budget.plannedAmount,
                  plannedPrice: itemData.budget.plannedPrice,
                  plannedUnit: itemData.budget.plannedUnit,
                  description: itemData.budget.description,
                  item: createdItem,
                };
                const newBudget = queryRunner.manager.create(BudgetEntity, {
                  plannedAmount: itemData.budget.plannedAmount,
                  plannedPrice: itemData.budget.plannedPrice,
                  plannedUnit: itemData.budget.plannedUnit,
                  description: itemData.budget.description,
                  item: createdItem,
                });
                await queryRunner.manager.save(newBudget);
              }
            }),
          );
        }),
      );
    };
    await this.transaction(callback, queryRunner);
    return 'Create planning successfully';
  }

  private convertResultFromCSV(dataReadResult: string): Promise<never> {
    try {
      const parsedResult = JSON.parse(dataReadResult);
      const convertResult = parsedResult.reduce((acc, obj) => {
        // Extract relevant fields
        const categoryId = obj['Loại hạng mục'];
        const itemName = obj['Hạng mục'];
        const description = obj['Diễn giải'];
        const plannedAmount = parseFloat(obj['Số Lượng']);
        const plannedPrice = parseFloat(obj['Đơn giá']);
        const plannedUnit = obj['Đơn vị tính'];

        // Find existing category in accumulator
        let category = acc.find((item) => item.categoryId === categoryId);

        // If category doesn't exist, create it
        if (!category) {
          category = {
            categoryId,
            items: [],
          };
          acc.push(category);
        }

        // Add item to category
        category.items.push({
          itemName,
          description,
          budget: {
            plannedAmount,
            plannedPrice,
            plannedUnit,
            description,
          },
        });

        return acc;
      }, []);
      return convertResult;
    } catch (err) {
      console.error('Error at Convert data result CSV to JSON: ', err);
    }
  }
}
