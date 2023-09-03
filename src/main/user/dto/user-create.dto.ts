import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsNumberString, Max, MaxLength } from "class-validator";

export default class UserCreateDto {

    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'Full name of user',
    })
    public fullName: string;

    @IsDateString()
    @ApiProperty({
        type: String,
        example: 'YYYY-MM-DD',
    })
    public dob: string;

    @IsNumberString()
    @MaxLength(12)
    @ApiProperty({
        type: String,
        description: 'ID number of user',
    })
    public idNumber: string;

    @IsBoolean()
    @ApiProperty({
        type: Boolean,
    })
    public gender: boolean;

    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'Address of user',
    })
    public address: string;

    @IsNumberString()
    @MaxLength(10)
    @ApiProperty()
    public phoneNumber: string;

    @IsEmail()
    @ApiProperty({
        type: String,
        description: 'Email of user',
    })
    public email: string;

    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'Username of user',
    })
    public username: string;

    @IsNumberString()
    @ApiProperty({})
    public roleId: string;

    @IsNotEmpty()
    @ApiProperty({})
    public departmentId: string;

}