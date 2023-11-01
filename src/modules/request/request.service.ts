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
} from './dto/request.request';
import { AnnualLeaveEntity } from '../annual-leave/annual-leave.entity';
import { EReplyRequest, ERequestType } from 'src/common/enum/enum';
import { UserPagination } from '../user/dto/user.request';

@Injectable()
export class RequestService extends BaseService<RequestEntity> {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    @Inject(forwardRef(() => AnnualLeaveService))
    private readonly annualLeaveService: AnnualLeaveService,
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
    // validate input
    for (const key in data) {
      if (!data[key] || data[key].length == 0) {
        throw new BadRequestException(`${key} is require!`);
      }
    }
    if (data.isFull == data.isPM) {
      throw new InternalServerErrorException('isFull can not equal isPM');
    }
    let annualLeave;
    try {
      annualLeave = await this.annualLeaveService.getAnnualLeaveOfyear(userID);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    data.isPM = JSON.parse(data.isPM.toString());
    data.isFull = JSON.parse(data.isFull.toString());
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
    const payload = { ...data, requestor: userID };
    const subDayOffs = annualLeave.amount - dayOffs;
    try {
      await queryRunner.manager.insert(RequestEntity, payload);
      await this.annualLeaveService.updateAnnualLeaveAmount(userID, subDayOffs);
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

    if (req.status != EReplyRequest.CANCEL && requestFind.userID == userID) {
      throw new InternalServerErrorException("You can't update your request");
    }
    let updateRequest;
    try {
      requestFind.status = req.status;
      requestFind.replyMessage = req.replyMessage;
      requestFind.approver = userID;
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

  async filterRequest(
    filter: FilterRequest,
    pagination: UserPagination,
  ): Promise<RequestEntity> {
    let { sizePage, currentPage } = pagination;
    sizePage = Number(sizePage);
    currentPage = Number(currentPage);

    const offset = sizePage * (currentPage - 1);
    let whereCondition = {};
    if (Object.keys(filter).length != 0) {
      for (const key in filter) {
        if (key != 'createdAt') {
          whereCondition = Object.assign(whereCondition, {
            [key]: filter[key],
          });
        }
        if (key == 'createdAt') {
          whereCondition = Object.assign(whereCondition, {
            [key]: ILike(`%${filter[key]}%`),
          });
        }
      }
    }

    let res;
    try {
      res = await this.requestRepository.find({
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

    return res;
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
}
