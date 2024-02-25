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
import { plainToClass } from 'class-transformer';
import { DivisionResponse } from './dto/division.response';
import { EUserStatus } from 'src/common/enum/enum';
import { DivisionPagination } from './dto/division.pagination';

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
        assignEvents: division.assignEvents.length || 0,
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
      const fieldName = 'staffId';
      const whereCondition =
        mode === 2
          ? {
              [fieldName]: null,
            }
          : undefined;
      const offset = sizePage * (currentPage - 1);
      const res = await this.divisionRepository.find({
        where: whereCondition,
        skip: offset,
        take: sizePage,
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
      const finalData = res.map((item) => {
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
