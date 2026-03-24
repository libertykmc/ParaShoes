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
import { CreateSeasonDto } from './dto/create-season.dto'
import { UpdateSeasonDto } from './dto/update-season.dto'
import { ProductSeason } from './product-season.entity'
import { SeasonService } from './season.service'

@ApiTags('seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonService) {}

  @Get()
  @ApiOkResponse({ type: [ProductSeason], description: 'Список всех сезонов' })
  findAll() {
    return this.seasonsService.findAll()
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'UUID сезона' })
  @ApiOkResponse({ type: ProductSeason, description: 'Информация о сезоне' })
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.seasonsService.findById(id)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiCreatedResponse({ type: ProductSeason, description: 'Создан новый сезон' })
  create(@Request() req, @Body() dto: CreateSeasonDto) {
    assertAdmin(req.user)
    return this.seasonsService.create(dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOkResponse({ type: ProductSeason, description: 'Сезон обновлен' })
  update(
    @Request() req,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSeasonDto,
  ) {
    assertAdmin(req.user)
    return this.seasonsService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOkResponse({ description: 'Сезон удален' })
  remove(@Request() req, @Param('id', new ParseUUIDPipe()) id: string) {
    assertAdmin(req.user)
    return this.seasonsService.remove(id)
  }
}
