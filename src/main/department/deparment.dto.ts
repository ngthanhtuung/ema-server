import { AutoMap } from "@automapper/classes";
import BaseDTO from "../base/base.dto";

export default class DepartmentDTO extends BaseDTO {

    @AutoMap()
    public departmentName: string;

    @AutoMap()
    public description: string;

    @AutoMap()
    public status: boolean;


}