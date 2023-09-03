import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export default class DepartmentUpdateDto {

    @IsNotEmpty()
    @ApiProperty({
        description: 'Department Name',
        example: 'Department Name',
    })
    public departmentName: string;

    @ApiProperty({
        description: 'Department Description',
        example: 'Department Description',
    })
    public description: string;
}