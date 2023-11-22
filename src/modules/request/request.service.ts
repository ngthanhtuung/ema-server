/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { RequestEntity } from './request.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository, SelectQueryBuilder } from 'typeorm';
import { Inject } from '@nestjs/common/decorators';
import { forwardRef } from '@nestjs/common/utils';
import { AnnualLeaveService } from '../annual-leave/annual-leave.service';
import {
  FilterRequest,
  RequestCreateRequest,
  UpdateRequestStatusReq,
  requestEmployee,
} from './dto/request.request';
import {
  EReplyRequest,
  ERequestType,
  ETypeNotification,
  EUserStatus,
} from 'src/common/enum/enum';
import { UserCreateRequest, UserPagination } from '../user/dto/user.request';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
import { NotificationCreateRequest } from '../notification/dto/notification.request';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { AppGateway } from 'src/sockets/app.gateway';
import { UserEntity } from '../user/user.entity';
import { DeviceService } from '../device/device.service';

@Injectable()
export class RequestService extends BaseService<RequestEntity> {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    @Inject(forwardRef(() => AnnualLeaveService))
    private readonly annualLeaveService: AnnualLeaveService,
    private notificationService: NotificationService,
    private userService: UserService,
    @Inject(forwardRef(() => AppGateway))
    private readonly appGateWay: AppGateway,
    private readonly deviceService: DeviceService,
  ) {
    super(requestRepository);
  }
  generalBuilderRequest(): SelectQueryBuilder<RequestEntity> {
    return this.requestRepository.createQueryBuilder('requests');
  }

  async diffOffDays(data: {
    startDateReq: Date;
    endDateReq: Date;
    type: string;
    isPM: boolean;
  }): Promise<number> {
    const startDate = new Date(data.startDateReq);
    const endDate = new Date(data.endDateReq);
    if (startDate > endDate) {
      throw new InternalServerErrorException(
        'start date can not greater than end date!',
      );
    }

    let dayOffs =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Math.abs(<any>endDate - <any>startDate) / (1000 * 60 * 60 * 24) + 1;
    const isPMBoolean = JSON.parse(data.isPM.toString());
    if (data.type == ERequestType.L || data.type == ERequestType.M) {
      dayOffs = dayOffs * 0;
    }
    if (data.type == ERequestType.A && isPMBoolean) {
      dayOffs = dayOffs * 0.5;
    }
    return dayOffs;
  }

  /**
   * createRequest
   * @param
   * @returns
   */
  async createRequest(
    userID: string,
    data: RequestCreateRequest,
  ): Promise<string> {
    const oUser = JSON.parse(userID);
    // validate input
    for (const key in data) {
      if (!data[key] || data[key].length == 0) {
        throw new BadRequestException(`${key} is require!`);
      }
    }
    data.isPM = JSON.parse(data.isPM.toString());
    data.isFull = JSON.parse(data.isFull.toString());
    if (data.isFull && data.isPM) {
      throw new InternalServerErrorException('isFull true, isPM can not true');
    }
    let annualLeave;
    try {
      annualLeave = await this.annualLeaveService.getAnnualLeaveOfyear(
        oUser.id,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    const dataReq = {
      startDateReq: data.startDate,
      endDateReq: data.endDate,
      type: data.type,
      isPM: data.isPM,
    };
    const dayOffs = await this.diffOffDays(dataReq);

    if (dayOffs > annualLeave.amount) {
      throw new InternalServerErrorException('Not enough vacation days');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    const payload = { ...data, requestor: oUser.id };
    const subDayOffs = annualLeave.amount - dayOffs;
    try {
      const createRequest = await queryRunner.manager.insert(
        RequestEntity,
        payload,
      );
      await this.annualLeaveService.updateAnnualLeaveAmount(
        oUser.id,
        subDayOffs,
      );
      const idReceive = await queryRunner.manager.findOne(UserEntity, {
        where: { division: { id: null } },
      });
      const dataNotification = {
        title: 'Yêu cầu đã được gửi',
        content: `${oUser.fullName} đã gửi yêu cầu đến bạn`,
      };
      await this.pushNotification(
        idReceive?.id,
        oUser,
        createRequest.generatedMaps[0]['id'],
        dataNotification,
        'notification',
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Create request fail - ${error.message}`,
      );
    }

    return 'Create request successfully';
  }

  async updateRequestStatus(
    req: UpdateRequestStatusReq,
    userID: string,
  ): Promise<string> {
    let requestFind, annualLeaveFind;
    const oUser = JSON.parse(userID);
    try {
      requestFind = await this.requestRepository.findOne({
        where: {
          id: req.requestID,
        },
      });
      annualLeaveFind = await this.annualLeaveService.getAnnualLeaveOfyear(
        requestFind.requestor,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Request not found - ${error.message}`,
      );
    }

    if (req.status != EReplyRequest.CANCEL && requestFind.userID == oUser?.id) {
      throw new InternalServerErrorException("You can't update your request");
    }
    let updateRequest;
    try {
      requestFind.status = req.status;
      requestFind.replyMessage = req.replyMessage;
      requestFind.approver = oUser.id;
      updateRequest = await this.requestRepository.save(requestFind);
    } catch (error) {
      throw new InternalServerErrorException(
        `update request fail - ${error.message}`,
      );
    }
    let isRejectOrCancel = false;

    if (
      req.status == EReplyRequest.REJECT ||
      req.status == EReplyRequest.CANCEL
    ) {
      isRejectOrCancel = true;
    }

    if (updateRequest && isRejectOrCancel) {
      const dataReq = {
        startDateReq: requestFind.startDate,
        endDateReq: requestFind.endDate,
        type: requestFind.type,
        isPM: requestFind.isPM,
      };
      let dayOffs = await this.diffOffDays(dataReq);
      dayOffs = annualLeaveFind.amount + dayOffs;
      try {
        await this.annualLeaveService.updateAnnualLeaveAmount(
          requestFind.requestor,
          dayOffs,
        );
      } catch (error) {
        throw new InternalServerErrorException(
          `fail to update annual leave - ${error.message}`,
        );
      }
    }
    const queryRunner = this.dataSource.createQueryRunner();
    const idReceive = await queryRunner.manager.findOne(RequestEntity, {
      where: { id: req.requestID },
    });
    const dataNotification = {
      title: 'Yêu cầu đã được phản hồi',
      content: `${oUser.fullName} đã phản hồi lại yêu cầu của bạn`,
    };
    await this.pushNotification(
      idReceive?.requestor,
      oUser,
      req.requestID,
      dataNotification,
      'notification',
    );

    return 'update successfully';
  }

  async updateRequest(
    dto: RequestCreateRequest,
    userID: string,
    requestID: string,
  ): Promise<string> {
    let requestFind, annualLeaveFind;
    dto.isFull = JSON.parse(dto.isFull.toString());
    dto.isPM = JSON.parse(dto.isPM.toString());
    try {
      requestFind = await this.requestRepository.findOne({
        where: {
          id: requestID,
          requestor: userID,
        },
      });
      annualLeaveFind = await this.annualLeaveService.getAnnualLeaveOfyear(
        requestFind.requestor,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `no request fail - ${error.message}`,
      );
    }
    const replyReqStatus = [
      EReplyRequest.ACCEPT,
      EReplyRequest.CANCEL,
      EReplyRequest.REJECT,
    ];
    if (replyReqStatus.includes(requestFind.status)) {
      throw new InternalServerErrorException(
        'Request has been approved, cannot be updated',
      );
    }
    let isNewInfo = false;
    for (const key in dto) {
      let isDate = false;
      if (key == 'startDate' || key == 'endDate') {
        isDate = true;
      }
      if (dto[key] != requestFind[key] && !isDate) {
        isNewInfo = true;
      }
      if (isDate) {
        const date = new Date(dto[key]).toLocaleDateString();
        const dateCompare = new Date(requestFind[key]).toLocaleDateString();
        if (date != dateCompare) {
          isNewInfo = true;
        }
      }
    }
    if (!isNewInfo) {
      throw new InternalServerErrorException('No new information');
    }

    let updateReq;
    try {
      updateReq = await this.requestRepository.update(
        {
          id: requestID,
        },
        dto,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `update request fail - ${error.message}`,
      );
    }
    if (
      updateReq &&
      (dto.type == ERequestType.A || requestFind.type == ERequestType.A)
    ) {
      const dataReqUpdate = {
        startDateReq: dto.startDate,
        endDateReq: dto.endDate,
        type: dto.type,
        isPM: dto.isPM,
      };
      const dataReqFind = {
        startDateReq: requestFind.startDate,
        endDateReq: requestFind.endDate,
        type: requestFind.type,
        isPM: requestFind.isPM,
      };
      const dayOffsUpdate = await this.diffOffDays(dataReqUpdate);
      const dayOffsFind = await this.diffOffDays(dataReqFind);
      if (dayOffsUpdate != dayOffsFind) {
        let modifyDayOffs = dayOffsFind - dayOffsUpdate;
        modifyDayOffs = annualLeaveFind.amount + modifyDayOffs;
        try {
          await this.annualLeaveService.updateAnnualLeaveAmount(
            requestFind.requestor,
            modifyDayOffs,
          );
        } catch (error) {
          throw new InternalServerErrorException(
            `fail to update annual leave - ${error.message}`,
          );
        }
      }
    }

    return 'Update successfully';
  }

  async deleteRequest(requestID: string): Promise<string> {
    try {
      await this.requestRepository.delete({ id: requestID });
      return 'Delete requests successfully!!!';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async filterRequest(
    filter: FilterRequest,
    pagination: UserPagination,
  ): Promise<IPaginateResponse<void>> {
    let { sizePage, currentPage } = pagination;
    sizePage = Number(sizePage);
    currentPage = Number(currentPage);

    const offset = sizePage * (currentPage - 1);
    let whereCondition = {};
    if (Object.keys(filter).length != 0) {
      for (const key in filter) {
        if (key != 'createdAt' && key != 'requestorName') {
          whereCondition = Object.assign(whereCondition, {
            [key]: filter[key],
          });
        }
        if (key == 'createdAt') {
          whereCondition = Object.assign(whereCondition, {
            [key]: ILike(`%${filter[key]}%`),
          });
        }
        if (key == 'requestorName') {
          whereCondition = Object.assign(whereCondition, {
            user: {
              profile: {
                fullName: ILike(`%${filter[key]}%`),
              },
            },
          });
        }
      }
    }

    let res = undefined;
    try {
      res = await this.requestRepository.findAndCount({
        skip: offset,
        take: sizePage,
        where: whereCondition,

        relations: {
          user: {
            profile: true,
          },
        },
        select: {
          user: {
            id: true,
            profile: {
              profileId: true,
              fullName: true,
              avatar: true,
              role: true,
              phoneNumber: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `no request found - ${error.message}`,
      );
    }
    return paginateResponse<void>([res[0], res[1]], currentPage, sizePage);
  }

  async getAllDetailRequest(requestId: string): Promise<RequestEntity> {
    let res = undefined;
    try {
      res = await this.requestRepository.find({
        where: {
          id: requestId,
        },
        relations: {
          user: {
            profile: true,
          },
        },
        select: {
          user: {
            id: true,
            profile: {
              profileId: true,
              fullName: true,
              avatar: true,
              role: true,
              phoneNumber: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `no request found - ${error.message}`,
      );
    }

    return res;
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
      type: ETypeNotification.REQUEST,
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

  async createRequestEmployee(
    reqInfo: requestEmployee,
    requestor: string,
  ): Promise<string> {
    const { title, content, form } = reqInfo;
    for (const key in reqInfo) {
      if (!reqInfo[key] || reqInfo[key].length == 0) {
        throw new BadRequestException(`${key} is require!`);
      }
    }
    for (const key in form) {
      if (!form[key] || form[key].length == 0) {
        throw new BadRequestException(`${key} is require!`);
      }
    }
    const queryRunner = this.dataSource.createQueryRunner();
    const payloadReq = { title, content, type: ERequestType.U, requestor };
    try {
      const createRequest = await queryRunner.manager.insert(
        RequestEntity,
        payloadReq,
      );

      const insertUser = await this.userService.insertUserNoSendEmail(form);
    } catch (error) {
      throw new InternalServerErrorException(
        `Create request fail - ${error.message}`,
      );
    }
    return 'create request successfully';
  }
}
