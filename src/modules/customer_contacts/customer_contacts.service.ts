import { RejectNoteNotFound } from './exceptions/RejectNoteNotFound';
import { UserEntity } from 'src/modules/user/user.entity';
import { ContactNotFoundException } from './exceptions/ContactNotFound';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { CustomerContactEntity } from './customer_contacts.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  CustomerContactRequest,
  FilterCustomerContact,
  RejectNote,
} from './dto/contact.dto';
import { CustomerContactPagination } from './dto/contact.pagination';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
import { EContactInformation, ERole } from 'src/common/enum/enum';
import * as moment from 'moment-timezone';
import { UserService } from '../user/user.service';
import { EventTypeEntity } from '../event_types/event_types.entity';
import { EventTypesService } from '../event_types/event_types.service';
import { ContractsService } from '../contracts/contracts.service';
import { forwardRef } from '@nestjs/common/utils';
import { Inject } from '@nestjs/common/decorators';

@Injectable()
export class CustomerContactsService {
  constructor(
    @InjectRepository(CustomerContactEntity)
    private readonly customerContactRepository: Repository<CustomerContactEntity>,
    private userService: UserService,
    @InjectDataSource()
    private dataSource: DataSource,
    private eventTypeService: EventTypesService,
    @Inject(forwardRef(() => ContractsService))
    private contractService: ContractsService,
  ) {}

