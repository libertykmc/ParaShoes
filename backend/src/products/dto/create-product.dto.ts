import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'

export class ProductSizeStockDto {
  @ApiProperty({ example: 42 })
  @IsInt()
  @Min(35)
  @Max(45)
  size: number

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  stock: number
}

export class CreateProductDto {
  @ApiProperty({ example: 'Nike Air Max' })
  @IsString()
  name: string

  @ApiProperty({ example: 'Comfortable sneakers' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 12999 })
  @IsNumber()
  @Min(0)
  price: number

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number

  @ApiProperty({ example: 'https://cdn.parashoes.com/nike.jpg' })
  @IsString()
  @IsOptional()
  image?: string

  @ApiProperty({
    type: [ProductSizeStockDto],
    required: false,
    example: [
      { size: 36, stock: 2 },
      { size: 37, stock: 1 },
      { size: 38, stock: 0 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSizeStockDto)
  @IsOptional()
  sizes?: ProductSizeStockDto[]

  @ApiProperty({
    example: 'e32a1320-3f6f-456a-bcd8-159b6527076d',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string

  @ApiProperty({
    example: 'e32a1320-3f6f-456a-bcd8-159b6527076d',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  materialId?: string

  @ApiProperty({
    example: 'e32a1320-3f6f-456a-bcd8-159b6527076d',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  styleId?: string

  @ApiProperty({
    example: 'e32a1320-3f6f-456a-bcd8-159b6527076d',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  seasonId?: string
}
