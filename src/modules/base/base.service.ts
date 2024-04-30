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
    isRelease?: boolean,
  ): Promise<void> {
    // establish real database connection using our new query runner
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log('Query Runner is release: ', isRelease);
    try {
      await fn(queryRunner);
      await queryRunner.commitTransaction();
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
