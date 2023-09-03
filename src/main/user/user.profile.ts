import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Mapper, mapFrom } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import User from './user.entity';
import UserDTO from './user.dto';


@Injectable()
export class UserProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    mapProfile() {
        return (mapper: Mapper): void => {
            mapper.createMap(User, UserDTO)
                .forMember(
                    (dest) => dest.roleName, mapFrom((src) => src.role.roleName)
                )
                .forMember(
                    (dest) => dest.departmentName, mapFrom((src) => src.department.departmentName)
                )
        };
    }
}
