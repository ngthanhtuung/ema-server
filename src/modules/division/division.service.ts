/* eslint-disable @typescript-eslint/no-explicit-any */
import DivisionRepository from './division.repository';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { DivisionEntity } from './division.entity';
import { BaseService } from '../base/base.service';
import {
  DivisionCreateRequest,
  DivisionUpdateRequest,
} from './dto/division.request';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DivisionResponse } from './dto/division.response';
import {
  EStatusAssignee,
  ETaskStatus,
  EUserStatus,
} from 'src/common/enum/enum';
import { DivisionPagination } from './dto/division.pagination';
import * as moment from 'moment-timezone';

@Injectable()
export class DivisionService extends BaseService<DivisionEntity> {
  constructor(
    @InjectRepository(DivisionEntity)
    private readonly divisionRepository: DivisionRepository,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(divisionRepository);
  }

  generalBuilderDivision(): SelectQueryBuilder<DivisionEntity> {
    return this.divisionRepository.createQueryBuilder('divisions');
  }

  /**
   * createDivision
   * @param division
   * @returns
   */
  async createDivision(division: DivisionCreateRequest): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.startTransaction();
      const divisionExist = await queryRunner.manager.findOne(DivisionEntity, {
        where: { divisionName: division.divisionName },
      });
      if (divisionExist) {
        throw new BadRequestException('Division already exists');
      }
      await queryRunner.manager.insert(DivisionEntity, {
        divisionName: division.divisionName,
        description: division.description,
        status: true,
      });
      await queryRunner.commitTransaction();
      return `Division created successfully`;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    }
  }

  /**
   * getListAssigneeEmployee
   * @param condition
   * @returns
   */
  async getListAssigneeEmployee(condition: object): Promise<DivisionResponse> {
    try {
      const fieldName = condition['fieldName'];
      const conValue = condition['conValue'];
      const startDate = condition['startDate'];
      const endDate = condition['endDate'];
      const idDivision = (
        await this.findOne({
          where: {
            users: {
              [fieldName]: conValue,
            },
          },
        })
      ).id;
      const division: any = await this.findOne({
        where: {
          id: idDivision,
        },
        order: {
          users: {
            role: {
              roleName: 'DESC',
            },
            assignee: {
              task: {
                priority: 'desc',
              },
            },
          },
        },
        select: {
          users: {
            id: true,
            email: true,
            role: {
              roleName: true,
            },
            profile: {
              avatar: true,
              fullName: true,
            },
            assignee: true,
          },
          assignEvents: true,
        },
        relations: {
          users: {
            profile: true,
            role: true,
            assignee: {
              task: {
                eventDivision: {
                  event: true,
                },
              },
            },
          },
          assignEvents: true,
        },
      });
      division.users = (division?.users || [])?.map((item: any) => {
        const listEvent = item?.assignee?.reduce((listEvent, object) => {
          const startDateFormat = moment(object?.task?.startDate).format(
            'YYYY-MM-DD',
          );
          const endDateFormat = moment(object?.task?.endDate).format(
            'YYYY-MM-DD',
          );
          const checkStartDate =
            startDateFormat >= startDate && startDateFormat <= endDate;
          const checkEndDate =
            endDateFormat >= startDate && endDateFormat <= endDate;
          console.log('object:', object);

          if (
            checkStartDate &&
            checkEndDate &&
            object?.status === EStatusAssignee.ACTIVE &&
            [ETaskStatus.PENDING, ETaskStatus.PROCESSING].includes(
              object?.task?.status,
            )
          ) {
            const resTask = {
              id: object?.task?.id,
              title: object?.task?.title,
              startDate: startDateFormat,
              endDate: endDateFormat,
              priority: object?.task?.priority,
              status: object?.task?.status,
            };

            const eventIndex = listEvent.findIndex(
              (event) =>
                event?.eventID === object?.task?.eventDivision?.event?.id,
            );

            if (eventIndex === -1) {
              listEvent.push({
                eventID: object?.task.eventDivision?.event.id,
                eventName: object?.task?.eventDivision?.event?.eventName,
                listTask: [resTask],
                totalTaskInEvent: 1,
              });
            } else {
              listEvent[eventIndex].listTask.push(resTask);
              listEvent[eventIndex].totalTaskInEvent++;
            }
          }

          return listEvent;
        }, []);
        const totalTask = listEvent.reduce(
          (total, data) => (total += data?.totalTaskInEvent),
          0,
        );
        delete item?.assignee;
        return {
          ...item,
          listEvent: listEvent,
          totalTask: totalTask || 0,
          isFree: totalTask === 0 ? true : false,
        };
      });
      if (!division) {
        throw new NotFoundException('Division not found');
      }
      const res = {
        ...division,
        assignEvents: division?.assignEvents?.length || 0,
      };
      return res;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * getListAssigneeEmployee
   * @param condition
   * @returns
   */
  async getListAssigneeDivision(
    condition: object,
  ): Promise<DivisionResponse[]> {
    try {
      const eventID = condition['eventID'];
      const startDate = condition['startDate'];
      const endDate = condition['endDate'];
      const getDivision = await this.divisionRepository.find({
        where: {
          assignEvents: {
            event: {
              id: eventID,
            },
          },
        },
        order: {
          users: {
            role: {
              roleName: 'DESC',
            },
            assignee: {
              task: {
                priority: 'desc',
              },
            },
          },
        },
        select: {
          users: {
            id: true,
            email: true,
            role: {
              roleName: true,
            },
            profile: {
              avatar: true,
              fullName: true,
            },
            assignee: true,
          },
          assignEvents: true,
        },
        relations: {
          users: {
            profile: true,
            role: true,
            assignee: {
              task: {
                eventDivision: {
                  event: true,
                },
              },
            },
          },
          assignEvents: {
            event: true,
          },
        },
      });
      console.log('getDivsion:', getDivision);
      console.log('getDivsion:', getDivision.length);
      const finalData = [];
      for (const division of getDivision) {
        const item = division?.users?.[0];
        console.log('Item:', item);

        const listEvent: any = item?.assignee?.reduce(
          (listEvent: any, object) => {
            const startDateFormat = moment(object?.task?.startDate).format(
              'YYYY-MM-DD',
            );
            const endDateFormat = moment(object?.task?.endDate).format(
              'YYYY-MM-DD',
            );
            const checkStartDate =
              startDateFormat >= startDate && startDateFormat <= endDate;
            const checkEndDate =
              endDateFormat >= startDate && endDateFormat <= endDate;

            if (
              (checkStartDate || checkEndDate) &&
              object?.status === EStatusAssignee.ACTIVE &&
              [ETaskStatus.PENDING, ETaskStatus.PROCESSING].includes(
                object?.task?.status,
              )
            ) {
              const resTask = {
                id: object?.task?.id,
                title: object?.task?.title,
                startDate: startDateFormat,
                endDate: endDateFormat,
                priority: object?.task?.priority,
                status: object?.task?.status,
              };

              const eventIndex = listEvent.findIndex(
                (event) =>
                  event?.eventID === object?.task?.eventDivision?.event?.id,
              );

              if (eventIndex === -1) {
                listEvent.push({
                  eventID: object?.task.eventDivision?.event.id,
                  eventName: object?.task?.eventDivision?.event?.eventName,
                  listTask: [resTask],
                  totalTaskInEvent: 1,
                });
              } else {
                listEvent[eventIndex].listTask.push(resTask);
                listEvent[eventIndex].totalTaskInEvent++;
              }
            }

            return listEvent;
          },
          [],
        );
        console.log('listEvent:', listEvent);

        const totalTask = listEvent.reduce(
          (total, data) => (total += data?.totalTaskInEvent),
          0,
        );
        delete item?.assignee;
        const dataMapUser: any = [
          {
            ...item,
            listEvent: listEvent,
            totalTask: totalTask || 0,
            isFree: totalTask === 0 ? true : false,
          },
        ];
        division.users = dataMapUser;
        finalData.push({
          ...division,
          assignEvents: division?.assignEvents?.length || 0,
        });
      }
      return finalData;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * getListUserDivisionByIdOrEmail
   * @param condition
   * @returns
   */
  async getListUserDivisionByIdOrEmail(
    condition: object,
  ): Promise<DivisionResponse> {
    try {
      const fieldName = condition['fieldName'];
      const conValue = condition['conValue'];
      const idDivision = (
        await this.findOne({
          where: {
            users: {
              [fieldName]: conValue,
            },
          },
        })
      ).id;
      const division = await this.findOne({
        where: {
          id: idDivision,
        },
        order: {
          users: {
            role: {
              roleName: 'DESC',
            },
          },
        },
        select: {
          users: {
            id: true,
            email: true,
            role: {
              roleName: true,
            },
            profile: {
              avatar: true,
              fullName: true,
            },
          },
          assignEvents: true,
        },
        relations: {
          users: {
            profile: true,
            role: true,
          },
          assignEvents: true,
        },
      });

      if (!division) {
        throw new NotFoundException('Division not found');
      }
      const res = {
        ...division,
        assignEvents: division?.assignEvents?.length || 0,
      };
      return res;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * getDivisionById
   * @param ids
   * @returns
   */
  async getDivisionById(id: string): Promise<DivisionResponse> {
    try {
      const division = await this.findOne({
        where: { id: id },
        select: {
          users: {
            id: true,
            email: true,
            role: {
              roleName: true,
            },
            profile: {
              avatar: true,
              fullName: true,
            },
          },
          assignEvents: true,
        },
        relations: {
          users: {
            profile: true,
            role: true,
          },
          assignEvents: true,
        },
      });

      if (!division) {
        throw new NotFoundException('Division not found');
      }
      const res = {
        ...division,
        assignEvents: division.assignEvents.length || 0,
      };
      return res;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateDivision(
    id: string,
    data: DivisionUpdateRequest,
  ): Promise<string> {
    try {
      const divisionExist = await this.getDivisionById(id);
      if (!divisionExist) {
        throw new NotFoundException('Division not found');
      }
      if (data.status !== divisionExist.status) {
        const query = this.generalBuilderDivision();
        query.leftJoin('users', 'users', 'users.divisionId = divisions.id');
        query.where('divisions.id = :id', { id: id });
        query.andWhere('users.status = :status', {
          status: EUserStatus.ACTIVE,
        });
        const account = await query.getCount();
        if (account > 0) {
          throw new BadRequestException(
            'Division is being used. Please modify the account first',
          );
        }
      }
      const result = await this.divisionRepository.update(id, data);
      if (result.affected === 0) {
        throw new InternalServerErrorException('Update failed');
      }
      return 'Update successfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * getAllDivision
   * @param divisionPagination
   * @returns
   */
  async getAllDivision(
    divisionPagination: DivisionPagination,
    mode: number,
  ): Promise<unknown> {
    try {
      const { currentPage, sizePage } = divisionPagination;
      const offset = sizePage * (currentPage - 1);
      let getDivsion = await this.divisionRepository.find({
        skip: offset,
        take: sizePage,
        order: {
          users: {
            role: {
              roleName: 'DESC',
            },
          },
        },
        select: {
          users: {
            id: true,
            email: true,
            role: {
              roleName: true,
            },
            profile: {
              avatar: true,
              fullName: true,
            },
          },
          assignEvents: true,
        },
        relations: {
          users: {
            profile: true,
            role: true,
          },
          assignEvents: true,
        },
      });
      console.log('getDivsion:', getDivsion);

      let listDivisionHaveStaff = [];
      if (mode === 2) {
        listDivisionHaveStaff = await this.divisionRepository.find({
          where: {
            users: {
              isStaff: true,
            },
          },
          relations: {
            users: true,
          },
        });
        console.log('listDivisionHaveStaff:', listDivisionHaveStaff);

        getDivsion = getDivsion?.filter((item) =>
          listDivisionHaveStaff.find((data) => data.id !== item.id),
        );
      }
      const finalData = getDivsion.map((item) => {
        return {
          ...item,
          assignEvents: item?.assignEvents?.length || 0,
        };
      });
      return finalData;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * updateStatus
   * @param divisionId
   * @returns
   */
  async updateStatus(divisionId: string): Promise<string> {
    try {
      const division = await this.getDivisionById(divisionId);
      if (!division) {
        throw new NotFoundException('Division not found');
      }
      if (division.status === true) {
        const query = this.generalBuilderDivision();
        query.leftJoin('users', 'users', 'users.divisionId = divisions.id');
        query.where('divisions.id = :id', { id: divisionId });
        query.andWhere('users.status = :status', {
          status: EUserStatus.ACTIVE,
        });
        const account = await query.getCount();
        if (account > 0) {
          throw new BadRequestException(
            'Division is being used. Please modify the account first',
          );
        }
      }
      const result = await this.divisionRepository.update(divisionId, {
        status: !division.status,
      });
      if (result.affected === 0) {
        throw new InternalServerErrorException('Update failed');
      }
      if (division.status === true) {
        return 'Disable division succesfully';
      }
      return 'Enable division succesfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
