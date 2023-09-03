import { AutoMap } from "@automapper/classes";

export default class BaseDTO {

    @AutoMap()
    public id: string;

    @AutoMap()
    public createdAt: Date;

    @AutoMap()
    public createdBy: string;

    @AutoMap()
    public modifiedAt: Date;

    @AutoMap()
    public modifiedBy: string;

}