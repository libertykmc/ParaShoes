import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { User } from './user.entity'
import { UsersService } from './users.service'

function serializeUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    address: user.address,
    bonusPoints: user.bonusPoints,
  }
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOkResponse({ description: 'Получен профиль пользователя' })
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId)
    if (!user) throw new NotFoundException('Пользователь не найден')

    return serializeUser(user)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  @ApiOkResponse({ description: 'Профиль обновлен' })
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    const user = await this.usersService.findById(req.user.userId)
    if (!user) throw new NotFoundException('Пользователь не найден')

    const updatedUser = await this.usersService.updateProfile(user.id, dto)
    return serializeUser(updatedUser)
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID пользователя' })
  @ApiOkResponse({ description: 'Пользователь найден' })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id)
    if (!user) throw new NotFoundException('Пользователь не найден')

    return serializeUser(user)
  }
}
