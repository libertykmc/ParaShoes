import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, Min, IsUUID } from 'class-validator'

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

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantityInStock?: number

  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string

  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d', required: false })
  @IsUUID()
  @IsOptional()
  materialId?: string

  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d', required: false })
  @IsUUID()
  @IsOptional()
  styleId?: string

  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d', required: false })
  @IsUUID()
  @IsOptional()
  seasonId?: string
}
