import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { ProductsService } from './product.service'
import { Product } from './product.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ type: [Product], description: 'Список всех товаров' })
  findAll() {
    return this.productsService.findAll()
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID товара' })
  @ApiOkResponse({ type: Product, description: 'Информация о товаре' })
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.findById(id)
  }

  // ✅ Теперь тело запроса описано через DTO
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiCreatedResponse({ type: Product, description: 'Создан новый товар' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: Product, description: 'Товар обновлен' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOkResponse({ description: 'Товар удален' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.remove(id)
  }
}
