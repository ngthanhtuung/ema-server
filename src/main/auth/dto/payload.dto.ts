import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export default class PayloadDTO {

    @IsNotEmpty()
    @ApiProperty()
    email: string;
}