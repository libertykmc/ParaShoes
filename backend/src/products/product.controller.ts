import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { ProductsService } from './product.service'
import { Model } from './product.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { assertAdmin } from '../auth/admin.helpers'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { UpdateProductImageDto } from './dto/update-product-image.dto'

@ApiTags('models')
@Controller('models')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ type: [Model], description: 'Список всех моделей' })
  findAll() {
    return this.productsService.findAll()
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID модели' })
  @ApiOkResponse({ type: Model, description: 'Информация о модели' })
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.findById(id)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiCreatedResponse({ type: Model, description: 'Создана новая модель' })
  create(@Request() req, @Body() dto: CreateProductDto) {
    assertAdmin(req.user)
    return this.productsService.create(dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: Model, description: 'Модель обновлена' })
  update(
    @Request() req,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    assertAdmin(req.user)
    return this.productsService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/image')
  @ApiOkResponse({ type: Model, description: 'Updated model image URL' })
  updateImage(
    @Request() req,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProductImageDto,
  ) {
    assertAdmin(req.user)
    return this.productsService.update(id, { image: dto.image })
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOkResponse({ description: 'Модель удалена' })
  remove(@Request() req, @Param('id', new ParseUUIDPipe()) id: string) {
    assertAdmin(req.user)
    return this.productsService.remove(id)
  }
}
