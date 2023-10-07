import { EUserStatus } from './../../common/enum/enum';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import {
  AUTH_ERROR_MESSAGE,
  DIVISION_ERROR_MESSAGE,
  USER_ERROR_MESSAGE,
} from 'src/common/constants/constants';
import { UserEntity } from 'src/modules/user/user.entity';
import {
  UserCreateRequest,
  UserPagination,
  UserProfileUpdateRequest,
  UserProfileUpdateRequestV2,
  // UserProfileUpdateRequest,
} from 'src/modules/user/dto/user.request';
import {
  UserResponse,
  PayloadUser,
  UserProfile,
  VerifyCode,
} from 'src/modules/user/dto/user.response';
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
import { ERole } from 'src/common/enum/enum';
import { DivisionEntity } from '../division/division.entity';
@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
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
        'user.email as email',
        'user.status as status',
        'profile.role as role',
        'profile.fullName as fullName',
      ]);

    const data = await query.execute();

    return plainToClass(PayloadUser, data[0]);
  }

  /**
   * findByIdV2
   * @param id
   * @returns
   */

  async findByIdV2(id: string): Promise<UserProfile> {
    try {
      const query = this.generalBuilderUser();
      query
        .leftJoin('profile', 'profile', 'user.id = profile.profileId')
        .leftJoin('division', 'division', 'division.id = user.divisionId')
        .where('user.id = :id', { id });
      query
        .select('profile.role as role')
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
        ]);
      const data = await query.execute();
      if (!data) {
        throw new BadRequestException('User not found');
      }
      return plainToInstance(UserProfile, data[0]);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   *
   * @param divisionId
   * @param userPagination
   * @param role
   * @returns
   */
  async findByDivision(
    divisionId: string,
    userPagination: UserPagination,
    role: string,
  ): Promise<IPaginateResponse<UserProfile>> {
    try {
      const { currentPage, sizePage } = userPagination;
      const query = this.generalBuilderUser();
      query
        .leftJoin('profile', 'profile', 'user.id = profile.profileId')
        .leftJoin('division', 'division', 'division.id = user.divisionId');
      if (divisionId) {
        query.where('division.id = :divisionId', { divisionId });
      }
      if (role === ERole.STAFF) {
        query.andWhere('user.status = :status', { status: EUserStatus.ACTIVE });
      }
      query
        .select('profile.role as role')
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
          'user.status as status',
        ]);
      const [result, total] = await Promise.all([
        query
          .offset(sizePage * (currentPage - 1))
          .limit(sizePage)
          .execute(),
        query.getCount(),
      ]);
      console.info(query.getSql());
      if (total === 0) {
        throw new NotFoundException('User not found');
      }
      const listUser = plainToInstance(UserProfile, result);
      return paginateResponse<UserProfile>(
        [listUser, total],
        currentPage as number,
        sizePage as number,
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
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

      const division = await queryRunner.manager.findOne(DivisionEntity, {
        where: { id: userCreateRequest.divisionId },
      });

      if (!division) {
        throw new BadRequestException(
          DIVISION_ERROR_MESSAGE.DIVISION_NOT_EXIST,
        );
      }

      const createUser = await queryRunner.manager.insert(UserEntity, {
        email,
        password,
        division,
      });

      await queryRunner.manager.insert(ProfileEntity, {
        ...profile,
        profileId: createUser.generatedMaps[0]['id'],
      });
      await this.shareService.sendConfirmEmail(email, generatePassword);
    };

    await this.transaction(callback, queryRunner);

    return 'Create user successfully';
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

  /**
   * updateStatus
   * @param userId
   * @param status
   * @param loginUserId
   * @returns
   */
  async updateStatus(
    userId: string,
    status: EUserStatus,
    loginUserId: string,
  ): Promise<string> {
    try {
      const userExisted = await this.findById(userId);
      if (!userExisted) {
        throw new BadRequestException(USER_ERROR_MESSAGE.USER_NOT_EXIST);
      }
      if (userExisted.id === loginUserId) {
        throw new BadRequestException(USER_ERROR_MESSAGE.CANT_CHANGE);
      }
      await this.userRepository.update({ id: userId }, { status: status });
      return status === EUserStatus.ACTIVE
        ? 'Active user success'
        : 'Inactive user success';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * updateStatus
   * @param userId
   * @param status
   * @param loginUserId
   * @returns
   */
  async updatePassword(
    password: string,
    modifiedDate: Date,
    loginUserId: string,
  ): Promise<void> {
    try {
      await this.userRepository.update(
        { id: loginUserId },
        {
          password: password,
          updatedAt: modifiedDate,
        },
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * updateCodeAndIssueDate
   * @param userId
   * @param authCode
   * @param issueDate
   * @returns
   */
  async updateCodeAndIssueDate(
    userId: string,
    authCode: string,
    issueDate: string,
  ): Promise<void> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const callback = async (queryRunner: QueryRunner): Promise<void> => {
        await queryRunner.manager.update(
          UserEntity,
          { id: userId },
          {
            issueDate: issueDate,
            authCode: authCode,
          },
        );
      };

      await this.transaction(callback, queryRunner);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * findByEmail
   * @param email
   * @returns
   */
  async getAuthCodeAndIssueDate(email: string): Promise<VerifyCode> {
    const query = this.generalBuilderUser();
    query
      .select(['user.authCode as authCode', 'user.issueDate as issueDate'])
      .where('user.email = :email', { email });
    const data = await query.execute();
    return plainToClass(VerifyCode, data[0]);
  }

  /**
   * updateProfile
   * @param userId
   * @param data
   * @returns
   */
  async updateProfile(
    userId: string,
    data: UserProfileUpdateRequest,
  ): Promise<string> {
    try {
      const existedUser = await this.findById(userId);
      if (!existedUser) {
        throw new BadRequestException(USER_ERROR_MESSAGE.USER_NOT_EXIST);
      }
      const queryRunner = this.dataSource.createQueryRunner();
      const result = await queryRunner.manager.update(
        ProfileEntity,
        { profileId: userId },
        {
          ...data,
        },
      );
      if (result.affected > 0) {
        return 'Update profile successfully';
      }
      return 'Update fail';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateProfileV2(
    loginUserId: string,
    data: UserProfileUpdateRequestV2,
    userIdUpdate: string,
  ): Promise<string> {
    try {
      const existedUser = await this.findById(userIdUpdate);
      if (!existedUser) {
        throw new BadRequestException(USER_ERROR_MESSAGE.USER_NOT_EXIST);
      }
      if (loginUserId === userIdUpdate) {
        throw new BadRequestException(USER_ERROR_MESSAGE.CANT_CHANGE);
      }
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.manager.update(
        UserEntity,
        { id: userIdUpdate },
        {
          email: data.email,
        },
      );
      const callbacks = async (queryRunner: QueryRunner): Promise<void> => {
        await queryRunner.manager.update(
          ProfileEntity,
          { profileId: userIdUpdate },
          {
            phoneNumber: data.phoneNumber,
            fullName: data.fullName,
            dob: data.dob,
            nationalId: data.nationalId,
            gender: data.gender,
            address: data.address,
            avatar: data.avatar,
          },
        );
      };
      await this.transaction(callbacks, queryRunner);
      return 'Update profile successfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
