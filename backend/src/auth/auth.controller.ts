import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ description: 'Пользователь зарегистрирован' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.username,
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.password,
      dto.phone,
      dto.address,
    )
  }

  @Post('login')
  @ApiOkResponse({ description: 'Успешная аутентификация' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password)
  }
}
