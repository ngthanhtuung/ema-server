/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  EContactInformation,
  EContractStatus,
  EPlanningUnit,
} from '../../common/enum/enum';
import * as csvFormat from 'json2csv';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { BaseService } from '../base/base.service';
import {
  CreateItemRequest,
  UpdateItemRequest,
  UpdatePlanRequest,
} from './dto/item.request';
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
      for (let i = 0; i < 50; i++) {
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
      const dataPlan = planExisted?.plan;
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
      const categories = await this.categoriesService.getCategories();
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
                errors.push(`Lỗi tại dòng ${lineNumber} - ${key} bị bỏ trống`);
                if (!hasErrorInRecord) {
                  totalErrorsRecords++;
                }
                hasErrorInRecord = true;
              } else if (key === 'Số Lượng' || key === 'Đơn giá') {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (!parseFloat(value.trim())) {
                  errors.push(
                    `Lỗi tại dòng ${lineNumber} - ${key} phải là một số thực`,
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
                    `Lỗi tại dòng ${lineNumber} - ${key} phải là số nguyên trong khoảng [1, 5]`,
                  );
                  if (!hasErrorInRecord) {
                    totalErrorsRecords++;
                  }
                  hasErrorInRecord = true;
                }
              } else if (key === 'Loại hạng mục') {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const trimValue = value.trim();
                if (!categories.some((category) => category.id === trimValue)) {
                  errors.push(
                    `Lỗi tại dòng ${lineNumber} - ID: ${trimValue} không tìm thấy trong danh sách loại hạng mục`,
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
      let convertResult = results;
      if (results.length > 0) {
        // convert Object
        const convert = await this.convertResultFromCSV(
          JSON.stringify(results),
        );
        convertResult = convert;
      }
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
    queryRunnerExisted?: QueryRunner,
  ): Promise<string> {
    let queryRunner: QueryRunner;
    if (queryRunnerExisted) {
      queryRunner = queryRunnerExisted;
    } else {
      queryRunner = this.dataSource.createQueryRunner();
    }
    try {
      // const { itemName, description, eventId, categoryId, budget } = planData;
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
      await this.transaction(callback, queryRunner, false);
      // const payload = {
      //   ...customerContactPayload,
      //   managerId: user.id,
      // };
      // console.log('Payload: ', payload);
      // const HOST = this.configService.get<string>('SERVER_HOST');
      // const PATH_API = this.configService.get<string>('PATH_OPEN_API');
      // const PORT = this.configService.get<string>('PORT');
      // const token = await this.sharedService.generateJWTTokenForAnHour(payload);
      // const url = `${HOST}:${PORT}/customer_contract_info.html?token=${token}`;
      // console.log('URL: ', url);
      // const processBy = await this.userService.findByIdV2(processById);
      // await this.sharedService.sendConfirmContract(
      //   customerContactPayload.customerEmail,
      //   customerContactPayload.fullName,
      //   url,
      //   processBy.fullName,
      //   processBy.email,
      //   processBy.phoneNumber,
      // );
      return 'Create planning successfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    } finally {
      if (!queryRunnerExisted) {
        await queryRunner.release();
      }
    }
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
        relations: ['customerInfo', 'customerInfo.contract'],
      });
      const contract = itemExisted?.customerInfo?.contract;
      if (!itemExisted) {
        throw new NotFoundException('Item not found');
      }
      const updateCategory = await queryRunner.manager.findOne(CategoryEntity, {
        where: { id: data.categoryId },
      });
      if (!updateCategory) {
        throw new NotFoundException('Category not found');
      }
      if (contract.status !== EContractStatus.PENDING) {
        throw new BadRequestException(
          'Hợp đồng của liên hệ này đã được xử lí, không thể thay đổi kế hoạch ngay bây giờ',
        );
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
        relations: ['customerInfo', 'customerInfo.contract'],
      });
      const contract = itemExisted?.customerInfo?.contract;
      if (!itemExisted) {
        throw new NotFoundException('Item not found');
      }
      if (contract.status !== EContractStatus.PENDING) {
        throw new BadRequestException(
          'Hợp đồng của liên hệ này đã được xử lí, không thể thay đổi kế hoạch ngay bây giờ',
        );
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

  async updatePlan(
    planData: UpdatePlanRequest[],
    customerContactId: string,
    user: UserEntity,
  ): Promise<string> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const contactExisted = await queryRunner.manager.findOne(
        CustomerContactEntity,
        {
          where: { id: customerContactId },
          relations: ['contract'],
        },
      );
      if (!contactExisted) {
        throw new NotFoundException('Không thể tìm thấy liên hệ này');
      }
      if (
        contactExisted?.contract?.status !== EContractStatus.PENDING &&
        contactExisted?.contract?.status !== undefined
      ) {
        throw new BadRequestException(
          'Hợp đồng của liên hệ này đã được xử lí, không thể thay đổi kế hoạch ngay bây giờ',
        );
      }
      const callback = async (queryRunner: QueryRunner): Promise<void> => {
        await queryRunner.manager.delete(ItemEntity, {
          customerInfo: {
            id: customerContactId,
          },
        });
        const result = await this.createEventPlan(
          planData,
          customerContactId,
          user,
          queryRunner,
        );
      };
      await this.transaction(callback, queryRunner);
      return 'Update plan successfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private async convertResultFromCSV(dataReadResult: string): Promise<any> {
    try {
      const categoriesMap = await this.categoriesService.getCategories();
      console.log('List categories: ', categoriesMap);
      const parsedResult = JSON.parse(dataReadResult);
      const convertResult = parsedResult.reduce((acc, obj) => {
        // Extract relevant fields
        const categoryId = obj['Loại hạng mục'];
        const categoryObject = categoriesMap.filter(
          (category) => category.id === categoryId,
        );

        const categoryNameById = categoryObject
          ? categoryObject[0]?.categoryName
          : 'Unknown';
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
            categoryName: categoryNameById,
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
      throw new InternalServerErrorException(err.message);
    }
  }
}
