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
import { EContactInformation, EPlanningUnit } from '../../common/enum/enum';
import * as csvFormat from 'json2csv';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { BaseService } from '../base/base.service';
import { CreateItemRequest, UpdateItemRequest } from './dto/item.request';
import { CategoryEntity } from '../categories/categories.entity';
import { UserEntity } from '../user/user.entity';
import { BudgetsService } from '../budgets/budgets.service';
import * as iconv from 'iconv-lite';
import { CustomerContactEntity } from '../customer_contacts/customer_contacts.entity';
import { SharedService } from '../../shared/shared.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class ItemsService extends BaseService<ItemEntity> {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemsRepository: Repository<ItemEntity>,
    private readonly categoriesService: CategoriesService,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly budgetService: BudgetsService,
    private readonly sharedService: SharedService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super(itemsRepository);
  }

  async getPlanByCustomerContactId(customerContactId: string): Promise<object> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const customerContactExisted = await queryRunner.manager.findOne(
        CustomerContactEntity,
        {
          where: { id: customerContactId },
        },
      );
      if (!customerContactExisted) {
        throw new NotFoundException('Event not found');
      }
      const planning = await this.itemsRepository.find({
        select: {
          category: {
            id: true,
            categoryName: true,
          },
        },
        where: {
          customerInfo: {
            id: customerContactId,
          },
        },
        relations: {
          category: true,
        },
        order: {
          priority: 'ASC',
        },
      });

      const groupedItems = planning.reduce((acc, currentItem) => {
        // Find existing category in accumulator
        let category = acc.find(
          (item) => item.categoryId === currentItem.category.id,
        );
        // If category doesn't exist, create it
        if (!category) {
          category = {
            categoryId: currentItem.category.id,
            categoryName: currentItem.category.categoryName,
            items: [],
          };
          acc.push(category);
        }
        // Add current item to category's items array
        category.items.push({
          id: currentItem.id,
          createdAt: currentItem.createdAt,
          updatedAt: currentItem.updatedAt,
          itemName: currentItem.itemName,
          description: currentItem.description,
          priority: currentItem.priority,
          plannedAmount: currentItem.plannedAmount,
          plannedPrice: currentItem.plannedPrice,
          plannedUnit: currentItem.plannedUnit,
          createdBy: currentItem.createdBy,
          updatedBy: currentItem.updatedBy,
        });

        return acc;
      }, []);
      const response = {
        ...customerContactExisted,
        plan: groupedItems,
      };
      return response;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async exportTemplateToCSV(): Promise<unknown> {
    try {
      const headers = [
        'STT',
        'Loại hạng mục',
        'Hạng mục',
        'Diễn giải',
        'Độ ưu tiên',
        'Đơn vị tính',
        'Số Lượng',
        'Đơn giá',
        'Thành Tiền',
      ];
      const columnName = [...Array(26)].map((_, index) =>
        String.fromCharCode(65 + index),
      );

      // const getAllCategories = await this.categoriesService.getCategories();
      // const listCategoriesId = getAllCategories.map((category) => category.id);
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
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          if (header === 'STT') {
            row[header] = `=IF(${columnName[headers.indexOf('Hạng mục')]}${
              i + 2
            }="","",ROW()-ROW(${columnName[headers.indexOf('STT')]}$2)+1)`;
          } else if (header === 'Độ ưu tiên') {
            row[header] = '';
          } else {
            row[header] = '';
          }
        });

        // Calculate Thành Tiền based on Số Lượng and Đơn giá
        row['Thành Tiền'] = `=IF(OR(ISBLANK(${
          columnName[headers.indexOf('Số Lượng')]
        }${i + 2}),ISBLANK(${columnName[headers.indexOf('Đơn giá')]}${
          i + 2
        })),"",${columnName[headers.indexOf('Số Lượng')]}${i + 2}*${
          columnName[headers.indexOf('Đơn giá')]
        }${i + 2})`;
        data.push(row);
      }
      console.log('Data at download template: ', data);
      const csv = csvFormat.parse(data, opts);
      // Encode the CSV data in UTF-8 format
      const encodedCsv = iconv.encode(csv, 'utf8');
      return encodedCsv;
    } catch (err) {
      console.log('Error at export CSV template: ', err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async exportPlanToCSV(customerContactId: string): Promise<unknown> {
    try {
      const planExisted = await this.getPlanByCustomerContactId(
        customerContactId,
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const dataPlan = planExisted.plan;
      const headers = [
        'STT',
        'ID Loại hạng mục',
        'Loại hạng mục',
        'Hạng mục',
        'Diễn giải',
        'Độ ưu tiên',
        'Đơn vị tính',
        'Số Lượng',
        'Đơn giá',
        'Thành Tiền',
      ];
      const columnName = [...Array(26)].map((_, index) =>
        String.fromCharCode(65 + index),
      );

      const opts = {
        headers: false,
        fieldFormatter: {
          'Số Lượng': (value) => Number(value).toFixed(2), // Format Số Lượng to 2 decimal places
          'Đơn giá': (value) => Number(value).toFixed(2), // Format Đơn giá to 2 decimal places
          'Thành Tiền': (value) => Number(value).toFixed(2), // Format Thành Tiền to 2 decimal places
        },
      };
      const data = [];
      const STT = 'STT';
      let i = 0;
      dataPlan.map((value, index) => {
        const originalRow = {
          STT: `=IF(${columnName[headers.indexOf('Hạng mục')]}${
            i + 2
          }="","",ROW()-ROW(${columnName[headers.indexOf('STT')]}$2)+1)`,
          'ID Loại hạng mục': value.categoryId,
          'Loại hạng mục': value.categoryName,
        };
        value.items.map((item) => {
          const row = {
            ...originalRow,
            'Hạng mục': item.itemName,
            'Diễn giải': item.description,
            'Độ ưu tiên': item.priority,
            'Đơn vị tính': item.plannedUnit,
            'Số Lượng': item.plannedAmount,
            'Đơn giá': item.plannedPrice,
            'Thành Tiền': item.plannedAmount * item.plannedPrice,
          };
          data.push(row);
          i++;
        });
      });
      const csv = csvFormat.parse(data, opts);
      // Encode the CSV data in UTF-8 format
      const encodedCsv = iconv.encode(csv, 'utf8');
      return encodedCsv;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async readCSVFile(file: Express.Multer.File): Promise<object> {
    try {
      if (!file.mimetype.includes('csv')) {
        throw new BadRequestException(
          'Invalid file format. You need to use CSV format',
        );
      }
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
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (value.trim() === '') {
                errors.push(`Error at line ${lineNumber} - ${key} is empty`);
                if (!hasErrorInRecord) {
                  totalErrorsRecords++;
                }
                hasErrorInRecord = true;
              } else if (key === 'Số Lượng' || key === 'Đơn giá') {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (!parseFloat(value.trim())) {
                  errors.push(
                    `Error at line ${lineNumber} - ${key} is not a float`,
                  );
                  if (!hasErrorInRecord) {
                    totalErrorsRecords++;
                  }
                  hasErrorInRecord = true;
                }
              } else if (key === 'Độ ưu tiên') {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const intValue = parseInt(value.trim(), 10);
                if (isNaN(intValue) || intValue < 1 || intValue > 5) {
                  errors.push(
                    `Error at line ${lineNumber} - ${key} is not a number in range [1, 5]`,
                  );
                  if (!hasErrorInRecord) {
                    totalErrorsRecords++;
                  }
                  hasErrorInRecord = true;
                }
              }
            });
            if (!hasErrorInRecord) {
              // Only add rows without errors to results
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
      // convert Object
      const convertResult = await this.convertResultFromCSV(
        JSON.stringify(results),
      );
      return {
        TotalRecords: totalRecords,
        TotalSuccessRecords: results.length,
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
    customerContactId: string,
    user: UserEntity,
  ): Promise<string> {
    // const { itemName, description, eventId, categoryId, budget } = planData;
    const queryRunner = this.dataSource.createQueryRunner();
    let customerContactPayload;
    let processById;
    const callback = async (queryRunner: QueryRunner): Promise<void> => {
      const customerInfoExisted = await queryRunner.manager.findOne(
        CustomerContactEntity,
        {
          where: { id: customerContactId },
        },
      );

      if (!customerInfoExisted) {
        throw new NotFoundException('Customer contact not found');
      }
      if (customerInfoExisted.status !== EContactInformation.ACCEPT) {
        throw new NotFoundException(
          'Thông tin khách hàng cần được chấp nhận trước khi lên kế hoạch cho sự kiện',
        );
      }
      customerContactPayload = customerInfoExisted;
      processById = customerInfoExisted.processedBy;
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
                priority: itemData.priority,
                plannedAmount: itemData.plannedAmount,
                plannedPrice: itemData.plannedPrice,
                plannedUnit: itemData.plannedUnit,
                category,
                customerInfo: customerInfoExisted,
                createdBy: user.id,
              });
              const createdItem = await queryRunner.manager.save(newItem);
            }),
          );
        }),
      );
    };
    await this.transaction(callback, queryRunner);
    const payload = {
      ...customerContactPayload,
      managerId: user.id,
    };

    console.log('Payload: ', payload);
    const HOST = this.configService.get<string>('SERVER_HOST');
    const PATH_API = this.configService.get<string>('PATH_OPEN_API');
    const PORT = this.configService.get<string>('PORT');
    const token = await this.sharedService.generateJWTTokenForAnHour(payload);
    const url = `${HOST}:${PORT}/customer_contract_info.html?token=${token}`;
    console.log('URL: ', url);
    const processBy = await this.userService.findByIdV2(processById);
    await this.sharedService.sendConfirmContract(
      customerContactPayload.customerEmail,
      customerContactPayload.fullName,
      url,
      processBy.fullName,
      processBy.email,
      processBy.phoneNumber,
    );
    return 'Create planning successfully';
  }

  async updateItem(
    itemId: string,
    data: UpdateItemRequest,
    user: UserEntity,
  ): Promise<string> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const itemExisted = await this.itemsRepository.findOne({
        where: { id: itemId },
      });
      if (!itemExisted) {
        throw new NotFoundException('Item not found');
      }
      const updateCategory = await queryRunner.manager.findOne(CategoryEntity, {
        where: { id: data.categoryId },
      });
      if (!updateCategory) {
        throw new NotFoundException('Category not found');
      }
      const updateItem = await queryRunner.manager.update(
        ItemEntity,
        { id: itemId },
        {
          itemName: data.itemName,
          description: data.description,
          plannedAmount: data.plannedAmount,
          plannedPrice: data.plannedPrice,
          plannedUnit: data.plannedUnit,
          priority: data.priority,
          category: updateCategory,
          updatedBy: user.id,
        },
      );
      if (updateItem.affected > 0) {
        return `Update item ${itemId} successfully`;
      }
      throw new BadRequestException(`Update item ${itemId} failed`);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteItem(itemId: string): Promise<string> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const itemExisted = await this.itemsRepository.findOne({
        where: { id: itemId },
      });
      if (!itemExisted) {
        throw new NotFoundException('Item not found');
      }
      const result = await queryRunner.manager.delete(ItemEntity, {
        id: itemId,
      });
      if (result.affected > 0) {
        return 'Delete item successfully';
      }
      throw new BadRequestException('Delete item fail');
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  private convertResultFromCSV(dataReadResult: string): Promise<never> {
    try {
      const parsedResult = JSON.parse(dataReadResult);
      const convertResult = parsedResult.reduce((acc, obj) => {
        // Extract relevant fields
        const categoryId = obj['Loại hạng mục'];
        const itemName = obj['Hạng mục'];
        const description = obj['Diễn giải'];
        const priority = parseInt(obj['Độ ưu tiên']);
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
          priority,
          plannedAmount,
          plannedPrice,
          plannedUnit,
        });
        return acc;
      }, []);

      // Sort items within each category by priority ascending
      convertResult.forEach((category) => {
        category.items.sort((a, b) => a.priority - b.priority);
      });
      return convertResult;
    } catch (err) {
      console.error('Error at Convert data result CSV to JSON: ', err);
    }
  }
}
