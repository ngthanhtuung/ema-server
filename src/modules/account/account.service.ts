import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { AUTH_ERROR_MESSAGE } from 'src/common/constants/constants';
import { AccountEntity } from 'src/modules/account/account.entity';
import { AccountCreateRequest } from 'src/modules/account/dto/account.request';
import {
  AccountResponse,
  PayloadAccount,
} from 'src/modules/account/dto/account.response';
import { BaseService } from 'src/modules/base/base.service';
import { ProfileEntity } from 'src/modules/profile/profile.entity';
import { SharedService } from 'src/shared/shared.service';
import {
  DataSource,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
@Injectable()
export class AccountService extends BaseService<AccountEntity> {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    private shareService: SharedService,
  ) {
    super(accountRepository);
  }

  generalBuilderAccount(): SelectQueryBuilder<AccountEntity> {
    return this.accountRepository.createQueryBuilder('account');
  }

  async findByEmail(email: string): Promise<AccountResponse> {
    const query = this.generalBuilderAccount();

    query
      .leftJoin('profile', 'profile', 'account.id = profile.profileId')
      .where('account.email = :email', { email });

    query
      .select('profile.role as role')
      .addSelect([
        'account.id as id',
        'account.password as password',
        'account.status as status',
      ]);

    const data = await query.execute();

    return plainToClass(AccountResponse, data[0]);
  }

  async findById(id: string) {
    const query = this.generalBuilderAccount();
    query
      .leftJoin('profile', 'profile', 'account.id = profile.profileId')
      .where('account.id = :id', { id });

    query
      .select('profile.role as role')
      .addSelect([
        'account.id as id',
        'account.status as status',
        'profile.role as role',
        'profile.fullName as fullName',
      ]);

    const data = await query.execute();

    return plainToClass(PayloadAccount, data[0]);
  }

  async insertAccount(
    accountCreateRequest: AccountCreateRequest,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    let { email, password, ...profile } = accountCreateRequest;
    password = await this.shareService.hashPassword(password);
    const callback = async (queryRunner: QueryRunner) => {
      const userExist = await queryRunner.manager.findOne(AccountEntity, {
        where: { email: accountCreateRequest.email },
      });

      if (userExist) {
        throw new BadRequestException(AUTH_ERROR_MESSAGE.EMAIL_EXIST);
      }

      const createAccount = await queryRunner.manager.insert(AccountEntity, {
        email,
        password,
      });

      await queryRunner.manager.insert(ProfileEntity, {
        ...profile,
        profileId: createAccount.generatedMaps[0]['id'],
      });
    };

    await this.transaction(callback, queryRunner);

    return 'Create account sucessfully';
  }
}
