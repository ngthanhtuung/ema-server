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

@Injectable()
export class DepartmentService {

    constructor(
        @InjectMapper() private readonly mapper: Mapper,
        private readonly departmentRepository: DepartmentRepository,
    ) { }


    async getAllDepartment(departmentPagination: DepartmentPagination): Promise<any | undefined> {
        try {
            const [list, count] = await this.departmentRepository.getAllDepartment(departmentPagination);
            const departmentDTO: DepartmentDTO[] = [];
            for (const item of list) {
                departmentDTO.push(this.mapper.map(item, DepartmentDTO, Department));
            }
            if (list.length === 0) {
                return new ApiResponse('Error', 'Department not found');
            }
            return new ApiResponse('Success', 'Get department successfully',
                paginateResponse<DepartmentDTO>(
                    departmentPagination.currentPage as number,
                    departmentPagination.sizePage as number,
                    [departmentDTO, count]
                ))

        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

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

    async createDepartment(deparment: DepartmentCreateDto): Promise<any | undefined> {
        try {
            const result = await this.departmentRepository.createDepartment(deparment);
            if (result) {
                return new ApiResponse('Success', 'Create department successfully', result);
            }
            throw new HttpException(new ApiResponse('Fail', 'Create department fail'), HttpStatus.BAD_REQUEST);
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
