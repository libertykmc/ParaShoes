import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsArray, ValidateNested, IsInt, IsNumber, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateOrderItemDto {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @IsString()
  productId: string

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number

  @ApiProperty({ example: 12999.99 })
  @IsNumber()
  @Min(0)
  price: number
}

export class CreateOrderDto {
  @ApiProperty({ example: 'г. Москва, ул. Ленина, д. 10, кв. 5' })
  @IsString()
  deliveryAddress: string

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]
}

