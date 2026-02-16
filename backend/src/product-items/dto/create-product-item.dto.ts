import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsUUID, Max, Min } from 'class-validator'

export class CreateProductItemDto {
  @ApiProperty({ example: 'e32a1320-3f6f-456a-bcd8-159b6527076d' })
  @IsUUID()
  modelId: string

  @ApiProperty({ example: 42, minimum: 35, maximum: 45 })
  @IsInt()
  @Min(35)
  @Max(45)
  size: number
}
