/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prefer-const */
import { EUserStatus } from './../../common/enum/enum';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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
  CustomerCreateRequest,
  FilterFreeEmployee,
  UserCreateRequest,
  UserPagination,
  UserProfileUpdateRequest,
  UserProfileUpdateRequestV2,
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
  LessThanOrEqual,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { IPaginateResponse, paginateResponse } from '../base/filter.pagination';
import { ERole } from 'src/common/enum/enum';
import { DivisionEntity } from '../division/division.entity';
import * as _ from 'lodash';
import { RoleEntity } from '../roles/roles.entity';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    private shareService: SharedService, // private taskService: TaskService,
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
   * getAllUser
   * @param email
   * @returns
   */
  async getAllUser() {
    const query = await this.generalBuilderUser();
    query
      .leftJoin('roles', 'roles', 'users.roleId = roles.id')
      .leftJoin('profiles', 'profiles', 'users.id = profiles.id')
      .where('roles. roleName != :excludedRole', {
        excludedRole: ERole.CUSTOMER,
      })
      .andWhere('users.status = :status', {
        status: EUserStatus.ACTIVE,
      })
      .select([
        'users.id as id',
        'profiles.fullName as fullName',
        'users.email as email',
        'profiles.avatar as avatar',
      ]);
    const res = await query.execute();

    return res;
  }

  /**
   * findByEmail
   * @param email
   * @returns
   */
  async findUser(email: string): Promise<UserEntity> {
    const query = this.generalBuilderUser();

    query
      .leftJoin('profiles', 'profiles', 'users.id = profiles.id')
      .leftJoin('roles', 'roles', 'roles.id = users.roleId')
      .where('users.email = :email', { email });

    query
      .select('roles.roleName as role')
      .addSelect([
        'users.id as id',
        'users.status as status',
        'users.divisionId as divisionId',
        'users.typeEmployee as typeEmployee',
        'profiles.avatar as avatar',
        'profiles.fullName as fullName',
      ]);

    const data = await query.execute();

    return data;
  }

  /**
   * findByEmail
   * @param email
   * @returns
   */
  async findByEmail(email: string): Promise<UserResponse> {
    const query = this.generalBuilderUser();

    query
      .leftJoin('profiles', 'profiles', 'users.id = profiles.id')
      .leftJoin('roles', 'roles', 'roles.id = users.roleId')
      .where('users.email = :email', { email });

    query
      .select('roles.roleName as role')
      .addSelect([
        'users.id as id',
        'users.password as password',
        'users.status as status',
        'users.divisionId as divisionId',
        'users.typeEmployee as typeEmployee',
        'profiles.avatar as avatar',
        'profiles.fullName as fullName',
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
      .leftJoin('profiles', 'profiles', 'users.id = profiles.id')
      .leftJoin('roles', 'roles', 'users.roleId = roles.id')
      .where('users.id = :id', { id });

    query
      .select('roles.roleName as role')
      .addSelect([
        'users.id as id',
        'users.email as email',
        'users.status as status',
        'users.socketId as socketId',
        'users.role as role',
        'profiles.fullName as fullName',
        'profiles.avatar as avatar',
        'users.divisionId as divisionId',
      ]);

    const data = await query.execute();
    console.log('Data after query: ', data);
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
        .leftJoin('profiles', 'profiles', 'users.id = profiles.id')
        .leftJoin('divisions', 'divisions', 'divisions.id = users.divisionId')
        .leftJoin('roles', 'roles', 'users.roleId = roles.id')
        .where('users.id = :id', { id });
      query
        .select('roles.roleName as role')
        .addSelect([
          'users.id as id',
          'profiles.fullName as fullName',
          'users.email as email',
          'profiles.phoneNumber as phoneNumber',
          'profiles.dob as dob',
          'profiles.nationalId as nationalId',
          'profiles.nationalIdImage as nationalImages',
          'profiles.gender as gender',
          'profiles.address as address',
          'profiles.avatar as avatar',
          'divisions.id as divisionId',
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
        .leftJoin('roles', 'roles', 'users.roleId = roles.id')
        .leftJoin('profiles', 'profiles', 'users.id = profiles.id')
        .leftJoin('divisions', 'divisions', 'divisions.id = users.divisionId')
        .where('roles. roleName != :excludedRole', {
          excludedRole: ERole.MANAGER,
        });
      if (divisionId !== undefined) {
        query.where('users.divisionId = :divisionId', { divisionId });
      }
      if (roleFilter !== undefined) {
        query.andWhere('roles.roleName = :role', {
          role: roleFilter,
        });
      }
      if (role === ERole.STAFF) {
        query.andWhere('users.status = :status', {
          status: EUserStatus.ACTIVE,
        });
      }
      query
        .select('roles.roleName as role')
        .addSelect([
          'users.id as id',
          'profiles.fullName as fullName',
          'users.email as email',
          'users.typeEmployee as typeEmployee',
          'profiles.phoneNumber as phoneNumber',
          'profiles.dob as dob',
          'profiles.nationalId as nationalId',
          'profiles.nationalIdImage as nationalImages',
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
    const { email, typeEmployee, ...profile } = userCreateRequest;
    const generatePassword = this.shareService.generatePassword(8);
    const password = await this.shareService.hashPassword(generatePassword);
    let createUser = undefined;
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

      const role = await queryRunner.manager.findOne(RoleEntity, {
        where: { id: userCreateRequest.roleId },
      });
      if (!division) {
        throw new BadRequestException(
          DIVISION_ERROR_MESSAGE.DIVISION_NOT_EXIST,
        );
      }
      createUser = await queryRunner.manager.insert(UserEntity, {
        email: userCreateRequest?.email,
        password: password,
        division: {
          id: userCreateRequest?.divisionId,
        },
        isStaff: Boolean(role.roleName === ERole.STAFF),
        role: {
          id: userCreateRequest?.roleId,
        },
        typeEmployee: typeEmployee,
      });
      await queryRunner.manager.insert(ProfileEntity, {
        ...profile,
        code: '1234',
        id: createUser.generatedMaps[0]['id'],
      });
      await this.shareService.sendConfirmEmail(email, generatePassword);
    };
    await this.transaction(callback, queryRunner);
    return 'Create user success';
  }

  /**
   * insertCustomer
   * @param customerRequest
   * @returns
   */
  async insertCustomer(
    customerRequest: CustomerCreateRequest,
  ): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    let { email, password, ...profile } = customerRequest;
    if (!password) {
      password = this.shareService.generatePassword(8);
    }
    const hashPassword = await this.shareService.hashPassword(password);
    let createUser = undefined;
    const callback = async (queryRunner: QueryRunner): Promise<void> => {
      const userExist = await queryRunner.manager.findOne(UserEntity, {
        where: { email: customerRequest.email },
      });
      if (userExist) {
        throw new BadRequestException(AUTH_ERROR_MESSAGE.EMAIL_EXIST);
      }
      const role = await queryRunner.manager.findOne(RoleEntity, {
        where: { roleName: ERole.CUSTOMER },
      });
      createUser = await queryRunner.manager.insert(UserEntity, {
        email: customerRequest?.email,
        password: hashPassword,
        role: {
          id: role?.id,
        },
      });
      await queryRunner.manager.insert(ProfileEntity, {
        ...profile,
        code: '1234',
        id: createUser.generatedMaps[0]['id'],
      });
      await this.shareService.sendConfirmEmail(email, password);
    };
    await this.transaction(callback, queryRunner);
    return 'Create user success';
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
   * updateRefreshToken
   * @param id
   * @param refreshToken
   * @returns
   */
  async insertSocketId(id: string, socketId: string): Promise<boolean> {
    try {
      await this.userRepository.update({ id: id }, { socketId: socketId });
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
          // updatedAt: modifiedDate,
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
        { id: userId },
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
      const role = await queryRunner.manager.findOne(RoleEntity, {
        where: { id: data.roleId },
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
          typeEmployee: data.typeEmployee,
          isStaff: role.roleName === ERole.STAFF,
        },
      );

      const query = await queryRunner.manager.query(`
          SELECT COUNT(*) as count
          FROM tasks
              INNER JOIN assign_tasks
          ON tasks.id = assign_tasks.taskId
          WHERE assign_tasks.assignee = '${userIdUpdate}' AND (tasks.status IN ('PENDING', 'PROCESSING'))
      `);
      const result = query[0].count;
      if (result === 0) {
        await queryRunner.manager.update(
          UserEntity,
          { id: userIdUpdate },
          {
            division: division,
          },
        );
      }
      const callbacks = async (queryRunner: QueryRunner): Promise<void> => {
        await queryRunner.manager.update(
          ProfileEntity,
          { id: userIdUpdate },
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
