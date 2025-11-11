import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
  NotFoundException,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiParam } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

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

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    }
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me/avatar')
  @ApiOkResponse({ description: 'Аватар обновлен' })
  async updateAvatar(@Request() req, @Body() body: { avatar: string }) {
    const user = await this.usersService.findById(req.user.userId)
    if (!user) throw new NotFoundException('Пользователь не найден')

    await this.usersService.update(user.id, { avatar: body.avatar })
    const updatedUser = await this.usersService.findById(user.id)
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    }
  }


  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID пользователя' })
  @ApiOkResponse({ description: 'Пользователь найден' })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id)
    if (!user) throw new NotFoundException('Пользователь не найден')

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    }
  }
}
