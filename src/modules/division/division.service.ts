import { Injectable, InternalServerErrorException } from '@nestjs/common';
import DivisionRepository from './division.repository';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { DivisionEntity } from './division.entity';
import { BaseService } from '../base/base.service';
import DivisionCreateRequest from './dto/division.request';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DivisionService extends BaseService<DivisionEntity> {

    constructor(
        @InjectRepository(DivisionEntity)
        private readonly divisionRepository: DivisionRepository,
        @InjectDataSource()
        private dataSource: DataSource,
    ) {
        super(divisionRepository)
    }

    generalBuilderDivision(): SelectQueryBuilder<DivisionEntity> {
        return this.divisionRepository.createQueryBuilder('division');
    }

    async createDivision(division: DivisionCreateRequest): Promise<string> {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            const divisionExist = await queryRunner.manager.findOne(DivisionEntity, {
                where: { divisionName: division.divisionName }
            });
            if (divisionExist) {
                throw new InternalServerErrorException('Division already exists');
            }
            await queryRunner.manager.insert(DivisionEntity, {
                divisionName: division.divisionName,
                status: true,
            })
            await queryRunner.commitTransaction();
            return `Division created successfully`
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException(err);
        }
    }
}
