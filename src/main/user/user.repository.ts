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
     * findUserByEmail
     * @param username 
     * @returns 
     */
    async findUserByEmail(email: string): Promise<any | undefined> {
        try {
            const user = await this.findOne({
                where: { email: email },
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
        fn: (email: string, password: string) => Promise<boolean>
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
            const result = await fn(user?.email, generatePassword);
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
    async getListUserByFilter(gender: boolean, status: boolean, departmentId: string, roleId: number): Promise<any | undefined> {
        try {
            let query = `SELECT *
            FROM user U
            INNER JOIN role R ON U.roleId = R.id
            INNER JOIN department D ON U.departmentId = D.id WHERE `
            const array = []
            // check have condition gender
            if (gender !== undefined) {
                array.push(`U.gender = ${gender}`)
            }
            // check have condtion status
            if (status !== undefined) {
                array.push(`U.status = ${status}`)
            }
            // check have condtion departmentId
            if (departmentId !== undefined) {
                array.push(`U.departmentId = '${departmentId}'`)
            }
            //  check have condtion roleId
            if (roleId !== undefined) {
                array.push(`U.roleId = '${Number(roleId)}'`)
            }
            if (array.length > 0) {
                query += array.join(' AND ')
                console.log("query final:", query);
                const result = await this.query(query);
                return new ApiResponse('Success', 'Get user by condition successfully', result);
            }
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * updateCodeAndIssueDate
     * @param userId 
     * @param authCode 
     * @param issueDate 
     * @returns 
     */
    async updateCodeAndIssueDate(userId: string, authCode: string, issueDate: string): Promise<any | undefined> {
        try {
            console.log("userId userRepository:", userId);
            let query = `UPDATE user
            SET issueDate = '${issueDate}', authCode = '${authCode}'
            WHERE id = '${userId}';`
            await this.query(query);
            console.log("Update successfully !!!");
            return true;
        } catch (err) {
            return false;
        }
    }
}