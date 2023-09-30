import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export default class DivisionCreateRequest {

    @IsString()
    @ApiProperty()
    divisionName: string;


}