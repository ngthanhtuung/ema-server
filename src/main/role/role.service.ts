import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import ApiResponse from 'src/shared/res/apiResponse';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {

    constructor(
        private readonly roleRepository: RoleRepository,
    ) { }

    async getRoleById(roleId: string): Promise<any | undefined> {
        try {
            const role = await this.roleRepository.getRoleById(roleId);
            if (role) {
                return new ApiResponse('Success', 'Get role successfully', role);
            }
            throw new HttpException(new ApiResponse('Fail', 'Role not found'), HttpStatus.BAD_REQUEST)
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
