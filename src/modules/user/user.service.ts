import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { AUTH_ERROR_MESSAGE } from 'src/common/constants/constants';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserCreateRequest, UserPagination } from 'src/modules/user/dto/user.request';
import { UserResponse, PayloadUser, UserProfile } from 'src/modules/user/dto/user.response';
import { BaseService } from 'src/modules/base/base.service';
import { ProfileEntity } from 'src/modules/profile/profile.entity';
import { SharedService } from 'src/shared/shared.service';
import {
  DataSource,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
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

  async findByIdV2(id: string): Promise<UserProfile> {
    try {
      const query = this.generalBuilderUser();
      query.leftJoin('profile', 'profile', 'user.id = profile.profileId')
        .leftJoin('division', 'division', 'division.id = user.divisionId')
        .where('user.id = :id', { id });
      query.select('profile.role as role')
        .addSelect([
          'user.id as id',
          'profile.fullName as fullName',
          'user.email as email',
          'profile.phoneNumber as phoneNumber',
          'profile.dob as dob',
          'profile.nationalId as nationalId',
          'profile.gender as gender',
          'profile.address as address',
          'profile.avatar as avatar',
          'division.divisionName as divisionName',
        ])
      const data = await query.execute()
      if (!data) {
        throw new BadRequestException('User not found');
      }
      return plainToInstance(UserProfile, data[0]);
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }


  async findByDivision(divisionId: string, userPagination: UserPagination): Promise<IPaginateResponse<UserProfile>> {
    try {
      const { currentPage, sizePage } = userPagination;
      const query = this.generalBuilderUser();

      query.leftJoin('profile', 'profile', 'user.id = profile.profileId')
        .leftJoin('division', 'division', 'division.id = user.divisionId')
        .where('division.id = :divisionId', { divisionId })
      query.select('profile.role as role')
        .addSelect([
          'user.id as id',
          'profile.fullName as fullName',
          'user.email as email',
          'profile.phoneNumber as phoneNumber',
          'profile.dob as dob',
          'profile.nationalId as nationalId',
          'profile.gender as gender',
          'profile.address as address',
          'profile.avatar as avatar',
          'division.divisionName as divisionName',
        ])
      const [result, total] = await Promise.all([
        query.offset((sizePage) * ((currentPage) - 1))
          .limit(sizePage).execute(),
        query.getCount()
      ])
      if (total === 0) {
        throw new NotFoundException('User not found');
      }
      console.log('Result: ', result.length)
      const listUser = plainToInstance(UserProfile, result)
      return paginateResponse<UserProfile>(
        [listUser, total],
        currentPage as number,
        sizePage as number
      )
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
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
      await this.shareService.sendConfirmEmail(email, generatePassword);
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
