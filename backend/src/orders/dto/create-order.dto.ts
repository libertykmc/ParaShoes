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
import { ApiProperty } from '@nestjs/swagger'

export class CreateOrderItemDto {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @IsUUID()
  modelId: string

  @ApiProperty({ example: 42 })
  @IsInt()
  @Min(35)
  @Max(45)
  size: number

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

  @ApiProperty({ example: 300, required: false, description: 'Количество бонусов к списанию' })
  @IsOptional()
  @IsInt()
  @Min(0)
  bonusPointsToSpend?: number

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]
}
