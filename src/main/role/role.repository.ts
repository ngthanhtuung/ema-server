import { Repository } from "typeorm";
import Role from "./role.entity";
import { CustomRepository } from "src/type-orm/typeorm-ex.decorator";
import ApiResponse from "src/shared/res/apiResponse";
import { HttpException, HttpStatus } from "@nestjs/common";

@CustomRepository(Role)
export class RoleRepository extends Repository<Role> {

    async getRoleById(roleId: string): Promise<any | undefined> {
        try {
            const role = await this.findOne({
                where: { id: parseInt(roleId) },
            });
            if (role) {
                return role;
            }
            return null;
        } catch (err) {
            throw new HttpException(new ApiResponse('Fail', err.message), err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}