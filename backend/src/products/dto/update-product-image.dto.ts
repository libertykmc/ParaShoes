import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class UpdateProductImageDto {
  @ApiProperty({ example: 'https://cdn.parashoes.com/nike.jpg' })
  @IsString()
  image: string
}

