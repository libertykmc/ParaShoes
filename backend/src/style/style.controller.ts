import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger";
import { StyleService } from "./style.service";
import { ProductStyle } from "./product-style.entity";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateStyleDto } from "./dto/create-style.dto";
import { UpdateStyleDto } from "./dto/update-style.dto";

@ApiTags('styles')
@Controller('styles')
export class StyleController {
    constructor(private readonly styleService: StyleService) { }

    @Get()
    @ApiOkResponse({ type: [ProductStyle], description: 'Список всех стилей' })
    findAll() {
        return this.styleService.findAll()
    }

    @Get(':id')
    @ApiParam({ name: 'id', type: String, description: 'UUID Стиля' })
    @ApiOkResponse({ type: ProductStyle, description: 'Информация о стиле' })
    findById(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.styleService.findById(id)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    @ApiCreatedResponse({ type: ProductStyle, description: 'Создан новый стиль' })
    create(@Body() dto: CreateStyleDto) {
        return this.styleService.create(dto)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id')
    @ApiOkResponse({ type: ProductStyle, description: 'Стиль обновлен' })
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateStyleDto,
    ) {
        return this.styleService.update(id, dto)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete(':id')
    @ApiOkResponse({ description: 'Стиль удален' })
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return this, this.styleService.remove(id)
    }
}