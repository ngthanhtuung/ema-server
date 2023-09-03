import { AutoMap } from "@automapper/classes";

export class RoleDTO {

    @AutoMap()
    public id: number;

    @AutoMap()
    public roleName: string;

}