import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsString } from 'class-validator'
import { MaterialType, Style } from '../category.entity'

export class CreateCategoryDto {
  @ApiProperty({ example: MaterialType.NATURAL_LEATHER, enum: MaterialType })
  @IsEnum(MaterialType)
  material: MaterialType

  @ApiProperty({ example: 42 })
  @IsInt()
  size: number

  @ApiProperty({ example: 'Лето' })
  @IsString()
  season: string

  @ApiProperty({ example: Style.CLASSIC, enum: Style })
  @IsEnum(Style)
  style: Style
}

