import { ApiProperty } from "@nestjs/swagger";
import { IsString, isString } from "class-validator";

export class CreateMaterialDto {
    @ApiProperty({ example: 'Натуральная кожа' })
    @IsString()
    name: string
}
