import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Иван Иванов Иванович' })
  fullName?: string

  @ApiPropertyOptional({ example: '+7 (999) 123-45-67' })
  phone?: string

  @ApiPropertyOptional({ example: 'г. Москва, ул. Ленина, д. 10, кв. 5' })
  address?: string
}
