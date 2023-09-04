import { CustomRepository } from "src/type-orm/typeorm-ex.decorator";
import Department from "./department.entity";
import { Repository } from "typeorm";
import DepartmentCreateDto from "./dto/department-create.dto";
import ApiResponse from "src/shared/res/apiResponse";
import { HttpException, HttpStatus } from "@nestjs/common";
import DepartmentPagination from "./dto/department.pagination";

@CustomRepository(Department)
export default class DepartmentRepository extends Repository<Department> {

    /**
     * getAllDepartment
     * @param departmentPagination 
     * @returns 
     */
    async getAllDepartment(departmentPagination: DepartmentPagination): Promise<[Department[], number]> {
        try {
            const query = this.createQueryBuilder('department')
            const { currentPage, sizePage, sort } = departmentPagination;
            const [list, count] = await Promise.all([
                query
                    .skip((sizePage as number) * ((currentPage as number) - 1))
                    .take(sizePage as number)
                    .orderBy('createdAt', sort)
                    .getMany(),
                query.getCount()
            ])
            return [list, count];
        } catch (err) {
            console.log('Error at DepartmentRepository: ', err.message);
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
            const department = await this.findOne({
                where: { id: departmentId }
            })
            return department;
        } catch (err) {
            console.log('Error at DepartmentRepository: ', err.message);
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * createDepartment
     * @param data 
     * @returns 
     */
    async createDepartment(data: DepartmentCreateDto): Promise<Department | undefined> {
        try {
            const result = await this.create({
                departmentName: data.departmentName,
                description: data.description,
            });
            const department = await this.save(result);
            return department;
        } catch (err) {
            console.log('Error at DepartmentRepository: ', err.message);
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * numOfEmployee
     * @param idDepartment 
     * @returns 
     */
    async numOfEmployee(idDepartment: string): Promise<number | undefined> {
        try {
            const query = `
            SELECT COUNT(U.id)
            FROM department D INNER JOIN user U ON D.id = U.departmentId
            WHERE D.id = '${idDepartment}' and U.status = 1`
            const result = await this.query(query);
            const obj = result[0];
            // Parse the value as an integer
            const countValue = parseInt(obj['COUNT(U.id)'], 10);
            console.log("countValue:", countValue);
            return countValue;
        } catch (err) {
            return -1;
        }
    }
}