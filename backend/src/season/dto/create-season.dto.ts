import { ApiProperty } from "@nestjs/swagger";
import { IsString, isString } from "class-validator";

export class CreateSeasonDto {
    @ApiProperty({ example: 'Лето' })
    @IsString()
    name: string
}
