import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { UserRole } from '../user.entity'

export class UpdateUserAdminDto {
  @ApiProperty({ enum: UserRole, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @ApiProperty({ example: 120, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  bonusPoints?: number

  @ApiProperty({ example: '+7 (999) 123-45-67', required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ example: 'г. Москва, ул. Ленина, д. 10', required: false })
  @IsString()
  @IsOptional()
  address?: string
}
