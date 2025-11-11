import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ description: 'Получен профиль пользователя' })
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
  }

  @Patch('me/avatar')
  @ApiOkResponse({ description: 'Аватар обновлен' })
  async updateAvatar(@Request() req, @Body() body: { avatar: string }) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    await this.usersService.update(user.id, { avatar: body.avatar });
    const updatedUser = await this.usersService.findById(user.id);
    if (!updatedUser) {
      throw new Error('Пользователь не найден');
    }
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    };
  }
}
