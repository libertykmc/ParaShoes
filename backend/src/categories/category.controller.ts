import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import { assertAdmin } from '../auth/admin.helpers'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ProductCategory } from './category.entity'
import { CategoriesService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

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
  create(@Request() req, @Body() dto: CreateCategoryDto) {
    assertAdmin(req.user)
    return this.categoriesService.create(dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: ProductCategory, description: 'Категория обновлена' })
  update(
    @Request() req,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    assertAdmin(req.user)
    return this.categoriesService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOkResponse({ description: 'Категория удалена' })
  remove(@Request() req, @Param('id', new ParseUUIDPipe()) id: string) {
    assertAdmin(req.user)
    return this.categoriesService.remove(id)
  }
}
