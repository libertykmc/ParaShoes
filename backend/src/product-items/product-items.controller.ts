import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ProductItem } from './product-item.entity'
import { ProductItemsService } from './product-items.service'
import { CreateProductItemDto } from './dto/create-product-item.dto'
import { UpdateProductItemDto } from './dto/update-product-item.dto'

@ApiTags('product')
@Controller('product')
export class ProductItemsController {
  constructor(private readonly productItemsService: ProductItemsService) {}

  @Get()
  @ApiOkResponse({ type: [ProductItem], description: 'Список единичных товаров' })
  findAll() {
    return this.productItemsService.findAll()
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID единичного товара' })
  @ApiOkResponse({ type: ProductItem, description: 'Информация о единичном товаре' })
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productItemsService.findById(id)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiCreatedResponse({ type: ProductItem, description: 'Единичный товар создан' })
  create(@Body() dto: CreateProductItemDto) {
    return this.productItemsService.create(dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: ProductItem, description: 'Единичный товар обновлен' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProductItemDto,
  ) {
    return this.productItemsService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOkResponse({ description: 'Единичный товар удален' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productItemsService.remove(id)
  }
}
