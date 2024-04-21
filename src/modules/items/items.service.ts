/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
import { EContactInformation, EContractStatus } from '../../common/enum/enum';
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
import * as iconv from 'iconv-lite';
import { CustomerContactEntity } from '../customer_contacts/customer_contacts.entity';
import { CreateCategoryRequest } from '../categories/dto/categories.request';
import { EventTypesService } from '../event_types/event_types.service';
import * as moment from 'moment';

@Injectable()
export class ItemsService extends BaseService<ItemEntity> {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemsRepository: Repository<ItemEntity>,
    private readonly categoriesService: CategoriesService,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly eventTypesService: EventTypesService,
  ) {
    super(itemsRepository);
  }

  /**
   * getPlanByCustomerContactId
   * @param customerContactId
   * @returns
   */
  async getPlanByCustomerContactId(customerContactId: string): Promise<object> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
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
          (item) => item?.categoryName === currentItem?.category?.categoryName,
        );
        // If category doesn't exist, create it
        if (!category) {
          category = {
            categoryName: currentItem?.category?.categoryName,
            items: [],
          };
          acc.push(category);
        }
        // Add current item to category's items array
        category.items.push({
          id: currentItem?.id,
          createdAt: currentItem?.createdAt,
          updatedAt: currentItem?.updatedAt,
          itemName: currentItem?.itemName,
          description: currentItem?.description,
          priority: currentItem?.priority,
          plannedAmount: currentItem?.plannedAmount,
          plannedPrice: currentItem?.plannedPrice,
          plannedUnit: currentItem?.plannedUnit,
          plannedStartDate: currentItem?.plannedStartDate,
          plannedEndDate: currentItem?.plannedEndDate,
          createdBy: currentItem?.createdBy,
          updatedBy: currentItem?.updatedBy,
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
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * exportTemplateToCSV
   * @returns
   */
  async exportTemplateToCSV(eventTypeID: string): Promise<string> {
    try {
      const eventType = await this.eventTypesService.findById(eventTypeID);
      return eventType?.linkTemplate;
    } catch (err) {
      console.log('Error at export CSV template: ', err);
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * generateData
   */
  generateData(
    headers: string[],
    columnName: string[],
  ): Record<string, string>[] {
    const data = [];
    for (let i = 0; i < 50; i++) {
      const row: Record<string, string> = {};
      headers.forEach((header) => {
        if (header === 'STT') {
          row[header] = `=IF(${columnName[headers.indexOf('Hạng mục')]}${
            i + 2
          }="","",ROW()-ROW(${columnName[headers.indexOf('STT')]}$2)+1)`;
        } else {
          row[header] = '';
        }
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
    return data;
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
        'Loại hạng mục',
        'Hạng mục',
        'Diễn giải',
        'Độ ưu tiên',
        'Đơn vị tính',
        'Số Lượng',
        'Đơn giá',
        'Thời gian bắt đầu',
        'Thời gian kết thúc',
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
      let i = 0;
      for (const value of dataPlan) {
        const originalRow = {
          STT: `=IF(${columnName[headers.indexOf('Hạng mục')]}${
            i + 2
          }="","",ROW()-ROW(${columnName[headers.indexOf('STT')]}$2)+1)`,
          'Loại hạng mục': value?.categoryName,
        };
        (value?.items || []).forEach((item) => {
          const row = {
            ...originalRow,
            'Hạng mục': item?.itemName,
            'Diễn giải': item?.description,
            'Độ ưu tiên': item?.priority,
            'Đơn vị tính': item?.plannedUnit,
            'Số Lượng': item?.plannedAmount,
            'Đơn giá': item?.plannedPrice,
            'Thời gian bắt đầu': item?.plannedStartDate,
            'Thời gian kết thúc': item?.plannedEndDate,
            'Thành Tiền': item?.plannedAmount * item?.plannedPrice,
          };
          data.push(row);
          i++;
        });
      }
      const csv = csvFormat.parse(data, opts);
      // Encode the CSV data in UTF-8 format
      const encodedCsv = iconv.encode(csv, 'utf8');
      return encodedCsv;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * readCSVFile
   * @param file
   * @returns
   */
  async readCSVFile(file: Express.Multer.File): Promise<object> {
    try {
      this.validateFileFormat(file);
      console.log('file:', file);
      const categories: CategoryEntity[] =
        await this.categoriesService.getCategories();
      const { results, errors, totalRecords, totalErrorsRecords } =
        await this.processCSVData(file);
      let convertResult = results;
      console.log('results:', results);

      if (results.length > 0) {
        convertResult = await this.convertResultFromCSV(
          JSON.stringify(results),
          categories,
        );
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

  /**
   * validateFileFormat
   * @param file
   */
  validateFileFormat(file: Express.Multer.File) {
    if (!file?.mimetype?.includes('csv')) {
      throw new BadRequestException(
        'Invalid file format. You need to use CSV format',
      );
    }
  }

  /**
   * processCSVData
   * @param file
   * @returns
   */
  async processCSVData(file: Express.Multer.File): Promise<{
    results: any[];
    errors: string[];
    totalRecords: number;
    totalErrorsRecords: number;
  }> {
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
        .on('data', (data: any) => {
          totalRecords++;
          const { hasErrorInRecord, errorMessages } = this.validateRecord(
            data,
            lineNumber,
          );
          if (hasErrorInRecord) {
            totalErrorsRecords++;
            errors.push(...errorMessages);
          } else {
            results.push(data);
          }
          lineNumber++;
        })
        .on('end', () => {
          if (errors.length > 0) {
            errors.forEach((error) => console.error(error));
          }
          resolve();
        })
        .on('error', (error) => reject(error));
    });
    return { results, errors, totalRecords, totalErrorsRecords };
  }

  /**
   * Handle Validate Record CSV
   * validateRecord
   * @param data
   * @param lineNumber
   * @returns
   */
  validateRecord(
    data: any,
    lineNumber: number,
  ): { hasErrorInRecord: boolean; errorMessages: string[] } {
    let hasErrorInRecord = false;
    const errorMessages = [];
    Object.entries(data).forEach(([key, value]) => {
      const trimValue = (value as string).trim();
      if (trimValue === '') {
        errorMessages.push(`Lỗi tại dòng ${lineNumber} - ${key} bị bỏ trống`);
        hasErrorInRecord = true;
      } else if (key === 'Số Lượng' || key === 'Đơn giá') {
        if (!parseFloat(trimValue)) {
          errorMessages.push(
            `Lỗi tại dòng ${lineNumber} - ${key} phải là một số thực`,
          );
          hasErrorInRecord = true;
        }
      } else if (key === 'Độ ưu tiên') {
        const intValue = parseInt(trimValue, 10);
        if (isNaN(intValue) || intValue < 1 || intValue > 5) {
          errorMessages.push(
            `Lỗi tại dòng ${lineNumber} - ${key} phải là số nguyên trong khoảng [1, 5]`,
          );
          hasErrorInRecord = true;
        }
      } else if (key === 'Thời gian bắt đầu' || key === 'Thời gian kết thúc') {
        const formattedDate = moment(trimValue).format('YYYY-MM-DD');
        const dateValue = moment(formattedDate, 'YYYY-MM-DD'); // Assuming date format is YYYY-MM-DD
        if (!dateValue.isValid()) {
          errorMessages.push(
            `Lỗi tại dòng ${lineNumber} - ${key} không hợp lệ. Định dạng chuẩn YYYY-MM-DD`,
          );
          hasErrorInRecord = true;
        } else if (
          key === 'Thời gian kết thúc' &&
          dateValue.isBefore(moment(trimValue, 'YYYY-MM-DD'))
        ) {
          errorMessages.push(
            `Lỗi tại dòng ${lineNumber} - ${key} phải sau Thời gian bắt đầu`,
          );
          hasErrorInRecord = true;
        } else if (
          key === 'Thời gian kết thúc' &&
          dateValue.isBefore(moment(), 'day')
        ) {
          errorMessages.push(
            `Lỗi tại dòng ${lineNumber} - ${key} không được trước ngày hôm nay`,
          );
          hasErrorInRecord = true;
        }
      }
    });
    return { hasErrorInRecord, errorMessages };
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
        if (customerInfoExisted?.status !== EContactInformation.ACCEPT) {
          throw new NotFoundException(
            'Thông tin khách hàng cần được chấp nhận trước khi lên kế hoạch cho sự kiện',
          );
        }
        customerContactPayload = customerInfoExisted;
        processById = customerInfoExisted?.processedBy;
        console.log('processById:', processById);
        console.log('customerContactPayload:', customerContactPayload);

        //Create plan
        const categoriesPromise = planData.map((plan) =>
          queryRunner.manager.findOne(CategoryEntity, {
            where: { categoryName: plan?.categoryName },
          }),
        );
        const categories = await Promise.all(categoriesPromise);
        console.log('categories:', categories);
        const listPromiseItems = planData.map((plan, index) => {
          const category = categories[index];
          if (!category) {
            throw new NotFoundException(
              `Category name ${plan.categoryName} not found`,
            );
          }
          const listNewItem = plan?.items?.map((itemData) => {
            return {
              itemName: itemData?.itemName,
              description: itemData?.description,
              priority: itemData?.priority,
              plannedAmount: itemData?.plannedAmount,
              plannedPrice: itemData?.plannedPrice,
              plannedUnit: itemData?.plannedUnit,
              category,
              customerInfo: customerInfoExisted,
              createdBy: user?.id,
              plannedStartDate: itemData?.plannedStartDate,
              plannedEndDate: itemData?.plannedEndDate,
            };
          });
          return queryRunner.manager.insert(ItemEntity, listNewItem);
        });

        await Promise.all(listPromiseItems);
      };
      await this.transaction(callback, queryRunner, false);
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
        where: { id: data?.categoryName },
      });
      if (!updateCategory) {
        throw new NotFoundException('Category not found');
      }
      if (
        contract?.status !== EContractStatus.PENDING &&
        contract?.status !== undefined
      ) {
        throw new BadRequestException(
          'Hợp đồng của liên hệ này đã được xử lí, không thể thay đổi kế hoạch ngay bây giờ',
        );
      }
      const updateItem = await queryRunner.manager.update(
        ItemEntity,
        { id: itemId },
        {
          itemName: data?.itemName,
          description: data?.description,
          plannedAmount: data?.plannedAmount,
          plannedPrice: data?.plannedPrice,
          plannedUnit: data?.plannedUnit,
          priority: data?.priority,
          plannedStartDate: data?.plannedStartDate,
          plannedEndDate: data?.plannedEndDate,
          category: updateCategory,
          updatedBy: user?.id,
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

  async getItemDetail(itemId: string): Promise<ItemEntity> {
    try {
      const itemExisted = await this.itemsRepository.findOne({
        where: {
          id: itemId,
        },
        relations: [
          'tasks',
          'tasks.transactions',
          'tasks.transactions.evidences',
        ],
      });
      return itemExisted;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
      if (
        contract?.status !== EContractStatus?.PENDING &&
        contract?.status !== undefined
      ) {
        throw new BadRequestException(
          'Hợp đồng của liên hệ này đã được xử lí, không thể thay đổi kế hoạch ngay bây giờ',
        );
      }
      const result = await queryRunner.manager.delete(ItemEntity, {
        id: itemId,
      });
      if (result?.affected > 0) {
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
    const queryRunner = this.dataSource.createQueryRunner();
    try {
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
        await this.createEventPlan(
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
    } finally {
      await queryRunner.release();
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment

  async getTotalPriceOfPlan(customerContactId: string): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const listPlan = await queryRunner.manager.find(ItemEntity, {
        where: {
          customerInfo: {
            id: customerContactId,
          },
        },
      });
      let totalPrice = 0;
      if (listPlan.length > 0) {
        for (const item of listPlan) {
          totalPrice += (item?.plannedPrice || 0) * (item?.plannedAmount || 0);
        }
        const backupPrice = totalPrice * 0.05;
        const taxPrice = (totalPrice + backupPrice) * 0.1;
        const grandTotalPrice = totalPrice + backupPrice + taxPrice;
        return grandTotalPrice;
      }
      throw new BadRequestException(
        'Hợp đồng này chưa có kế hoạch, vui lòng tạo kế hoạch',
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async convertResultFromCSV(
    dataReadResult: string,
    categoriesMap: any,
  ) {
    try {
      const parsedResult = JSON.parse(dataReadResult);
      console.log('parsedResult:', parsedResult);
      console.log('dataReadResult:', dataReadResult);

      const categoriesMapObj = new Map(
        categoriesMap.map((category) => [category?.categoryName, category]),
      );
      const listPromiseAll = [];
      for (const item of parsedResult) {
        const categoryName = item?.['Loại hạng mục'] || '';
        const categoryObject: any = categoriesMapObj.get(categoryName);
        // Create category if not existed
        if (!categoryObject) {
          const dataCreateCategory: CreateCategoryRequest = {
            categoryName,
          };
          listPromiseAll.push(
            this.categoriesService.createCategory(dataCreateCategory),
          );
          categoriesMapObj.set(categoryName, dataCreateCategory);
        }
      }
      await Promise.all(listPromiseAll);
      const convertResult = parsedResult.reduce((acc, obj) => {
        // Extract relevant fields
        const categoryName = obj['Loại hạng mục'];
        // console.log('categoryName:', categoryName);
        const categoryObject: any = categoriesMapObj.get(categoryName);
        // console.log('categoryObject:', categoryObject);
        const itemName = obj['Hạng mục'];
        const description = obj['Diễn giải'];
        const priority = parseInt(obj['Độ ưu tiên']);
        const plannedAmount = parseFloat(obj['Số Lượng']);
        const plannedPrice = parseFloat(obj['Đơn giá']);
        const plannedUnit = obj['Đơn vị tính'];
        const plannedStartDate = moment(obj['Thời gian bắt đầu']).format(
          'YYYY-MM-DD',
        );
        const plannedEndDate = moment(obj['Thời gian kết thúc']).format(
          'YYYY-MM-DD',
        );
        // Find existing category in accumulator
        let category = acc.find(
          (item) => item?.categoryName === categoryObject?.categoryName,
        );
        // console.log('category:', category);
        // If category doesn't exist, create it
        if (!category) {
          category = {
            categoryName: categoryObject?.categoryName,
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
          plannedStartDate,
          plannedEndDate,
        });
        category.items.sort((a, b) => a?.priority - b?.priority);
        return acc;
      }, []);
      return convertResult;
    } catch (err) {
      console.error('Error at Convert data result CSV to JSON: ', err);
      throw new InternalServerErrorException(err.message);
    }
  }
}
