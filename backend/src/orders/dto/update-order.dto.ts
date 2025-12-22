import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString, IsOptional } from 'class-validator'
import { OrderStatus } from '../order.entity'

export class UpdateOrderDto {
  @ApiProperty({ example: OrderStatus.PREPARING, enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus

  @ApiProperty({ example: 'г. Москва, ул. Ленина, д. 10, кв. 5', required: false })
  @IsString()
  @IsOptional()
  deliveryAddress?: string
}

