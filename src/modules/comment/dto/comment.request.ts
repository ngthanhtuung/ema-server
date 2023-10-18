import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsString } from "class-validator";

export class CommentCreateRequest {

    @IsString()
    @ApiProperty({})
    taskID: string;

    @IsString()
    @ApiProperty()
    content: string;

    @ApiProperty({
        required: false
    })
    fileUrl?: string[];

}

