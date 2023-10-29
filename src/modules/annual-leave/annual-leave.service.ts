import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AnnualLeaveEntity } from './annual-leave.entity';
import { DataSource, QueryRunner, SelectQueryBuilder } from 'typeorm';
import AnnualLeaveRepository from './annual-leave.repository';

@Injectable()
export class AnnualLeaveService extends BaseService<AnnualLeaveEntity> {
  constructor(
    @InjectRepository(AnnualLeaveEntity)
    private readonly annualLeaveRepository: AnnualLeaveRepository,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(annualLeaveRepository);
  }
  generalBuilderAnnualLeave(): SelectQueryBuilder<AnnualLeaveEntity> {
    return this.annualLeaveRepository.createQueryBuilder('annual_leaves');
  }

  /**
   * getAnnualLeaveByUser
   * @param ...
   * @returns
   */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAnnualLeaveOfyear(userID: string, year?: number): Promise<any> {
    const currentYear = new Date().getFullYear();
    if (!year) {
      year = currentYear;
    }
    const query = this.generalBuilderAnnualLeave();
    let res;
    query
      .select([
        'annual_leaves.year as year, annual_leaves.amount as amount, annual_leaves.userId as userID',
      ])
      .where('annual_leaves.year = :year', { year })
      .andWhere('annual_leaves.userID = :userID', { userID });

    try {
      res = await query.execute();
      if (res.length == 0) {
        return [];
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Get annual leave fail - ${error.message}`,
      );
    }
    return res[0];
  }

  async updateAnnualLeaveAmount(
    userID: string,
    amount: number,
  ): Promise<boolean> {
    if (amount == 0) return;
    const currentYear = new Date().getFullYear();
    try {
      const annualLeave = await this.annualLeaveRepository.findOne({
        where: {
          userID,
          year: currentYear,
        },
      });
      if (!annualLeave) {
        throw new InternalServerErrorException('not vacation days found');
      }
      annualLeave.amount = amount;
      await this.annualLeaveRepository.save(annualLeave);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return true;
  }
}
