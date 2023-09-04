import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import DepartmentRepository from './department.repository';
import DepartmentCreateDto from './dto/department-create.dto';
import ApiResponse from 'src/shared/res/apiResponse';
import DepartmentPagination from './dto/department.pagination';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import DepartmentDTO from './deparment.dto';
import Department from './department.entity';
import { paginateResponse } from '../base/filter.pagination';
import DepartmentUpdateDto from './dto/department-update.dto';
import * as moment from 'moment-timezone';
import User from '../user/user.entity';

@Injectable()
export class DepartmentService {

    constructor(
        @InjectMapper() private readonly mapper: Mapper,
        private readonly departmentRepository: DepartmentRepository,
    ) { }

    /**
     * getAllDepartment
     * @param departmentPagination 
     * @returns 
     */
    async getAllDepartment(departmentPagination: DepartmentPagination): Promise<any | undefined> {
        try {
            const [list, count] = await this.departmentRepository.getAllDepartment(departmentPagination);
            const departmentDTO: DepartmentDTO[] = [];
            for (const item of list) {
                departmentDTO.push(this.mapper.map(item, DepartmentDTO, Department));
            }
            if (list?.length === 0) {
                return new ApiResponse('Error', 'Department not found');
            }
            return new ApiResponse('Success', 'Get department successfully',
                paginateResponse<DepartmentDTO>(
                    departmentPagination?.currentPage as number,
                    departmentPagination?.sizePage as number,
                    [departmentDTO, count]
                ))

        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * getDepartmentById
     * @param departmentId 
     * @returns 
     */
    async getDepartmentById(departmentId: string): Promise<any | undefined> {
        try {
            const department = await this.departmentRepository.getDepartmentById(departmentId);
            if (department) {
                return new ApiResponse('Success', 'Get department successfully', department);
            }
            throw new HttpException(new ApiResponse('Fail', 'Department not found'), HttpStatus.BAD_REQUEST);
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * createDepartment
     * @param department 
     * @returns 
     */
    async createDepartment(department: DepartmentCreateDto): Promise<any | undefined> {
        try {
            const result = await this.departmentRepository.createDepartment(department);
            if (result) {
                return new ApiResponse('Success', 'Create department successfully', result);
            }
            throw new HttpException(new ApiResponse('Fail', 'Create department fail'), HttpStatus.BAD_REQUEST);
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * updateDepartment
     * @param idDepartment 
     * @param data 
     * @param user 
     * @returns 
     */
    async updateDepartment(idDepartment: string, data: DepartmentUpdateDto, user: User): Promise<any | undefined> {
        try {
            const department = await this.departmentRepository.findOne({
                where: { id: idDepartment },
            });

            if (department) {
                const result = await this.departmentRepository.update({ id: idDepartment }, {
                    departmentName: data?.departmentName,
                    description: data?.description,
                    modifiedAt: moment().tz('Asia/Ho_Chi_Minh').toDate(),
                    modifiedBy: user?.id
                });
                if (result.affected > 0) {
                    return new ApiResponse('Success', 'Update department successfully');
                }
                throw new HttpException(new ApiResponse('Fail', 'Update department fail'), HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(new ApiResponse('Fail', 'Department not found'), HttpStatus.BAD_REQUEST);
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * changeStatusDepartment
     * @param idDepartment 
     * @param user 
     * @returns 
     */
    async changeStatusDepartment(idDepartment: string, user: User): Promise<any | undefined> {
        try {
            const department = await this.departmentRepository.findOne({
                where: { id: idDepartment },
            });
            if (department) {
                const checkEmployeeBelong = await this.departmentRepository.numOfEmployee(idDepartment);
                console.log("checkEmployeeBelong:", checkEmployeeBelong);
                if (checkEmployeeBelong > 0 && department.status === true) {
                    throw new HttpException(new ApiResponse('Fail', `Department has ${checkEmployeeBelong} employee(s) belong, please moderate before disable`), HttpStatus.BAD_REQUEST);
                }
                const result = await this.departmentRepository.update({ id: idDepartment }, {
                    status: !department.status,
                    modifiedAt: moment().tz('Asia/Ho_Chi_Minh').toDate(),
                    modifiedBy: user?.id
                })
                if (result.affected > 0) {
                    return new ApiResponse('Success', `${department.status === true ? 'Disable' : 'Enable'} department successfully`);
                }
                throw new HttpException(new ApiResponse('Fail', 'Change status department fail'), HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(new ApiResponse('Fail', 'Department not found'), HttpStatus.BAD_REQUEST);
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
