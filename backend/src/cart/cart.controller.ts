import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
import { CartService } from './cart.service'
import { Cart } from './cart.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AddToCartDto } from './dto/add-to-cart.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOkResponse({ type: [Cart], description: 'Содержимое корзины' })
  findAll(@Request() req) {
    return this.cartService.findAll(req.user.userId)
  }

  @Post()
  @ApiCreatedResponse({ type: Cart, description: 'Товар добавлен в корзину' })
  addToCart(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, dto)
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID элемента корзины' })
  @ApiOkResponse({ type: Cart, description: 'Количество товара обновлено' })
  updateQuantity(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateQuantity(id, req.user.userId, dto)
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID элемента корзины' })
  @ApiOkResponse({ description: 'Товар удален из корзины' })
  removeFromCart(@Param('id', new ParseUUIDPipe()) id: string, @Request() req) {
    return this.cartService.removeFromCart(id, req.user.userId)
  }

  @Delete()
  @ApiOkResponse({ description: 'Корзина очищена' })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId)
  }
}

