import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class RegisterDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  username: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({ required: false, example: '+7 (999) 123-45-67' })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ required: false, example: 'г. Москва, ул. Ленина, д. 10, кв. 5' })
  @IsString()
  @IsOptional()
  address?: string
}
