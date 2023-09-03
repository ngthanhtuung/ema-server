import { RoleService } from './../role/role.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import UserRepository from './user.repository';
import UserCreateDto from './dto/user-create.dto';
import ApiResponse from 'src/shared/res/apiResponse';
import { DepartmentService } from '../department/department.service';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import UserDTO from './user.dto';
import User from './user.entity';
import { SharedService } from 'src/shared/shared.service';
import ChangePasswordDto from './dto/changePassword.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class UserService {

    constructor(
        @InjectMapper() private readonly mapper: Mapper,
        private readonly userRepository: UserRepository,
        private readonly sharedService: SharedService
    ) { }

    async findUserByUsername(username: string): Promise<any | undefined> {
        try {
            const user = await this.userRepository.findUserByUsername(username);
            if (user) {
                return user;
            }
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createUser(data: UserCreateDto, loginUser: User): Promise<any | undefined> {
        try {
            const DEFAULT_PASSWORD = '123456789';
            const hashPassword = await this.sharedService.hashPassword(DEFAULT_PASSWORD);
            const callback = async (email: string, username: string): Promise<boolean | undefined> => {
                const result = await this.sharedService.sendConfirmEmail(email, username);
                return result;
            }
            const user = await this.userRepository.createUser(data, hashPassword, loginUser.id, callback);
            if (user) {
                const parseUser = this.mapper.map(user, UserDTO, User);
                return new ApiResponse('Success', 'Create user successfully', parseUser);
            }
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateRefreshToken(id: string, refreshToken: string): Promise<any | undefined> {
        try {
            await this.userRepository.update({ id: id }, { refreshToken: refreshToken });
            return true;
        } catch (err) {
            return false;
        }
    }

    async changePassword(data: ChangePasswordDto, user: User): Promise<any | undefined> {
        try {
            const loginUser = await this.findUserByUsername(user.username);
            const { oldPassword, newPassword, confirmPassword } = data;
            if (newPassword !== confirmPassword) {
                throw new HttpException(new ApiResponse('Fail', 'Confirm password is not match'), HttpStatus.BAD_REQUEST);
            }
            const checkPassword = await this.sharedService.comparePassword(oldPassword, loginUser.password);
            if (!checkPassword) {
                throw new HttpException(new ApiResponse('Fail', 'Old password is not match'), HttpStatus.BAD_REQUEST);
            }
            const hashPassword = await this.sharedService.hashPassword(newPassword);
            await this.userRepository.update(
                { id: loginUser.id },
                {
                    password: hashPassword,
                    modifiedAt: moment().tz('Asia/Ho_Chi_Minh').toDate(),
                    modifiedBy: user.id
                });
            return new ApiResponse('Success', 'Change password successfully');
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getProfile(user: User): Promise<any | undefined> {
        try {
            const loginUser = await this.findUserByUsername(user.username);
            return new ApiResponse('Success', 'Get profile successfully', loginUser);
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
