import { Repository } from "typeorm";
import User from "./user.entity";
import { CustomRepository } from "src/type-orm/typeorm-ex.decorator";
import UserCreateDto from "./dto/user-create.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import ApiResponse from "src/shared/res/apiResponse";
import * as moment from 'moment-timezone';


@CustomRepository(User)
export default class UserRepository extends Repository<User> {

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

    async createUser(
        data: UserCreateDto,
        hashPassword: string,
        createdBy: string,
        fn: (email: string, username: string) => Promise<boolean>
    ): Promise<any | undefined> {
        const queryRunner = this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction('READ COMMITTED');
        try {
            const role = await queryRunner.manager.findOne('Role', {
                where: { id: data.roleId }
            });

            const department = await queryRunner.manager.findOne('Department', {
                where: { id: data.departmentId }
            })

            const user = await queryRunner.manager.save(
                queryRunner.manager.create('User', {
                    fullName: data.fullName,
                    dob: new Date(data.dob),
                    idNumber: data.idNumber,
                    username: data.username,
                    password: hashPassword,
                    gender: data.gender,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    role: role,
                    department: department,
                    createdAt: moment().tz('Asia/Ho_Chi_Minh').toDate(),
                    createdBy: createdBy
                })
            )
            const result = await fn(user.email, user.username);
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
}