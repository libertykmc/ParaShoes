import { ApiProperty } from "@nestjs/swagger";
import { IsString, isString } from "class-validator";

export class CreateStyleDto {
    @ApiProperty({ example: 'Классика' })
    @IsString()
    name: string
}
