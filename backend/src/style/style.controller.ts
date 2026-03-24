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
import { CreateStyleDto } from './dto/create-style.dto'
import { ProductStyle } from './product-style.entity'
import { StyleService } from './style.service'
import { UpdateStyleDto } from './dto/update-style.dto'

@ApiTags('styles')
@Controller('styles')
export class StyleController {
  constructor(private readonly styleService: StyleService) {}

  @Get()
  @ApiOkResponse({ type: [ProductStyle], description: 'Список всех стилей' })
  findAll() {
    return this.styleService.findAll()
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID стиля' })
  @ApiOkResponse({ type: ProductStyle, description: 'Информация о стиле' })
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.styleService.findById(id)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiCreatedResponse({ type: ProductStyle, description: 'Создан новый стиль' })
  create(@Request() req, @Body() dto: CreateStyleDto) {
    assertAdmin(req.user)
    return this.styleService.create(dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: ProductStyle, description: 'Стиль обновлен' })
  update(
    @Request() req,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateStyleDto,
  ) {
    assertAdmin(req.user)
    return this.styleService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOkResponse({ description: 'Стиль удален' })
  remove(@Request() req, @Param('id', new ParseUUIDPipe()) id: string) {
    assertAdmin(req.user)
    return this.styleService.remove(id)
  }
}
