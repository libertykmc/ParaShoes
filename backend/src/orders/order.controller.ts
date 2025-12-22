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
import { OrdersService } from './order.service'
import { Order } from './order.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOkResponse({ type: [Order], description: 'Список всех заказов' })
  findAll(@Request() req) {
    // Админы видят все заказы, пользователи - только свои
    const userId = req.user.role === 'Администратор' ? undefined : req.user.userId
    return this.ordersService.findAll(userId)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID заказа' })
  @ApiOkResponse({ type: Order, description: 'Информация о заказе' })
  findById(@Param('id', new ParseUUIDPipe()) id: string, @Request() req) {
    const userId = req.user.role === 'Администратор' ? undefined : req.user.userId
    return this.ordersService.findById(id, userId)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiCreatedResponse({ type: Order, description: 'Создан новый заказ' })
  create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: Order, description: 'Заказ обновлен' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrderDto,
    @Request() req,
  ) {
    const userId = req.user.role === 'Администратор' ? undefined : req.user.userId
    return this.ordersService.update(id, dto, userId)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/cancel')
  @ApiOkResponse({ type: Order, description: 'Заказ отменен' })
  cancel(@Param('id', new ParseUUIDPipe()) id: string, @Request() req) {
    return this.ordersService.cancel(id, req.user.userId)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOkResponse({ description: 'Заказ удален' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ordersService.remove(id)
  }
}

