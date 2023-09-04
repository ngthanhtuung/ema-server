import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import UserRepository from './user.repository';
import UserCreateDto from './dto/user-create.dto';
import ApiResponse from 'src/shared/res/apiResponse';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import UserDTO from './user.dto';
import User from './user.entity';
import { SharedService } from 'src/shared/shared.service';
import ChangePasswordDto from './dto/changePassword.dto';
import * as moment from 'moment-timezone';
import UserPagination from './dto/user.pagination';
import { paginateResponse } from '../base/filter.pagination';

@Injectable()
export class UserService {

    constructor(
        @InjectMapper() private readonly mapper: Mapper,
        private readonly userRepository: UserRepository,
        private readonly sharedService: SharedService
    ) {
        this.mapper.createMap(Boolean, Boolean);
    }

    /**
     * getAllUser
     * @param userPagination 
     * @returns 
     */
    async getAllUser(userPagination: UserPagination): Promise<any | undefined> {
        try {
            const [list, count] = await this.userRepository.getAllUser(userPagination);
            const userDTO: UserDTO[] = [];
            console.log("list:", list);
            console.log("count:", count);
            for (const item of list) {
                userDTO.push(this.mapper.map(item, UserDTO, User,));
            }
            if (list.length === 0) {
                return new ApiResponse('Error', 'User not found');
            }
            return new ApiResponse('Success', 'Get user successfully',
                paginateResponse<UserDTO>(
                    userPagination.currentPage as number,
                    userPagination.sizePage as number,
                    [userDTO, count]
                ))

        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * findUserByUsername
     * @param username 
     * @returns 
     */
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

    /**
     * createUser
     * @param data 
     * @param loginUser 
     * @returns 
     */
    async createUser(data: UserCreateDto, loginUser: User): Promise<any | undefined> {
        try {
            const generatePassword = this.sharedService.generatePassword(8);
            const hashPassword = await this.sharedService.hashPassword(generatePassword);
            const callback = async (email: string, username: string, password: string): Promise<boolean | undefined> => {
                const result = await this.sharedService.sendConfirmEmail(email, username, password);
                return result;
            }
            const user = await this.userRepository.createUser(data, hashPassword, loginUser?.id, generatePassword, callback);
            if (user) {
                const parseUser = this.mapper.map(user, UserDTO, User);
                return new ApiResponse('Success', 'Create user successfully', parseUser);
            }
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * updateRefreshToken
     * @param id 
     * @param refreshToken 
     * @returns 
     */
    async updateRefreshToken(id: string, refreshToken: string): Promise<any | undefined> {
        try {
            await this.userRepository.update({ id: id }, { refreshToken: refreshToken });
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * changePassword
     * @param data 
     * @param user 
     * @returns 
     */
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

    /**
     * getProfile
     * @param user 
     * @returns 
     */
    async getProfile(user: User): Promise<any | undefined> {
        try {
            const loginUser = await this.findUserByUsername(user.username);
            return new ApiResponse('Success', 'Get profile successfully', loginUser);
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * changeStatusUser
     * @param idUser 
     * @param user 
     * @returns 
     */
    async changeStatusUser(idUser: string, user: User): Promise<any | undefined> {
        try {
            const User = await this.userRepository.findOne({
                where: { id: idUser },
            });
            if (User) {
                const result = await this.userRepository.update({ id: idUser }, {
                    status: !User?.status,
                    modifiedAt: moment().tz('Asia/Ho_Chi_Minh').toDate(),
                    modifiedBy: user?.id
                })
                if (result.affected > 0) {
                    return new ApiResponse('Success', `${User.status === true ? 'Disable' : 'Enable'} User successfully`);
                }
                throw new HttpException(new ApiResponse('Fail', 'Change status User fail'), HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(new ApiResponse('Fail', 'User not found'), HttpStatus.BAD_REQUEST);
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * getListUserByFilter
     * @param condition 
     * @param data 
     * @returns 
     */
    async getListUserByFilter(condition: string, data: string): Promise<any | undefined> {
        try {
            const user = await this.userRepository.getListUserByFilter(condition, data);
            if (user) {
                return user;
            }
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
