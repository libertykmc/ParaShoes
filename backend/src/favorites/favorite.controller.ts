import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { FavoritesService } from './favorite.service'
import { Favorite } from './favorite.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOkResponse({ type: [Favorite], description: 'Список избранных товаров' })
  findAll(@Request() req) {
    return this.favoritesService.findAll(req.user.userId)
  }

  @Post(':productId')
  @ApiParam({ name: 'productId', type: String, description: 'UUID товара' })
  @ApiCreatedResponse({ type: Favorite, description: 'Товар добавлен в избранное' })
  addToFavorites(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Request() req,
  ) {
    return this.favoritesService.addToFavorites(req.user.userId, productId)
  }

  @Delete(':productId')
  @ApiParam({ name: 'productId', type: String, description: 'UUID товара' })
  @ApiOkResponse({ description: 'Товар удален из избранного' })
  removeFromFavorites(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Request() req,
  ) {
    return this.favoritesService.removeFromFavorites(req.user.userId, productId)
  }

  @Get('check/:productId')
  @ApiParam({ name: 'productId', type: String, description: 'UUID товара' })
  @ApiOkResponse({ description: 'Проверка наличия товара в избранном' })
  checkIfFavorite(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Request() req,
  ) {
    return this.favoritesService.checkIfFavorite(req.user.userId, productId)
  }
}

