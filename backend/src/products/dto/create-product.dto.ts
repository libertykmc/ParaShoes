import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsOptional, IsString, Min, IsUUID } from 'class-validator'

export class CreateProductDto {
  @ApiProperty({ example: 'Кроссовки Nike Air Max' })
  @IsString()
  name: string

  @ApiProperty({ example: 'Удобные и стильные кроссовки' })
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

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  productStatus?: boolean

  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string
}
