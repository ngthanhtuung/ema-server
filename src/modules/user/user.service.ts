import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { AUTH_ERROR_MESSAGE } from 'src/common/constants/constants';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserCreateRequest } from 'src/modules/user/dto/user.request';
import { UserResponse, PayloadUser } from 'src/modules/user/dto/user.response';
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
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    private shareService: SharedService,
  ) {
    super(userRepository);
  }

  /**
   * generalBuilderUser
   * @returns
   */
  generalBuilderUser(): SelectQueryBuilder<UserEntity> {
    return this.userRepository.createQueryBuilder('user');
  }

  /**
   * findByEmail
   * @param email
   * @returns
   */
  async findByEmail(email: string): Promise<UserResponse> {
    const query = this.generalBuilderUser();

    query
      .leftJoin('profile', 'profile', 'user.id = profile.profileId')
      .where('user.email = :email', { email });

    query
      .select('profile.role as role')
      .addSelect([
        'user.id as id',
        'user.password as password',
        'user.status as status',
      ]);

    const data = await query.execute();

    return plainToClass(UserResponse, data[0]);
  }

  /**
   * findById
   * @param id
   * @returns
   */
  async findById(id: string): Promise<PayloadUser> {
    const query = this.generalBuilderUser();
    query
      .leftJoin('profile', 'profile', 'user.id = profile.profileId')
      .where('user.id = :id', { id });

    query
      .select('profile.role as role')
      .addSelect([
        'user.id as id',
        'user.status as status',
        'profile.role as role',
        'profile.fullName as fullName',
      ]);

    const data = await query.execute();

    return plainToClass(PayloadUser, data[0]);
  }

  /**
   * insertUser
   * @param userCreateRequest
   * @returns
   */
  async insertUser(userCreateRequest: UserCreateRequest): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    const { email, ...profile } = userCreateRequest;
    const generatePassword = this.shareService.generatePassword(8);
    const password = await this.shareService.hashPassword(generatePassword);
    const callback = async (queryRunner: QueryRunner): Promise<void> => {
      const userExist = await queryRunner.manager.findOne(UserEntity, {
        where: { email: userCreateRequest.email },
      });

      if (userExist) {
        throw new BadRequestException(AUTH_ERROR_MESSAGE.EMAIL_EXIST);
      }

      const createUser = await queryRunner.manager.insert(UserEntity, {
        email,
        password,
      });

      await queryRunner.manager.insert(ProfileEntity, {
        ...profile,
        profileId: createUser.generatedMaps[0]['id'],
      });
      await this.shareService.sendConfirmEmail(email, password);
    };

    await this.transaction(callback, queryRunner);

    return 'create user success';
  }

  /**
   * updateRefreshToken
   * @param id
   * @param refreshToken
   * @returns
   */
  async updateRefreshToken(id: string, refreshToken: string): Promise<boolean> {
    try {
      await this.userRepository.update(
        { id: id },
        { refreshToken: refreshToken },
      );
      return true;
    } catch (err) {
      return false;
    }
  }
}
