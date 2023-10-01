import { Expose } from "class-transformer";

export class DivisionResponse {

    @Expose()
    id: string;

    @Expose()
    divisionName: string;

    @Expose()
    description: string;

    @Expose()
    status: boolean;
}