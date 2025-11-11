import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator'

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

  @ApiProperty({ example: 'https://cdn.parashoes.com/nike.jpg' })
  @IsString()
  @IsOptional()
  image?: string

  @ApiProperty({ example: 'sneakers' })
  @IsString()
  @IsOptional()
  category?: string

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isPromo?: boolean

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isSeasonal?: boolean
}
