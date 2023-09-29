import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  QueryRunner,
  Repository,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export class BaseService<T extends BaseEntity> {
  constructor(private readonly repository: Repository<T>) {}

  create(entity: DeepPartial<T>): T {
    return this.repository.create(entity);
  }

  async save(entity: DeepPartial<T>): Promise<T> {
    return this.repository.save(entity);
  }

  async query(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T> {
    return this.repository.findOne(options);
  }

  async transaction(
    fn: (queryRunner: QueryRunner) => Promise<void>,
    queryRunner: QueryRunner,
  ) {
    // establish real database connection using our new query runner
    await queryRunner.connect();

    // lets now open a new transaction:
    await queryRunner.startTransaction();

    try {
      await fn(queryRunner);
      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors let's rollback changes we made

      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }
  }
}