  /**
   * Get all contacts
   * @param contactPagination
   * @param filter
   * @param user
   */
  async getAllContacts(
    contactPagination: CustomerContactPagination,
    filter: FilterCustomerContact,
    user: UserEntity,
  ): Promise<IPaginateResponse<unknown> | undefined> {
    try {
      const { currentPage, sizePage } = contactPagination;
      const { sortProperty, sort, status } = filter;
      const query = this.generalBuilderContacts();
      query.select([
        'contacts.id as id',
        'contacts.fullName as fullName',
        'contacts.email as email',
        'contacts.phoneNumber as phoneNumber',
        'contacts.address as address',
        'contacts.note as note',
        'contacts.startDate as startDate',
        'contacts.endDate as endDate',
        'contacts.budget as budget',
        'contacts.eventTypeId as eventType',
        'contacts.processedBy as processedBy',
        'contacts.createdAt as createdAt',
        'contacts.status as status',
      ]);
      if (
        user.role.toString() !== ERole.ADMIN &&
        user.role.toString() !== ERole.CUSTOMER &&
        ![EContactInformation.PENDING, EContactInformation.ALL].includes(status)
      ) {
        query.where('contacts.processedBy = :userId', { userId: user.id });
      }
      if (status !== EContactInformation.ALL) {
        query.andWhere('contacts.status = :status', { status });
      }
      if (user.role.toString() === ERole.CUSTOMER) {
        query.andWhere('contacts.email = :email', { email: user.email });
      }
      if (sortProperty) {
        query.orderBy(`contacts.${sortProperty}`, sort);
      }
      const [originalResult, total] = await Promise.all([
        query
          .offset((sizePage as number) * ((currentPage as number) - 1))
          .limit(sizePage as number)
          .execute(),
        query.getCount(),
      ]);
      let result = originalResult;
      if (status === EContactInformation.ALL) {
        result = result.filter(
          (contact) => contact.status !== EContactInformation.DELETED,
        );
      }
      let listEventType = [];
      const listInfoUser = await Promise.all(
        (result || []).reduce((acc, item) => {
          if (item.processedBy) {
            acc.push(this.userService.findByIdV2(item.processedBy));
          }
          if (item.eventType) {
            listEventType.push(this.eventTypeService.findById(item.eventType));
          }
          return acc;
        }, []),
      );
      listEventType = await Promise.all(listEventType);
      // Lists User
      const userMap = {};
      listInfoUser.forEach((user) => {
        userMap[user?.id] = {
          id: user?.id,
          fullName: user?.fullName,
          email: user.email,
          phoneNumber: user?.phoneNumber,
          dob: user?.dob,
          avatar: user?.avatar,
          status: user?.status,
        };
      });
      // List Event Type
      const eventTypeMap = {};
      listEventType.forEach((eventType) => {
        eventTypeMap[eventType?.id] = {
          id: eventType?.id,
          typeName: eventType?.typeName,
        };
      });
      const finalData = result.reduce((acc, contact) => {
        const res = { ...contact };
        if (contact.processedBy) {
          res.processedBy = userMap[contact?.processedBy];
        }
        if (contact.eventType) {
          res.eventType = eventTypeMap[contact?.eventType];
        }
        acc.push(res);
        return acc;
      }, []);
      return paginateResponse<unknown>(
        [finalData, total],
        currentPage as number,
        sizePage as number,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * getContactDetailsById
   * @param contactId
   * @returns
   */
  async getContactDetailsById(contactId: string): Promise<unknown> {
    try {
      const query = this.generalBuilderContacts();
      query.select([
        'contacts.id as id',
        'contacts.fullName as fullName',
        'contacts.email as email',
        'contacts.phoneNumber as phoneNumber',
        'contacts.address as address',
        'contacts.note as note',
        'contacts.startDate as startDate',
        'contacts.endDate as endDate',
        'contacts.budget as budget',
        'contacts.eventTypeId as eventType',
        'contacts.processedBy as processedBy',
        'contacts.createdAt as createdAt',
        'contacts.status as status',
      ]);
      query.where('contacts.id = :id', { id: contactId });
      const data = await query.execute();
      if (!data) {
        throw new ContactNotFoundException();
      }
      const contract =
        await this.contractService.getContractByCustomerContactId(contactId);
      console.log('Contract: ', contract);
      const user = await this.userService.findByEmailV2(data?.[0]?.email);
      const contractInfo = contract ? contract : null;
      return {
        ...data[0],
        customerInfo: user,
        contract: contractInfo,
      };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * findContactById
   * @param contactId
   * @returns
   */
  async findContactById(contactId: string): Promise<CustomerContactEntity> {
    try {
      const data = await this.customerContactRepository.findOne({
        where: { id: contactId },
        relations: {
          contract: true,
        },
      });
      return data;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * @param contact
   * @param email
   * @returns
   */
  async leaveMessage(
    user: UserEntity,
    contact: CustomerContactRequest,
  ): Promise<string | undefined> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const eventType = await queryRunner.manager.findOne(EventTypeEntity, {
        where: { id: contact.eventTypeId },
      });
      if (!eventType) {
        throw new NotFoundException('Event type not found, please try again');
      }
      const data = await this.customerContactRepository.save({
        fullName: contact.fullName,
        address: contact.address,
        email: user.email,
        phoneNumber: contact.phoneNumber,
        note: contact.note,
        startDate: contact.startDate,
        endDate: contact.endDate,
        budget: contact.budget,
        eventType: eventType,
        createdBy: user.id,
      });
      if (data) {
        return 'Leave message successfully';
      }
      throw new BadRequestException('Error unknown');
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   *
   * @param user
   * @param contactId
   * @param status
   * @param rejectNote
   * @returns
   */
  async updateStatus(
    user: UserEntity,
    contactId: string,
    status: EContactInformation,
    rejectNote: RejectNote,
  ): Promise<string | undefined> {
    try {
      const contactExisted = await this.customerContactRepository.findOne({
        where: { id: contactId },
      });
      console.log('contactExisted:', contactExisted);
      console.log('contactId:', contactId);

      if (contactExisted) {
        switch (status) {
          case EContactInformation.ACCEPT:
            if (contactExisted.status !== EContactInformation.PENDING) {
              throw new BadRequestException(
                'This contact can not be accepted because contact is already!',
              );
            }
            if (
              user.role.toString() === ERole.ADMIN ||
              user.role.toString() === ERole.CUSTOMER
            ) {
              throw new BadRequestException(
                `This contact can not be accepted because you are ${user.role.toString()}`,
              );
            }
            const acceptedResult = await this.customerContactRepository.update(
              { id: contactId },
              {
                status: status,
                processedBy: user.id,
                updateAt: moment()
                  .tz('Asia/Bangkok')
                  .format('YYYY-MM-DD HH:mm:ss'),
                updatedBy: user.id,
              },
            );
            if (acceptedResult) {
              return `Accept contact of ${contactExisted.fullName} - ${contactExisted.phoneNumber} successfully. Processed by: ${user.id}`;
            } else {
              throw new BadRequestException('Error unknown');
            }
            break;
          case EContactInformation.REJECT:
            if (
              user.role.toString() !== ERole.ADMIN &&
              contactExisted.processedBy !== user.id
            ) {
              throw new BadRequestException(
                `You are not allowed to reject contact [${contactExisted.id}] - ${contactExisted.fullName} - ${contactExisted.phoneNumber}`,
              );
            }
            if (!rejectNote.rejectNote) {
              throw new RejectNoteNotFound();
            }
            const rejectResult = await this.customerContactRepository.update(
              { id: contactId },
              {
                status: status,
                processedBy: user.id,
                updateAt: moment()
                  .tz('Asia/Bangkok')
                  .format('YYYY-MM-DD HH:mm:ss'),
                updatedBy: user.id,
                rejectNote: rejectNote.rejectNote,
              },
            );
            if (rejectResult) {
              return `Reject contact of ${contactExisted.fullName} - ${contactExisted.phoneNumber} successfully.\n
              The reason reject: ${rejectNote.rejectNote}`;
            } else {
              throw new BadRequestException('Error unknown');
            }
            break;
          case EContactInformation.DELETED:
            if (contactExisted.status !== EContactInformation.PENDING) {
              throw new BadRequestException(
                'This contact is already processing, you can not delete it',
              );
            }
            if (contactExisted.createdBy !== user.id) {
              throw new BadRequestException(
                'You are not allowed to delete this contact',
              );
            }
            if (!rejectNote.rejectNote) {
              throw new RejectNoteNotFound();
            }
            const deletedResult = await this.customerContactRepository.update(
              { id: contactId },
              {
                status: status,
                updateAt: moment()
                  .tz('Asia/Bangkok')
                  .format('YYYY-MM-DD HH:mm:ss'),
                updatedBy: user.id,
                rejectNote: rejectNote.rejectNote,
              },
            );
            if (deletedResult) {
              return `Delete contact of ${contactExisted.fullName} - ${contactExisted.phoneNumber} successfully.\n
              The reason deleted: ${rejectNote.rejectNote}`;
            } else {
              throw new BadRequestException('Error unknown');
            }
            break;
          case EContactInformation.SUCCESS:
            console.log('contactExisted.status:', contactExisted.status);

            if (contactExisted.status !== EContactInformation.ACCEPT) {
              console.log('test');

              throw new BadRequestException(
                'This contact is not accepted yet, you can not update to success',
              );
            }
            if (contactExisted.processedBy !== user.id) {
              throw new BadRequestException(
                'You are not allowed to update success this contact',
              );
            }
            const updateResult = await this.customerContactRepository.update(
              { id: contactId },
              {
                status: status,
                updateAt: moment()
                  .tz('Asia/Bangkok')
                  .format('YYYY-MM-DD HH:mm:ss'),
                updatedBy: user.id,
              },
            );
            if (updateResult) {
              return `Update to SUCCESS contact of ${contactExisted.fullName} - ${contactExisted.phoneNumber} successfully.`;
            } else {
              throw new BadRequestException('Error unknown');
            }
            break;
        }
      }
      throw new NotFoundException(
        !contactExisted
          ? `Contact ${contactId} not found`
          : `Contact ${contactExisted.id} is being proccesed`,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * Update contact
   * @param contactId
   * @param contact
   * @param user
   * @returns
   */

  async updateContact(
    contactId: string,
    contact: CustomerContactRequest,
    user: UserEntity,
  ): Promise<string> {
    try {
      const existedContact = await this.customerContactRepository.findOne({
        where: { id: contactId },
      });
      if (!existedContact) {
        throw new ContactNotFoundException();
      }
      if (
        existedContact.status !== EContactInformation.PENDING ||
        existedContact.createdBy !== user.id.toString()
      ) {
        throw new BadRequestException(
          'You are not allowed to update this contact',
        );
      }

      const eventType = await this.eventTypeService.findById(
        contact.eventTypeId,
      );
      const updatedData = await this.customerContactRepository.update(
        { id: contactId },
        {
          fullName: contact.fullName,
          address: contact.address,
          email: user.email,
          phoneNumber: contact.phoneNumber,
          note: contact.note,
          startDate: contact.startDate,
          endDate: contact.endDate,
          budget: contact.budget,
          eventType: eventType,
          updatedBy: user.id,
          updateAt: moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
        },
      );
      if (updatedData.affected > 0) {
        return 'Update contact successfully';
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  private generalBuilderContacts(): SelectQueryBuilder<CustomerContactEntity> {
    return this.customerContactRepository.createQueryBuilder('contacts');
  }
}
