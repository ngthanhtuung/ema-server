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
    return this.userRepository.createQueryBuilder('users');
  }

  /**
   * findByEmail
   * @param email
   * @returns
   */
  async findByEmail(email: string): Promise<UserResponse> {
    const query = this.generalBuilderUser();

    query
      .leftJoin('profiles', 'profiles', 'users.id = profiles.profileId')
      .where('users.email = :email', { email });

    query
      .select('profiles.role as role')
      .addSelect([
        'users.id as id',
        'users.password as password',
        'users.status as status',
        'users.divisionId as divisionId',
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
      .leftJoin('profiles', 'profiles', 'users.id = profiles.profileId')
      .where('users.id = :id', { id });

    query
      .select('profiles.role as role')
      .addSelect([
        'users.id as id',
        'users.email as email',
        'users.status as status',
        'profiles.role as role',
        'profiles.fullName as fullName',
        'users.divisionId as divisionId',
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
        .leftJoin('profiles', 'profiles', 'users.id = profiles.profileId')
        .leftJoin('divisions', 'divisions', 'divisions.id = users.divisionId')
        .where('users.id = :id', { id });
      query
        .select('profiles.role as role')
        .addSelect([
          'users.id as id',
          'profiles.fullName as fullName',
          'users.email as email',
          'profiles.phoneNumber as phoneNumber',
          'profiles.dob as dob',
          'profiles.nationalId as nationalId',
          'profiles.gender as gender',
          'profiles.address as address',
          'profiles.avatar as avatar',
          'divisions.divisionName as divisionName',
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

  async findByDivision(
    divisionId: string,
    userPagination: UserPagination,
    roleFilter: string,
    role: string,
  ): Promise<IPaginateResponse<UserProfile>> {
    try {
      const { currentPage, sizePage } = userPagination;
      const query = this.generalBuilderUser();
      query
        .leftJoin('profiles', 'profiles', 'users.id = profiles.profileId')
        .leftJoin('divisions', 'divisions', 'divisions.id = users.divisionId')
        .where('profiles.role != :excludedRole', {
          excludedRole: ERole.MANAGER,
        });
      if (divisionId !== undefined) {
        query.where('users.divisionId = :divisionId', { divisionId });
      }
      if (roleFilter !== undefined) {
        query.andWhere('profiles.role = :role', {
          role: roleFilter,
        });
      }
      if (role === ERole.STAFF) {
        query.andWhere('users.status = :status', {
          status: EUserStatus.ACTIVE,
        });
      }
      query
        .select('profiles.role as role')
        .addSelect([
          'users.id as id',
          'profiles.fullName as fullName',
          'users.email as email',
          'profiles.phoneNumber as phoneNumber',
          'profiles.dob as dob',
          'profiles.nationalId as nationalId',
          'profiles.gender as gender',
          'profiles.address as address',
          'profiles.avatar as avatar',
          'divisions.id as divisionId',
          'divisions.divisionName as divisionName',
          'users.status as status',
        ]);
      const [result, total] = await Promise.all([
        query
          .offset(sizePage * (currentPage - 1))
          .limit(sizePage)
          .execute(),
        query.getCount(),
      ]);
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
      console.log('Create user: ', createUser);
      console.log('ProfileId: ', createUser.generatedMaps[0]['id']);
      if (profile.role === ERole.STAFF) {
        await queryRunner.manager.insert(DivisionEntity, {
          staffId: createUser.generatedMaps[0]['id'],
        });
      }
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
      .select(['users.authCode as authCode', 'users.issueDate as issueDate'])
      .where('users.email = :email', { email });
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
      const division = await queryRunner.manager.findOne(DivisionEntity, {
        where: { id: data.divisionId },
      });

      if (!division) {
        throw new BadRequestException(
          DIVISION_ERROR_MESSAGE.DIVISION_NOT_EXIST,
        );
      }

      await queryRunner.manager.update(
        UserEntity,
        { id: userIdUpdate },
        {
          email: data.email,
          status: data.status,
          division,
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
        const divisionFilterStaff = await queryRunner.manager.findOne(
          DivisionEntity,
          {
            where: { staffId: userIdUpdate },
          },
        );
        if (divisionFilterStaff && data.role === ERole.EMPLOYEE) {
          await queryRunner.manager.update(
            DivisionEntity,
            { id: divisionFilterStaff.id },
            {
              staffId: null,
            },
          );
        }
        if (data.role === ERole.STAFF) {
          await queryRunner.manager.update(
            DivisionEntity,
            { id: division.id },
            {
              staffId: userIdUpdate,
            },
          );
        }
      };
      await this.transaction(callbacks, queryRunner);
      return 'Update profile successfully';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
