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
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { CategoriesService } from './category.service'
import { ProductCategory } from './category.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Get()
  @ApiOkResponse({ type: [ProductCategory], description: 'Список всех категорий' })
  findAll() {
    return this.categoriesService.findAll()
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID категории' })
  @ApiOkResponse({ type: ProductCategory, description: 'Информация о категории' })
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoriesService.findById(id)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiCreatedResponse({ type: ProductCategory, description: 'Создана новая категория' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: ProductCategory, description: 'Категория обновлена' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOkResponse({ description: 'Категория удалена' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoriesService.remove(id)
  }
}

