import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger";
import { SeasonService } from "./season.service";
import { ProductSeason } from "./product-season.entity";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateSeasonDto } from "./dto/create-season.dto";
import { UpdateSeasonDto } from "./dto/update-season.dto";

@ApiTags('seasons')
@Controller('seasons')
export class SeasonsController {
    constructor(private readonly seasonsService: SeasonService) { }

    @Get()
    @ApiOkResponse({ type: [ProductSeason], description: 'Список всех сезонов' })
    findAll() {
        return this.seasonsService.findAll()
    }

    @Get(':id')
    @ApiParam({ name: 'id', type: String, description: 'UUID Сезона' })
    @ApiOkResponse({ type: ProductSeason, description: 'Информация о сезоне' })
    findById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.seasonsService.findById(id)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    @ApiCreatedResponse({ type: ProductSeason, description: 'Создан новый сезон' })
    create(@Body() dto: CreateSeasonDto) {
        return this.seasonsService.create(dto)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id')
    @ApiOkResponse({ type: ProductSeason, description: 'Сезон обновлен' })
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateSeasonDto,
    ) {
        return this.seasonsService.update(id, dto)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete(':id')
    @ApiOkResponse({ description: 'Сезон удален' })
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return this, this.seasonsService.remove(id)
    }
}