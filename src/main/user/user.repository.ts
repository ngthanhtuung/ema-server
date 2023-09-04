import { Repository } from "typeorm";
import User from "./user.entity";
import { CustomRepository } from "src/type-orm/typeorm-ex.decorator";
import UserCreateDto from "./dto/user-create.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import ApiResponse from "src/shared/res/apiResponse";
import * as moment from 'moment-timezone';
import UserPagination from "./dto/user.pagination";


@CustomRepository(User)
export default class UserRepository extends Repository<User> {

    /**
     * getAllUser
     * @param userPagination 
     * @returns 
     */
    async getAllUser(userPagination: UserPagination): Promise<[User[], number]> {
        try {
            const query = this.createQueryBuilder('user')
            const { currentPage, sizePage, sort } = userPagination;
            const [list, count] = await Promise.all([
                query
                    .leftJoinAndSelect('user.role', 'role')
                    .leftJoinAndSelect('user.department', 'department')
                    .skip((sizePage as number) * ((currentPage as number) - 1))
                    .take(sizePage as number)
                    .orderBy('user.createdAt', sort)
                    .getMany(),
                query.getCount()
            ])
            return [list, count];
        } catch (err) {
            console.log('Error at UserRepository: ', err.message);
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
            const user = await this.findOne({
                where: { username: username },
                relations: ['role', 'department']
            })
            return user;
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * createUser
     * @param data 
     * @param hashPassword 
     * @param createdBy 
     * @param generatePassword 
     * @param fn 
     * @returns 
     */
    async createUser(
        data: UserCreateDto,
        hashPassword: string,
        createdBy: string,
        generatePassword: string,
        fn: (email: string, username: string, password: string) => Promise<boolean>
    ): Promise<any | undefined> {
        const queryRunner = this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction('READ COMMITTED');
        try {
            // Get Data Role
            const role = await queryRunner.manager.findOne('Role', {
                where: { id: data?.roleId }
            });
            // Get data department
            const department = await queryRunner.manager.findOne('Department', {
                where: { id: data?.departmentId }
            })
            // process insert data in table User
            const user = await queryRunner.manager.save(
                queryRunner.manager.create('User', {
                    fullName: data?.fullName,
                    dob: new Date(data?.dob),
                    idNumber: data?.idNumber,
                    username: data?.username,
                    password: hashPassword,
                    gender: data?.gender,
                    address: data?.address,
                    phoneNumber: data?.phoneNumber,
                    email: data?.email,
                    role: role,
                    department: department,
                    createdAt: moment().tz('Asia/Ho_Chi_Minh').toDate(),
                    createdBy: createdBy
                })
            )
            const result = await fn(user?.email, user?.username, generatePassword);
            if (result) {
                await queryRunner.commitTransaction();
                return user;
            }
            await queryRunner.rollbackTransaction();
            throw new HttpException(new ApiResponse('Fail', 'Send email fail'), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            queryRunner.release();
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
            let query = ` SELECT U.*, R.roleName, D.departmentName
            FROM user U
            INNER JOIN role R ON U.roleId = R.id
            INNER JOIN department D ON U.departmentId = D.id`
            switch (condition) {
                // filter by gender
                case 'gender':

                    break;
                // filter by status
                case 'status':

                    break;
                // filter by role
                case 'gender':

                    break;
                // filter by role
                case 'department':

                    break;
            }
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}