import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsInt, Min } from 'class-validator'

export class AddToCartDto {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @IsString()
  productId: string

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number
}

