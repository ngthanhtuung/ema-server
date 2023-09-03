import { AutoMap } from "@automapper/classes";
import BaseDTO from "../base/base.dto";
import { RoleDTO } from "../role/role.dto";
import DepartmentDTO from "../department/deparment.dto";

export default class UserDTO extends BaseDTO {

    @AutoMap()
    public username: string;

    @AutoMap()
    public fullName: string;

    @AutoMap()
    public dob: Date;

    @AutoMap()
    public idNumber: string;

    @AutoMap()
    public gender: boolean;

    @AutoMap()
    public address: string;

    @AutoMap()
    public phoneNumber: string;

    @AutoMap()
    public email: string;

    @AutoMap()
    public avatarUrl: string;

    @AutoMap()
    public status: boolean;

    @AutoMap()
    public refreshToken: string;

    @AutoMap()
    public roleName: string;

    @AutoMap()
    public departmentName: string;

}